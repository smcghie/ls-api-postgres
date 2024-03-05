import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany, ManyToMany } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Album } from 'src/album/models/album.entity';
import { Moment } from 'src/moment/models/moment.entity';
import { Friendship } from 'src/friendship/models/friendship.entity';
import { Comment } from 'src/comments/models/comment.entity';
import { FriendRequest } from 'src/friendship/models/friendrequest.entity';
import { Report } from 'src/reports/models/report.entity';

@Entity('user')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: "regular" })
    userType: 'regular' | 'premium'; 

    @Column({ nullable: true })
    avatar: string;

    @Column()
    username: string;

    @Column()
    name: string;

    @Column({ default: false })
    isPrivate: boolean;

    @OneToMany(() => Album, album => album.createdBy)
    albums: Album[];

    @ManyToMany(() => Album, album => album.sharedUsers)
    sharedAlbums: Album[];

    @OneToMany(() => Moment, moment => moment.createdBy)
    moments: Moment[];

    @Index({ unique: true }) 
    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: 0 })
    albumCount: number;

    @Column({
        type: 'decimal',
        precision: 6,
        scale: 1,
        default: 0,
      })
    totalDataUsed: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Friendship, friendship => friendship.user)
    friends: Friendship[];

    @OneToMany(() => Comment, comment => comment.createdBy)
    comments: Comment[];
  
    @OneToMany(() => Friendship, friendship => friendship.friend)
    friendedBy: Friendship[];

    @Column({ type: 'timestamp', nullable: true })
    lastLogin: Date;

    @Column({ type: 'timestamp', nullable: true })
    previousLogin: Date;

    @OneToMany(() => FriendRequest, friendRequest => friendRequest.sender)
    sentRequests: FriendRequest[];

    @OneToMany(() => FriendRequest, friendRequest => friendRequest.receiver)
    receivedRequests: FriendRequest[];

    @OneToMany(() => Report, report => report.reportingUser)
    reportingReports: Report[];
  
    @OneToMany(() => Report, report => report.reportedUser)
    reportedReports: Report[];


    constructor() {
        if (!this.id) {
            this.id = uuidv4();
        }
    }
}
