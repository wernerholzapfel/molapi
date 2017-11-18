
import {Kandidaat} from '../kandidaten/kandidaat.interface';

export interface Aflevering {
    id: string;
    aflevering: number;
    laatseAflevering: boolean;
    uitgezonden: boolean;
    deadlineDatetime: Date;
}