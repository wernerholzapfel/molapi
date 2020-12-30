import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {getConnection, getManager, Repository} from 'typeorm';
import {Poule} from './poule.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {CreatePouleDto} from './create-poule.dto';
import {PouleInvitation} from '../poule_invitations/poule-invitation.entity';

@Injectable()
export class PoulesService {
    private readonly logger = new Logger('pouleRepository', true);

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

    async create(poule: CreatePouleDto) {
        return await getManager().transaction(async transactionalEntityManager => {
            const savedPoule = await this.pouleRepository.save(poule);

            const pouleInvitation = await transactionalEntityManager
                .getRepository(PouleInvitation)
                .save({poule: {id: savedPoule.id}});

            return await  transactionalEntityManager.getRepository(Poule)
                .createQueryBuilder()
                .select('poule')
                .from(Poule, 'poule')
                .leftJoinAndSelect('poule.deelnemers', 'deelnemers')
                .leftJoinAndSelect('poule.admins', 'admins')
                .leftJoinAndSelect('poule.pouleInvitations', 'pouleInvitations')
                .where('poule.id = :id', {id: savedPoule.id})
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
