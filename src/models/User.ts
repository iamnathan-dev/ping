import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import bcrypt from "bcrypt";
import { Exclude } from "class-transformer";

@Entity()
export class Users {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  full_name!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: false })
  @Exclude()
  password!: string;

  @Column({ default: false })
  verified!: boolean;

  @Column({ type: "timestamp", nullable: true })
  date_of_birth?: Date;

  @Column({ nullable: true })
  avatar?: string;

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}
