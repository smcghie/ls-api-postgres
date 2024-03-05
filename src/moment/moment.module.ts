import { Module } from '@nestjs/common';
import { MomentController } from './moment.controller';
import { MomentService } from './moment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/models/user.entity';
import { Album } from 'src/album/models/album.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Moment } from './models/moment.entity';
import { Comment } from 'src/comments/models/comment.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([User, Album, Moment, Comment]),
  ],
  controllers: [MomentController],
  providers: [MomentService]
})
export class MomentModule {}
