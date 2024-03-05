import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { User } from "./models/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: (req: Request) => {
                let token = null;
                if (req && req.cookies) {
                    token = req.cookies['token'];
                }
                return token;
            },
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload) {
        const { id } = payload;

        const user = await this.userRepository.findOne({
            where: { id: id },
            relations: ['friends', 'friends.friend'],
        });

        if (!user) {
            throw new UnauthorizedException('Access denied. Please login.');
        }

        return user;
    }
}