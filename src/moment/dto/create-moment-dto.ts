import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateMomentDto {

    @IsString()
    readonly image: string;

    @IsString()
    readonly description: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(2)
    @IsNumber({}, { each: true })
    readonly coordinates: number[];

    @IsString()
    readonly captureDate: string;

    @IsNumber()
    readonly fileSize: number
}

export class CreateMomentsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMomentDto)
    readonly moments: CreateMomentDto[];
}