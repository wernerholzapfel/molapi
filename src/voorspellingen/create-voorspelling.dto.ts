import {IsDefined, IsNumber, IsString} from 'class-validator';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Kandidaat} from '../kandidaten/kandidaat.entity';

export class CreateVoorspellingDto {
    readonly id: string;
    @IsNumber() readonly aflevering: number;
    @IsDefined() readonly mol: Kandidaat;
    @IsDefined() readonly winnaar: Kandidaat;
    @IsDefined() readonly afvaller: Kandidaat;
    @IsDefined() readonly deelnemer: Deelnemer;
}
