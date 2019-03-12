import {IsBoolean, IsInt, IsOptional} from 'class-validator';

export class CreateActiesDto {
    readonly id: string;
    readonly updatedDate: Date;

    @IsOptional() @IsInt() readonly voorspellingaflevering: number;
    @IsOptional() @IsInt()  readonly testaflevering: number;
    @IsOptional() @IsBoolean()  readonly alwaysUpdate: boolean;
    @IsOptional() @IsBoolean()  readonly isSeasonFinished: boolean;

}