import { Module } from '@nestjs/common';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/models/user.entity';
import { Album } from './models/album.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Moment } from 'src/moment/models/moment.entity';
import { Comment } from 'src/comments/models/comment.entity';
import { Friendship } from 'src/friendship/models/friendship.entity';
import { EventsModule } from 'src/events/events.module';
import { RateLimiterModule } from 'nestjs-rate-limiter';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([User, Album, Comment, Friendship, Moment]),
    EventsModule,
    RateLimiterModule
  ],
  controllers: [AlbumController],
  providers: [AlbumService]
})
export class AlbumModule {}
