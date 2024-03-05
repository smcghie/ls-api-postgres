import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateCommentDto {

    @IsString()
    readonly momentId: string;

    readonly albumId: string;

    readonly createdBy: string;
    
    @IsString()
    readonly commentText: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateCommentDto)
    readonly replies?: Comment[];
}