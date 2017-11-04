import {Component, Inject} from '@nestjs/common';
import {Repository} from 'typeorm';

import {Mol} from './mol.entity';

@Component()
export class MollenService {
    constructor(@Inject('molRepositoryToken') private readonly molRepository: Repository<Mol>) {
    }

    async findAll(): Promise<Mol[]> {
        try {
            return await this.molRepository.find();
        } catch (err) {
            return err;
        }
    }

    async create(mol: Mol) {
        try {
            await this.molRepository.save(mol);
        } catch (err) {
            return err;
        }
    }

    async deleteOne(molId: string) {
        try {
            return await this.molRepository.removeById(molId);
        } catch (err) {
            return err;
        }
    }
}
