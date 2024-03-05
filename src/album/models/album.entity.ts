import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Moment } from 'src/moment/models/moment.entity';
import { User } from 'src/auth/models/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Album {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    albumType: string;

    @OneToMany(() => Moment, moment => moment.album)
    moments: Moment[];

    @ManyToOne(() => User, user => user.albums)
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @Column({ name: 'createdById', nullable: true })
    createdById: string;

    @ManyToMany(() => User, user => user.sharedAlbums)
    @JoinTable({
        name: 'album_shared_users',
        joinColumn: {
            name: 'albumId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'userId',
            referencedColumnName: 'id',
        },
    })
    sharedUsers: User[];

    @CreateDateColumn()
    createdAt: Date;

    constructor() {
        if (!this.id) {
            this.id = uuidv4();
        }
    }
}