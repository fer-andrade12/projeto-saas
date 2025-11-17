import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'cashback_transactions' })
export class CashbackTransaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  customer_id!: number;

  @Index()
  @Column({ nullable: true })
  campaign_id?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string; // positive for credit, negative for debit

  @Column({ length: 10 })
  direction!: 'credit' | 'debit';

  @Column({ type: 'datetime', nullable: true })
  expires_at?: Date;

  @Column({ type: 'datetime', nullable: true })
  used_at?: Date;

  @Column({ length: 100, nullable: true })
  reference?: string;

  @CreateDateColumn()
  created_at!: Date;
}
