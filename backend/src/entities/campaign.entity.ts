import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'campaigns' })
export class Campaign {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  company_id!: number;

  @Column({ length: 200 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 30, default: 'coupon' })
  type!: 'coupon' | 'cashback' | 'gift' | 'coupon_cashback';

  @Column({ type: 'int', nullable: true })
  discount_percent?: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  cashback_value?: string | null;

  @Column({ type: 'datetime', nullable: true })
  start_date?: Date;

  @Column({ type: 'datetime', nullable: true })
  end_date?: Date;

  @Column({ default: true })
  active!: boolean;

  @Column({ default: 0 })
  total_coupons!: number;

  @Column({ default: 0 })
  redeemed_coupons!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ type: 'int', nullable: true })
  limit_per_customer?: number | null;

  @Column({ type: 'int', nullable: true })
  total_available?: number | null;

  @Column({ type: 'text', nullable: true })
  message_template?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  landing_url?: string | null;
}
