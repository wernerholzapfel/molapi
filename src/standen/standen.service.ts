import {Component, Inject, Logger} from '@nestjs/common';
import {Repository} from 'typeorm';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import * as _ from 'lodash';

@Component()
export class StandenService {
    private readonly logger = new Logger('standenService', true);

    constructor(@Inject('AfleveringpuntRepositoryToken') private readonly afleveringpuntRepository: Repository<Afleveringpunten>) {
    }

    async findAll(): Promise<any[]> {
        const puntenlijst = await this.afleveringpuntRepository.find({
            join: {
                alias: 'afleveringpunten',
                leftJoinAndSelect: {
                    deelnemer: 'afleveringpunten.deelnemer',
                },
            },
        });
        return _(puntenlijst).groupBy('deelnemer.id')
            .map((objs, key) => ({
                deelnemerId: key,
                display_name: _.head(objs).deelnemer.display_name,
                molpunten: _.sumBy(objs, 'molpunten'),
                afvallerpunten: _.sumBy(objs, 'afvallerpunten'),
                winnaarpunten: _.sumBy(objs, 'winnaarpunten'),
                totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten'),
            }))
            .value().sort((a, b) => b.totaalpunten - a.totaalpunten);
    }

    async findByDeelnemer(deelnemerId): Promise<Afleveringpunten[]> {
        return await this.afleveringpuntRepository.find({where: {deelnemer: deelnemerId}});
    }
}
