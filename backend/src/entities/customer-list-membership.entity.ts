import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'customer_list_memberships' })
export class CustomerListMembership {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  list_id!: number;

  @Index()
  @Column()
  customer_id!: number;
}
