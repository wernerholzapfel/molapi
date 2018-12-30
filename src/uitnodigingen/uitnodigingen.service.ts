import {HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import {getConnection, getRepository, Repository} from 'typeorm';
import {Uitnodiging} from './uitnodiging.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {AcceptUitnodigingDto, DeclineUitnodigingDto} from './create-uitnodiging.dto';
import {Poule} from '../poules/poule.entity';

@Injectable()
export class UitnodigingenService {
    private readonly logger = new Logger('UitnodigingenService', true);

    constructor(@Inject('UitnodigingRepositoryToken') private readonly uitnodigingRepository: Repository<Uitnodiging>) {
    }

    async find(uniqueIdentifier): Promise<any> {
        const deelnemer = await getRepository(Deelnemer)
            .createQueryBuilder('deelnemer')
            .select('deelnemer.email')
            .where('deelnemer.firebaseIdentifier = :uniqueIdentifier', {uniqueIdentifier})
            .getOne()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        return await getRepository(Uitnodiging)
            .createQueryBuilder('uitnodiging')
            .leftJoinAndSelect('uitnodiging.poule', 'poule')
            .leftJoinAndSelect('poule.admins', 'admins')
            .where('uitnodiging.uniqueIdentifier = :email', {email: deelnemer.email})
            .andWhere('uitnodiging.isAccepted = false')
            .andWhere('uitnodiging.isDeclined = false')
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    async create(uitnodiging: Uitnodiging, firebaseIdentifier: string) {
        // todo check if admin of poule
        this.logger.log(uitnodiging.uniqueIdentifier);
        return await this.uitnodigingRepository
            .save(uitnodiging)
            .catch((err) => {
                throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    },
                    HttpStatus.BAD_REQUEST);
            });
    }

    async accept(acceptUitnodiging: AcceptUitnodigingDto, uniqueIdentifier: string) {
        // versimpelen door alleen uitnodigingId mee te sturen en adhv  de uitndoging ophalen en de pouleId gebruiken

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

        // update uitnoding set isAccepted
        await getConnection()
            .createQueryBuilder()
            .update(Uitnodiging)
            .set({isAccepted: true})
            .where('id = :id', {id: acceptUitnodiging.uitnodigingId})
            .execute();

        const poule = await getRepository(Poule)
            .createQueryBuilder('poule')
            .select('*')
            .where('poule.id = :pouleId', {pouleId: acceptUitnodiging.poule.id})
            .getOne();

        this.logger.log('deelnemerId: ' + deelnemer.id);
        return await getConnection()
            .createQueryBuilder()
            .relation(Poule, 'deelnemers')
            .of(acceptUitnodiging.poule.id)
            .add(deelnemer.id)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

    }

    async decline(declineUitnodiging: DeclineUitnodigingDto, uniqueIdentifier: string) {
        // versimpelen door alleen uitnodigingId mee te sturen en adhv  de uitndoging ophalen en de pouleId gebruiken

        const deelnemer = await getRepository(Deelnemer)
            .createQueryBuilder('deelnemer')
            .select('deelnemer.email')
            .where('deelnemer.firebaseIdentifier = :uniqueIdentifier', {uniqueIdentifier})
            .getOne()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        if (deelnemer) {
            this.logger.log('declinde please ' + declineUitnodiging.uitnodigingId + deelnemer.email);
            // update uitnoding set isDeclined
            return await getConnection()
                .createQueryBuilder()
                .update(Uitnodiging)
                .set({isDeclined: true})
                .where('id = :id', {id: declineUitnodiging.uitnodigingId})
                .andWhere('uniqueIdentifier = :email', {email: deelnemer.email})
                .execute()
                .catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });
        } else {
            throw new HttpException({
                statusCode: HttpStatus.FORBIDDEN,
            }, HttpStatus.FORBIDDEN);
        }
    }

    async findByPouleId(uniqueIdentifier, pouleId): Promise<any> {

        // todo mooier maken.

        const deelnemer = await getRepository(Deelnemer)
            .createQueryBuilder('deelnemer')
            .select('deelnemer.id')
            .where('deelnemer.firebaseIdentifier = :uniqueIdentifier', {uniqueIdentifier})
            .getOne()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        const uitnodigingen = await getRepository(Uitnodiging)
            .createQueryBuilder('uitnodiging')
            .leftJoinAndSelect('uitnodiging.poule', 'poule')
            .leftJoinAndSelect('poule.admins', 'admins')
            .where('poule.id = :pouleId', {pouleId})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        if (uitnodigingen[0].poule.admins[0].id === deelnemer.id) {
            return uitnodigingen;
        } else {
            return [];
        }
    }
}