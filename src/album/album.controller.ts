import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AlbumService } from './album.service';
import { CreateAlbumDto } from './dto/create-album-dto';
import { AuthGuard } from '@nestjs/passport';
import { Album } from './models/album.entity';
import { RateLimit, RateLimiterGuard } from 'nestjs-rate-limiter';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumsService: AlbumService) {}

  @UseGuards(RateLimiterGuard)
  @RateLimit({
    keyPrefix: 'create-albums',
    points: 5,
    duration: 60,
    errorMessage: 'Too many create album requests, try again later.',
  })
  @Post('createWithMoments')
  @UseGuards(AuthGuard())
  createWithMoments(@Body() createAlbumDto: CreateAlbumDto, @Req() req) {
    try {
      const response = this.albumsService.createWithMoments(
        createAlbumDto,
        req.user,
      );
      return response;
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }

  @UseGuards(RateLimiterGuard)
  @RateLimit({
    keyPrefix: 'get-albums',
    points: 10,
    duration: 60,
    errorMessage: 'Too many album requests, try again later.',
  })
  @Get('/user/:userId')
  @UseGuards(AuthGuard())
  async getAlbumsByUser(
    @Param('userId') userId: string,
    @Req() req,
  ): Promise<Album[]> {
    //console.log("ID: ", userId);
    return this.albumsService.findAllByUser(userId, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteAlbum(@Param('id') albumId: string, @Req() req) {
    await this.albumsService.deleteAlbumWithMoments(albumId, req.user);
    return {
      statusCode: HttpStatus.OK,
      message: 'Album successfully deleted.',
    };
  }
}
