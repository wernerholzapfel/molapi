import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {Logger} from '@nestjs/common/services/logger.service';
import {Repository} from 'typeorm';

import {Voorspelling} from './voorspelling.entity';

@Injectable()
export class VoorspellingenService {
    private readonly logger = new Logger('voorspellingenService', true);

    constructor(@Inject('VoorspellingRepositoryToken') private readonly voorspellingRepository: Repository<Voorspelling>) {
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

    async create(voorspelling: Voorspelling, auth0Identifier?: string) {
        return await this.voorspellingRepository.save(voorspelling)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }
}
