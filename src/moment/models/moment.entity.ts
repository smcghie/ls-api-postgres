import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Album } from 'src/album/models/album.entity';
import { User } from 'src/auth/models/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { Comment } from 'src/comments/models/comment.entity';
import { Report } from 'src/reports/models/report.entity';

@Entity()
export class Moment {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column()
    image: string;

    @Column('text')
    description: string;

    @Column('float', { array: true })
    coordinates: number[];

    @Column()
    commentCount: number;

    @Column()
    captureDate: string;

    @ManyToOne(() => User, user => user.albums)
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @Column({ name: 'albumId' })
    albumId: string;

    @ManyToOne(() => Album, album => album.moments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'albumId' })
    album: Album;

    @Column({
        type: 'decimal',
        precision: 5,
        scale: 1,
        default: 0,
      })
    fileSize: number;

    @Column({default: ""})
    fileType: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Comment, comment => comment.moment)
    comments: Comment[];

    @OneToMany(() => Report, report => report.reportedMoment)
    reports: Report[];

    constructor() {
        if (!this.id) {
            this.id = uuidv4();
        }
    }
}
