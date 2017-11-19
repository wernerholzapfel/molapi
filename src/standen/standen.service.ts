import {Component, Inject, Logger} from '@nestjs/common';
import {getRepository, Repository} from 'typeorm';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import * as _ from 'lodash';
import {Aflevering} from '../afleveringen/aflevering.entity';

@Component()
export class StandenService {
    private readonly logger = new Logger('standenService', true);

    constructor(@Inject('AfleveringpuntRepositoryToken') private readonly afleveringpuntRepository: Repository<Afleveringpunten>) {
    }

    async findAll(): Promise<any[]> {
        const latestAflevering = await this.getLatestAflevering();
        const puntenlijst = await this.getPuntenVoorAflevering(latestAflevering.aflevering);
        const previouspuntenlijst = await this.getPuntenVoorAflevering(
            latestAflevering.aflevering === 1 ? latestAflevering.aflevering : latestAflevering.aflevering - 1);

        const previousStand = await _(previouspuntenlijst).groupBy('deelnemer.id')
            .map((objs, key) => ({
                deelnemerId: key,
                display_name: _.head(objs).deelnemer.display_name,
                previous_molpunten: _.sumBy(objs, 'molpunten'),
                previous_afvallerpunten: _.sumBy(objs, 'afvallerpunten'),
                previous_winnaarpunten: _.sumBy(objs, 'winnaarpunten'),
                previous_quizpunten: _.sumBy(objs, 'quizpunten'),
                previous_totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + _.sumBy(objs, 'quizpunten'),
            }))
            .value().sort((a, b) => b.totaalpunten - a.totaalpunten);

        return _(puntenlijst).groupBy('deelnemer.id')
            .map((objs, key) => ({
                deelnemerId: key,
                display_name: _.head(objs).deelnemer.display_name,
                molpunten: _.sumBy(objs, 'molpunten'),
                afvallerpunten: _.sumBy(objs, 'afvallerpunten'),
                winnaarpunten: _.sumBy(objs, 'winnaarpunten'),
                quizpunten: _.sumBy(objs, 'quizpunten'),
                totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + _.sumBy(objs, 'quizpunten'),
                delta_molpunten: _.sumBy(objs, 'molpunten') - previousStand.find(item => item.deelnemerId === key).previous_molpunten,
                delta_afvallerpunten: _.sumBy(objs, 'afvallerpunten') - previousStand.find(item => item.deelnemerId === key).previous_afvallerpunten,
                delta_winnaarpunten: _.sumBy(objs, 'winnaarpunten') - previousStand.find(item => item.deelnemerId === key).previous_winnaarpunten,
                delta_quizpunten: _.sumBy(objs, 'quizpunten') - previousStand.find(item => item.deelnemerId === key).previous_quizpunten,
                delta_totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + _.sumBy(objs, 'quizpunten') -
                previousStand.find(item => item.deelnemerId === key).previous_totaalpunten,
            }))
            .value().sort((a, b) => b.totaalpunten - a.totaalpunten);
    }

    async findByDeelnemer(deelnemerId): Promise<Afleveringpunten[]> {
        const latestAflevering: Aflevering = await this.getLatestAflevering();

        return await this.afleveringpuntRepository.find({where: {deelnemer: deelnemerId}})
            .then(afleveringpunten => {
            return afleveringpunten.filter(afleveringpunt => {
                return afleveringpunt.afleveringstand === latestAflevering.aflevering; });
            });
        }

        // const latestAflevering: Aflevering = await this.getLatestAflevering();
        //
        // return await getRepository(Afleveringpunten)
        //     .createQueryBuilder('Afleveringpunten')
        //     .where('Afleveringpunten.deelnemer = :deelnemerId', {deelnemerId})
        //     .andWhere('Afleveringpunten.afleveringstand = :aflevering', {aflevering: latestAflevering.aflevering})
        //     .getMany();

    async getPuntenVoorAflevering(aflevering: number) {
        return await this.afleveringpuntRepository.find({
            join: {
                alias: 'afleveringpunten',
                leftJoinAndSelect: {
                    deelnemer: 'afleveringpunten.deelnemer',
                },
            },
        }).then(response => {
            return response.filter(item => {
                return item.afleveringstand === aflevering;
            });
        });
    }

    async getLatestAflevering(): Promise<Aflevering> {
        const afleveringen = await getRepository(Aflevering).find({where: {uitgezonden: true}});
        return _.maxBy(afleveringen, 'aflevering');

    }
}
