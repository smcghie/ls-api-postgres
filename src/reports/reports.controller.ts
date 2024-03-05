import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateReportDto } from './dto/create-report-dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportService: ReportsService) {}

    @Post()
    @UseGuards(AuthGuard())
    @HttpCode(HttpStatus.CREATED)
    async createReport(
      @Body() createReportDto: CreateReportDto,
      @Req() req) {
      const report = await this.reportService.createReport(createReportDto, req.user);
      return report;
    }
}
