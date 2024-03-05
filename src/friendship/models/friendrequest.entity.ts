import { User } from "src/auth/models/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.sentRequests)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User, user => user.receivedRequests)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';

  @CreateDateColumn()
  createdAt: Date;
}