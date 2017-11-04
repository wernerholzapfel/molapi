import {IsNumber, IsString} from 'class-validator';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Mol} from '../mollen/mol.entity';

export class CreateVoorspellingDto {
    readonly id: string;
    @IsNumber() readonly aflevering: number;
    @IsString() readonly mol: Mol;
    @IsString() readonly deelnemer: Deelnemer;
}
