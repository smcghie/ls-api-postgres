import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateReportDto } from './dto/create-report-dto';
import { User } from 'src/auth/models/user.entity';
import { Moment } from 'src/moment/models/moment.entity';
import { Report } from './models/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly dataSource: DataSource,
    
  ) {}

  async createReport(createReportDto: CreateReportDto, reportingUser: User): Promise<Report> {
    return await this.dataSource.transaction(async (entityManager) => {
      const { reportedUserId, reportedMomentId, status } = createReportDto;

      const reportedUser = await entityManager.findOneBy(User, { id: reportedUserId });
      const reportedMoment = await entityManager.findOneBy(Moment, { id: reportedMomentId });

      if (!reportedUser || !reportingUser || !reportedMoment) {
        throw new Error('Reported or reporting user or moment not found.');
      }

      const report = entityManager.create(Report, {
        reportedUser,
        reportingUser,
        reportedMoment,
        status: status,
      });

      await entityManager.save(Report, report);

      return report;
    });
  }
}
