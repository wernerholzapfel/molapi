import {HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import {getRepository, Repository} from 'typeorm';
import {Quizpunt} from './quizpunt.entity';
import {Aflevering} from '../afleveringen/aflevering.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import * as _ from 'lodash';
import {Actie} from '../acties/actie.entity';

@Injectable()
export class QuizpuntenService {
    private readonly logger = new Logger('quizpuntenService', true);
    afleveringWithLatestTest: number;

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
            this.afleveringWithLatestTest = afleveringObject.aflevering - 1;
        }
        else {
            const uitgezondenAfleveringen = afleveringen.filter(item => {
                return item.uitgezonden;
            });
            this.afleveringWithLatestTest = _.maxBy(uitgezondenAfleveringen, 'aflevering').aflevering;
        }

        this.logger.log('dit is de huidige aflevering: ' + this.afleveringWithLatestTest);

        return await getRepository(Quizpunt)
            .createQueryBuilder('punten')
            .leftJoinAndSelect('punten.deelnemer', 'deelnemer')
            .leftJoinAndSelect('punten.quizresultaat', 'resultaat')
            .leftJoinAndSelect('resultaat.vraag', 'vraag')
            .leftJoinAndSelect('resultaat.antwoord', 'antwoord')
            .where('punten.afleveringstand = :aflevering', {aflevering: this.afleveringWithLatestTest})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    async findAllForDeelnemer(auth0Identifier: string): Promise<any[]> {
        this.logger.log('dit is de auth0Identifier: ' + auth0Identifier);
        const acties = await getRepository(Actie).findOne().catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });

        this.afleveringWithLatestTest = acties.testaflevering;

        if (this.afleveringWithLatestTest > 0) {
            const deelnemer = await getRepository(Deelnemer).findOne({where: {auth0Identifier}});

            const previousPuntenlijst = await this.getPuntenlijst(this.afleveringWithLatestTest === 1 ? this.afleveringWithLatestTest : this.afleveringWithLatestTest - 1, deelnemer);
            const puntenlijst: any[] = this.addPreviousPuntenToVragen(await this.getPuntenlijst(this.afleveringWithLatestTest, deelnemer), previousPuntenlijst);

            return await _(puntenlijst).groupBy('aflevering')
                .map((objs, key) => ({
                    aflevering: key,
                    display_name: _.head(objs).deelnemer.display_name,
                    afleveringpunten: _.sumBy(objs, 'quizpunten'),
                    vragen: objs,
                })).value();
        }
        else {
            throw new HttpException({
                message: 'er zijn nog geen test resultaten bekend',
                statusCode: HttpStatus.NO_CONTENT,
            }, HttpStatus.NO_CONTENT);
        }
    }

    async getPuntenlijst(afleveringId: number, deelnemer: Deelnemer) {
        return await getRepository(Quizpunt)
            .createQueryBuilder('punten')
            .select('punten.aflevering')
            .addSelect('punten.quizpunten')
            .leftJoinAndSelect('punten.deelnemer', 'deelnemerAlias')
            .leftJoinAndSelect('punten.quizresultaat', 'resultaat')
            .leftJoinAndSelect('resultaat.vraag', 'vraag')
            .leftJoinAndSelect('resultaat.antwoord', 'antwoord')
            .where('punten.afleveringstand = :aflevering', {aflevering: afleveringId})
            .andWhere('punten.deelnemer = :deelnemerId', {deelnemerId: deelnemer.id})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    addPreviousPuntenToVragen(puntenlijst, previousPuntenlijst): any[] {
        this.logger.log('puntenlijst: ' + puntenlijst.length);
        for (const vraag of puntenlijst) {
            this.logger.log(vraag.quizresultaat.vraag.id);
            vraag.deltaQuizpunten = (previousPuntenlijst.find(item => {
                return item.quizresultaat.vraag.id === vraag.quizresultaat.vraag.id;
            }) ? -1 * (vraag.quizpunten - previousPuntenlijst.find(item => {
                return item.quizresultaat.vraag.id === vraag.quizresultaat.vraag.id;
            }).quizpunten) : 0);
        }
        return puntenlijst;
    }
}