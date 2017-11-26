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

    constructor(@Inject('QuizresultatenRepositoryToken') private readonly quizresultaatRepository: Repository<Quizresultaat>) {
    }

    async findAll(auth0Identifier: string): Promise<Quizresultaat[]> {
        const afleveringen = await getRepository(Aflevering).find({where: {uitgezonden: false}}).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
        const aflevering = _.minBy(afleveringen, 'aflevering').aflevering;
        this.logger.log('dit is de huidige aflevering: ' + aflevering);

        const deelnemer = await getRepository(Deelnemer).findOne({where: {auth0Identifier}});

        return await getRepository(Quizresultaat)
            .createQueryBuilder('resultaat')
            .leftJoinAndSelect('resultaat.vraag', 'vraag')
            .leftJoinAndSelect('resultaat.antwoord', 'antwoord')
            .where('resultaat.aflevering = :aflevering', {aflevering})
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
