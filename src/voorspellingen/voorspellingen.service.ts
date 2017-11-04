import {Component, HttpStatus, Inject} from '@nestjs/common';
import {Logger} from '@nestjs/common/services/logger.service';
import {Repository} from 'typeorm';

import {Voorspelling} from './voorspelling.entity';

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
                        },
                    },
                },
            );
        } catch (err) {
            return err;
        }
    }

    async create(voorspelling: Voorspelling, res: any) {
        await this.voorspellingRepository.save(voorspelling).then(response => {
                return res.status(HttpStatus.CREATED).json(response).send();
            },
            error => {
                return res.status(HttpStatus.FORBIDDEN).json(error).send();
            });
    }

    // async deleteOne(voorspellingId: string) {
    //     try {
    //         return await this.voorspellingRepository.removeById(voorspellingId);
    //     } catch (err) {
    //         return err;
    //     }
    // }


    // async findVoorspellingenByDeelnemer(deelnemer: Deelnemer): Promise<Voorspelling[]> {
    //     try {
    //         return await this.voorspellingRepository.find({deelnemer});
    //     } catch (err) {
    //         return err;
    //     }
    // }
    //
    // async findVoorspellingenByMol(molId: string): Promise<Voorspelling[]> {
    //     try {
    //         return await this.voorspellingRepository.find({molId});
    //     } catch (err) {
    //         return err;
    //     }
    // }

}
