import {IsDefined, IsString} from 'class-validator';
import {Poule} from '../poules/poule.entity';

export class CreateUitnodigingDto {
    readonly id: string;

    @IsString() readonly uniqueIdentifier: string;

    @IsDefined() readonly poule: Poule;

    readonly isAccepted: boolean;
}

export class AcceptUitnodigingDto {
    @IsDefined() readonly poule: Poule;
    @IsDefined() readonly uitnodigingId: string;
}
