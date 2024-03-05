import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MomentModule } from './moment/moment.module';
import { AlbumModule } from './album/album.module';
import { FriendshipModule } from './friendship/friendship.module';
import { CommentsModule } from './comments/comments.module';
import { ActivityModule } from './activity/activity.module';
import { EventsModule } from './events/events.module';
import { RateLimiterGuard, RateLimiterModule } from 'nestjs-rate-limiter';
import { APP_GUARD } from '@nestjs/core';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      extra: {
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      },
    }),
    RateLimiterModule,
    AuthModule,
    MomentModule,
    AlbumModule,
    FriendshipModule,
    CommentsModule,
    ActivityModule,
    EventsModule,
    ReportsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
  },],
})
export class AppModule {}
