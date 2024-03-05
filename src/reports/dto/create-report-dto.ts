import { IsString } from "class-validator";

enum ReportStatus {
  PENDING = "pending",
  REVIEWING = "reviewing",
  RESOLVED = "resolved",
  REJECTED = "rejected",
}

export class CreateReportDto {

    @IsString()
    reportedUserId: string;

    @IsString()
    reportedMomentId: string;

    @IsString()
    status: ReportStatus;
  }
  