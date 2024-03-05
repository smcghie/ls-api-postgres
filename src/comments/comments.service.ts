import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Comment } from './models/comment.entity';
import { Moment } from 'src/moment/models/moment.entity';
import { User } from 'src/auth/models/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { getPresignedAvatarUrl, getPresignedFullUrl } from 'src/utils/signage';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createComment(createCommentDto: CreateCommentDto, userId: string): Promise<any> {
    return await this.commentRepository.manager.transaction(async (manager: EntityManager) => {
      const { momentId, commentText, replies } = createCommentDto;

      const moment = await manager.findOne(Moment, {
        where: { id: momentId },
        relations: ["createdBy", "album"],
      });
      if (!moment) {
        throw new Error('Moment not found');
      }

      const user = await manager.findOne(User, {
        where: { id: userId }
      });
      if (!user) {
        throw new Error('User not found');
      }

      moment.commentCount = (moment.commentCount || 0) + 1;
      await manager.save(Moment, moment);

      const comment = manager.create(Comment, {
        moment,
        createdBy: user,
        commentText,
        replies: [],
      });

      if (userId !== moment.createdBy.id){
      this.eventsGateway.notifyNewComment(moment.createdBy.id, {
        enlargedImage: moment.image,
        albumTitle: moment.album.title,
        moment: moment,
        sender: {
          username: user.username,
          id: user.id,
          name: user.name,
        },
        status: 'newComment',
        message: `You have a new comment by ${user.username}`,
      });
    }
      await manager.save(Comment, comment);

      const response = {
          commentText: comment.commentText,
          createdBy: {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            name: user.name,
          },
          id: user.id,
          momentId: comment.momentId
      };

      return response;
    });
  }

  async getComments(momentId: string): Promise<any> {
    const comments = await this.commentRepository.find({
      where: { momentId: momentId },
      relations: ['createdBy'],
    });
  
    if (comments.length === 0) {
      throw new Error('No comments found for this moment');
    }
  
    const modifiedComments = await Promise.all(comments.map(async (comment) => {

      const { id, username, avatar, name } = comment.createdBy;
      const createdBy = {
        id,
        username,
        avatar,
        name,
      };
  
      return { ...comment, createdBy };
    }));
  
    return modifiedComments;
  }
  
  async deleteComment(commentId: string): Promise<any> {
    return await this.commentRepository.manager.transaction(async (manager: EntityManager) => {
      const comment = await manager.findOne(Comment, { 
        where: { id: commentId },
        relations: ['moment']
      });
  
      if (!comment) {
        throw new Error('Comment not found');
      }
  
      const moment = await manager.findOne(Moment, {
        where: { id: comment.moment.id }
      });
  
      if (!moment) {
        throw new Error('Moment not found');
      }
  
      moment.commentCount = (moment.commentCount || 0) - 1;
      await manager.save(Moment, moment);
  
      await manager.delete(Comment, { id: commentId });

      return { message: 'Comment deleted successfully' };
    });
  }
  
}