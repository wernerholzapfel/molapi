import {HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import {getConnection, getRepository, Repository} from 'typeorm';

import {Aflevering} from '../afleveringen/aflevering.entity';
import * as _ from 'lodash';
import {Poule} from '../poules/poule.entity';
import {Deelnemer} from './deelnemer.entity';
import {IDeelnemer} from './deelnemer.interface';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Actie} from '../acties/actie.entity';
import {Quizresultaat} from '../quizresultaten/quizresultaat.entity';

@Injectable()
export class DeelnemersService {
    private readonly logger = new Logger('deelnemerService', true);

    constructor(@Inject('DeelnemerRepositoryToken') private readonly deelnemerRepository: Repository<Deelnemer>) {
    }

    async findAll(): Promise<Deelnemer[]> {
        return await this.deelnemerRepository.find(
            {
                join: {
                    alias: 'deelnemer',
                    leftJoinAndSelect: {
                        voorspellingen: 'deelnemer.voorspellingen',
                    },
                },
            },
        ).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
    }

    async getTests(firebaseIdentifier): Promise<any[]> {
        const deelnemer = await this.deelnemerRepository.findOne({where: {firebaseIdentifier}});
        const acties = await getRepository(Actie).findOne();

        this.logger.log('acties.voorspellingaflevering: ' + acties.voorspellingaflevering);
        const test: any = await getRepository(Quizresultaat)
            .createQueryBuilder('quizresultaat')
            .leftJoinAndSelect('quizresultaat.vraag', 'vraag')
            .leftJoinAndSelect('quizresultaat.deelnemer', 'deelnemer')
            .leftJoinAndSelect('quizresultaat.antwoord', 'antwoord')
            .where('deelnemer.id = :deelnemerId', {deelnemerId: deelnemer.id})
            .andWhere('quizresultaat.aflevering < :aflevering', {aflevering: acties.voorspellingaflevering})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        return _.sortBy(test, [v => -v.aflevering]);
    }

    async getVoorspellingen(firebaseIdentifier): Promise<any[]> {
        this.logger.log('get voorspellingen wordt werkelijk aangeroepen');
        const deelnemer = await this.deelnemerRepository.findOne({where: {firebaseIdentifier}});

        const afleveringen = await getRepository(Aflevering).find({where: {uitgezonden: true}}).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });

        const laatsteAflevering: Aflevering = _.maxBy(afleveringen, 'aflevering');
        if (laatsteAflevering) {
            this.logger.log(laatsteAflevering.aflevering);

            const voorspellingen: any = await getRepository(Voorspelling)
                .createQueryBuilder('voorspelling')
                .leftJoinAndSelect('voorspelling.deelnemer', 'deelnemer')
                .leftJoinAndSelect('voorspelling.mol', 'mol')
                .leftJoinAndSelect('voorspelling.afvaller', 'afvaller')
                .leftJoinAndSelect('voorspelling.winnaar', 'winnaar')
                .where('deelnemer.id = :deelnemerId', {deelnemerId: deelnemer.id})
                .andWhere('voorspelling.aflevering <= :aflevering', {aflevering: laatsteAflevering.aflevering})
                .getMany()
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });

            return _.sortBy(voorspellingen, [v => -v.aflevering]);
        }
        else {
            throw new HttpException({
                message: 'er zijn nog geen voorspellingen bekend',
                statusCode: HttpStatus.NO_CONTENT,
            }, HttpStatus.NO_CONTENT);
        }
    }

    async create(deelnemer: IDeelnemer, firebaseIdentifier: string) {
        const oldDeelnemer = await this.deelnemerRepository.findOne({where: {firebaseIdentifier}});
        if (oldDeelnemer) deelnemer = {
            id: oldDeelnemer.id,
            display_name: deelnemer.display_name,
            firebaseIdentifier,
            email: oldDeelnemer.email,
        }; else {
            deelnemer.firebaseIdentifier = firebaseIdentifier;
        }
        return await this.deelnemerRepository.save(deelnemer)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    // todo
    async oldfindVoorspellingen(firebaseIdentifier: string) {
        this.logger.log('vind voorspelling van deelnemer: ' + firebaseIdentifier);
        const deelnemer = await this.deelnemerRepository.findOne({where: {firebaseIdentifier}})
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        return deelnemer;
    }

    async findVoorspellingen(firebaseIdentifier: string) {

        const deelnemer = await getConnection().manager.findOne(Deelnemer, {where: {firebaseIdentifier}});

        if (deelnemer) {

            deelnemer.poules = await getConnection()
                .createQueryBuilder()
                .select('poule')
                .from(Poule, 'poule')
                .leftJoinAndSelect('poule.deelnemers', 'deelnemers')
                .leftJoinAndSelect('deelnemers.voorspellingen', 'voorspellingen')
                .leftJoinAndSelect('deelnemers.tests', 'test')
                .leftJoinAndSelect('test.vraag', 'vraag')
                .leftJoinAndSelect('test.antwoord', 'tests')
                .leftJoinAndSelect('voorspellingen.mol', 'mol')
                .leftJoinAndSelect('voorspellingen.afvaller', 'afvaller')
                .leftJoinAndSelect('voorspellingen.winnaar', 'winnaar')
                .leftJoinAndSelect('poule.admins', 'admins')
                .where(qb => {
                    const subQuery = qb.subQuery()
                        .select('poule.id')
                        .from(Poule, 'poule')
                        .leftJoin('poule.deelnemers', 'deelnemers')
                        .where('deelnemers.id = :deelnemerId', {deelnemerId: deelnemer.id})
                        .getQuery();
                    return 'poule.id IN ' + subQuery;
                })
                .getMany()
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });

            return deelnemer;
        } else {
            throw new HttpException({
                statusCode: HttpStatus.NO_CONTENT,
            }, HttpStatus.NO_CONTENT);
        }
    }

    async actualvoorspelling(firebaseIdentifier) {
        this.logger.log('get voorspellingen wordt werkelijk aangeroepen');
        const deelnemer = await this.deelnemerRepository.findOne({where: {firebaseIdentifier}});

        const voorspelling: any = await getRepository(Voorspelling)
            .createQueryBuilder('voorspelling')
            .leftJoinAndSelect('voorspelling.deelnemer', 'deelnemer')
            .leftJoinAndSelect('voorspelling.mol', 'mol')
            .leftJoinAndSelect('voorspelling.afvaller', 'afvaller')
            .leftJoinAndSelect('voorspelling.winnaar', 'winnaar')
            .where('voorspelling.deelnemer = :deelnemerId', {deelnemerId: deelnemer.id})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        return _.maxBy(voorspelling, 'aflevering');
    }
}
