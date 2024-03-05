import { Body, Controller, Post, UseGuards, Request, Req, Get, Param, Delete, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './models/comment.entity';

@Controller('comments')
export class CommentsController {

    constructor(private readonly commentsService: CommentsService) {}

    @Post()
    @UseGuards(AuthGuard())
    async createComment(@Body() createCommentDto: CreateCommentDto, @Req() req): Promise<Comment> {
      const userId = req.user.id;
      return this.commentsService.createComment(createCommentDto, userId);
    }

    @Get(':id')
    @UseGuards(AuthGuard())
    async getComments(
        @Param('id')
        momentId: string
    ): Promise<Comment> {
      return this.commentsService.getComments(momentId);
    }

    @Delete(':id')
    @UseGuards(AuthGuard())
    async deleteComment(
        @Param('id')
        commentId: string,
    ): Promise<Comment> {
        return this.commentsService.deleteComment(commentId)
    }
}
