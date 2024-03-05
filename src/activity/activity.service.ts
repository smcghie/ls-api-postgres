import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Album } from 'src/album/models/album.entity';
import { User } from 'src/auth/models/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
  ) {}

  async getRecentFriendActivities(
    user: User,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    let albums: Album[] = [];
    const offset = (page - 1) * limit;
    let hasMore = true;
    console.log(`Page: ${page}, Limit: ${limit}, Offset: ${offset}`);
  
    const friendIds = user.friends.map((friend) => friend.friend.id);
  
    const newAlbums = await this.albumRepository
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
      .where('album.createdBy IN (:...friendIds)', { friendIds })
      .orderBy('album.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  
    if (newAlbums.length > 0) {
      albums = newAlbums;
      if (newAlbums.length < limit) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  
    for (const album of albums) {
      if (album.moments && album.moments.length > 0) {
        album.moments.sort((a, b) => a.captureDate.localeCompare(b.captureDate));
      }
    }
  
    return {
      albums: albums,
      hasMore: hasMore,
    };
  }
 }
