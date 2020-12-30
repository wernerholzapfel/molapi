import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {getConnection, getRepository, Repository} from 'typeorm';
import {PouleInvitation} from './poule-invitation.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Poule} from '../poules/poule.entity';

@Injectable()
export class PouleInvitationService {
    constructor(@InjectRepository(PouleInvitation)
                private readonly pouleInvitationRepository: Repository<PouleInvitation>) {
    }

    async find(): Promise<PouleInvitation[]> {
        return await getConnection()
            .createQueryBuilder()
            .select('poule')
            .from(PouleInvitation, 'poule')
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

    async create(invationId: string, uniqueIdentifier: string) {

        const invitation = await this.pouleInvitationRepository.findOne(invationId)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        if (!invitation) {
            throw new HttpException({
                message: 'Code is niet geldig',
                statusCode: HttpStatus.BAD_REQUEST,
            }, HttpStatus.BAD_REQUEST);
        }

        const deelnemer = await getRepository(Deelnemer)
            .createQueryBuilder('deelnemer')
            .where('deelnemer.firebaseIdentifier = :uniqueIdentifier', {uniqueIdentifier})
            .getOne()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        if (!deelnemer) {
            throw new HttpException({
                message: 'We konden je niet vinden in de database. Log uit en opnieuw in en probeer nog een keer',
                statusCode: HttpStatus.UNAUTHORIZED,
            }, HttpStatus.UNAUTHORIZED);
        }

        await getConnection()
            .createQueryBuilder()
            .relation(Poule, 'deelnemers')
            .of(invitation.poule.id)
            .add(deelnemer.id)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        return invitation.poule;
    }
}
