import {Component, Inject, Logger} from '@nestjs/common';
import {getRepository, Repository} from 'typeorm';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import * as _ from 'lodash';
import {Aflevering} from '../afleveringen/aflevering.entity';
import {Quizpunt} from '../quizpunten/quizpunt.entity';

@Component()
export class StandenService {
    private readonly logger = new Logger('standenService', true);

    constructor(@Inject('AfleveringpuntRepositoryToken') private readonly afleveringpuntRepository: Repository<Afleveringpunten>) {
    }

    async findAll(): Promise<any[]> {
        const latestAflevering = await this.getLatestAflevering();
        this.logger.log('latestAflevering: ' + latestAflevering.aflevering);
        const puntenlijst = await this.getPuntenVoorAflevering(latestAflevering.aflevering);
        const previouspuntenlijst = await this.getPuntenVoorAflevering(
            latestAflevering.aflevering === 1 ? latestAflevering.aflevering : latestAflevering.aflevering - 1);

        const quizPuntenlijst = await this.getPuntenVoorQuiz(latestAflevering.aflevering);
        const QuizPreviouspuntenlijst = await this.getPuntenVoorQuiz(
            latestAflevering.aflevering === 1 ? latestAflevering.aflevering : latestAflevering.aflevering - 1);

        const previousQuizStand = await _(QuizPreviouspuntenlijst).groupBy('deelnemer.id')
            .map((objs, key) => ({
                deelnemerId: key,
                quizpunten: _.sumBy(objs, 'quizpunten'),
            }))
            .value();

        const quizStand = await _(quizPuntenlijst).groupBy('deelnemer.id')
            .map((objs, key) => ({
                deelnemerId: key,
                quizpunten: _.sumBy(objs, 'quizpunten'),
            }))
            .value();

        const previousStand = await _(previouspuntenlijst).groupBy('deelnemer.id')
            .map((objs, key) => ({
                deelnemerId: key,
                display_name: _.head(objs).deelnemer.display_name,
                previous_molpunten: _.sumBy(objs, 'molpunten'),
                previous_afvallerpunten: _.sumBy(objs, 'afvallerpunten'),
                previous_winnaarpunten: _.sumBy(objs, 'winnaarpunten'),
                quizpunten: previousQuizStand.find(item => item.deelnemerId === key).quizpunten,
                previous_totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + _.sumBy(objs, 'quizpunten'),
            }))
            .value().sort((a, b) => b.totaalpunten - a.totaalpunten);

        return await _(puntenlijst).groupBy('deelnemer.id')
            .map((objs, key) => ({
                deelnemerId: key,
                display_name: _.head(objs).deelnemer.display_name,
                molpunten: _.sumBy(objs, 'molpunten'),
                afvallerpunten: _.sumBy(objs, 'afvallerpunten'),
                winnaarpunten: _.sumBy(objs, 'winnaarpunten'),
                quizpunten: quizStand.find(item => item.deelnemerId === key).quizpunten,
                totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + _.sumBy(objs, 'quizpunten'),
                delta_molpunten: _.sumBy(objs, 'molpunten') - previousStand.find(item => item.deelnemerId === key).previous_molpunten,
                delta_afvallerpunten: _.sumBy(objs, 'afvallerpunten') - previousStand.find(item => item.deelnemerId === key).previous_afvallerpunten,
                delta_winnaarpunten: _.sumBy(objs, 'winnaarpunten') - previousStand.find(item => item.deelnemerId === key).previous_winnaarpunten,
                delta_quizpunten: quizStand.find(item => item.deelnemerId === key).quizpunten - previousStand.find(item => item.deelnemerId === key).quizpunten,
                delta_totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + _.sumBy(objs, 'quizpunten') -
                previousStand.find(item => item.deelnemerId === key).previous_totaalpunten,
            }))
            .value().sort((a, b) => b.totaalpunten - a.totaalpunten);

    }

