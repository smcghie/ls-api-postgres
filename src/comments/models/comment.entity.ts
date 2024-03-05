import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Moment } from 'src/moment/models/moment.entity';
import { User } from 'src/auth/models/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'momentId' })
  momentId: string;

  @ManyToOne(() => Moment, moment => moment.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'momentId' })
  moment: Moment;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'userId' })
  createdBy: User;

  @Column({ type: 'text' })
  commentText: string;

  @ManyToOne(() => Comment, comment => comment.replies)
  @JoinColumn({ name: 'parentId' })
  parentComment: Comment;

  @OneToMany(() => Comment, comment => comment.parentComment)
  replies: Comment[];
}
