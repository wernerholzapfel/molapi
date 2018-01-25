import {Component, HttpStatus, Inject} from '@nestjs/common';
import {getRepository, Repository} from 'typeorm';
import {HttpException} from '@nestjs/core';
import {Actie} from './actie.entity';
import {Aflevering} from '../afleveringen/aflevering.entity';
import {ActieResponse} from './actieresponse.interface';

@Component()
export class ActiesService {
    constructor(@Inject('ActieRepositoryToken') private readonly actieRepository: Repository<Actie>) {
    }

    async find(): Promise<ActieResponse> {
        return await this.actieRepository.createQueryBuilder('actie')
            .getOne().then(async response => {
                const afleveringen = await getRepository(Aflevering).find();
                return {
                    id: response.id,
                    voorspellingaflevering: response.voorspellingaflevering,
                    testaflevering: response.testaflevering,
                    testDeadlineDatetime: this.getDeadlineDatetime(response.testaflevering + 1, afleveringen),
                    voorspellingDeadlineDatetime: this.getDeadlineDatetime(response.voorspellingaflevering, afleveringen),
                };
            }).catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    getDeadlineDatetime(afleveringnummer: number, afleveringen: Aflevering[]) {
        if (afleveringnummer > 0) {
            return afleveringen.find(aflevering => aflevering.aflevering === afleveringnummer).deadlineDatetime;
        }
        else {
            return null;
        }
    }

    // tdod
    // async create(aflevering: Aflevering) {
    //     return await this.afleveringRepository.save(aflevering).catch((err) => {
    //         throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
    //     });
    // }
}