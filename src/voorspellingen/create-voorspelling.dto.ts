import {IsDefined, IsNumber} from 'class-validator';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Kandidaat} from '../kandidaten/kandidaat.entity';

export class CreateVoorspellingDto {
    readonly id: string;
    @IsDefined() @IsNumber() readonly aflevering: number;
    readonly mol: Kandidaat;
    readonly winnaar: Kandidaat;
    readonly afvaller: Kandidaat;
    @IsDefined() readonly deelnemer: Deelnemer;
}
