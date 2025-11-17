import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'cashback_wallets' })
export class CashbackWallet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column()
  customer_id!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance!: string; // store as string decimal

  @UpdateDateColumn()
  updated_at!: Date;
}
