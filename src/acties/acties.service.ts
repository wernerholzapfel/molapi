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
                    voorspellingaflevering: this.determineVoorspellingAflevering(response.voorspellingaflevering, afleveringen) ,
                    testaflevering: this.determineTestAflevering(response.testaflevering, afleveringen),
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

    determineVoorspellingAflevering(afleveringnummer: number, afleveringen: Aflevering[]): number {
        const aflevering = afleveringen.find(item => item.aflevering === afleveringnummer);
        return !aflevering.laatseAflevering ? afleveringnummer : null;
    }

    determineTestAflevering(afleveringnummer: number, afleveringen: Aflevering[]): number {
        const aflevering = afleveringen.find(item => item.aflevering === afleveringnummer);
        return !aflevering.laatseAflevering ? afleveringnummer : null;
    }

    async create(actie: Actie) {
        return await this.actieRepository.save(actie).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
    }
}