import { IsEmail, IsString, MinLength } from "class-validator";

export class UpdatePasswordDto {

    @IsString()
    @MinLength(6)
    readonly oldPassword: string;

    @IsString()
    @MinLength(6)
    readonly newPassword: string;
}

export class UpdateAvatarDto {
    @IsString()
    readonly avatarUrl: string;
}

export class UpdateUsernameDto {
    @IsString()
    @MinLength(3)
    readonly newUsername: string;
}

export class UpdateEmailDto {
    @IsEmail()
    readonly newEmail: string;
}