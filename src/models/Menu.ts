import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";

@Entity("menus")
export class Menu {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  label: string;

  @Column()
  route: string;

  @Column({ nullable: true })
  path: string; // Contoh: "uuid1.uuid2"

  @Column({ default: 0 })
  sort_order: number;

  @ManyToOne(() => Menu, (menu) => menu.children, { nullable: true })
  @JoinColumn({ name: "parent_id" })
  parent: Menu;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];
}