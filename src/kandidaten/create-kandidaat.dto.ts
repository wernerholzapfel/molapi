import {IsBoolean, IsInt, IsNumber, IsOptional, IsString, Length} from 'class-validator';

export class CreateKandidaatDTO {
    readonly id: string;
    @IsString() @Length(3, 64) readonly display_name: string;
    @IsString() readonly image_url: string;
    @IsOptional() @IsBoolean() readonly winner: boolean;
    @IsOptional() @IsBoolean() readonly mol: boolean;
    @IsOptional() @IsBoolean() readonly finalist: boolean;
    @IsOptional() @IsBoolean() readonly afgevallen: boolean;
    @IsOptional() @IsInt() readonly aflevering: number;
}
