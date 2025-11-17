import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELED = 'canceled',
  TRIAL = 'trial'
}

@Entity({ name: 'company_subscriptions' })
export class CompanySubscription {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  company_id!: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column()
  plan_id!: number;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'plan_id' })
  plan?: SubscriptionPlan;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status!: SubscriptionStatus;

  @Column({ type: 'date', nullable: true })
  started_at?: Date;

  @Column({ type: 'date', nullable: true })
  expires_at?: Date;

  @Column({ type: 'date', nullable: true })
  canceled_at?: Date;

  // Stripe/Payment data
  @Column({ length: 255, nullable: true })
  stripe_subscription_id?: string;

  @Column({ length: 255, nullable: true })
  stripe_customer_id?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  last_payment_amount?: string;

  @Column({ type: 'date', nullable: true })
  last_payment_date?: Date;

  @Column({ type: 'date', nullable: true })
  next_billing_date?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
