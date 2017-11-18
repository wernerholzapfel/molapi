import {Component, Inject, Logger} from '@nestjs/common';
import {getRepository, Repository} from 'typeorm';
import {Kandidaat} from './kandidaat.entity';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';
import {Quizresultaat} from '../quizresultaten/quizresultaat.entity';

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

    async findAll(): Promise<any> {
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
        const correctAnswers: Quizantwoord[] = answers.filter(answer => {
            return answer.kandidaten.every(
                kandidaat => {
                    return !kandidaat.afgevallen && !kandidaat.winner;
                });
        });
        return correctAnswers;
    }

    async create(kandidaat: Kandidaat) {
        this.logger.log(kandidaat.display_name + ' is afgevallen in ronde ' + kandidaat.aflevering);
        await this.kandidaatRepository.save(kandidaat);
        await getRepository(Afleveringpunten).delete({aflevering: kandidaat.aflevering});
        const deelnemers = await getRepository(Deelnemer).find();
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
        });
        await this.logger.log(voorspellingen.length.toString() + 'aantal voorspellingen');
        this.logger.log(kandidaat.id + ' is het id van de kandidaat');
        await deelnemers.forEach(async deelnemer => {
            await getRepository(Afleveringpunten).save({
                aflevering: kandidaat.aflevering,
                afvallerpunten: await this.determineAfvallerPunten(deelnemer, voorspellingen, kandidaat),
                molpunten: await this.determineMolPunten(deelnemer, voorspellingen, kandidaat),
                winnaarpunten: await this.determineWinnaarPunten(deelnemer, voorspellingen, kandidaat),
                deelnemer: {id: deelnemer.id},
                voorspelling: {id: await this.determineVoorspellingId(deelnemer, voorspellingen, kandidaat)},
            });
        });
        await this.updateQuizResultaten();
    }

    async updateQuizResultaten() {

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
            await getRepository(Quizresultaat).save(quizresultaat);
        });
    }

    determineAfvallerPunten(deelnemer: Deelnemer, voorspellingen: Voorspelling[], kandidaat: Kandidaat) {
        if (kandidaat.afgevallen) {
            return voorspellingen.filter(voorspelling => {
                return voorspelling.deelnemer.id === deelnemer.id &&
                    voorspelling.aflevering === kandidaat.aflevering &&
                    voorspelling.afvaller.id === kandidaat.id;
            }).length > 0 ? 25 : 0;
        }
    }

    determineMolPunten(deelnemer: Deelnemer, voorspellingen: Voorspelling[], kandidaat: Kandidaat) {
        if (kandidaat.mol) {
            return voorspellingen.filter(voorspelling => {
                return voorspelling.deelnemer.id === deelnemer.id &&
                    voorspelling.mol.id === kandidaat.id;
            }).length * this.molPunten;
        }
        if (kandidaat.afgevallen &&
            voorspellingen.find(voorspelling => {
                return voorspelling.deelnemer.id === deelnemer.id &&
                    voorspelling.aflevering === kandidaat.aflevering &&
                    voorspelling.mol.id === kandidaat.id;
            })) return this.molStrafpunten;
        return 0;
    }

    determineWinnaarPunten(deelnemer: Deelnemer, voorspellingen: Voorspelling[], kandidaat: Kandidaat) {
        if (kandidaat.winner) {
            return voorspellingen.filter(voorspelling => {
                return voorspelling.deelnemer.id === deelnemer.id &&
                    voorspelling.winnaar.id === kandidaat.id;
            }).length * this.winnaarPunten;
        }
        if (kandidaat.afgevallen &&
            voorspellingen.find(voorspelling => {
                return voorspelling.deelnemer.id === deelnemer.id &&
                    voorspelling.aflevering === kandidaat.aflevering &&
                    voorspelling.winnaar.id === kandidaat.id;
            })) return this.winnaarStrafpunten;
        return 0;
    }

    determineVoorspellingId(deelnemer: Deelnemer, voorspellingen: Voorspelling[], kandidaat: Kandidaat) {
        return voorspellingen.find(voorspelling => {
            return voorspelling.deelnemer.id === deelnemer.id &&
                voorspelling.aflevering === kandidaat.aflevering;
        }).id;
    }
}