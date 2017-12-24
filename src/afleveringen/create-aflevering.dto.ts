import {IsBoolean, IsDate, IsDateString, IsNumber} from 'class-validator';

export class CreateAfleveringDto {
    readonly id: string;
    @IsNumber() readonly aflevering: number;
    @IsBoolean() readonly laatseAflevering: boolean;
    @IsDateString() readonly deadlineDatetime: Date;
    @IsBoolean() readonly uitgezonden: boolean;
    @IsBoolean() readonly hasVoorspelling: boolean;
    @IsBoolean() readonly hasTest: boolean;
}