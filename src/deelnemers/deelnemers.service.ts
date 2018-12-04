import {HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import {getConnection, getRepository, Repository} from 'typeorm';

import {Aflevering} from '../afleveringen/aflevering.entity';
import * as _ from 'lodash';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import {Poule} from '../poules/poule.entity';
import {Deelnemer} from './deelnemer.entity';
import {IDeelnemer} from './deelnemer.interface';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';

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

    async getVoorspellingen(firebaseIdentifier): Promise<any[]> {
        this.logger.log('get voorspellingen wordt werkelijk aangeroepen');
        const deelnemer = await this.deelnemerRepository.findOne({where: {firebaseIdentifier}});

        const afleveringen = await getRepository(Aflevering).find({where: {uitgezonden: true}}).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });

        const laatsteAflevering: Aflevering = _.maxBy(afleveringen, 'aflevering');
        if (laatsteAflevering) {
            const voorspellingen: any = await getRepository(Afleveringpunten)
                .createQueryBuilder('afleveringpunten')
                .leftJoinAndSelect('afleveringpunten.deelnemer', 'deelnemer')
                .leftJoinAndSelect('afleveringpunten.voorspelling', 'voorspelling')
                .leftJoinAndSelect('voorspelling.mol', 'mol')
                .leftJoinAndSelect('voorspelling.afvaller', 'afvaller')
                .leftJoinAndSelect('voorspelling.winnaar', 'winnaar')
                .where('afleveringpunten.afleveringstand = :aflevering', {aflevering: laatsteAflevering.aflevering})
                .andWhere('afleveringpunten.deelnemer = :deelnemerId', {deelnemerId: deelnemer.id})
                .getMany()
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });

            const aflevering = await getRepository(Aflevering).find();

            voorspellingen.forEach(voorspelling => {
                voorspelling.voorspelling.aflevering = _.find(aflevering, {aflevering: voorspelling.aflevering});
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
        };
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
                .innerJoinAndSelect('poule.deelnemers', 'deelnemers')
                .innerJoinAndSelect('deelnemers.voorspellingen', 'voorspellingen')
                .innerJoinAndSelect('deelnemers.tests', 'test')
                .innerJoinAndSelect('test.vraag', 'vraag')
                .innerJoinAndSelect('test.antwoord', 'tests')
                .innerJoinAndSelect('voorspellingen.mol', 'mol')
                .innerJoinAndSelect('voorspellingen.afvaller', 'afvaller')
                .innerJoinAndSelect('voorspellingen.winnaar', 'winnaar')
                .innerJoinAndSelect('poule.admins', 'admins')
                .where(qb => {
                    const subQuery = qb.subQuery()
                        .select('poule.id')
                        .from(Poule, 'poule')
                        .innerJoin('poule.deelnemers', 'deelnemers')
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

    async findLoggedInDeelnemer(firebaseIdentifier) {
        this.logger.log('get voorspellingen wordt werkelijk aangeroepen');
        const deelnemer = await this.deelnemerRepository.findOne({where: {firebaseIdentifier}});

        const afleveringen = await getRepository(Aflevering).find({where: {uitgezonden: true}}).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });

        const laatsteAflevering: Aflevering = _.maxBy(afleveringen, 'aflevering');

        const voorspelling: any = await getRepository(Voorspelling)
            .createQueryBuilder('voorspelling')
            .leftJoinAndSelect('voorspelling.deelnemer', 'deelnemer')
            .leftJoinAndSelect('voorspelling.mol', 'mol')
            .leftJoinAndSelect('voorspelling.afvaller', 'afvaller')
            .leftJoinAndSelect('voorspelling.winnaar', 'winnaar')
            .where('voorspelling.aflevering = :aflevering', {aflevering: laatsteAflevering ? laatsteAflevering.aflevering : 1})
            .andWhere('voorspelling.deelnemer = :deelnemerId', {deelnemerId: deelnemer.id})
            .getOne()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
        return voorspelling;
    }
}
