import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {getConnection, Repository} from 'typeorm';
import {Poule} from './poule.entity';

@Injectable()
export class PoulesService {
    constructor(@Inject('PouleRepositoryToken') private readonly pouleRepository: Repository<Poule>) {
    }

    async find(): Promise<Poule[]> {
        return await getConnection()
            .createQueryBuilder()
            .select('poule')
            .from(Poule, 'poule')
            .leftJoinAndSelect('poule.deelnemers', 'deelnemers')
            // .leftJoinAndSelect('poule.deelnemers', 'deelnemers', 'deelnemers.poules = poule.id')
            .leftJoinAndSelect('poule.admins', 'admins')
            .printSql()
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    async create(poule: Poule) {
        return await this.pouleRepository.save(poule).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
    }
}