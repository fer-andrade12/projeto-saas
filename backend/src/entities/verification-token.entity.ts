import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'verification_tokens' })
export class VerificationToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  user_id!: number;

  @Column({ length: 255 })
  @Index({ unique: true })
  token!: string;

  @Column({ type: 'datetime' })
  expires_at!: Date;

  @Column({ type: 'datetime', nullable: true })
  used_at?: Date | null;

  @CreateDateColumn()
  created_at!: Date;
}
