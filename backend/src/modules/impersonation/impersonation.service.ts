import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../entities/company.entity';
import { User, UserRole } from '../../entities/user.entity';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

@Injectable()
export class ImpersonationService {
  constructor(
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async startImpersonation(superAdminId: number, companyId: number) {
    // Verify super admin
    const superAdmin = await this.userRepo.findOne({ where: { id: superAdminId } });
    if (!superAdmin || superAdmin.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Only super admins can impersonate');
    }

    // Verify company exists
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) throw new Error('Company not found');

    // Find a company user (or create temporary payload)
    const companyUser = await this.userRepo.findOne({ 
      where: { company_id: companyId, role: UserRole.COMPANY } 
    });

    const payload = {
      sub: companyUser?.id || superAdminId,
      email: companyUser?.email || superAdmin.email,
      role: UserRole.COMPANY,
      company_id: companyId,
      original_user_id: superAdminId, // ID do super admin original
      original_role: UserRole.SUPER_ADMIN
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    return { 
      accessToken, 
      message: `Impersonating company ${company.name}`,
      company 
    };
  }

  async stopImpersonation(currentUserId: number, originalUserId: number) {
    // Use the original super admin ID to restore session
    const superAdmin = await this.userRepo.findOne({ where: { id: originalUserId } });
    if (!superAdmin || superAdmin.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Invalid original user');
    }

    const payload = {
      sub: superAdmin.id,
      email: superAdmin.email,
      role: UserRole.SUPER_ADMIN,
      company_id: null
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    return { accessToken, message: 'Impersonation stopped' };
  }
}
