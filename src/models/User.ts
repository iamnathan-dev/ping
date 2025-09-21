import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import bcrypt from "bcrypt";
import { Exclude } from "class-transformer";

@Entity()
export class Users {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  first_name!: string;

  @Column({ nullable: false })
  last_name!: string;

  @Column({ nullable: false })
  username!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: false })
  @Exclude()
  password!: string;

  @Column({ default: false })
  verified!: boolean;

  @Column({ nullable: false })
  phone_number!: string;

  @Column({ type: "timestamp", nullable: true })
  date_of_birth?: Date;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: new Date() })
  created_at?: Date;

  @Column({ default: new Date() })
  updated_at?: Date;

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}
