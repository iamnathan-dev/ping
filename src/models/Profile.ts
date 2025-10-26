import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Users } from "./User";

@Entity()
export class Profile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Users, { nullable: false })
  @JoinColumn({ name: "user_id" })
  user!: Users;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  phone_number?: string;

  @Column({ type: "timestamp", nullable: true })
  date_of_birth?: Date;

  @Column({ default: new Date() })
  created_at?: Date;

  @Column({ default: new Date() })
  updated_at?: Date;
}
