import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";


export class LoginDto {

    @IsOptional()
    @IsEmail({}, {message: "Please enter correct email"})
    readonly email: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    readonly password: string
}
