import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { User } from 'src/auth/models/user.entity';
  import { Moment } from 'src/moment/models/moment.entity';
  
  enum ReportStatus {
    PENDING = "pending",
    REVIEWING = "reviewing",
    RESOLVED = "resolved",
    REJECTED = "rejected",
  }

  @Entity()
  export class Report {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => User, (user) => user.reportedReports)
    reportedUser: User;
  
    @ManyToOne(() => User, (user) => user.reportingReports)
    reportingUser: User;
  
    @ManyToOne(() => Moment, (moment) => moment.reports)
    reportedMoment: Moment;
  
    @Column({
      type: "enum",
      enum: ReportStatus,
      default: ReportStatus.PENDING,
    })
    status: ReportStatus;
  
    @CreateDateColumn()
    createdAt: Date;
  }


  