    async findByDeelnemer(deelnemerId): Promise<any[]> {
        // const latestAflevering = {aflevering: 2};
        const latestAflevering = await this.getLatestAflevering();

        this.logger.log('latestAflevering: ' + latestAflevering.aflevering);
        const puntenlijst = await this.getPuntenVoorAfleveringVoorDeelnemer(latestAflevering.aflevering, deelnemerId);
        const previouspuntenlijst = await this.getPuntenVoorAfleveringVoorDeelnemer(
            latestAflevering.aflevering === 1 ? latestAflevering.aflevering : latestAflevering.aflevering - 1, deelnemerId);

        const quizPuntenlijst = await this.getPuntenVoorQuizVoorDeelnemer(latestAflevering.aflevering, deelnemerId);
        const QuizPreviouspuntenlijst = await this.getPuntenVoorQuizVoorDeelnemer(
            latestAflevering.aflevering === 1 ? latestAflevering.aflevering : latestAflevering.aflevering - 1, deelnemerId);

        const previousQuizStand = await _(QuizPreviouspuntenlijst).groupBy('aflevering')
            .map((objs, key) => ({
                aflevering: parseInt(key, 10),
                deelnemerId: _.head(objs).deelnemer.id,
                deelnemer: _.head(objs).deelnemer,
                afleveringstand: _.head(objs).afleveringstand,
                quizpunten: _.sumBy(objs, 'quizpunten'),
            }))
            .value();

        const quizStand = await _(quizPuntenlijst).groupBy('aflevering')
            .map((objs, key) => ({
                aflevering: parseInt(key, 10),
                deelnemerId: _.head(objs).deelnemer.id,
                deelnemer: _.head(objs).deelnemer,
                afleveringstand: _.head(objs).afleveringstand,
                quizpunten: _.sumBy(objs, 'quizpunten'),
                deltaquizpunten: this.determineDeltaQuizPunten(key, previousQuizStand, objs),
            }))
            .value();

        const previousStand = await _(previouspuntenlijst).groupBy('aflevering')
            .map((objs, key) => ({
                aflevering: parseInt(key, 10),
                deelnemerId: _.head(objs).deelnemer.id,
                deelnemer: _.head(objs).deelnemer,
                previous_molpunten: _.sumBy(objs, 'molpunten'),
                previous_afvallerpunten: _.sumBy(objs, 'afvallerpunten'),
                previous_winnaarpunten: _.sumBy(objs, 'winnaarpunten'),
                previous_quizpunten: this.determinePreviousQuizPunten(previousQuizStand, key),
                previous_totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + this.determinePreviousQuizPunten(previousQuizStand, key),
            }))
            .value().sort((a, b) => b.totaalpunten - a.totaalpunten);

        return await _(puntenlijst).groupBy('aflevering')
            .map((objs, key) => ({
                aflevering: parseInt(key, 10),
                deelnemerId: _.head(objs).deelnemer.id,
                deelnemer: _.head(objs).deelnemer,
                display_name: _.head(objs).deelnemer.display_name,
                voorspelling: _.head(objs).voorspelling,
                molpunten: _.sumBy(objs, 'molpunten'),
                afvallerpunten: _.sumBy(objs, 'afvallerpunten'),
                winnaarpunten: _.sumBy(objs, 'winnaarpunten'),
                quizpunten: this.determinePreviousQuizPunten(quizStand, key),
                totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + _.sumBy(objs, 'quizpunten'),
                delta_molpunten: _.sumBy(objs, 'molpunten') - this.determinePreviousMolpunten(previousStand, key),
                delta_afvallerpunten: _.sumBy(objs, 'afvallerpunten') - this.determinePreviousAfvallerpunten(previousStand, key),
                delta_winnaarpunten: _.sumBy(objs, 'winnaarpunten') - this.determinePreviousWinnaarpunten(previousStand, key),
                delta_quizpunten: this.determinePreviousQuizPunten(quizStand, key) - this.determinePreviousQuizPunten(previousQuizStand, key),
                delta_totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + this.determinePreviousQuizPunten(quizStand, key) -
                this.determinePreviousTotaalpunten(previousStand, key),
            }))
            .value().sort((a, b) => a.aflevering - b.aflevering);
    }


