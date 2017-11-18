import {Component, HttpStatus, Inject} from '@nestjs/common';
import {Logger} from '@nestjs/common/services/logger.service';
import {getRepository, Repository} from 'typeorm';

import {Voorspelling} from './voorspelling.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';

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

    async create(voorspelling: Voorspelling, auth0Identifier: string, res: any) {
        await getRepository(Deelnemer).findOne({auth0Identifier}).then(deelnemer => {
            if (deelnemer.id !== voorspelling.deelnemer.id) {
                return res.status(HttpStatus.UNAUTHORIZED).json(deelnemer.id + ' probeert voorspellingen van ' + voorspelling.deelnemer.id + ' op te slaan').send();
            }
            this.voorspellingRepository.save(voorspelling).then(response => {
                    return res.status(HttpStatus.CREATED).json(response).send();
                },
                error => {
                    return res.status(HttpStatus.FORBIDDEN).json(error).send();
                });
        });
    }
}
