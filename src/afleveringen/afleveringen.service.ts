import {Component, Inject} from '@nestjs/common';
import {Repository} from 'typeorm';
import {Aflevering} from './aflevering.entity';
import * as _ from 'lodash';

@Component()
export class AfleveringenService {
    constructor(@Inject('AfleveringRepositoryToken') private readonly afleveringRepository: Repository<Aflevering>) {
    }

    async findAll(): Promise<Aflevering[]> {
        try {
            return await this.afleveringRepository.find();
        } catch (err) {
            return err;
        }
    }

    async getLatestAflevering(): Promise<Aflevering> {
        const afleveringen = await this.afleveringRepository.find({where: {uitgezonden: true}});
        return _.maxBy(afleveringen, 'aflevering');
    }

    async getCurrentAflevering(): Promise<Aflevering> {
        const afleveringen = await this.afleveringRepository.find({where: {uitgezonden: false}});
        return _.minBy(afleveringen, 'aflevering');
    }

    async create(aflevering: Aflevering) {
        return await this.afleveringRepository.save(aflevering);
    }
}