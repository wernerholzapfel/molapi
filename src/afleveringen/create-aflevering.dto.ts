import {IsBoolean, IsNumber} from 'class-validator';
import {Kandidaat} from '../kandidaten/kandidaat.entity';

export class CreateAfleveringDto {
    readonly id: string;
    @IsNumber() readonly aflevering: number;
    readonly afvaller: Kandidaat;
    readonly winnaar: Kandidaat;
    readonly finalist: Kandidaat;
    @IsBoolean() readonly laatseAflevering: boolean;
}