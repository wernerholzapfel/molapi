import {IsDefined, IsNumber, IsString} from 'class-validator';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Quizvraag} from '../quizvragen/quizvraag.entity';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';

export class CreateQuizresultaatDto {
    readonly id: string;
    @IsNumber() readonly aflevering: number;
    @IsDefined() deelnemer: Deelnemer;
    @IsDefined() vraag: Quizvraag;
    @IsDefined() antwoord: Quizantwoord;
    readonly punten: number;
}
