import {Component, HttpStatus, Inject} from '@nestjs/common';
import {Logger} from '@nestjs/common/services/logger.service';
import {getRepository, Repository} from 'typeorm';

import {Voorspelling} from './voorspelling.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {HttpException} from '@nestjs/core';

@Component()
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
        return await getRepository(Deelnemer).findOne({auth0Identifier}).then(async deelnemer => {
            if (deelnemer.id !== voorspelling.deelnemer.id) {
                 throw new HttpException({message: deelnemer.id + ' probeert voorspellingen van ' + voorspelling.deelnemer.id + ' op te slaan', statusCode: HttpStatus.FORBIDDEN}, HttpStatus.FORBIDDEN);
            }
            return await this.voorspellingRepository.save(voorspelling)
                .catch((err) => {
                    throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
                });
        });
    }
}
