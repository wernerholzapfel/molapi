import {IsArray, IsDefined, IsString} from 'class-validator';
import {Deelnemer} from '../deelnemers/deelnemer.entity';

export class CreatePouleDto {
    readonly id: string;

    @IsString() readonly poule_name: string;
    @IsArray() @IsDefined() readonly deelnemers: Deelnemer[];
    @IsArray() @IsDefined() readonly admins: Deelnemer[];

}
