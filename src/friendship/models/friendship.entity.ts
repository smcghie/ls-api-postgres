import { User } from "src/auth/models/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('friendship')
export class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  friendId: string;

  @ManyToOne(() => User, user => user.friends, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User, user => user.friendedBy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'friendId' })
  friend: User;
}
