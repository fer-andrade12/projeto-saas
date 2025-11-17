import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'campaign_events' })
export class CampaignEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  campaign_id!: number;

  @Index()
  @Column()
  customer_id!: number;

  @Index()
  @Column({ nullable: true })
  send_id?: number;

  @Index()
  @Column({ length: 32 })
  type!: 'open' | 'click' | 'redeem' | 'cashback_credit' | 'cashback_debit';

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  created_at!: Date;
}
