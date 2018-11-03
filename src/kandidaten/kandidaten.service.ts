import {HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import {getConnection, getRepository, Repository} from 'typeorm';
import {Kandidaat} from './kandidaat.entity';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';
import {Quizresultaat} from '../quizresultaten/quizresultaat.entity';
import {Quizpunt} from '../quizpunten/quizpunt.entity';
import * as _ from 'lodash';
import {CacheService} from '../cache.service';
import {
    afvallerPunten,
    molPunten,
    molStrafpunten,
    vragenPunten,
    winnaarPunten,
    winnaarStrafpunten,
} from '../shared/puntentelling.constanten';

@Injectable()
export class KandidatenService {
    private readonly logger = new Logger('KandidatenService', true);
    private readonly calclogger = new Logger('calculatieLogger', true);

    constructor(@Inject('kandidaatRepositoryToken') private readonly kandidaatRepository: Repository<Kandidaat>, private readonly cacheService: CacheService) {
    }

    async findAll(): Promise<Kandidaat[]> {
        const kandidaten = await this.kandidaatRepository.find()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
        return _.sortBy(kandidaten, 'display_name');

    }

    async create(kandidaat: Kandidaat) {
        this.logger.log(kandidaat.display_name + ' is afgevallen in ronde ' + kandidaat.aflevering);
        const response = await this.kandidaatRepository.save(kandidaat).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });

        this.updateAntwoorden(kandidaat);

        this.updateQuizResultaten(kandidaat.aflevering);

        this.updateAfleveringPunten(kandidaat);

        return response;
    }

    async updateAntwoorden(kandidaat: Kandidaat) {
        const antwoordMogelijkheden: Quizantwoord[] = await getRepository(Quizantwoord)
            .createQueryBuilder('antwoordMogelijkheden')
            .leftJoinAndSelect('antwoordMogelijkheden.kandidaten', 'kandidaten')
            .leftJoinAndSelect('antwoordMogelijkheden.vraag', 'vraag')
            .getMany();

        antwoordMogelijkheden.forEach(async antwoordMogelijkheid => {
            if (antwoordMogelijkheid.kandidaten.every(kandidaatItem => {
                return kandidaatItem.afgevallen || kandidaatItem.winner;
            })) {

                this.logger.log('aantal kandidaten dat is afgevallen voor antwoord: '
                    + antwoordMogelijkheid.antwoord + ' - '
                    + antwoordMogelijkheid.kandidaten.length);
                const isNietMeerMogelijkSinds = antwoordMogelijkheid.kandidaten
                    .sort((a, b) => a.aflevering + b.aflevering)[0].aflevering;

                await getRepository(Quizantwoord)
                    .createQueryBuilder('quizantwoord')
                    .update()
                    .set({is_niet_meer_mogelijk_sinds: isNietMeerMogelijkSinds})
                    .where('id = :id', {id: antwoordMogelijkheid.id})
                    .execute()
                    .catch((err) => {
                        throw new HttpException({
                            message: err.message,
                            statusCode: HttpStatus.BAD_REQUEST,
                        }, HttpStatus.BAD_REQUEST);
                    });
            }
        });
    }

    async updateAfleveringPunten(kandidaat: Kandidaat) {
        this.calclogger.log('start updating afleveringpunten for stand: ' + kandidaat.aflevering);

        const voorspellingen: Voorspelling[] = await getRepository(Voorspelling)
            .createQueryBuilder('voorspelling')
            .leftJoinAndSelect('voorspelling.deelnemer', 'deelnemer')
            .leftJoinAndSelect('voorspelling.mol', 'mol')
            .leftJoinAndSelect('voorspelling.afvaller', 'afvaller')
            .leftJoinAndSelect('voorspelling.winnaar', 'winnaar')
            .where('voorspelling.aflevering <= :aflevering', {aflevering: kandidaat.aflevering})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        this.calclogger.log('voorspellingen.length: ' + voorspellingen.length);

        const kandidatenlijst = await getRepository(Kandidaat).find().catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });

        const uitgespeeldeKandidatenLijst = kandidatenlijst.filter(item => {
            return item.aflevering <= kandidaat.aflevering && item.aflevering > 0;
        });

        await getRepository(Afleveringpunten).delete({afleveringstand: kandidaat.aflevering});

        const newAfleveringpunten: Afleveringpunten[] = [];

        await voorspellingen.forEach(async voorspelling => {
            await getRepository(Afleveringpunten).save({
                aflevering: voorspelling.aflevering,
                afvallerpunten: await this.determineAfvallerPunten(voorspelling, uitgespeeldeKandidatenLijst),
                molpunten: await this.determineMolPunten(voorspelling, uitgespeeldeKandidatenLijst),
                winnaarpunten: await this.determineWinnaarPunten(voorspelling, uitgespeeldeKandidatenLijst),
                deelnemer: {id: voorspelling.deelnemer.id},
                voorspelling: {id: voorspelling.id},
                afleveringstand: kandidaat.aflevering,
            }).catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
        });
        this.calclogger.log('finished updating afleveringpunten for stand: ' + kandidaat.aflevering);
        this.cacheService.flushAll();
    }

    async updateQuizResultaten(afleveringstand) {
        this.calclogger.log('start updating quizresultaten for stand: ' + afleveringstand);

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

        this.calclogger.log('answers: ' + answers.length);

        const possibleCorrectAnswers: Quizantwoord[] = answers.filter(answer => {
            return answer.kandidaten.some(
                kandidaat => {
                    return !kandidaat.afgevallen && !kandidaat.winner;
                });
        });

        this.calclogger.log('possibleCorrectAnswers.length: ' + possibleCorrectAnswers.length);

        const quizresultaten: Quizresultaat[] = await getRepository(Quizresultaat)
            .createQueryBuilder('quizresultaat')
            .leftJoinAndSelect('quizresultaat.vraag', 'vraag')
            .leftJoinAndSelect('quizresultaat.antwoord', 'antwoord')
            .leftJoinAndSelect('quizresultaat.deelnemer', 'deelnemer')
            .where('quizresultaat.aflevering <= :aflevering', {aflevering: afleveringstand})
            .getMany();

        this.calclogger.log('quizresultaten opgehaald: ' + quizresultaten.length);
        const newQuizResults: Quizpunt[] = [];
        await quizresultaten.forEach(async quizresultaat => {
            if (quizresultaat.antwoord && possibleCorrectAnswers.find(correctAnswer => {
                return correctAnswer.id === quizresultaat.antwoord.id;
            })) {
                quizresultaat.punten = vragenPunten;
            }
            else {
                quizresultaat.punten = 0;
            }
            newQuizResults.push({
                deelnemer: {id: quizresultaat.deelnemer.id},
                aflevering: quizresultaat.aflevering,
                quizpunten: quizresultaat.punten,
                afleveringstand,
                quizresultaat: {id: quizresultaat.id},
            } as Quizpunt);
        });

        await getRepository(Quizpunt).delete({afleveringstand});

        this.calclogger.log('ik ga nu ' + newQuizResults.length + ' newQuizResults opslaan');

        let index = 1;
        const batchsize = 500;
        const totalItems = newQuizResults.length;

        for (index; index <= Math.ceil(totalItems / batchsize); index++) {
            getConnection()
                .createQueryBuilder()
                .insert()
                .into(Quizpunt)
                .values(newQuizResults.slice((index * batchsize - batchsize), batchsize * index))
                .execute().then(response => {
                newQuizResults.splice(0, batchsize);
            })
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });
        }
        this.calclogger.log('finished updating quizresultaten for stand: ' + afleveringstand);
        this.cacheService.flushAll();
    }

    determineAfvallerPunten(voorspelling: Voorspelling, kandidaten: Kandidaat[]) {
        if (kandidaten.find(kandidaat => kandidaat.aflevering === voorspelling.aflevering &&
            voorspelling.afvaller.id === kandidaat.id && kandidaat.afgevallen)) {
            return afvallerPunten;
        }
        return 0;
    }

    determineMolPunten(voorspelling: Voorspelling, kandidaten: Kandidaat[]) {
        if (kandidaten.find(kandidaat => voorspelling.mol.id === kandidaat.id && kandidaat.mol)) {
            return molPunten;
        }
        if (kandidaten.find(kandidaat => kandidaat.aflevering === voorspelling.aflevering &&
            voorspelling.mol.id === kandidaat.id && kandidaat.afgevallen)) {
            return molStrafpunten;
        }
        return 0;
    }

    determineWinnaarPunten(voorspelling: Voorspelling, kandidaten: Kandidaat[]) {
        if (kandidaten.find(kandidaat => voorspelling.winnaar.id === kandidaat.id && kandidaat.winner)) {
            return winnaarPunten;
        }
        if (kandidaten.find(kandidaat => kandidaat.aflevering === voorspelling.aflevering &&
            voorspelling.winnaar.id === kandidaat.id && kandidaat.afgevallen)) {
            return winnaarStrafpunten;
        }
        return 0;
    }
}