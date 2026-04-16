import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity("blacklisted_tokens")
export class BlacklistedToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  @Index()
  token: string;

  @Column({ type: "timestamp", nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
