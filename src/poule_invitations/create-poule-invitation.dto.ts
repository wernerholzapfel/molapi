import {IsDefined} from 'class-validator';
import {Poule} from '../poules/poule.entity';

export class CreatePouleInvitationDto {
    readonly id: string;

    @IsDefined() readonly poule: Poule;
}