    determinePreviousMolpunten(previousQuizStand, key) {
        if (previousQuizStand.length > 0) {
            return (parseInt(key, 10) > _.maxBy(previousQuizStand, 'aflevering').aflevering) ? 0 : previousQuizStand.find(item => {
                return item.aflevering === (parseInt(key, 10));
            }).previous_molpunten;
        }
        return 0;
    }

    determinePreviousAfvallerpunten(previousQuizStand, key) {
        if (previousQuizStand.length > 0) {
            return (parseInt(key, 10) > _.maxBy(previousQuizStand, 'aflevering').aflevering) ? 0 : previousQuizStand.find(item => {
                return item.aflevering === (parseInt(key, 10));
            }).previous_afvallerpunten;
        }
        return 0;
    }

    determinePreviousWinnaarpunten(previousQuizStand, key) {
        if (previousQuizStand.length > 0) {
            return (parseInt(key, 10) > _.maxBy(previousQuizStand, 'aflevering').aflevering) ? 0 : previousQuizStand.find(item => {
                return item.aflevering === (parseInt(key, 10));
            }).previous_winnaarpunten;
        }
        return 0;
    }

    determinePreviousTotaalpunten(previousQuizStand, key) {
        if (previousQuizStand.length > 0) {
            return (parseInt(key, 10) > _.maxBy(previousQuizStand, 'aflevering').aflevering) ? 0 : previousQuizStand.find(item => {
                return item.aflevering === (parseInt(key, 10));
            }).previous_totaalpunten;
        }
        return 0;
    }

    determinePreviousQuizPunten(previousQuizStand, key) {
        if (previousQuizStand.length > 0) {
            return (parseInt(key, 10) > _.maxBy(previousQuizStand, 'aflevering').aflevering) ? 0 : previousQuizStand.find(item => {
                return item.aflevering === (parseInt(key, 10));
            }).quizpunten;
        }
        return 0;
    }

    determineDeltaQuizPunten(key, previousQuizStand: any[], objs) {
        if (previousQuizStand.length > 0) {
            return (parseInt(key, 10) > _.maxBy(previousQuizStand, 'aflevering').aflevering) ? 0 : _.sumBy(objs, 'quizpunten') - previousQuizStand.find(item => {
                return item.aflevering === (parseInt(key, 10));
            }).quizpunten;
        }
        return 0;
    }

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

    async getPuntenVoorAfleveringVoorDeelnemer(aflevering: number, deelnemerId: string) {
        return await this.afleveringpuntRepository.find({
            join: {
                alias: 'afleveringpunten',
                leftJoinAndSelect: {
                    deelnemer: 'afleveringpunten.deelnemer',
                },
            },
        }).then(response => {
            return response.filter(item => {
                return item.afleveringstand === aflevering && item.deelnemer.id === deelnemerId;
            });
        });
    }

    async getPuntenVoorQuiz(aflevering: number) {
        return await getRepository(Quizpunt).find({
            join: {
                alias: 'quizpunten',
                leftJoinAndSelect: {
                    deelnemer: 'quizpunten.deelnemer',
                },
            },
        }).then(response => {
            return response.filter(item => {
                return item.afleveringstand === aflevering;
            });
        });
    }

    async getPuntenVoorQuizVoorDeelnemer(aflevering: number, deelnemerId: string) {
        return await getRepository(Quizpunt).find({
            join: {
                alias: 'quizpunten',
                leftJoinAndSelect: {
                    deelnemer: 'quizpunten.deelnemer',
                },
            },
        }).then(response => {
            return response.filter(item => {
                return item.afleveringstand === aflevering &&
                    item.deelnemer.id === deelnemerId;
            });
        });
    }

    async getLatestAflevering(): Promise<Aflevering> {
        const afleveringen = await getRepository(Aflevering).find({where: {uitgezonden: true}});
        return _.maxBy(afleveringen, 'aflevering');

    }
}
