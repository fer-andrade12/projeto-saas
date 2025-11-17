import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  COMPANY = 'company'
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  email!: string;

  @Column({ length: 200 })
  password!: string;

  @Column({ length: 100, nullable: true })
  name?: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COMPANY })
  role!: UserRole;

  @Column({ nullable: true })
  company_id?: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
