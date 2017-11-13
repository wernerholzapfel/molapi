import {Component, Inject} from '@nestjs/common';
import {Repository} from 'typeorm';
import {Kandidaat} from './kandidaat.entity';


@Component()
export class KandidatenService {
    constructor(@Inject('kandidaatRepositoryToken') private readonly kandidaatRepository: Repository<Kandidaat>) {
    }

    async findAll(): Promise<Kandidaat[]> {
        try {
            return await this.kandidaatRepository.find();
        } catch (err) {
            return err;
        }
    }

    async create(kandidaat: Kandidaat) {
        try {
            await this.kandidaatRepository.save(kandidaat);
        } catch (err) {
            return err;
        }
    }

    async deleteOne(kandidaatId: string) {
        try {
            return await this.kandidaatRepository.removeById(kandidaatId);
        } catch (err) {
            return err;
        }
    }
}
