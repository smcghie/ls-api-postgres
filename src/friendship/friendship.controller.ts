import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FriendshipService } from './friendship.service';
import { User } from 'src/auth/models/user.entity';
import { FriendRequest } from './models/friendrequest.entity';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Put('add-friend')
  @UseGuards(AuthGuard())
  async addFriend(
    @Body() body: { userId: string; friendId: string },
  ): Promise<any> {
    const { userId, friendId } = body;
    const userResponse = await this.friendshipService.sendFriendRequest(
      userId,
      friendId,
    );
    return { user: userResponse };
    //return friendship;
  }

  @Put('accept-friend-request/:requestId')
  @UseGuards(AuthGuard())
  async acceptFriendRequest(
    @Param('requestId') requestId: string,
    @Req() req,
  ): Promise<any> {
    const userId = req.user.id;

    const updatedUser = await this.friendshipService.acceptFriendRequest(
      requestId,
      userId,
    );
    return { user: updatedUser };
  }

  @Put('/cancel-friend-request')
  @UseGuards(AuthGuard())
  async cancelFriendRequest(
    @Body('senderId') senderId: string,
    @Body('receiverId') receiverId: string,
  ): Promise<void> {
    return this.friendshipService.cancelFriendRequest(senderId, receiverId);
  }

  @Get('pending-requests')
  @UseGuards(AuthGuard())
  async getPendingFriendRequests(@Req() req): Promise<FriendRequest[]> {
    const userId = req.user.id;
    return this.friendshipService.getPendingFriendRequestsForUser(userId);
  }

  @Get(':userId/friends')
  @UseGuards(AuthGuard())
  async getFriends(@Param('userId') userId: string): Promise<User[]> {
    return this.friendshipService.getFriends(userId);
  }

  @Delete('remove-friend')
  @UseGuards(AuthGuard())
  async removeFriend(
    @Body() body: { userId: string; friendId: string },
  ): Promise<any> {
    const { userId, friendId } = body;
    const userResponse = await this.friendshipService.removeFriend(
      userId,
      friendId,
    );
    return { user: userResponse };
    //return friendship;
  }

  @Get('/status')
  async getFriendRequestStatus(
    @Query('senderId') senderId: string,
    @Query('receiverId') receiverId: string,
  ): Promise<
    | { status: 'pending' | 'accepted' | 'rejected' | 'cancelled' }
    | { status: 'none' }
  > {
    //console.log('SENDER?RECEVER: ', senderId, receiverId);
    return this.friendshipService.getFriendRequestStatus(senderId, receiverId);
  }
}
