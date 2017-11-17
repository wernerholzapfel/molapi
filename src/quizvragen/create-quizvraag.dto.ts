import {IsDefined, IsNumber, IsString} from 'class-validator';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Kandidaat} from '../kandidaten/kandidaat.entity';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';

export class CreateQuizvraagDto {
    readonly id: string;
    @IsString() readonly vraag: string;
    @IsNumber() readonly aflevering: number;
    @IsDefined() readonly antwoorden: Quizantwoord[];
}