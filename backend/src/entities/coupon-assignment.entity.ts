import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'coupon_assignments' })
export class CouponAssignment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  campaign_id!: number;

  @Index()
  @Column()
  customer_id!: number;

  @Index({ unique: true })
  @Column({ length: 64 })
  coupon_code!: string;

  @CreateDateColumn()
  assigned_at!: Date;

  @Column({ type: 'datetime', nullable: true })
  redeemed_at?: Date;

  @Column({ default: 1 })
  limit_per_customer!: number;

  @Column({ default: 0 })
  usage_count!: number;
}
