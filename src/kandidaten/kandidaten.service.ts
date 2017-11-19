import {Component, Inject, Logger} from '@nestjs/common';
import {getRepository, Repository} from 'typeorm';
import {Kandidaat} from './kandidaat.entity';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';
import {Quizresultaat} from '../quizresultaten/quizresultaat.entity';
import {Quizpunt} from '../quizpunten/quizpunt.entity';

@Component()
export class KandidatenService {
    private readonly logger = new Logger('deelnemersController', true);

    molStrafpunten: number = -5;
    winnaarStrafpunten: number = -5;
    molPunten: number = 20;
    winnaarPunten: number = 5;
    vragenPunten: number = 10;

    constructor(@Inject('kandidaatRepositoryToken') private readonly kandidaatRepository: Repository<Kandidaat>) {
    }

    async findAll(): Promise<Kandidaat[]> {
        return await this.kandidaatRepository.find();
    }

    async create(kandidaat: Kandidaat) {
        this.logger.log(kandidaat.display_name + ' is afgevallen in ronde ' + kandidaat.aflevering);
        await this.kandidaatRepository.save(kandidaat);
        await getRepository(Afleveringpunten).delete({afleveringstand: kandidaat.aflevering});
        await getRepository(Quizpunt).delete({afleveringstand: kandidaat.aflevering});
        const deelnemers = await getRepository(Deelnemer).find();

        await this.updateQuizResultaten(kandidaat.aflevering);

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
        });
        await this.logger.log(voorspellingen.length.toString() + 'aantal voorspellingen');
        this.logger.log(kandidaat.id + ' is het id van de kandidaat');
        const kandidatenlijst = await getRepository(Kandidaat).find();
        const afgevalenKandidatenLijst = kandidatenlijst.filter(item => {
            return item.aflevering <= kandidaat.aflevering && item.aflevering > 0;
        });
        this.logger.log('afgevalenKandidatenLijst length: ' + afgevalenKandidatenLijst.length);
        await afgevalenKandidatenLijst.forEach(async afgevallenkandidaat => {
            await voorspellingen.forEach(async voorspelling => {
                await getRepository(Afleveringpunten).save({
                    aflevering: voorspelling.aflevering,
                    afvallerpunten: await this.determineAfvallerPunten(voorspelling, voorspellingen, afgevallenkandidaat),
                    molpunten: await this.determineMolPunten(voorspelling, voorspellingen, afgevallenkandidaat),
                    winnaarpunten: await this.determineWinnaarPunten(voorspelling, voorspellingen, afgevallenkandidaat),
                    deelnemer: {id: voorspelling.deelnemer.id},
                    voorspelling: {id: voorspelling.id},
                    afleveringstand: kandidaat.aflevering,
                });
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
        const possibleCorrectAnswers: Quizantwoord[] = answers.filter(answer => {
            return answer.kandidaten.every(
                kandidaat => {
                    return !kandidaat.afgevallen && !kandidaat.winner;
                });
        });
        this.logger.log('possibleCorrectAnswers.length: ' + possibleCorrectAnswers.length);

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
            });
        });
    }

    determineAfvallerPunten(voorspelling: Voorspelling, voorspellingen: Voorspelling[], kandidaat: Kandidaat) {
        if (kandidaat.afgevallen && (
                voorspelling.aflevering === kandidaat.aflevering &&
                voorspelling.afvaller.id === kandidaat.id)) {
            return 25;
        }
        return 0;
    }

    determineMolPunten(voorspelling: Voorspelling, voorspellingen: Voorspelling[], kandidaat: Kandidaat) {
        if (kandidaat.mol) {
            return voorspellingen.filter(voorspellingItem => {
                return voorspellingItem.deelnemer.id === voorspellingItem.deelnemer.id &&
                    voorspellingItem.mol.id === kandidaat.id;
            }).length * this.molPunten;
        }
        if (kandidaat.afgevallen && voorspelling.aflevering === kandidaat.aflevering &&
            voorspelling.mol.id === kandidaat.id) {
            return this.molStrafpunten;
        }
        return 0;
    }

    determineWinnaarPunten(voorspelling: Voorspelling, voorspellingen: Voorspelling[], kandidaat: Kandidaat) {
        if (kandidaat.winner) {
            return voorspellingen.filter(voorspellingItem => {
                return voorspellingItem.deelnemer.id === voorspelling.deelnemer.id &&
                    voorspellingItem.winnaar.id === kandidaat.id;
            }).length * this.winnaarPunten;
        }
        if (kandidaat.afgevallen &&
            voorspelling.aflevering === kandidaat.aflevering &&
            voorspelling.winnaar.id === kandidaat.id) {
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