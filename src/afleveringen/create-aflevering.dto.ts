import {IsBoolean, IsDateString, IsNumber} from 'class-validator';

export class CreateAfleveringDto {
    readonly id: string;
    @IsNumber() readonly aflevering: number;
    @IsBoolean() readonly laatsteAflevering: boolean;
    @IsDateString() readonly deadlineDatetime: Date;
    @IsBoolean() readonly uitgezonden: boolean;
    @IsBoolean() readonly hasVoorspelling: boolean;
    @IsBoolean() readonly hasTest: boolean;
}