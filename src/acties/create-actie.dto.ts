import {IsInt} from 'class-validator';

export class CreateActiesDto {
    readonly id: string;
    readonly updatedDate: Date;

    @IsInt() readonly voorspellingaflevering: number;
    @IsInt() readonly testaflevering: number;

}