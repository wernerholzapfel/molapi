import {Mol} from '../mollen/mol.entity';

export interface Aflevering {
    id: string;
    aflevering: number;
    afvaller: Mol;
    winnaar: Mol;
    finalist: Mol;
    laatseAflevering: boolean;
}