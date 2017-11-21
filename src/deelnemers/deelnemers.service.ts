import {Component, HttpStatus, Inject, Logger} from '@nestjs/common';
import {Repository} from 'typeorm';

import {Deelnemer} from './deelnemer.interface';
import {HttpException} from '@nestjs/core';

@Component()
export class DeelnemersService {
    private readonly logger = new Logger('deelnemerService', true);

    constructor(@Inject('DeelnemerRepositoryToken') private readonly deelnemerRepository: Repository<Deelnemer>) {
    }

    async findAll(): Promise<Deelnemer[]> {
        return await this.deelnemerRepository.find(
            {
                join: {
                    alias: 'deelnemer',
                    leftJoinAndSelect: {
                        voorspellingen: 'deelnemer.voorspellingen',
                    },
                },
            },
        ).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
    }

    async create(deelnemer: Deelnemer) {
        return await this.deelnemerRepository.save(deelnemer)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    async findVoorspellingen(deelnemerId: string) {
        this.logger.log('vind voorspelling van deelnemer: ' + deelnemerId);
        return await this.deelnemerRepository.findOneById(deelnemerId)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    async findLoggedInDeelnemer(user_id) {
        this.logger.log(user_id);
        return await this.deelnemerRepository.findOne({where: {auth0Identifier: user_id}}).then(deelnemer => {
            return deelnemer; }, (err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
    }
}
