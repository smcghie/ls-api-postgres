import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivityService } from './activity.service';
import { RateLimit, RateLimiterGuard } from 'nestjs-rate-limiter';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @UseGuards(RateLimiterGuard)
  @RateLimit({
    keyPrefix: 'get-updates',
    points: 5,
    duration: 60,
    errorMessage: 'Too many update requests, try again later.',
  })
  @Get()
  @UseGuards(AuthGuard())
  getRecentFriendActivities(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.activityService.getRecentFriendActivities(
      req.user,
      page,
      limit,
    );
  }
}