import {Component, HttpStatus, Inject, Logger} from '@nestjs/common';
import {getConnection, getRepository, Repository} from 'typeorm';
import {Quizvraag} from './quizvraag.entity';
import {HttpException} from '@nestjs/core';
import {Aflevering} from '../afleveringen/aflevering.entity';
import * as _ from 'lodash';
import {Quizresultaat} from '../quizresultaten/quizresultaat.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';
import {Kandidaat} from '../kandidaten/kandidaat.entity';

@Component()
export class QuizvragenService {
    private readonly logger = new Logger('quizvragenService', true);

    constructor(@Inject('QuizvragenRepositoryToken') private readonly quizvraagRepository: Repository<Quizvraag>) {
    }

    async find(auth0Identifier: string): Promise<any> {

        // get current aflevering
        const afleveringen = await getRepository(Aflevering).find({where: {uitgezonden: true}}).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });

        //todo was met ParseInt er omheen??
        const aflevering: number = await _.maxBy(afleveringen, 'aflevering').aflevering;
        this.logger.log('dit is de huidige aflevering: ' + aflevering);

        const deelnemer = await getRepository(Deelnemer).findOne({where: {auth0Identifier}});

        this.logger.log('dit is de huidige deelnemer: ' + auth0Identifier);

        const answeredQuestions = await getRepository(Quizresultaat)
            .createQueryBuilder('resultaat')
            .leftJoinAndSelect('resultaat.vraag', 'vraag')
            .where('resultaat.aflevering = :aflevering', {aflevering})
            .andWhere('resultaat.deelnemer = :deelnemerId', {deelnemerId: deelnemer.id})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
        this.logger.log('answeredQuestions: ' + answeredQuestions.length);

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
        this.logger.log('afleveringQuestions: ' + afleveringQuestions.length);

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

    async updateAntwoorden(antwoord: Quizantwoord) {
        this.logger.log('quizvraag done');
        return await getConnection()
            .createQueryBuilder()
            .update(Quizantwoord)
            .set({antwoord: antwoord.antwoord})
            .where('id = :id', {id: antwoord.id})
            .execute();
    }

    async deleteKandidaten(antwoord: Quizantwoord) {
        const oldAntwoord = await getRepository(Quizantwoord).createQueryBuilder('antwoord')
            .leftJoinAndSelect('antwoord.kandidaten', 'kandidaten')
            .where('antwoord.id = :antwoordId', {antwoordId: antwoord.id})
            .getOne();

        await oldAntwoord.kandidaten.forEach(async kandidaat => {
            this.logger.log('delete: ' + kandidaat.display_name);
            return await
                getConnection()
                    .createQueryBuilder()
                    .relation(Quizantwoord, 'kandidaten')
                    .of(antwoord)
                    .remove(kandidaat);
        });
    }

    async updateKandidaten(antwoord: Quizantwoord, kandidaat: Kandidaat) {
        this.logger.log('kandidaat toegevoegd: ' + kandidaat.display_name);
        return await getConnection()
            .createQueryBuilder()
            .relation(Quizantwoord, 'kandidaten')
            .of(antwoord) // you can use just post id as well
            .add(kandidaat); // you can use just category id as well
    }

    async getQuizVoorAflevering(afleveringId: string) {
        return await getRepository(Quizvraag)
            .createQueryBuilder('vraag')
            .leftJoinAndSelect('vraag.antwoorden', 'antwoord')
            .leftJoinAndSelect('antwoord.kandidaten', 'kandidaten')
            .where('vraag.aflevering = :afleveringId', {afleveringId})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }
}
