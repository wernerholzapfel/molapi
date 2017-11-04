import {Component, Inject} from '@nestjs/common';
import {getConnection, Repository} from 'typeorm';

import {Voorspelling} from './voorspelling.entity';

@Component()
export class VoorspellingenService {
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

    async create(voorspelling: Voorspelling) {
        try {
            // return await this.voorspellingRepository.save(voorspelling);
            return await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Voorspelling)
                .values([
                    {
                        aflevering: voorspelling.aflevering,
                        mol: voorspelling.mol,
                        deelnemer: voorspelling.deelnemer,
                        created_at: voorspelling.created_at,
                    },
                ])
                .execute();
        } catch (err) {
            return err;
        }
    }

    async deleteOne(voorspellingId: string) {
        try {
            return await this.voorspellingRepository.removeById(voorspellingId);
        } catch (err) {
            return err;
        }
    }

    //
    // async findVoorspellingenByDeelnemer(deelnemerId: string): Promise<Voorspelling[]> {
    //     try {
    //         return await this.voorspellingRepository.find({deelnemerId});
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
