import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'coupons' })
export class Coupon {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  campaign_id!: number;

  @Column({ length: 100, unique: true })
  code!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount_value?: number;

  @Column({ type: 'datetime', nullable: true })
  redeemed_at?: Date;

  @Column({ length: 200, nullable: true })
  redeemed_by?: string;

  @Column({ default: false })
  is_redeemed!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
