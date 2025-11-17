import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'customer_lists' })
export class CustomerList {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  company_id!: number;

  @Column({ length: 200 })
  name!: string;

  @CreateDateColumn()
  created_at!: Date;
}
