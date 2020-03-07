import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {getRepository, Repository} from 'typeorm';
import {Actie} from './actie.entity';
import {Aflevering} from '../afleveringen/aflevering.entity';
import {ActieResponse} from './actieresponse.interface';
import {InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class ActiesService {
    private readonly logger = new Logger('ActiesService', true);

    constructor(@InjectRepository(Actie)
                private readonly actieRepository: Repository<Actie>) {
    }

    async find(): Promise<ActieResponse> {

        this.logger.log('acties is aangeroepen ole');
        return await this.actieRepository.createQueryBuilder('actie')
            .getOne().then(async response => {
                const afleveringen = await getRepository(Aflevering).find();
                return {
                    id: response.id,
                    voorspellingaflevering: this.determineVoorspellingAflevering(response.voorspellingaflevering, afleveringen),
                    testaflevering: this.determineTestAflevering(response.testaflevering, afleveringen),
                    testDeadlineDatetime: this.getDeadlineDatetime(response.testaflevering + 1, afleveringen),
                    voorspellingDeadlineDatetime: this.getDeadlineDatetime(response.voorspellingaflevering, afleveringen),
                    updatedDate: response.updatedDate,
                    alwaysUpdate: response.alwaysUpdate,
                    isSeasonFinished: response.isSeasonFinished,
                };
            }).catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    getDeadlineDatetime(afleveringnummer: number, afleveringen: Aflevering[]) {
        if (afleveringnummer > 0 && afleveringnummer < 11) {
            return afleveringen.find(aflevering => aflevering.aflevering === afleveringnummer).deadlineDatetime;
        }
        else {
            return new Date('2020-03-14T19:30:00.000Z');
        }
    }

    determineVoorspellingAflevering(afleveringnummer: number, afleveringen: Aflevering[]): number {
        const aflevering = afleveringen.find(item => item.aflevering === afleveringnummer);
        return !aflevering.laatsteAflevering ? afleveringnummer : null;
    }

    determineTestAflevering(afleveringnummer: number, afleveringen: Aflevering[]): number {
        const aflevering = afleveringen.find(item => item.aflevering === afleveringnummer);
        return (!aflevering || !aflevering.laatsteAflevering) ? afleveringnummer : null;
    }

    async create(actie: Actie) {
        return await this.actieRepository.save(actie).catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
    }
}
