import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { getSignedCookie } from 'src/utils/signage';
import { UpdateAvatarDto, UpdateEmailDto, UpdatePasswordDto, UpdateUsernameDto } from './dto/update-user.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('/signup')
    async signUp(@Body() signUpDto: SignUpDto, @Res() response: Response) {
        try {
            const userResponse = await this.authService.signUp(signUpDto);

            response.cookie('token', userResponse.token, {
                httpOnly: true,
                secure: true, 
                sameSite: 'none',
                path: '/',
                domain: '.legasee.online',
                maxAge: 7 * 24 * 60 * 60 * 1000 
            });

            const resource = "http*://cdn.legasee.online/*";
            const expiration = Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000);

            const cloudFrontCookies = getSignedCookie(resource, expiration);
            //console.log("CF COOKIE: ", cloudFrontCookies)

            for (const cookieName in cloudFrontCookies) {
                response.cookie(cookieName, cloudFrontCookies[cookieName], {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    path: '/',
                    domain: '.legasee.online',
                    maxAge: 7 * 24 * 60 * 60 * 1000 
                });
            }

            delete userResponse.token;
    
            return response.json({ user: userResponse });
        } catch (error) {
            console.error('Error during sign-up:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/login')
    async login(@Body() loginDto: LoginDto, @Res() response: Response) {
        try {
            const userResponse = await this.authService.login(loginDto, response);

            const resource = "http*://cdn.legasee.online/*";
            const expiration = Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000);

            const cloudFrontCookies = getSignedCookie(resource, expiration);
            //console.log("CF COOKIE: ", cloudFrontCookies)

            for (const cookieName in cloudFrontCookies) {
                response.cookie(cookieName, cloudFrontCookies[cookieName], {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    path: '/',
                    domain: '.legasee.online',
                    maxAge: 7 * 24 * 60 * 60 * 1000 
                });
            }

            delete userResponse.token;
    
            return response.json({ user: userResponse });
        } catch (error) {
            console.error('Error during login:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/logout')
    logout(@Res() response: Response) {
        response.cookie('token', '', {
            httpOnly: true,
            sameSite: 'none',
            expires: new Date(0), 
            secure: true, 
            path: '/',
            domain:'.legasee.online'
        });

        const cloudFrontCookies = ['CloudFront-Signature', 'CloudFront-Key-Pair-Id', 'CloudFront-Policy', 'CloudFront-Expires'];
        cloudFrontCookies.forEach(cookieName => {
            response.cookie(cookieName, '', {
                expires: new Date(0),
                secure: true,
                path: '/',
                domain: '.legasee.online',
                sameSite: 'none',
            });
        });

        response.sendStatus(200);
    }

    @Get(':id')
    @UseGuards(AuthGuard())
    async getUser(@Param('id') id: string): Promise<any> {
        //console.log("ID: ", id)
      return this.authService.findById(id);
    }

    @UseGuards(AuthGuard())
    @Patch('updatePassword')
    async updatePassword(
        @Body() updatePasswordDto: UpdatePasswordDto,
        @Req() req,
    ) {
        //console.log("updatePasswordDTO: ", updatePasswordDto)
        return this.authService.updatePassword(updatePasswordDto, req.user);
    }

    @UseGuards(AuthGuard())
    @Patch('updateAvatar')
    async updateAvatar(
        @Body() updateAvatarDto: UpdateAvatarDto,
        @Req() req,
    ) {
        //console.log("updateAvatarDto", updateAvatarDto)
        return await this.authService.updateAvatar(updateAvatarDto, req.user);
    }

    @UseGuards(AuthGuard())
    @Patch('updateUsername')
    async updateUsername(
        @Body() updateUsernameDto: UpdateUsernameDto,
        @Req() req,
    ) {
        return await this.authService.updateUsername(updateUsernameDto, req.user);
    }

    @UseGuards(AuthGuard())
    @Patch('updateEmail')
    async updateEmail(
        @Body() updateEmailDto: UpdateEmailDto,
        @Req() req,
    ) {
        return this.authService.updateEmail(updateEmailDto, req.user);
    }

    @Post('/search')
    @UseGuards(AuthGuard())
    async search(@Body('query') query: string, @Req() req) {
      return await this.authService.search(query, req.user);
    }


}
