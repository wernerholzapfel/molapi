import {IsBoolean, IsInt, IsNumber, IsOptional, IsString, Length} from 'class-validator';

export class CreatemolDto {
    readonly id: string;
    @IsString() @Length(3, 64) readonly display_name: string;
    @IsString() readonly image_url: string;
    @IsOptional() @IsBoolean() readonly winner: boolean;
    @IsOptional() @IsBoolean() readonly mol: boolean;
    @IsOptional() @IsBoolean() readonly finalist: boolean;
    @IsOptional() @IsInt() readonly elimination_round: number;
}
