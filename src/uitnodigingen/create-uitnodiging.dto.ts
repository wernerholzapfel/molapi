import {IsDefined, IsString} from 'class-validator';
import {Poule} from '../poules/poule.entity';

export class CreateUitnodigingDto {
    readonly id: string;

    @IsString() readonly uniqueIdentifier: string;

    @IsDefined() readonly poule: Poule;

    readonly isAccepted: boolean;
    readonly isDeclined: boolean;
}

export class AcceptUitnodigingDto {
    @IsDefined() readonly poule: Poule;
    @IsDefined() readonly uitnodigingId: string;
}

export class DeclineUitnodigingDto {
    @IsDefined() readonly poule: Poule;
    @IsDefined() readonly uitnodigingId: string;
}
