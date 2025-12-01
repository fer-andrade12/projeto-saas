import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum PlanType {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium'
}

export enum BillingPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

@Entity({ name: 'subscription_plans' })
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @ApiProperty({ enum: PlanType, enumName: 'PlanType' })
  @Column({ type: 'enum', enum: PlanType })
  type!: PlanType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string; // R$ 20.00, 50.00, 100.00

  @ApiProperty({ enum: BillingPeriod, enumName: 'BillingPeriod' })
  @Column({ 
    type: 'enum', 
    enum: BillingPeriod, 
    default: BillingPeriod.MONTHLY 
  })
  billing_period!: BillingPeriod;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Limits (opcional para versionamento futuro)
  @Column({ type: 'int', nullable: true })
  max_campaigns?: number;

  @Column({ type: 'int', nullable: true })
  max_customers?: number;

  @Column({ type: 'int', nullable: true })
  max_emails_per_month?: number;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
