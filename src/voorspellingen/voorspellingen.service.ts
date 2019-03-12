import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Logger} from '@nestjs/common/services/logger.service';
import {getConnection, Repository} from 'typeorm';

import {Voorspelling} from './voorspelling.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class VoorspellingenService {
    private readonly logger = new Logger('voorspellingenService', true);

    constructor(@InjectRepository(Voorspelling)
                private readonly voorspellingRepository: Repository<Voorspelling>) {
    }

    async findAll(): Promise<Voorspelling[]> {
        try {
            return await this.voorspellingRepository.find(
                {
                    join: {
                        alias: 'voorspelling',
                        leftJoinAndSelect: {
                            deelnemer: 'voorspelling.deelnemer',
                            mol: 'voorspelling.mol',
                            afvaller: 'voorspelling.afvaller',
                            winnaar: 'voorspelling.winnaar',
                        },
                    },
                },
            );
        } catch (err) {
            return err;
        }
    }

    // get laatste voorspelling van deelnemer

    async getHuidigeVoorspelling(firebaseIdentifier: string) {
        const deelnemer = await getConnection().manager.findOne(Deelnemer, {where: {firebaseIdentifier}});

        if (deelnemer) {

            // @ts-ignore
            deelnemer.voorspellingen = await getConnection()
                .createQueryBuilder()
                .select('*')
                .from(Voorspelling, 'voorspelling')
                .where('voorspelling.deelnemer = :deelnemerId', {deelnemerId: deelnemer.id})
                .orderBy('voorspellingen.aflevering', 'ASC')
                .getOne()
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });

            return deelnemer.voorspellingen;
        }  else {
            throw new HttpException({
                statusCode: HttpStatus.NO_CONTENT,
            }, HttpStatus.NO_CONTENT);
        }
    }

    async create(voorspelling: Voorspelling, firebaseIdentifier?: string) {
        return await this.voorspellingRepository.save(voorspelling)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }
}
