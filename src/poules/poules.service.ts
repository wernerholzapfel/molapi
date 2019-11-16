import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {getConnection, Repository} from 'typeorm';
import {Poule} from './poule.entity';
import {InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class PoulesService {
    constructor(@InjectRepository(Poule)
                private readonly pouleRepository: Repository<Poule>) {
    }

    async find(): Promise<Poule[]> {
        return await getConnection()
            .createQueryBuilder()
            .select('poule')
            .from(Poule, 'poule')
            .leftJoinAndSelect('poule.deelnemers', 'deelnemers')
            .leftJoinAndSelect('poule.admins', 'admins')
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    async create(poule: Poule) {
        return await this.pouleRepository.save(poule).then(async response => {
            return await getConnection()
                .createQueryBuilder()
                .select('poule')
                .from(Poule, 'poule')
                .leftJoinAndSelect('poule.deelnemers', 'deelnemers')
                .leftJoinAndSelect('poule.admins', 'admins')
                .where('poule.id = :id', {id: response.id})
                .getOne()
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });

        }).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
    }
}
