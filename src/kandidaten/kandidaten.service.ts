import {Component, Inject, Logger} from '@nestjs/common';
import {getRepository, Repository} from 'typeorm';
import {Kandidaat} from './kandidaat.entity';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';

@Component()
export class KandidatenService {
    private readonly logger = new Logger('deelnemersController', true);

    molPunten: number = 20;
    winnaarPunten: number = 5;

    constructor(@Inject('kandidaatRepositoryToken') private readonly kandidaatRepository: Repository<Kandidaat>) {
    }

    async findAll(): Promise<Kandidaat[]> {
        try {
            return await this.kandidaatRepository.find();
        } catch (err) {
            return err;
        }
    }

    // todo alleen admin mag posten
    async create(kandidaat: Kandidaat) {
        this.logger.log(kandidaat.display_name + ' is afgevallen in ronde ' + kandidaat.elimination_round);
        await this.kandidaatRepository.save(kandidaat);
        await getRepository(Afleveringpunten).delete({aflevering: kandidaat.elimination_round});
        const deelnemers = await getRepository(Deelnemer).find();
        const voorspellingen = await getRepository(Voorspelling).find({
            join: {
                alias: 'voorspelling',
                leftJoinAndSelect: {
                    deelnemer: 'voorspelling.deelnemer',
                    mol: 'voorspelling.mol',
                    afvaller: 'voorspelling.afvaller',
                    winnaar: 'voorspelling.winnaar',
                },
            },
        });
        await this.logger.log(voorspellingen.length.toString() + 'aantal voorspellingen');
        this.logger.log(kandidaat.id + ' is het id van de kandidaat');
        const correcteVoorspellingen = await voorspellingen.filter(voorspelling => {
            return voorspelling.afvaller.id === kandidaat.id && voorspelling.aflevering === kandidaat.elimination_round;
        });
        await deelnemers.forEach(async deelnemer => {
            // afvallerpunten = await this.determineAfvallerPunten(deelnemer, voorspellingen, kandidaat);
            // molpunten = await this.determineMolPunten();
            // winnaarpunten = await this.determineWinnaarPunten();
            await getRepository(Afleveringpunten).save({
                aflevering: kandidaat.elimination_round,
                afvallerpunten: await this.determineAfvallerPunten(deelnemer, voorspellingen, kandidaat),
                molpunten: await this.determineMolPunten(deelnemer, voorspellingen, kandidaat),
                winnaarpunten: await this.determineWinnaarPunten(deelnemer, voorspellingen, kandidaat),
                deelnemer: {id: deelnemer.id},
            });
        });
    }

    determineAfvallerPunten(deelnemer: Deelnemer, voorspellingen: Voorspelling[], kandidaat: Kandidaat) {
        return voorspellingen.filter(voorspelling => {
            return voorspelling.deelnemer.id === deelnemer.id &&
                voorspelling.aflevering === kandidaat.elimination_round &&
                voorspelling.afvaller.id === kandidaat.id;
        }).length > 0 ? 25 : 0;
    }

    determineMolPunten(deelnemer: Deelnemer, voorspellingen: Voorspelling[], kandidaat: Kandidaat) {
        if (kandidaat.mol) {
            return voorspellingen.filter(voorspelling => {
                return voorspelling.deelnemer.id === deelnemer.id &&
                    voorspelling.mol.id === kandidaat.id;
            }).length * this.molPunten;
        }
        return 0;
    }

    determineWinnaarPunten(deelnemer: Deelnemer, voorspellingen: Voorspelling[], kandidaat: Kandidaat) {
        if (kandidaat.winner) {
            return voorspellingen.filter(voorspelling => {
                return voorspelling.deelnemer.id === deelnemer.id &&
                    voorspelling.winnaar.id === kandidaat.id;
            }).length * this.winnaarPunten;
        }
        return 0;

    }
}