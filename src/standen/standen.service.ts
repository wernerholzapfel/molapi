import {HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import {getConnection, getRepository, Repository} from 'typeorm';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import * as _ from 'lodash';
import {Aflevering} from '../afleveringen/aflevering.entity';
import {Kandidaat} from '../kandidaten/kandidaat.entity';
import {CacheService} from '../cache.service';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';
import {Quizresultaat} from '../quizresultaten/quizresultaat.entity';
import * as fs from 'fs';
import {Stand, TestStand} from './standen.interface';
import {vragenPunten} from '../shared/puntentelling.constanten';
import * as standenhelper from './standen.helper';

@Injectable()
export class StandenService {
    private readonly logger = new Logger('standenService', true);

    constructor(@Inject('AfleveringpuntRepositoryToken') private readonly afleveringpuntRepository: Repository<Afleveringpunten>, public readonly cacheService: CacheService) {
        // todo niet meer nodig?
        // this.findAll().then(async deelnemers => {
        //     deelnemers.forEach(deelnemer => {
        //         this.findByDeelnemer(deelnemer.deelnemerId).catch(err => this.logger.log('Probleem opgetreden bij het ophalen van de huidige stand voor deelnemer' + err));
        //     });
        // });
    }

    createStandenFile: boolean = false;

    async findAll(): Promise<Stand[]> {
        // todo getLatestUitgezondenAflevering at once
        const afleveringen: Aflevering[] = await this.getAlleUitgezondenAfleveringen();
        const latestUitgezondenAflevering: Aflevering = _.maxBy(afleveringen, 'aflevering');

        return this.getStandByAflevering(latestUitgezondenAflevering.aflevering);
    }

    async findByDeelnemer(deelnemerId): Promise<any[]> {
        const alleUitgezondenAfleveringen = await this.getAlleUitgezondenAfleveringen();

        const laatsteAfleveringMetTestOrVoorspelling: Aflevering = _.maxBy(alleUitgezondenAfleveringen, 'aflevering');

        const response = await this.getStandByDeelnemerForAflevering(deelnemerId, laatsteAfleveringMetTestOrVoorspelling.aflevering);

        this.cacheService.set('api/v1/standen/' + deelnemerId, response).catch(err => {
            this.logger.log('fatal error caching mislukt' + err);
        });
        this.cacheService.getStats().then(stats => this.logger.log('aantal keys in cache na deelnemerstand: ' + stats.keys));

        return response;
    }

    async findByDeelnemerAndAflevering(deelnemerId, aflevering): Promise<any[]> {
        const response = await this.getStandByDeelnemerForAflevering(deelnemerId, aflevering);

        if (this.createStandenFile) {
            const jsonStand = JSON.stringify(response);
            fs.writeFile('output/deel   nemerstand_' + deelnemerId + '.json', jsonStand, 'utf8', (err) => {
                // throws an error, you could also catch it here
                if (err) throw err;
            });
        }
        return response;
    }

    async getStandByAflevering(aflevering: number): Promise<Stand[]> {
        if (aflevering) {
            const testantwoorden: Quizresultaat[] = await this.getGemaakteTests();

            const quizStand: TestStand[] = await _(testantwoorden).groupBy('deelnemer.id')
                .map((objs, key) => ({
                    deelnemerId: key,
                    quizpunten: standenhelper.determineQuizpunten(objs, aflevering),
                    previous_quizpunten: standenhelper.determineQuizpunten(objs, aflevering - 1),
                }))
                .value();

            const kandidatenlijst = await getRepository(Kandidaat).find().catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

            const afleveringsVoorspellingen: any[] = await this.getAfleveringsVoorspellingen(aflevering);

            const mol = standenhelper.getMol(kandidatenlijst, aflevering);
            const previousmol = standenhelper.getMol(kandidatenlijst, aflevering - 1);
            const winnaar: Kandidaat = kandidatenlijst.find(kandidaat => kandidaat.winner);
            const previouswinnaar: Kandidaat = standenhelper.getWinnaar(kandidatenlijst, aflevering - 1);

            // @ts-ignore
            const voorspellingenPunten: any = afleveringsVoorspellingen.map(voorspelling => ({
                ...voorspelling,
                molpunten: mol ? standenhelper.determineMolPunten(voorspelling, kandidatenlijst, mol) : 0,
                previousmolpunten: previousmol ? standenhelper.determineMolPunten(voorspelling, kandidatenlijst, previousmol) : 0,
                winnaarpunten: winnaar ? standenhelper.determineWinnaarPunten(voorspelling, kandidatenlijst, winnaar) : 0,
                previouswinnaarpunten: previouswinnaar ? standenhelper.determineWinnaarPunten(voorspelling, kandidatenlijst, previouswinnaar) : 0,
                afvallerpunten: standenhelper.determineAfvallerPunten(voorspelling, kandidatenlijst, voorspelling.aflevering),
                previousafvallerpunten: voorspelling.aflevering < aflevering ? standenhelper.determinePreviousAfvallerPunten(voorspelling, kandidatenlijst, voorspelling.aflevering) : 0,
                quizpunten: standenhelper.hasResultaatForAflevering(quizStand, voorspelling.aflevering.toString()) ? standenhelper.hasResultaatForAflevering(quizStand, voorspelling.aflevering.toString()).quizpunten : 0,
                previous_quizpunten: standenhelper.hasResultaatForAflevering(quizStand, voorspelling.aflevering.toString()) ? standenhelper.hasResultaatForAflevering(quizStand, voorspelling.aflevering.toString()).previous_quizpunten : 0,
                delta_quizpunten: standenhelper.hasResultaatForAflevering(quizStand, voorspelling.aflevering.toString()) ? standenhelper.hasResultaatForAflevering(quizStand, voorspelling.aflevering.toString()).delta_quizpunten : 0,
            })).map(voorspelling => ({
                ...voorspelling,
                totaalpunten: voorspelling.molpunten + voorspelling.afvallerpunten + voorspelling.winnaarpunten + voorspelling.quizpunten,
            }));

            const response: any[] = await _(voorspellingenPunten).groupBy('deelnemer.id')
                .map((objs, key) => ({
                    deelnemerId: key,
                    display_name: _.head(objs).deelnemer.display_name,
                    molpunten: _.sumBy(objs, 'molpunten'),
                    afvallerpunten: _.sumBy(objs, 'afvallerpunten'),
                    winnaarpunten: _.sumBy(objs, 'winnaarpunten'),
                    quizpunten: quizStand.find(item => item.deelnemerId === key) ? quizStand.find(item => item.deelnemerId === key).quizpunten : 0,
                    previousmolpunten: _.sumBy(objs, 'previousmolpunten'),
                    previousafvallerpunten: _.sumBy(objs, 'previousafvallerpunten'),
                    previouswinnaarpunten: _.sumBy(objs, 'previouswinnaarpunten'),
                    previous_quizpunten: quizStand.find(item => item.deelnemerId === key) ? quizStand.find(item => item.deelnemerId === key).previous_quizpunten : 0,
                    totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + (quizStand.find(item => item.deelnemerId === key) ? quizStand.find(item => item.deelnemerId === key).quizpunten : 0),
                    delta_totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + (quizStand.find(item => item.deelnemerId === key) ? quizStand.find(item => item.deelnemerId === key).quizpunten : 0) - (
                        _.sumBy(objs, 'previousmolpunten') + _.sumBy(objs, 'previousafvallerpunten') + _.sumBy(objs, 'previouswinnaarpunten') + (quizStand.find(item => item.deelnemerId === key) ? quizStand.find(item => item.deelnemerId === key).previous_quizpunten : 0)
                    ),
                }))
                .value();

            this.cacheService.set('api/v1/standen', _.sortBy(response, [o => -o.totaalpunten], [o => o.delta_totaalpunten], [o => o.display_name]));

            if (this.createStandenFile) {
                const jsonStand = JSON.stringify(_.sortBy(response, [o => -o.totaalpunten], [o => o.delta_totaalpunten], [o => o.display_name]));
                fs.writeFile('output/stand.json', jsonStand, 'utf8', (err) => {
                    // throws an error, you could also catch it here
                    if (err) throw err;
                });
            }

            return _.sortBy(response, [o => -o.totaalpunten], [o => o.delta_totaalpunten], [o => o.display_name]);
        }
        else {
            throw new HttpException({
                message: 'er is nog geen stand bekend',
                statusCode: HttpStatus.NO_CONTENT,
            }, HttpStatus.NO_CONTENT);
        }
    }

    async getStatistieken(): Promise<any[]> {
        const voorspellingen = await getConnection()
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
            .value().filter(voorspelling => !voorspelling.mol.afgevallen);

        const molPercentaPerKandidaat: any = await _(laatsteVoorspellingPerDeelnemer).groupBy('mol.id')
            .map((objs, key) => ({
                mol: _.head(objs).mol,
                count: objs.length,
                percentage: Math.round(objs.length / laatsteVoorspellingPerDeelnemer.length * 100),
            }))
            .value();

        return _.orderBy(molPercentaPerKandidaat, 'count', 'desc');
    }

    async getPossibleStand(molId, winnaarId): Promise<any[]> {

        const afleveringen = await this.getAlleUitgezondenAfleveringen();
        const latestUitgezondenAflevering = _.maxBy(afleveringen, 'aflevering');

        if (latestUitgezondenAflevering) {
            this.logger.log('latestUitgezondenAflevering: ' + latestUitgezondenAflevering.aflevering);
            const puntenlijst = await this.getPossiblePuntenVoorAflevering(latestUitgezondenAflevering.aflevering, molId, winnaarId);
            const quizPuntenlijst = await this.getPossiblePuntenVoorQuiz(latestUitgezondenAflevering.aflevering, molId);
            const quizStand = await _(quizPuntenlijst).groupBy('deelnemer.id')
                .map((objs, key) => ({
                    deelnemerId: key,
                    quizpunten: _.sumBy(objs, 'quizpunten'),
                }))
                .value();

            const response = await _(puntenlijst).groupBy('deelnemer.id')
                .map((objs, key) => ({
                    deelnemerId: key,
                    display_name: _.head(objs).deelnemer.display_name,
                    molpunten: _.sumBy(objs, 'molpunten'),
                    afvallerpunten: _.sumBy(objs, 'afvallerpunten'),
                    winnaarpunten: _.sumBy(objs, 'winnaarpunten'),
                    quizpunten: quizStand.find(item => item.deelnemerId === key) ? quizStand.find(item => item.deelnemerId === key).quizpunten : 0,
                    totaalpunten: _.sumBy(objs, 'molpunten') + _.sumBy(objs, 'afvallerpunten') + _.sumBy(objs, 'winnaarpunten') + (quizStand.find(item => item.deelnemerId === key) ? quizStand.find(item => item.deelnemerId === key).quizpunten : 0),
                }))
                .value();

            // this.cacheService.set('api/v1/standen/getpossiblestand', _.sortBy(response, [o => -o.totaalpunten], [o => o.delta_totaalpunten], [o => o.display_name]));
            return _.sortBy(response, [o => -o.totaalpunten], [o => o.delta_totaalpunten], [o => o.display_name]);
        }
        else {
            throw new HttpException({
                message: 'er is nog geen stand bekend',
                statusCode: HttpStatus.NO_CONTENT,
            }, HttpStatus.NO_CONTENT);
        }
    }

    private async getStandByDeelnemerForAflevering(deelnemerId, aflevering: number) {
        const testantwoorden: Quizresultaat[] = await this.getGemaakteTestsForDeelnemer(deelnemerId, aflevering);

        const quizStand = await _(testantwoorden).groupBy('aflevering')
            .map((objs, key) => ({
                aflevering: parseInt(key, 10),
                deelnemerId: _.head(objs).deelnemer.id,
                quizpunten: standenhelper.determineQuizpunten(objs, aflevering),
                previous_quizpunten: standenhelper.determinePreviousQuizpunten(objs, aflevering - 1),
                delta_quizpunten: standenhelper.determineQuizpunten(objs, aflevering) -
                    standenhelper.determinePreviousQuizpunten(objs, aflevering - 1),
            }))
            .value();

        const kandidatenlijst = await getRepository(Kandidaat).find().catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });

        const afleveringsVoorspellingen: any[] = await this.getAfleveringsVoorspellingenVoorDeelnemer(deelnemerId, aflevering);

        const mol = standenhelper.getMol(kandidatenlijst, aflevering);
        const previousmol = standenhelper.getMol(kandidatenlijst, aflevering - 1);
        const winnaar: Kandidaat = kandidatenlijst.find(kandidaat => kandidaat.winner);
        const previouswinnaar: Kandidaat = standenhelper.getWinnaar(kandidatenlijst, aflevering - 1);

        const afleveringen = await this.getAlleUitgezondenAfleveringen();
        const laatsteAflevering = _.maxBy(afleveringen, 'aflevering');

        const response = afleveringen
            .filter(afleveringItem => afleveringItem.aflevering <= aflevering)
            .map(afleveringItem => ({
                aflevering: afleveringItem,
                voorspelling: afleveringsVoorspellingen.find(item => item.aflevering === afleveringItem.aflevering),
            }))
            .map(mergedAfleveringVoorspelling => ({
                ...mergedAfleveringVoorspelling.voorspelling,
                aflevering: mergedAfleveringVoorspelling.aflevering.aflevering,
                molpunten: mol ? standenhelper.determineMolPunten(mergedAfleveringVoorspelling.voorspelling, kandidatenlijst, mol) : 0,
                previousmolpunten: previousmol ? standenhelper.determineMolPunten(mergedAfleveringVoorspelling.voorspelling, kandidatenlijst, previousmol) : 0,
                winnaarpunten: winnaar ? standenhelper.determineWinnaarPunten(mergedAfleveringVoorspelling.voorspelling, kandidatenlijst, winnaar) : 0,
                previouswinnaarpunten: previouswinnaar ? standenhelper.determineWinnaarPunten(mergedAfleveringVoorspelling.voorspelling, kandidatenlijst, previouswinnaar) : 0,
                afvallerpunten: standenhelper.determineAfvallerPunten(mergedAfleveringVoorspelling.voorspelling, kandidatenlijst, mergedAfleveringVoorspelling.aflevering.aflevering),
                previousafvallerpunten: standenhelper.determinePreviousAfvallerPunten(mergedAfleveringVoorspelling.voorspelling, kandidatenlijst, laatsteAflevering.aflevering),
                quizpunten: standenhelper.hasResultaatForAflevering(quizStand, mergedAfleveringVoorspelling.aflevering.aflevering.toString()) ? standenhelper.hasResultaatForAflevering(quizStand, mergedAfleveringVoorspelling.aflevering.aflevering.toString()).quizpunten : 0,
                previousquizpunten: standenhelper.hasResultaatForAflevering(quizStand, mergedAfleveringVoorspelling.aflevering.aflevering.toString()) ? standenhelper.hasResultaatForAflevering(quizStand, mergedAfleveringVoorspelling.aflevering.aflevering.toString()).previous_quizpunten : 0,
            }))
            .map(voorspelling => ({
                ...voorspelling,
                totaalpunten: voorspelling.molpunten + voorspelling.afvallerpunten + voorspelling.winnaarpunten + voorspelling.quizpunten,
                delta_molpunten: voorspelling.molpunten - voorspelling.previousmolpunten,
                delta_afvallerpunten: voorspelling.afvallerpunten - voorspelling.previousafvallerpunten,
                delta_winnaarpunten: voorspelling.winnaarpunten - voorspelling.previouswinnaarpunten,
                delta_quizpunten: voorspelling.quizpunten - voorspelling.previousquizpunten,
                afgevallenKandidaat: kandidatenlijst.find(kandidaat => kandidaat.afgevallen && kandidaat.aflevering === voorspelling.aflevering),
            }));

        return response.sort((a, b) => a.aflevering - b.aflevering);
    }

    private async getPossiblePuntenVoorAflevering(aflevering: number, molId: string, winnaarId: string) {
        const voorspellingen = await getConnection().createQueryBuilder()
            .select('voorspelling')
            .from(Voorspelling, 'voorspelling')
            .leftJoinAndSelect('voorspelling.deelnemer', 'deelnemer')
            .leftJoinAndSelect('voorspelling.mol', 'mol')
            .leftJoinAndSelect('voorspelling.afvaller', 'afvaller')
            .leftJoinAndSelect('voorspelling.winnaar', 'winnaar')
            .where('voorspelling.aflevering <= :aflevering', {aflevering})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        const kandidatenlijst = await getRepository(Kandidaat).find().catch((err) => {
            throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
        });
        const uitgespeeldeKandidatenLijst = kandidatenlijst;

        const mol: Kandidaat = uitgespeeldeKandidatenLijst.find(kandidaat => kandidaat.id === molId);
        const winnaar: Kandidaat = uitgespeeldeKandidatenLijst.find(kandidaat => kandidaat.id === winnaarId);
        const possiblestand: any[] = [];

        await voorspellingen.forEach(async voorspelling => {
            const item: any = {};
            item.mol = voorspelling.mol,
                item.afvaller = voorspelling.afvaller,
                item.winnaar = voorspelling.winnaar,
                item.deelnemer = voorspelling.deelnemer,
                item.aflevering = voorspelling.aflevering,
                item.afvallerpunten = await standenhelper.determineAfvallerPunten(voorspelling, uitgespeeldeKandidatenLijst, voorspelling.aflevering),
                item.molpunten = await standenhelper.determineMolPunten(voorspelling, uitgespeeldeKandidatenLijst, mol),
                item.winnaarpunten = await standenhelper.determineWinnaarPunten(voorspelling, uitgespeeldeKandidatenLijst, winnaar);

            possiblestand.push(item);
        });
        return possiblestand;
    }

    private async getAfleveringsVoorspellingenVoorDeelnemer(deelnemerId: string, aflevering: number) {
        return await getConnection()
            .createQueryBuilder()
            .select('voorspelling')
            .from(Voorspelling, 'voorspelling')
            .leftJoinAndSelect('voorspelling.deelnemer', 'deelnemer')
            .leftJoinAndSelect('voorspelling.mol', 'mol')
            .leftJoinAndSelect('voorspelling.afvaller', 'afvaller')
            .leftJoinAndSelect('voorspelling.winnaar', 'winnaar')
            .where('deelnemer.id = :deelnemerId', {deelnemerId})
            .andWhere('voorspelling.aflevering <= :aflevering', {aflevering})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    private async getAfleveringsVoorspellingen(aflevering: number) {
        return await getConnection()
            .createQueryBuilder()
            .select('voorspelling')
            .from(Voorspelling, 'voorspelling')
            .leftJoinAndSelect('voorspelling.deelnemer', 'deelnemer')
            .leftJoinAndSelect('voorspelling.mol', 'mol')
            .leftJoinAndSelect('voorspelling.afvaller', 'afvaller')
            .leftJoinAndSelect('voorspelling.winnaar', 'winnaar')
            .where('voorspelling.aflevering <= :aflevering', {aflevering})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    private async getGemaakteTests(): Promise<Quizresultaat[]> {
        return await getConnection()
            .createQueryBuilder()
            .select('quizresultaat')
            .from(Quizresultaat, 'quizresultaat')
            .leftJoinAndSelect('quizresultaat.deelnemer', 'deelnemer')
            .leftJoinAndSelect('quizresultaat.antwoord', 'antwoord')
            .getMany()
            .then(response => response)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    private async getGemaakteTestsForDeelnemer(deelnemerId: string, aflevering: number): Promise<Quizresultaat[]> {
        return await getConnection()
            .createQueryBuilder()
            .select('quizresultaat')
            .from(Quizresultaat, 'quizresultaat')
            .leftJoinAndSelect('quizresultaat.deelnemer', 'deelnemer')
            .leftJoinAndSelect('quizresultaat.antwoord', 'antwoord')
            .where('deelnemer.id = :deelnemerId', {deelnemerId})
            .andWhere('quizresultaat.aflevering <= :aflevering', {aflevering})
            .getMany()
            .then(response => response)
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
    }

    async getAlleUitgezondenAfleveringen(): Promise<Aflevering[]> {
        return await getRepository(Aflevering).find({where: {uitgezonden: true}});
    }

    private async getPossiblePuntenVoorQuiz(afleveringstand: number, molId) {

        const answers = await getConnection().createQueryBuilder()
            .select('quizantwoord')
            .from(Quizantwoord, 'quizantwoord')
            .leftJoinAndSelect('quizantwoord.kandidaten', 'kandidaten')
            .leftJoinAndSelect('quizantwoord.vraag', 'vraag')
            .where('vraag.aflevering <= :aflevering', {aflevering: (afleveringstand - 1)})
            .getMany()
            .catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });

        this.logger.log('answers: ' + answers);

        const possibleCorrectAnswers: Quizantwoord[] = answers.filter(answer => {
            return answer.kandidaten.some(
                kandidaat => {
                    return kandidaat.id === molId;
                    // return !kandidaat.afgevallen && !kandidaat.winner;
                });
        });

        const quizresultaten: Quizresultaat[] = await getRepository(Quizresultaat).find();
        const quizpuntenlijst = [];

        await quizresultaten.forEach(async quizresultaat => {
            if (possibleCorrectAnswers.find(correctAnswer => {
                return correctAnswer.id === quizresultaat.antwoord.id;
            })) {
                quizresultaat.punten = vragenPunten;
            }
            else {
                quizresultaat.punten = 0;
            }

            const quizpunten: any = {};

            quizpunten.deelnemer = {id: quizresultaat.deelnemer.id, display_name: quizresultaat.deelnemer.display_name},
                quizpunten.aflevering = quizresultaat.aflevering,
                quizpunten.quizpunten = quizresultaat.punten,
                quizpunten.afleveringstand = afleveringstand,
                // quizpunten.quizresultaat = quizresultaat,
                quizpuntenlijst.push(quizpunten);
        });
        return quizpuntenlijst;
    }

}
