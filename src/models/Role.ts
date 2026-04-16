import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Menu } from "./Menu";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  role_name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Menu)
  @JoinTable({ name: "role_menus" })
  menus: Menu[];
}