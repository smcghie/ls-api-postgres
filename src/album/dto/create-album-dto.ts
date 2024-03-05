import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested } from 'class-validator';
import { CreateMomentDto } from 'src/moment/dto/create-moment-dto';

export class CreateAlbumDto {

    @IsString()
    readonly title: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMomentDto)
    readonly moments: CreateMomentDto[];

    @IsString()
    readonly albumType: string;

    @IsArray()
    sharedWith: string[];
}
