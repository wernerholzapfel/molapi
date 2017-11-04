import {Component, Inject} from '@nestjs/common';
import {Repository} from 'typeorm';

import {Deelnemer} from './deelnemer.interface';

@Component()
export class DeelnemersService {
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

    async deleteOne(deelnemerId: string) {
        try {
            return await this.deelnemerRepository.removeById(deelnemerId);
        } catch (err) {
            return err;
        }
    }
}
