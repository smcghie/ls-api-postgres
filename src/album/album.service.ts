import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Album } from './models/album.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateAlbumDto } from './dto/create-album-dto';
import { Moment } from 'src/moment/models/moment.entity';
import { User } from 'src/auth/models/user.entity';
import {
  getPresignedImageUploadUrl,
} from 'src/utils/signage';
import { Friendship } from 'src/friendship/models/friendship.entity';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private albumsRepository: Repository<Album>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    private entityManager: EntityManager,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(createAlbumDto: CreateAlbumDto): Promise<Album> {
    const album = this.albumsRepository.create(createAlbumDto);
    return this.albumsRepository.save(album);
  }

  async createWithMoments(
    createAlbumDto: CreateAlbumDto,
    user: User,
  ): Promise<any> {
    return await this.entityManager.transaction(async (manager) => {
      const { moments, sharedWith, ...albumData } = createAlbumDto;

      let REGULAR = Number(process.env.REGULAR_ALLOWANCE);
      let PREMIUM = Number(process.env.PREMIUM_ALLOWANCE);

      let totalMomentsSize: number = 0;

      moments.forEach((moment) => {
        totalMomentsSize += moment.fileSize;
      });
      const total = Number(user.totalDataUsed) + Number(totalMomentsSize);

      if (user.userType === 'regular' && total > REGULAR) {
        throw new Error(
          'Regular user has exceeded their data usage allowance.',
        );
      } else if (user.userType === 'premium' && total > PREMIUM) {
        throw new Error(
          'Premium user has exceeded their data usage allowance.',
        );
      }

      user.totalDataUsed = total;
      console.log('Total moments size: ', totalMomentsSize);
      //console.log("Total data used after adding: ", total);
      await manager.save(User, user);

      const album = manager.create(Album, {
        ...albumData,
        createdBy: user,
      });
      await manager.save(Album, album);

      if (sharedWith && sharedWith.length) {
        const sharedUsers = await manager.findByIds(User, sharedWith);
        album.sharedUsers = sharedUsers;
        sharedUsers.forEach((sharedUser) => {
          this.eventsGateway.notifySharedAlbum(sharedUser.id, {
            albumId: album.id,
            albumTitle: album.title,
            sender: {
              username: user.username,
              id: user.id,
              name: user.name,
            },
            status: 'sharedAlbum',
            message: `You have a new album shared by ${user.username}`,
          });
        });
      } else {
        album.sharedUsers = [];
      }
      await manager.save(Album, album);

      const presignedUrls = [];

      if (moments && moments.length) {
        for (const momentData of moments) {
          const moment = manager.create(Moment, {
            ...momentData,
            album: album,
            createdBy: user,
            commentCount: 0,
          });
          const presignedUrl = await getPresignedImageUploadUrl(
            momentData.image,
          );
          presignedUrls.push(presignedUrl);

          await manager.save(Moment, moment);
        }
      }
      const response = {
        album: {
          ...album,
          createdBy: {
            id: user.id,
            username: user.username,
          },
          sharedWith: album.sharedUsers.map((u) => ({
            id: u.id,
            username: u.username,
          })),
        },
        presignedUrls,
      };

      return response;
    });
  }

  async findAllByUser(
    profileOwnerId: string,
    requestingUserId: string,
  ): Promise<any> {
    //console.log("PROFILE: ", profileOwnerId)
    //console.log("REQUEST: ", requestingUserId)
    const profileOwner = await this.userRepository.findOne({
      where: { id: profileOwnerId },
    });

    if (!profileOwner) {
      throw new Error('Profile owner not found.');
    }

    if (profileOwner.isPrivate) {
      if (requestingUserId !== profileOwnerId) {
        const isFriend = await this.friendshipRepository.findOne({
          where: [
            { user: { id: requestingUserId }, friend: { id: profileOwnerId } },
            { user: { id: profileOwnerId }, friend: { id: requestingUserId } },
          ],
        });

        //console.log("IS FRIEND: ", isFriend);

        if (!isFriend) {
          return { message: 'This profile is private.' };
        }
      }
    }

    const albums = await this.albumsRepository
      .createQueryBuilder('album')
      .leftJoinAndSelect('album.createdBy', 'createdBy')
      .leftJoinAndSelect('album.sharedUsers', 'sharedUser')
      .leftJoinAndSelect('album.moments', 'moment')
      .leftJoinAndSelect('moment.createdBy', 'momentUser')
      .select([
        'album',
        'moment',
        'createdBy.id',
        'createdBy.name',
        'createdBy.username',
        'createdBy.avatar',
        'momentUser.id',
        'momentUser.name',
        'momentUser.username',
        'momentUser.avatar',
        'sharedUser.id',
        'sharedUser.username',
        'sharedUser.avatar',
      ])
      .where('album.createdBy.id = :userId', { userId: profileOwnerId })
      .orWhere('sharedUser.id = :userId', { userId: profileOwnerId })
      .getMany();

    for (const album of albums) {
      if (album.moments && album.moments.length > 0) {
        album.moments.sort((a, b) => a.captureDate.localeCompare(b.captureDate));
      }
    }
    return albums;
  }

  async deleteAlbumWithMoments(albumId: string, user: User): Promise<void> {
    return await this.entityManager.transaction(async (manager) => {
      const album = await manager.findOne(Album, {
        where: { id: albumId, createdBy: { id: user.id } },
        relations: ['moments'],
      });

      if (!album) {
        throw new Error(
          'Album not found or you do not have permission to delete it.',
        );
      }
      const totalFileSize = album.moments.reduce(
        (acc, moment) => Number(acc) + Number(moment.fileSize),
        0,
      );
      //console.log('TOTALFILESIZE: ', totalFileSize);
      user.totalDataUsed -= totalFileSize;
      if (user.totalDataUsed < 0) {
        user.totalDataUsed = 0;
      }

      await manager.save(User, user);

      await manager.remove(Album, album);
    });
  }
}
