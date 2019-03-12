import * as _ from 'lodash';
import {Kandidaat} from '../kandidaten/kandidaat.entity';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Quizresultaat} from '../quizresultaten/quizresultaat.entity';
import {
    afvallerPunten,
    molPunten,
    molStrafpunten,
    vragenPunten,
    winnaarPunten,
    winnaarStrafpunten,
} from '../shared/puntentelling.constanten';

export function determineQuizpunten(quizresultaat: Quizresultaat[], aflevering: number) {
    return quizresultaat.filter(item =>
        ((item.antwoord && !item.antwoord.is_niet_meer_mogelijk_sinds) || (item.antwoord && item.antwoord.is_niet_meer_mogelijk_sinds > aflevering))).length * vragenPunten;
}

// merge with determineQuizpunten
export function determinePreviousQuizpunten(quizresultaat: Quizresultaat[], aflevering: number) {
    const punten = quizresultaat.filter(item =>
        aflevering !== 0 &&
        (
            (item.antwoord && !item.antwoord.is_niet_meer_mogelijk_sinds) ||
            (item.antwoord && item.antwoord.is_niet_meer_mogelijk_sinds > aflevering)
        ),
    )
        .length * vragenPunten;
    return punten;
}

export function getMol(kandidatenlijst: Kandidaat[], aflevering: number): Kandidaat {
    return kandidatenlijst.find(kandidaat => kandidaat.mol && kandidaat.aflevering <= aflevering);
}

export function getWinnaar(kandidatenlijst: Kandidaat[], aflevering: number): Kandidaat {
    return kandidatenlijst.find(kandidaat => kandidaat.winner && kandidaat.aflevering <= aflevering);
}

export function getVoorspellingVoorAflevering(voorspellingen: Voorspelling[], aflevering: number): Voorspelling {
    return voorspellingen.find(voorspelling => voorspelling.aflevering === aflevering);
}

export function hasResultaatForAflevering(resultatenLijst: any, aflevering: string): any {
    return _.find(resultatenLijst, {aflevering: parseInt(aflevering, 10)});
}

export function determineAfvallerPunten(voorspelling: Voorspelling, kandidaten: Kandidaat[], aflevering: number) {
    if (voorspelling && voorspelling.afvaller && kandidaten.find(kandidaat =>
            kandidaat.aflevering === voorspelling.aflevering &&
            voorspelling.afvaller.id === kandidaat.id &&
            kandidaat.afgevallen)) {
        return afvallerPunten;
    }
    return 0;
}

export function determinePreviousAfvallerPunten(voorspelling: Voorspelling, kandidaten: Kandidaat[], aflevering: number) {
    if (voorspelling && voorspelling.aflevering === aflevering) return 0;
    if (voorspelling && voorspelling.afvaller && kandidaten.find(kandidaat =>
            kandidaat.aflevering === voorspelling.aflevering &&
            voorspelling.afvaller.id === kandidaat.id &&
            kandidaat.afgevallen)) {
        return afvallerPunten;
    }
    return 0;
}

export function determineMolPunten(voorspelling: Voorspelling, kandidaten: Kandidaat[], mol: Kandidaat) {
    if (voorspelling && mol && voorspelling.mol && voorspelling.mol.id === mol.id) return molPunten;
    if (voorspelling && voorspelling.mol &&
        kandidaten.find(kandidaat => kandidaat.aflevering === voorspelling.aflevering &&
            voorspelling.mol.id === kandidaat.id && kandidaat.afgevallen)) {
        return molStrafpunten;
    }
    return 0;
}

export function determineWinnaarPunten(voorspelling: Voorspelling, kandidaten: Kandidaat[], winnaar: Kandidaat) {
    if (voorspelling && winnaar && voorspelling.winnaar && voorspelling.winnaar.id === winnaar.id) return winnaarPunten;

    if (voorspelling && voorspelling.winnaar && kandidaten.find(kandidaat => kandidaat.aflevering === voorspelling.aflevering &&
            voorspelling.winnaar.id === kandidaat.id && kandidaat.afgevallen)) {
        return winnaarStrafpunten;
    }
    return 0;
}