import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friendship } from './models/friendship.entity';
import { User } from 'src/auth/models/user.entity';
import { Brackets, Repository } from 'typeorm';
import { EventsGateway } from 'src/events/events.gateway';
import { FriendRequest } from './models/friendrequest.entity';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async sendFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<FriendRequest> {
    //console.log('RECEIVER ID: ', receiverId);
    const sender = await this.userRepository.findOneBy({ id: senderId });
    const receiver = await this.userRepository.findOneBy({ id: receiverId });

    if (!sender || !receiver) {
      throw new Error('One or both users not found');
    }

    const existingRequestOrAccepted = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .where(
        new Brackets((qb) => {
          qb.where(
            'friendRequest.senderId = :senderId AND friendRequest.receiverId = :receiverId',
            {
              senderId,
              receiverId,
            },
          ).orWhere(
            'friendRequest.senderId = :receiverId AND friendRequest.receiverId = :senderId',
            {
              senderId,
              receiverId,
            },
          );
        }),
      )
      .andWhere('friendRequest.status IN (:...statuses)', {
        statuses: ['pending', 'accepted'],
      })
      .getOne();

    if (existingRequestOrAccepted) {
      throw new Error(
        'Friend request already sent or friendship already exists',
      );
    }

    const friendRequest = this.friendRequestRepository.create({
      sender,
      receiver,
      status: 'pending',
    });

    await this.friendRequestRepository.save(friendRequest);

    this.eventsGateway.notifyFriendRequest(receiverId, {
      id: friendRequest.id,
      sender: {
        username: sender.username,
        id: sender.id,
        name: sender.name,
      },
      status: friendRequest.status,
      message: 'You have a new friend request!',
    });

    return friendRequest;
  }

  async acceptFriendRequest(
    requestId: string,
    userId: string,
  ): Promise<UserResponse> {
    const request = await this.friendRequestRepository.findOne({
      where: { id: requestId },
      relations: ['sender', 'receiver'],
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Friend request is not in a pending state');
    }

    request.status = 'accepted';
    await this.friendRequestRepository.save(request);

    this.eventsGateway.notifyFriendRequestAcceptance(request.sender.id, {
      id: request.id,
      receiver: {
        id: request.receiver.id,
        username: request.receiver.username,
        name: request.receiver.name,
      },
      status: request.status,
      message: 'Your friend request has been accepted.',
    });

    this.eventsGateway.notifyFriendRequestAcceptance(request.receiver.id, {
      id: request.id,
      sender: {
        id: request.sender.id,
        username: request.sender.username,
        name: request.sender.name,
      },
      status: request.status,
      message: 'You have accepted a friend request.',
    });

    const friendship1 = this.friendshipRepository.create({
      user: request.sender,
      friend: request.receiver,
    });
    const friendship2 = this.friendshipRepository.create({
      user: request.receiver,
      friend: request.sender,
    });

    await this.friendshipRepository.save([friendship1, friendship2]);

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends', 'friends.friend'],
    });

    const friendsData = updatedUser.friends.map((friendship) => ({
      id: friendship.friend.id,
    }));
    const userResponse: UserResponse = {
      id: updatedUser.id,
      avatar: updatedUser.avatar,
      username: updatedUser.username,
      name: updatedUser.name,
      albumCount: updatedUser.albumCount,
      friends: friendsData,
    };

    return userResponse;
  }

  async cancelFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<any> {
    const friendRequest = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .where(
        'friendRequest.senderId = :senderId AND friendRequest.receiverId = :receiverId',
        { senderId, receiverId },
      )
      .andWhere('friendRequest.status = :status', { status: 'pending' })
      .getOne();

    if (!friendRequest) {
      throw new Error('Friend request not found or not pending');
    }

    friendRequest.status = 'cancelled';
    await this.friendRequestRepository.save(friendRequest);
    this.eventsGateway.notifyFriendRequestCancellation(receiverId, {
      id: friendRequest.id,
      status: friendRequest.status,
      message: 'Friend request has been cancelled.',
    });
    return { status: 'cancelled' };
  }

  async getFriendRequestStatus(
    senderId: string,
    receiverId: string,
  ): Promise<
    | { status: 'pending' | 'accepted' | 'rejected' | 'cancelled' }
    | { status: 'none' }
  > {
    const friendRequest = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .leftJoin('friendRequest.sender', 'sender')
      .leftJoin('friendRequest.receiver', 'receiver')
      .where('sender.id = :senderId AND receiver.id = :receiverId', {
        senderId,
        receiverId,
      })
      .orWhere('sender.id = :receiverId AND receiver.id = :senderId', {
        senderId,
        receiverId,
      })
      .orderBy('friendRequest.createdAt', 'DESC')
      .select(['friendRequest.status'])
      .getOne();

    return friendRequest
      ? { status: friendRequest.status }
      : { status: 'none' };
  }

  async getPendingFriendRequestsForUser(userId: string): Promise<any[]> {
    const requests = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .leftJoinAndSelect('friendRequest.sender', 'sender')
      .select([
        'friendRequest.id',
        'friendRequest.status',
        'sender.id',
        'sender.name',
        'sender.username',
      ])
      .where('friendRequest.receiverId = :userId', { userId })
      .andWhere('friendRequest.status = :status', { status: 'pending' })
      .getMany();

    return requests;
  }

  async getFriends(userId: string): Promise<any[]> {
    const friendships = await this.friendshipRepository.find({
      where: { user: { id: userId } },
      relations: ['friend'],
    });

    const friends = friendships.map(friendship => {
      const { id, username, name, avatar } = friendship.friend;
      return { id, username, name, avatar };
    });
  
    return friends;
  }

  async removeFriend(userId: string, friendId: string): Promise<any> {
    await this.friendshipRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const friendRequest = await transactionalEntityManager
          .createQueryBuilder(FriendRequest, 'friendRequest')
          .where([
            {
              sender: { id: userId },
              receiver: { id: friendId },
              status: 'accepted',
            },
            {
              sender: { id: friendId },
              receiver: { id: userId },
              status: 'accepted',
            },
          ])
          .orderBy('friendRequest.createdAt', 'DESC')
          .getOne();

        if (friendRequest) {
          friendRequest.status = 'cancelled';
          await transactionalEntityManager.save(FriendRequest, friendRequest);
        }

        const friendships = await transactionalEntityManager.find(Friendship, {
          where: [
            { user: { id: userId }, friend: { id: friendId } },
            { user: { id: friendId }, friend: { id: userId } },
          ],
        });

        if (friendships.length > 0) {
          await transactionalEntityManager.remove(Friendship, friendships);
        }
      },
    );

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends', 'friends.friend'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const friendsData = user.friends.map((friendship) => ({
      id: friendship.friend.id,
    }));

    const userResponse: UserResponse = {
      id: user.id,
      avatar: user.avatar,
      username: user.username,
      name: user.name,
      albumCount: user.albumCount,
      friends: friendsData,
    };
    return userResponse;
  }
}
