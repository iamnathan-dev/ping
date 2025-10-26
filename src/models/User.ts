import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import bcrypt from "bcrypt";
import { Exclude } from "class-transformer";
import { Profile } from "./Profile";

@Entity()
export class Users {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  full_name!: string;

  @Column({ nullable: false })
  username!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: false })
  @Exclude()
  password!: string;

  @Column({ default: false })
  verified!: boolean;

  @Column({ default: new Date() })
  created_at?: Date;

  @Column({ default: new Date() })
  updated_at?: Date;

  @OneToMany(() => Profile, (profile) => profile.user)
  profiles?: Profile[];

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}
