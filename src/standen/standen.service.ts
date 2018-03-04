import {Component, HttpStatus, Inject, Logger} from '@nestjs/common';
import {getConnection, getRepository, Repository} from 'typeorm';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import * as _ from 'lodash';
import {Aflevering} from '../afleveringen/aflevering.entity';
import {Quizpunt} from '../quizpunten/quizpunt.entity';
import {Kandidaat} from '../kandidaten/kandidaat.entity';
import {HttpException} from '@nestjs/core';
import {CacheService} from '../cache.service';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';

@Component()
export class StandenService {
    private readonly logger = new Logger('standenService', true);

    constructor(@Inject('AfleveringpuntRepositoryToken') private readonly afleveringpuntRepository: Repository<Afleveringpunten>, public readonly cacheService: CacheService) {
        this.findAll().then(async deelnemers => {
            for (const deelnemer of deelnemers) {
                this.findByDeelnemer(deelnemer.deelnemerId);
            }
        });
    }

    async findAll(): Promise<any[]> {
        const afleveringen = await this.getAlleUitgezondenAfleveringen();
        const latestUitgezondenAflevering = _.maxBy(afleveringen, 'aflevering');

        if (latestUitgezondenAflevering) {
            this.logger.log('latestUitgezondenAflevering: ' + latestUitgezondenAflevering.aflevering);
            const puntenlijst = await this.getPuntenVoorAflevering(latestUitgezondenAflevering.aflevering);
            const previouspuntenlijst = await this.getPuntenVoorAflevering(
                latestUitgezondenAflevering.aflevering === 1 ? latestUitgezondenAflevering.aflevering : latestUitgezondenAflevering.aflevering - 1);

            const quizPuntenlijst = await this.getPuntenVoorQuiz(latestUitgezondenAflevering.aflevering);
            const QuizPreviouspuntenlijst = await this.getPuntenVoorQuiz(
                latestUitgezondenAflevering.aflevering === 1 ? latestUitgezondenAflevering.aflevering : latestUitgezondenAflevering.aflevering - 1);

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
                    // display_name: _.head(objs).deelnemer.display_name,
                    // previous_molpunten: _.sumBy(objs, 'molpunten'),
                    // previous_afvallerpunten: _.sumBy(objs, 'afvallerpunten'),
                    // previous_winnaarpunten: _.sumBy(objs, 'winnaarpunten'),
                    // quizpunten: (previousQuizStand.find(item => item.deelnemerId === key) ? previousQuizStand.find(item => item.deelnemerId === key).quizpunten : 0),
                    previous_totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + ((previousQuizStand.find(item => item.deelnemerId === key) ? previousQuizStand.find(item => item.deelnemerId === key).quizpunten : 0)),
                }))
                .value();

            const response = await _(puntenlijst).groupBy('deelnemer.id')
                .map((objs, key) => ({
                    deelnemerId: key,
                    display_name: _.head(objs).deelnemer.display_name,
                    // molpunten: _.sumBy(objs, 'molpunten'),
                    // afvallerpunten: _.sumBy(objs, 'afvallerpunten'),
                    // winnaarpunten: _.sumBy(objs, 'winnaarpunten'),
                    // quizpunten: quizStand.find(item => item.deelnemerId === key) ? quizStand.find(item => item.deelnemerId === key).quizpunten : 0,
                    totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + (quizStand.find(item => item.deelnemerId === key) ? quizStand.find(item => item.deelnemerId === key).quizpunten : 0),
                    // delta_molpunten: _.sumBy(objs, 'molpunten') - (previousStand.find(item => item.deelnemerId === key) ? previousStand.find(item => item.deelnemerId === key).previous_molpunten : 0),
                    // delta_afvallerpunten: _.sumBy(objs, 'afvallerpunten') - (previousStand.find(item => item.deelnemerId === key) ? previousStand.find(item => item.deelnemerId === key).previous_afvallerpunten : 0),
                    // delta_winnaarpunten: _.sumBy(objs, 'winnaarpunten') - (previousStand.find(item => item.deelnemerId === key) ? previousStand.find(item => item.deelnemerId === key).previous_winnaarpunten : 0),
                    // delta_quizpunten: quizStand.find(item => item.deelnemerId === key) && quizStand.find(item => item.deelnemerId === key) ? quizStand.find(item => item.deelnemerId === key).quizpunten - (previousStand.find(item => item.deelnemerId === key) ? previousStand.find(item => item.deelnemerId === key).quizpunten : 0) : 0,
                    delta_totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + (quizStand.find(item => item.deelnemerId === key) ? quizStand.find(item => item.deelnemerId === key).quizpunten : 0) -
                    (previousStand.find(item => item.deelnemerId === key) ? previousStand.find(item => item.deelnemerId === key).previous_totaalpunten : 0),
                }))
                .value();

            this.cacheService.set('api/v1/standen', _.sortBy(response, [o => -o.totaalpunten], [o => o.delta_totaalpunten], [o => o.display_name]));
            return _.sortBy(response, [o => -o.totaalpunten], [o => o.delta_totaalpunten], [o => o.display_name]);
        }
        else {
            throw new HttpException({
                message: 'er is nog geen stand bekend',
                statusCode: HttpStatus.NO_CONTENT,
            }, HttpStatus.NO_CONTENT);
        }
    }

    async findByDeelnemer(deelnemerId): Promise<any[]> {
        const alleUitgezondenAfleveringen = await this.getAlleUitgezondenAfleveringen();

        const laatsteAfleveringMetTestOrVoorspelling = _.maxBy(alleUitgezondenAfleveringen, 'aflevering');

        const puntenlijst = await this.getPuntenVoorAfleveringVoorDeelnemer(laatsteAfleveringMetTestOrVoorspelling.aflevering, deelnemerId);

        const previouspuntenlijst = await this.getPuntenVoorAfleveringVoorDeelnemer(
            laatsteAfleveringMetTestOrVoorspelling.aflevering === 1 ? laatsteAfleveringMetTestOrVoorspelling.aflevering : laatsteAfleveringMetTestOrVoorspelling.aflevering - 1, deelnemerId);

        const quizPuntenlijst = await this.getPuntenVoorQuizVoorDeelnemer(laatsteAfleveringMetTestOrVoorspelling.aflevering, deelnemerId);

        const QuizPreviouspuntenlijst = await this.getPuntenVoorQuizVoorDeelnemer(
            laatsteAfleveringMetTestOrVoorspelling.aflevering === 1 ? laatsteAfleveringMetTestOrVoorspelling.aflevering : laatsteAfleveringMetTestOrVoorspelling.aflevering - 1, deelnemerId);

        const previousQuizStand = await _(QuizPreviouspuntenlijst).groupBy('aflevering')
            .map((objs, key) => ({
                aflevering: parseInt(key, 10),
                deelnemerId: _.head(objs).deelnemer.id,
                // deelnemer: _.head(objs).deelnemer,
                // afleveringstand: _.head(objs).afleveringstand,
                quizpunten: _.sumBy(objs, 'quizpunten'),
            }))
            .value();

        const quizStand = await _(quizPuntenlijst).groupBy('aflevering')
            .map((objs, key) => ({
                aflevering: parseInt(key, 10),
                deelnemerId: _.head(objs).deelnemer.id,
                // deelnemer: _.head(objs).deelnemer,
                // afleveringstand: _.head(objs).afleveringstand,
                quizpunten: _.sumBy(objs, 'quizpunten'),
                deltaquizpunten: this.determineDeltaQuizPunten(key, previousQuizStand, objs),
            }))
            .value();

        const previousStand: any = await _(previouspuntenlijst).groupBy('aflevering')
            .map((objs, key) => ({
                aflevering: parseInt(key, 10),
                deelnemerId: _.head(objs).deelnemer.id,
                deelnemer: _.head(objs).deelnemer,
                previous_molpunten: _.sumBy(objs, 'molpunten'),
                previous_afvallerpunten: _.sumBy(objs, 'afvallerpunten'),
                previous_winnaarpunten: _.sumBy(objs, 'winnaarpunten'),
                previous_quizpunten: this.determineQuizPunten(previousQuizStand, key),
                previous_totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + this.determineQuizPunten(previousQuizStand, key),
            }))
            .value();

        const resultatenLijst = await _(puntenlijst).groupBy('aflevering')
            .map((objs, key) => ({
                aflevering: parseInt(key, 10),
                // deelnemerId: _.head(objs).deelnemer.id,
                // deelnemer: _.head(objs).deelnemer,
                // display_name: _.head(objs).deelnemer.display_name,
                voorspelling: _.head(objs).voorspelling,
                molpunten: _.sumBy(objs, 'molpunten'),
                afvallerpunten: _.sumBy(objs, 'afvallerpunten'),
                winnaarpunten: _.sumBy(objs, 'winnaarpunten'),
                quizpunten: this.determineQuizPunten(quizStand, key),
                totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + this.determineQuizPunten(quizStand, key),
                delta_molpunten: _.sumBy(objs, 'molpunten') - this.determinePreviousMolpunten(previousStand, key),
                delta_afvallerpunten: _.sumBy(objs, 'afvallerpunten') - this.determinePreviousAfvallerpunten(previousStand, key),
                delta_winnaarpunten: _.sumBy(objs, 'winnaarpunten') - this.determinePreviousWinnaarpunten(previousStand, key),
                delta_quizpunten: this.determineQuizPunten(quizStand, key) - this.determineQuizPunten(previousQuizStand, key),
                // delta_totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + this.determineQuizPunten(quizStand, key) -
                // this.determinePreviousTotaalpunten(previousStand, key),
            }))
            .value().sort((a, b) => a.aflevering - b.aflevering);

        const response: any = await _(alleUitgezondenAfleveringen.filter(aflevering => !aflevering.laatseAflevering)).groupBy('aflevering')
            .map((objs, key) => ({
                aflevering: key,
                // deelnemerId,
                // deelnemer: this.hasResultaatForAflevering(resultatenLijst, key) ? this.hasResultaatForAflevering(resultatenLijst, key).deelnemer : null,
                // display_name: this.hasResultaatForAflevering(resultatenLijst, key) ? this.hasResultaatForAflevering(resultatenLijst, key).display_name : null,
                voorspelling: this.hasResultaatForAflevering(resultatenLijst, key) ? this.hasResultaatForAflevering(resultatenLijst, key).voorspelling : null,
                molpunten: this.hasResultaatForAflevering(resultatenLijst, key) ? this.hasResultaatForAflevering(resultatenLijst, key).molpunten : 0,
                afvallerpunten: this.hasResultaatForAflevering(resultatenLijst, key) ? this.hasResultaatForAflevering(resultatenLijst, key).afvallerpunten : 0,
                winnaarpunten: this.hasResultaatForAflevering(resultatenLijst, key) ? this.hasResultaatForAflevering(resultatenLijst, key).winnaarpunten : 0,
                quizpunten: this.hasResultaatForAflevering(resultatenLijst, key) ? this.hasResultaatForAflevering(resultatenLijst, key).quizpunten : this.determineQuizPunten(quizStand, key),
                totaalpunten: this.hasResultaatForAflevering(resultatenLijst, key) ? this.hasResultaatForAflevering(resultatenLijst, key).totaalpunten : this.determineQuizPunten(quizStand, key),
                delta_molpunten: this.hasResultaatForAflevering(resultatenLijst, key) ? this.hasResultaatForAflevering(resultatenLijst, key).delta_molpunten : 0,
                delta_afvallerpunten: this.hasResultaatForAflevering(resultatenLijst, key) ? this.hasResultaatForAflevering(resultatenLijst, key).delta_afvallerpunten : 0,
                delta_winnaarpunten: this.hasResultaatForAflevering(resultatenLijst, key) ? this.hasResultaatForAflevering(resultatenLijst, key).delta_winnaarpunten : 0,
                delta_quizpunten: this.hasResultaatForAflevering(resultatenLijst, key) ? this.hasResultaatForAflevering(resultatenLijst, key).delta_quizpunten : (this.determineQuizPunten(quizStand, key) - this.determineQuizPunten(previousQuizStand, key)),
                // delta_totaalpunten: this.hasResultaatForAflevering(resultatenLijst, key) ? this.hasResultaatForAflevering(resultatenLijst, key).delta_totaalpunten : (this.determineQuizPunten(quizStand, key) - this.determineQuizPunten(previousQuizStand, key)),
            })).value();

        // voeg afgevallen kandidaat toe.
        const kandidaten = await getRepository(Kandidaat).find();

        response.forEach(async resultaat => {
            resultaat.afgevallenKandidaat = _.find(kandidaten, {
                afgevallen: true,
                aflevering: parseInt(resultaat.aflevering, 10),
            });
        });

        this.cacheService.set('api/v1/standen/' + deelnemerId, response).catch(err => {
            this.logger.log('fatal error caching mislukt');
        });
        this.cacheService.getStats().then(stats => this.logger.log('aantal keys in cache na deelnemerstand: ' + stats.keys));
        return response;
    }

    async getStatistieken(): Promise<any[]> {
        const voorspellingen =  await getConnection()
            .createQueryBuilder()
            .select('voorspelling')
            .from(Voorspelling, 'voorspelling')
            .leftJoinAndSelect('voorspelling.mol', 'mol')
            .leftJoinAndSelect('voorspelling.deelnemer', 'deelnemer')
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        const laatsteVoorspellingPerDeelnemer = await _(voorspellingen).groupBy('deelnemer.id')
            .map((objs, key) => ({
                deelnemer: _.maxBy(objs, 'aflevering').deelnemer,
                aflevering: _.maxBy(objs, 'aflevering').aflevering,
                mol: _.maxBy(objs, 'aflevering').mol,
            }))
            .value();

        const molPercentaPerKandidaat = await _(laatsteVoorspellingPerDeelnemer).groupBy('mol.id')
            .map((objs, key) => ({
                mol: _.head(objs).mol,
                count: objs.length,
                percentage: objs.length / laatsteVoorspellingPerDeelnemer.length * 100,
            }))
            .value();

        return molPercentaPerKandidaat;
    }

    private hasResultaatForAflevering(resultatenLijst: any, aflevering: string) {
        return _.find(resultatenLijst, {aflevering: parseInt(aflevering, 10)});
    }

    private determinePreviousMolpunten(previousQuizStand: any[], key) {
        if (previousQuizStand.length > 0) {
            return (parseInt(key, 10) > _.maxBy(previousQuizStand, 'aflevering').aflevering) ? 0 : previousQuizStand.find(item => {
                return item.aflevering === (parseInt(key, 10));
            }).previous_molpunten;
        }
        return 0;
    }

    private determinePreviousAfvallerpunten(previousQuizStand: any[], key) {
        if (previousQuizStand.length > 0) {
            return (parseInt(key, 10) > _.maxBy(previousQuizStand, 'aflevering').aflevering) ? 0 : previousQuizStand.find(item => {
                return item.aflevering === (parseInt(key, 10));
            }).previous_afvallerpunten;
        }
        return 0;
    }

    private determinePreviousWinnaarpunten(previousQuizStand: any[], key) {
        if (previousQuizStand.length > 0) {
            return (parseInt(key, 10) > _.maxBy(previousQuizStand, 'aflevering').aflevering) ? 0 : previousQuizStand.find(item => {
                return item.aflevering === (parseInt(key, 10));
            }).previous_winnaarpunten;
        }
        return 0;
    }

    private determineQuizPunten(quizStand: any[], aflevering) {
        if (quizStand.length > 0 && quizStand.find(item => item.aflevering === (parseInt(aflevering, 10)))) {
            return (parseInt(aflevering, 10) > _.maxBy(quizStand, 'aflevering').aflevering) ? 0 : quizStand.find(item => {
                return item.aflevering === (parseInt(aflevering, 10));
            }).quizpunten;
        }
        return 0;
    }

    private determineDeltaQuizPunten(key, previousQuizStand: any[], objs) {
        if (previousQuizStand.length > 0) {
            return (parseInt(key, 10) > _.maxBy(previousQuizStand, 'aflevering').aflevering) ? 0 : _.sumBy(objs, 'quizpunten') - previousQuizStand.find(item => {
                return item.aflevering === (parseInt(key, 10));
            }).quizpunten;
        }
        return 0;
    }

    private async getPuntenVoorAflevering(aflevering: number) {
        return await getConnection()
            .createQueryBuilder()
            .select('afleveringpunt')
            .from(Afleveringpunten, 'afleveringpunt')
            .leftJoinAndSelect('afleveringpunt.deelnemer', 'deelnemer')
            .where('afleveringpunt.afleveringstand = :aflevering', {aflevering})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    private async getPuntenVoorAfleveringVoorDeelnemer(aflevering: number, deelnemerId: string) {
        return await getConnection()
            .createQueryBuilder()
            .select('afleveringpunt')
            .from(Afleveringpunten, 'afleveringpunt')
            .leftJoinAndSelect('afleveringpunt.deelnemer', 'deelnemer')
            .leftJoinAndSelect('afleveringpunt.voorspelling', 'voorspelling')
            .leftJoinAndSelect('voorspelling.mol', 'mol')
            .leftJoinAndSelect('voorspelling.afvaller', 'afvaller')
            .leftJoinAndSelect('voorspelling.winnaar', 'winnaar')
            .where('deelnemer.id = :deelnemerId', {deelnemerId})
            .andWhere('afleveringpunt.afleveringstand = :aflevering', {aflevering})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

    }

    private async getPuntenVoorQuiz(afleveringstand: number) {
        return await getConnection()
            .createQueryBuilder()
            .select('quizpunten')
            .from(Quizpunt, 'quizpunten')
            .leftJoinAndSelect('quizpunten.deelnemer', 'deelnemer')
            .where('quizpunten.afleveringstand = :afleveringstand', { afleveringstand })
            .getMany()
            .then(response => response)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    private async getPuntenVoorQuizVoorDeelnemer(aflevering: number, deelnemerId: string) {

        return await getConnection()
            .createQueryBuilder()
            .select('quizpunten.quizpunten')
            .addSelect('quizpunten.aflevering')
            .addSelect('deelnemer.id')
            .from(Quizpunt, 'quizpunten')
            .leftJoinAndSelect('quizpunten.deelnemer', 'deelnemer')
            .where('quizpunten.afleveringstand = :aflevering', { aflevering })
            .andWhere('deelnemer.id = :deelnemerId', { deelnemerId })
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    private async getAlleUitgezondenAfleveringen(): Promise<Aflevering[]> {
        return await getRepository(Aflevering).find({where: {uitgezonden: true}});
    }
}
