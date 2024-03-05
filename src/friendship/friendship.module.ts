import { Module } from '@nestjs/common';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from './models/friendship.entity';
import { User } from 'src/auth/models/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { FriendRequest } from './models/friendrequest.entity';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Friendship]),
    TypeOrmModule.forFeature([FriendRequest]),
    TypeOrmModule.forFeature([User]),
    EventsModule
  ],
  controllers: [FriendshipController],
  providers: [FriendshipService]
})
export class FriendshipModule {}
