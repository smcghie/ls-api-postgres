import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Moment } from './models/moment.entity';
import { Repository } from 'typeorm';
import { CreateMomentDto } from './dto/create-moment-dto';
import { User } from 'src/auth/models/user.entity';
import { Album } from 'src/album/models/album.entity';

@Injectable()
export class MomentService {
    constructor(
        @InjectRepository(Moment)
        private momentsRepository: Repository<Moment>,
        @InjectRepository(Album)
        private readonly albumRepository: Repository<Album>
      ) {}
    
      async addMomentsToAlbum(momentsData: CreateMomentDto[], albumId: string, user: User): Promise<any> {
        const album = await this.albumRepository.findOne({ 
          where: { id: albumId}
        });
        
        if (!album) {
          throw new Error('Album not found or you do not have permission to add moments to this album.');
        }
    
        const createdMoments = momentsData.map(momentData => {
          const moment = this.momentsRepository.create({
            ...momentData,
            album: album,
            createdBy: { id: user.id } 
          });
          return moment;
        });
      
        const savedMoments = await this.momentsRepository.save(createdMoments);

        let totalMomentsSize: number = 0;
        savedMoments.forEach(moment => {
          totalMomentsSize += Number(moment.fileSize);
        });
        const total = Number(user.totalDataUsed) + Number(totalMomentsSize);

        user.totalDataUsed = total;
        await this.albumRepository.manager.save(user);

        const updatedAlbum = await this.albumRepository.findOne({
          where: { id: albumId },
          relations: ['moments', 'moments.createdBy'],
        });
      
        return updatedAlbum;
      }

      async deleteMoment(momentId: string, albumId: string, user: User): Promise<any> {
        const moment = await this.momentsRepository.findOne({
          where: { id: momentId },
          relations: ['album']
        });
    
        if (!moment) {
          throw new Error('Moment not found or you do not have permission to delete this moment.');
        }

        user.totalDataUsed -= moment.fileSize;
        if (user.totalDataUsed < 0) {
          user.totalDataUsed = 0; 
        }
        await this.momentsRepository.manager.save(user); 
    
        await this.momentsRepository.remove(moment);

        const updatedAlbum = await this.albumRepository.findOne({
          where: { id: albumId },
          relations: ['moments', 'moments.createdBy'],
        });
        return updatedAlbum;
      }

}
