import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/models/user.entity';
import { Moment } from 'src/moment/models/moment.entity';
import { Comment } from './models/comment.entity';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Moment]),
    TypeOrmModule.forFeature([Comment]),
    EventsModule
  ],
  controllers: [CommentsController],
  providers: [CommentsService]
})
export class CommentsModule {}
