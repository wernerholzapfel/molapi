import {Component, HttpStatus, Inject, Logger} from '@nestjs/common';
import {getRepository, Repository} from 'typeorm';
import {Quizresultaat} from './quizresultaat.entity';
import {HttpException} from '@nestjs/core';
import {Aflevering} from '../afleveringen/aflevering.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import * as _ from 'lodash';

@Component()
export class QuizresultatenService {
    private readonly logger = new Logger('quizresultatenService', true);
    aflevering: number;

    constructor(@Inject('QuizresultatenRepositoryToken') private readonly quizresultaatRepository: Repository<Quizresultaat>) {
    }

    async findAll(auth0Identifier: string): Promise<Quizresultaat[]> {
        const afleveringen = await getRepository(Aflevering).find().catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
        const afleveringObject = afleveringen.find(item => {
            return item.laatseAflevering;
        });
        if (afleveringObject) {
            this.aflevering = afleveringObject.aflevering - 1;
        }
        else {

            const uitgezondenAfleveringen = afleveringen.filter(item => {
                return !item.uitgezonden;
            });
            this.aflevering = _.minBy(uitgezondenAfleveringen, 'aflevering').aflevering;
        }

        this.logger.log('dit is de huidige aflevering: ' + this.aflevering);
        const deelnemer = await getRepository(Deelnemer).findOne({where: {auth0Identifier}});

        return await getRepository(Quizresultaat)
            .createQueryBuilder('resultaat')
            .leftJoinAndSelect('resultaat.vraag', 'vraag')
            .leftJoinAndSelect('resultaat.antwoord', 'antwoord')
            .where('resultaat.aflevering = :aflevering', {aflevering: this.aflevering})
            .andWhere('resultaat.deelnemer = :deelnemerId', {deelnemerId: deelnemer.id})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    async create(quizresultaat: Quizresultaat) {
        this.logger.log('er wordt een antwoord opgeslagen');
        return await this.quizresultaatRepository.save(quizresultaat).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
    }
}
