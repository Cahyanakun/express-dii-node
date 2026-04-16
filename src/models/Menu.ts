import { Entity, PrimaryGeneratedColumn, Column, Tree, TreeParent, TreeChildren, JoinColumn } from "typeorm";

@Entity("menus")
@Tree("materialized-path")
export class Menu {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  label: string;

  @Column()
  route: string;

  @Column({ nullable: true })
  path: string;

  @Column({ default: 0 })
  sort_order: number;

  @TreeParent()
  @JoinColumn({ name: "parent_id" })
  parent: Menu;

  @TreeChildren()
  children: Menu[];
}