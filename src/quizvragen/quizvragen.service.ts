import {Component, HttpStatus, Inject, Logger} from '@nestjs/common';
import {getRepository, Repository} from 'typeorm';
import {Quizvraag} from './quizvraag.entity';
import {HttpException} from '@nestjs/core';
import {Aflevering} from '../afleveringen/aflevering.entity';
import * as _ from 'lodash';
import {Quizresultaat} from '../quizresultaten/quizresultaat.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';

@Component()
export class QuizvragenService {
    private readonly logger = new Logger('quizvragenService', true);

    constructor(@Inject('QuizvragenRepositoryToken') private readonly quizvraagRepository: Repository<Quizvraag>) {
    }

    async find(auth0Identifier: string): Promise<any> {

        // get current aflevering
        const afleveringen = await getRepository(Aflevering).find({where: {uitgezonden: false}}).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
        const aflevering = _.minBy(afleveringen, 'aflevering').aflevering;
        this.logger.log('dit is de huidige aflevering: ' + aflevering);

        const deelnemer = await getRepository(Deelnemer).findOne({where: {auth0Identifier}});

        this.logger.log('dit is de huidige deelnemer: ' + auth0Identifier);

        const answeredQuestions = await getRepository(Quizresultaat)
            .createQueryBuilder('resultaat')
            .leftJoinAndSelect('resultaat.vraag', 'vraag')
            .where('resultaat.aflevering = :aflevering', {aflevering})
            .where('resultaat.deelnemer = :deelnemerId', {deelnemerId: deelnemer.id})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        const afleveringQuestions = await getRepository(Quizvraag)
            .createQueryBuilder('quizvraag')
            .leftJoinAndSelect('quizvraag.antwoorden', 'antwoorden')
            .where('quizvraag.aflevering = :aflevering', {aflevering})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        answeredQuestions.forEach(answer => {
            const index = afleveringQuestions.findIndex(question => {
                return question.id === answer.vraag.id;
            });
            afleveringQuestions.splice(index, 1);
        });
        this.logger.log(deelnemer.display_name + ' heeft nog ' + afleveringQuestions.length + ' vragen te beantwoorden');
        const activeQuestion = afleveringQuestions.sort((a, b) => 0.5 - Math.random())[0];
        if (activeQuestion) {
        return {
            id: activeQuestion.id,
            aantalOpenVragen: afleveringQuestions.length,
            antwoorden: activeQuestion.antwoorden,
            vraag: activeQuestion.vraag,
            aflevering: activeQuestion.aflevering,
        };
        }
        return {aantalOpenVragen: 0};
    }

    async create(quizvraag: Quizvraag) {
        return await this.quizvraagRepository.save(quizvraag).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
    }
}
