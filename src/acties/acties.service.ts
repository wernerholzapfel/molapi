import {Component, HttpStatus, Inject} from '@nestjs/common';
import {Repository} from 'typeorm';
import {HttpException} from '@nestjs/core';
import {Actie} from './actie.entity';

@Component()
export class ActiesService {
    constructor(@Inject('ActieRepositoryToken') private readonly actieRepository: Repository<Actie>) {
    }

    async find(): Promise<Actie> {
        return await this.actieRepository.createQueryBuilder('actie')
            .getOne().catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    // tdod
    // async create(aflevering: Aflevering) {
    //     return await this.afleveringRepository.save(aflevering).catch((err) => {
    //         throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
    //     });
    // }
}