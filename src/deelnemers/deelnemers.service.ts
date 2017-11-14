import {Component, HttpStatus, Inject, Logger} from '@nestjs/common';
import {Repository} from 'typeorm';

import {Deelnemer} from './deelnemer.interface';

@Component()
export class DeelnemersService {
    private readonly logger = new Logger('deelnemerService', true);

    constructor(@Inject('DeelnemerRepositoryToken') private readonly deelnemerRepository: Repository<Deelnemer>) {
    }

    async findAll(): Promise<Deelnemer[]> {
        try {
            return await this.deelnemerRepository.find(
                {
                    join: {
                        alias: 'deelnemer',
                        leftJoinAndSelect: {
                            voorspellingen: 'deelnemer.voorspellingen',
                        },
                    },
                },
            );
        } catch (err) {
            return err;
        }
    }

    async create(deelnemer: Deelnemer) {
        try {
            return await this.deelnemerRepository.save(deelnemer);
        } catch (err) {
            return err;
        }
    }

    async findVoorspellingen(deelnemerId: string) {
        try {
            this.logger.log('vind voorspelling van deelnemer: ' + deelnemerId);
            return await this.deelnemerRepository.findOneById(deelnemerId);
        } catch (err) {
            return err;
        }
    }

    async findLoggedInDeelnemer(user_id: string, res) {
        try {
            await this.deelnemerRepository.findOne({where: {auth0Identifier: user_id}}).then(response => {
                return res.status(HttpStatus.ACCEPTED).json(response).send();
            });
        } catch (err) {
            return err;
        }
    }
}
