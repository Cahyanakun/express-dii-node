import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Role } from "./Role";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column({ select: false }) // Biar password gak otomatis ketarik pas query
  password: string;

  @ManyToMany(() => Role)
  @JoinTable({ name: "user_roles" }) // Jembatan Many-to-Many
  roles: Role[];
}