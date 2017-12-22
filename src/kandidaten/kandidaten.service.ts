import {Component, HttpStatus, Inject, Logger} from '@nestjs/common';
import {getRepository, Repository} from 'typeorm';
import {Kandidaat} from './kandidaat.entity';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';
import {Quizresultaat} from '../quizresultaten/quizresultaat.entity';
import {Quizpunt} from '../quizpunten/quizpunt.entity';
import {HttpException} from '@nestjs/core';
import * as _ from 'lodash';

@Component()
export class KandidatenService {
    private readonly logger = new Logger('deelnemersController', true);
    private readonly calclogger = new Logger('calculatieLogger', true);

    molStrafpunten: number = -10;
    winnaarStrafpunten: number = -5;
    afvallerPunten: number = 20;
    molPunten: number = 20;
    winnaarPunten: number = 10;
    vragenPunten: number = 10;

    constructor(@Inject('kandidaatRepositoryToken') private readonly kandidaatRepository: Repository<Kandidaat>) {
    }

    async findAll(): Promise<Kandidaat[]> {
        const kandidaten = await this.kandidaatRepository.find()
            .catch((err) => {
                throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
            });
        return _.sortBy(kandidaten, 'display_name');

    }

    async create(kandidaat: Kandidaat) {
        this.logger.log(kandidaat.display_name + ' is afgevallen in ronde ' + kandidaat.aflevering);
        const response = await this.kandidaatRepository.save(kandidaat).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
        await getRepository(Quizpunt).delete({afleveringstand: kandidaat.aflevering});
        await this.updateQuizResultaten(kandidaat.aflevering);

        await getRepository(Afleveringpunten).delete({afleveringstand: kandidaat.aflevering});
        await this.updateAfleveringPunten(kandidaat);

        return response;
    }

    async updateAfleveringPunten(kandidaat: Kandidaat) {
        const voorspellingen = await getRepository(Voorspelling).find({
            join: {
                alias: 'voorspelling',
                leftJoinAndSelect: {
                    deelnemer: 'voorspelling.deelnemer',
                    mol: 'voorspelling.mol',
                    afvaller: 'voorspelling.afvaller',
                    winnaar: 'voorspelling.winnaar',
                },
            },
        }).then(voorspellingenlijst => {
            return voorspellingenlijst.filter(vl => {
                return vl.aflevering <= kandidaat.aflevering;
            });
        }).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });

        const kandidatenlijst = await getRepository(Kandidaat).find().catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
        const uitgespeeldeKandidatenLijst = kandidatenlijst.filter(item => {
            return item.aflevering <= kandidaat.aflevering && item.aflevering > 0;
        });

        await voorspellingen.forEach(async voorspelling => {
            await getRepository(Afleveringpunten).save({
                aflevering: voorspelling.aflevering,
                afvallerpunten: await this.determineAfvallerPunten(voorspelling, voorspellingen, uitgespeeldeKandidatenLijst),
                molpunten: await this.determineMolPunten(voorspelling, voorspellingen, uitgespeeldeKandidatenLijst),
                winnaarpunten: await this.determineWinnaarPunten(voorspelling, voorspellingen, uitgespeeldeKandidatenLijst),
                deelnemer: {id: voorspelling.deelnemer.id},
                voorspelling: {id: voorspelling.id},
                afleveringstand: kandidaat.aflevering,
            }).catch((err) => {
                throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
            });
        });

    }

    async updateQuizResultaten(afleveringstand) {
        const answers = await getRepository(Quizantwoord).find(
            {
                join: {
                    alias: 'quizantwoord',
                    leftJoinAndSelect: {
                        kandidaten: 'quizantwoord.kandidaten',
                    },
                },
            },
        );

        this.logger.log('answers: ' + answers);

        const possibleCorrectAnswers: Quizantwoord[] = answers.filter(answer => {
            return answer.kandidaten.some(
                kandidaat => {
                    return !kandidaat.afgevallen && !kandidaat.winner;
                });
        });


        this.calclogger.log('possibleCorrectAnswers.length: ' + possibleCorrectAnswers.length);

        const quizresultaten: Quizresultaat[] = await getRepository(Quizresultaat).find();
        await quizresultaten.forEach(async quizresultaat => {
            if (possibleCorrectAnswers.find(correctAnswer => {
                    return correctAnswer.id === quizresultaat.antwoord.id;
                })) {
                quizresultaat.punten = this.vragenPunten;
            }
            else {
                quizresultaat.punten = 0;
            }
            await getRepository(Quizpunt).save({
                deelnemer: {id: quizresultaat.deelnemer.id},
                aflevering: quizresultaat.aflevering,
                quizpunten: quizresultaat.punten,
                afleveringstand,
                quizresultaat: {id: quizresultaat.id},
            }).catch((err) => {
                throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
            });
        });
    }

    determineAfvallerPunten(voorspelling: Voorspelling, voorspellingen: Voorspelling[], kandidaten: Kandidaat[]) {
        if (kandidaten.find(kandidaat => kandidaat.aflevering === voorspelling.aflevering &&
                voorspelling.afvaller.id === kandidaat.id && kandidaat.afgevallen)) {
            return this.afvallerPunten;
        }
        return 0;
    }

    determineMolPunten(voorspelling: Voorspelling, voorspellingen: Voorspelling[], kandidaten: Kandidaat[]) {
        if (kandidaten.find(kandidaat => voorspelling.mol.id === kandidaat.id && kandidaat.mol)) {
            return this.molPunten;
        }
        if (kandidaten.find(kandidaat => kandidaat.aflevering === voorspelling.aflevering &&
                voorspelling.mol.id === kandidaat.id && kandidaat.afgevallen)) {
            return this.molStrafpunten;
        }
        return 0;
    }

    determineWinnaarPunten(voorspelling: Voorspelling, voorspellingen: Voorspelling[], kandidaten: Kandidaat[]) {
        if (kandidaten.find(kandidaat => voorspelling.winnaar.id === kandidaat.id && kandidaat.winner)) {
            return this.winnaarPunten;
        }
        if (kandidaten.find(kandidaat => kandidaat.aflevering === voorspelling.aflevering &&
                voorspelling.winnaar.id === kandidaat.id && kandidaat.afgevallen)) {
            return this.winnaarStrafpunten;
        }
        return 0;
    }

    // determineVoorspellingId(deelnemer: Deelnemer, voorspellingen: Voorspelling[], kandidaat: Kandidaat) {
    //     return voorspellingen.find(voorspelling => {
    //         return voorspelling.deelnemer.id === deelnemer.id &&
    //             voorspelling.aflevering === kandidaat.aflevering;
    //     }).id;
    // }
}