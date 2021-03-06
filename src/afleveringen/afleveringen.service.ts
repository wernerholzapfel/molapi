import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {Aflevering} from './aflevering.entity';
import * as _ from 'lodash';
import {CacheService} from '../cache.service';
import {InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class AfleveringenService {
    constructor(@InjectRepository(Aflevering)
                private readonly afleveringRepository: Repository<Aflevering>,
                private readonly cacheService: CacheService) {
    }

    async findAll(): Promise<Aflevering[]> {
        const afleveringen = await this.afleveringRepository.find().catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
        return _.sortBy(afleveringen, 'aflevering');

    }

    async getLatestAflevering(): Promise<Aflevering> {
        const afleveringen = await this.afleveringRepository.find({where: {uitgezonden: true}}).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
        return _.maxBy(afleveringen, 'aflevering');
    }

    async getCurrentAflevering(): Promise<Aflevering> {
        const afleveringen = await this.afleveringRepository.find({where: {uitgezonden: false}}).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
        return _.minBy(afleveringen, 'aflevering');
    }

    async create(aflevering: Aflevering) {
        return await this.afleveringRepository.save(aflevering).then((() => {
            this.cacheService.flushAll();
        })).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
    }
}