import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from 'src/album/models/album.entity';
import { User } from 'src/auth/models/user.entity';
import { RateLimiterModule } from 'nestjs-rate-limiter';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Album]),
    TypeOrmModule.forFeature([User]),
    RateLimiterModule
  ],
  controllers: [ActivityController],
  providers: [ActivityService]
})
export class ActivityModule {}