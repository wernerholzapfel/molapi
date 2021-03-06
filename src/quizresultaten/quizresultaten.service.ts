import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {getRepository, Repository} from 'typeorm';
import {Quizresultaat} from './quizresultaat.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Actie} from '../acties/actie.entity';
import {InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class QuizresultatenService {
    private readonly logger = new Logger('quizresultatenService', true);
    latestUitgezondenAflevering: number;

    constructor(@InjectRepository(Quizresultaat)
                private readonly quizresultaatRepository: Repository<Quizresultaat>) {
    }

    async findAll(firebaseIdentifier: string): Promise<Quizresultaat[]> {
        const acties = await getRepository(Actie).findOne().catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });

        this.latestUitgezondenAflevering = acties.testaflevering;

        if (this.latestUitgezondenAflevering > 0) {

            this.logger.log('dit is de huidige aflevering: ' + this.latestUitgezondenAflevering);
            const deelnemer = await getRepository(Deelnemer).findOne({where: {firebaseIdentifier}});

            return await getRepository(Quizresultaat)
                .createQueryBuilder('resultaat')
                .leftJoinAndSelect('resultaat.vraag', 'vraag')
                .leftJoinAndSelect('resultaat.antwoord', 'antwoord')
                .where('resultaat.aflevering = :aflevering', {aflevering: this.latestUitgezondenAflevering})
                .andWhere('resultaat.deelnemer = :deelnemerId', {deelnemerId: deelnemer.id})
                .getMany()
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });
        }
        else {
            return [];
        }
    }

    async create(quizresultaat: Quizresultaat) {
        this.logger.log('er wordt een antwoord opgeslagen');
        return await getRepository(Quizresultaat).save(quizresultaat)
            .catch((err) => {
            this.logger.log('opslaan van atnwoord fout gegaan: ' + quizresultaat.deelnemer.id);
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
    }
}
