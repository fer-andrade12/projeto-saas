import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'campaign_sends' })
export class CampaignSend {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  campaign_id!: number;

  @Index()
  @Column()
  customer_id!: number;

  @Column({ length: 20 })
  channel!: 'email' | 'whatsapp';

  @Index({ unique: true })
  @Column({ length: 64 })
  tracking_id!: string; // unique token per send

  @CreateDateColumn()
  sent_at!: Date;

  @Column({ length: 20, default: 'sent' })
  status!: 'sent' | 'delivered' | 'failed' | 'pending';
}
