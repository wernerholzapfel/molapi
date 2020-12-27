import {IsEmail} from 'class-validator';

export class CreateDeelnemerDto {
    readonly id: string;
    @IsEmail() email: string;
}
