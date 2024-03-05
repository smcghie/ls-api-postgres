import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { User } from './models/user.entity';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcryptjs';
import { HttpStatus } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import {
  UpdateAvatarDto,
  UpdateEmailDto,
  UpdatePasswordDto,
  UpdateUsernameDto,
} from './dto/update-user.dto';
import * as jwt from 'jsonwebtoken';
import { Report } from 'src/reports/models/report.entity';
export interface JwtPayload {
  id: string;
}
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    private jwtService: JwtService,
  ) {}

  async validateUserByJwt(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['friends', 'friends.friend'],
    });

    if (!user) {
      throw new UnauthorizedException('Access denied. Please login.');
    }

    return user;
  }

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<any> {
    const { avatar, username, name, email, password, albumCount } = signUpDto;
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new HttpException(
        'A user is already registered with that email',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      avatar,
      username,
      name,
      email,
      password: hashedPassword,
      albumCount,
    });

    await this.userRepository.save(user);
    const token = this.jwtService.sign(
      { id: user.id, type: user.userType },
      { expiresIn: '1d' },
    );

    const userResponse = {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
      name: user.name,
      albumCount: user.albumCount,
      totalDataUsed: 0,
      token,
    };

    return userResponse;
  }

  async login(loginDto: LoginDto, response): Promise<any> {
    const { email, password } = loginDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndMapMany('user.friends', 'user.friends', 'friendship')
      .leftJoinAndSelect('friendship.friend', 'friend')
      .select([
        'user.id',
        'user.avatar',
        'user.username',
        'user.name',
        'user.albumCount',
        'user.password',
        'user.lastLogin',
        'user.userType',
        'user.totalDataUsed',
        'friendship.id',
        'friend.id',
      ])
      .where('user.email = :email', { email })
      .getOne();
    if (!user) {
      throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid password');
    }
    //console.log('USER: ', user);

    const token = this.jwtService.sign(
      { id: user.id, type: user.userType },
      { expiresIn: '1d' },
    );

    response.cookie('token', token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
      path: '/',
      domain: '.legasee.online',
      maxAge: 7 * 24 * 60 * 60 * 1000 
  });

    const friendsData = user.friends.map((friendship) => ({
      id: friendship.friend.id,
    }));

    user.previousLogin = user.lastLogin;
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    const userResponse = {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
      name: user.name,
      albumCount: user.albumCount,
      friends: friendsData,
      totalDataUser: user.totalDataUsed,
      token,
    };
    return userResponse;
  }

  async findById(userId: string): Promise<any> {
    if (!userId) {
      throw new BadRequestException('Please enter a correct id');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      //relations: ['friends', 'friends.friend'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { id, username, avatar, name, albumCount } = user;
    const result = {
      id,
      username,
      name,
      avatar,
      albumCount,
    };
    return result;
  }

  async updatePassword(
    updatePasswordDto: UpdatePasswordDto,
    user: User,
  ): Promise<any> {
    const { oldPassword, newPassword } = updatePasswordDto;

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new Error('Old password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.password = newPasswordHash;
    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async updateAvatar(
    updateAvatarDto: UpdateAvatarDto,
    user: User,
  ): Promise<any> {
    const { avatarUrl } = updateAvatarDto;

    user.avatar = avatarUrl;
    await this.userRepository.save(user);

    const userResponse: UserResponse = {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
      name: user.name,
      friends: user.friends,
      albumCount: user.albumCount,
    };

    return {
      message: 'Avatar updated successfully',
      user: userResponse,
    };
  }

  async updateUsername(
    updateUsernameDto: UpdateUsernameDto,
    user: User,
  ): Promise<any> {
    const { newUsername } = updateUsernameDto;

    const existingUser = await this.userRepository.findOneBy({
      username: newUsername,
    });
    if (existingUser) {
      throw new Error('Username is already taken');
    }

    user.username = newUsername;
    await this.userRepository.save(user);

    const userResponse: UserResponse = {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
      name: user.name,
      friends: user.friends,
      albumCount: user.albumCount,
    };

    return {
      message: 'Avatar updated successfully',
      user: userResponse,
    };
  }

  async updateEmail(updateEmailDto: UpdateEmailDto, user: User): Promise<any> {
    const { newEmail } = updateEmailDto;

    const existingUser = await this.userRepository.findOneBy({
      email: newEmail,
    });
    if (existingUser) {
      throw new Error('Email is already in use');
    }

    user.email = newEmail;
    await this.userRepository.save(user);

    return { message: 'Email updated successfully' };
  }

  async search(query: string, user: User): Promise<any> {
    if (typeof query !== 'string') {
      throw new Error('Query must be a string');
    }

    const users = await this.userRepository.find({
      where: {
        username: ILike(`%${query}%`),
        id: Not(user.id),
      },
    });
    return users;
  }
}
