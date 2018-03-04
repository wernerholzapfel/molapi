import {IsInt} from 'class-validator';

export class CreateActiesDto {
    readonly id: string;

    @IsInt() readonly voorspellingaflevering: number;
    @IsInt() readonly testaflevering: number;

}