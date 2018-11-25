import {IsEmail, IsString, Length} from 'class-validator';

export class CreateDeelnemerDto {
    readonly id: string;
    @IsString() @Length(3, 64) readonly display_name: string;
    @IsEmail() readonly email: string;
    @IsString() readonly firebaseIdentifier: string;
}
