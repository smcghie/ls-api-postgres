import { Body, Controller, Delete, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateMomentDto, CreateMomentsDto } from './dto/create-moment-dto';
import { MomentService } from './moment.service';
import { AuthGuard } from '@nestjs/passport';
import { Moment } from './models/moment.entity';

@Controller('moment')
export class MomentController {

    constructor(private readonly momentsService: MomentService) {}

    @Post(':albumId')
    @UseGuards(AuthGuard())
    async addMomentToAlbum(
      @Body() createMomentsDto: CreateMomentsDto, 
      @Param('albumId') albumId: string, 
      @Req() req
    ): Promise<Moment> {
      const user = req.user;
      return this.momentsService.addMomentsToAlbum(createMomentsDto.moments, albumId, user);
    }

    @Delete(':momentId')
    @UseGuards(AuthGuard())
    async deleteMoment(
      @Param('momentId') momentId: string, 
      @Query('albumId') albumId: string,
      @Req() req,
    ): Promise<void> {
      const user = req.user;
      return await this.momentsService.deleteMoment(momentId, albumId, user);
    }

}
