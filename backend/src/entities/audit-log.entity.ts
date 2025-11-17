import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ nullable: true })
  actor_user_id?: number;

  @Index()
  @Column({ nullable: true })
  company_id?: number;

  @Column({ length: 50 })
  action!: string; // e.g., campaign.created, coupon.redeemed

  @Column({ length: 50, nullable: true })
  entity?: string; // e.g., campaign, coupon, customer

  @Column({ nullable: true })
  entity_id?: number;

  @Column({ type: 'json', nullable: true })
  data?: Record<string, any>;

  @CreateDateColumn()
  created_at!: Date;
}
