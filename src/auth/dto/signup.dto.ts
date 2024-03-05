import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from "class-validator";


export class SignUpDto {

    @IsString()
    readonly avatar: string;

    @IsString()
    readonly username: string;

    @IsString()
    readonly name: string;

    @IsEmail({}, {message: "Please enter correct email"})
    readonly email: string;

    @IsString()
    @MinLength(6)
    readonly password: string

    @IsNumber()
    readonly albumCount: number
}
