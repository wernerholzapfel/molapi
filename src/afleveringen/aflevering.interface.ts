
import {Kandidaat} from '../kandidaten/kandidaat.interface';

export interface Aflevering {
    id: string;
    aflevering: number;
    afvaller: Kandidaat;
    winnaar: Kandidaat;
    finalist: Kandidaat;
    laatseAflevering: boolean;
}