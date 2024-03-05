import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/models/user.entity';
import { Moment } from 'src/moment/models/moment.entity';
import { RateLimiterModule } from 'nestjs-rate-limiter';
import { Report } from './models/report.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Moment]),
    TypeOrmModule.forFeature([Report]),
    RateLimiterModule

  ],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {}
