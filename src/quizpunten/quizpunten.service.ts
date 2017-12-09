import {Component, HttpStatus, Inject, Logger} from '@nestjs/common';
import {getRepository, Repository} from 'typeorm';
import {Quizpunt} from './quizpunt.entity';
import {HttpException} from '@nestjs/core';
import {Aflevering} from '../afleveringen/aflevering.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import * as _ from 'lodash';

@Component()
export class QuizpuntenService {
    private readonly logger = new Logger('quizpuntenService', true);
    aflevering: number;

    constructor(@Inject('QuizpuntRepositoryToken') private readonly quizpuntRepository: Repository<Quizpunt>) {
    }

    // todo groeperen op deelnemer
    async findAll(): Promise<Quizpunt[]> {
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
                return item.uitgezonden;
            });
            this.aflevering = _.maxBy(uitgezondenAfleveringen, 'aflevering').aflevering;
        }

        this.logger.log('dit is de huidige aflevering: ' + this.aflevering);

        return await getRepository(Quizpunt)
            .createQueryBuilder('punten')
            .leftJoinAndSelect('punten.deelnemer', 'deelnemer')
            .leftJoinAndSelect('punten.quizresultaat', 'resultaat')
            .leftJoinAndSelect('resultaat.vraag', 'vraag')
            .leftJoinAndSelect('resultaat.antwoord', 'antwoord')
            .where('punten.afleveringstand = :aflevering', {aflevering: this.aflevering})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    async findAllForDeelnemer(auth0Identifier: string): Promise<Quizpunt[]> {
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
                return item.uitgezonden;
            });
            this.aflevering = _.maxBy(uitgezondenAfleveringen, 'aflevering').aflevering;
        }

        this.logger.log('dit is de huidige aflevering: ' + this.aflevering);
        const deelnemer = await getRepository(Deelnemer).findOne({where: {auth0Identifier}});

        return await getRepository(Quizpunt)
            .createQueryBuilder('punten')
            .leftJoinAndSelect('punten.deelnemer', 'deelnemerAlias')
            .leftJoinAndSelect('punten.quizresultaat', 'resultaat')
            .leftJoinAndSelect('resultaat.vraag', 'vraag')
            .leftJoinAndSelect('resultaat.antwoord', 'antwoord')
            .where('punten.afleveringstand = :aflevering', {aflevering: this.aflevering})
            .andWhere('punten.deelnemer = :deelnemerId', {deelnemerId: deelnemer.id})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }
}
