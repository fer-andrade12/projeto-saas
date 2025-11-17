import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../entities/company.entity';
import { User, UserRole } from '../../entities/user.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { CompanySubscription, SubscriptionStatus } from '../../entities/company-subscription.entity';
import { PaymentTransaction, PaymentStatus } from '../../entities/payment-transaction.entity';
import { SaasSettings } from '../../entities/saas-settings.entity';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(SubscriptionPlan)
    private planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(CompanySubscription)
    private subscriptionRepo: Repository<CompanySubscription>,
    @InjectRepository(PaymentTransaction)
    private paymentRepo: Repository<PaymentTransaction>,
    @InjectRepository(SaasSettings)
    private settingsRepo: Repository<SaasSettings>,
  ) {}

  async getDashboardStats() {
    const totalCompanies = await this.companyRepo.count();
    const activeCompanies = await this.companyRepo.count({ where: { active: true } });
    
    // Subscription status breakdown
    const activeSubscriptions = await this.subscriptionRepo.count({ 
      where: { status: SubscriptionStatus.ACTIVE } 
    });
    
    const trialSubscriptions = await this.subscriptionRepo.count({ 
      where: { status: SubscriptionStatus.TRIAL } 
    });

    const suspendedSubscriptions = await this.subscriptionRepo.count({ 
      where: { status: SubscriptionStatus.SUSPENDED } 
    });

    const canceledSubscriptions = await this.subscriptionRepo.count({ 
      where: { status: SubscriptionStatus.CANCELED } 
    });

    // Companies without subscriptions (free users)
    const companiesWithSubs = await this.subscriptionRepo
      .createQueryBuilder('sub')
      .select('DISTINCT sub.company_id')
      .getRawMany();
    
    const freeCompanies = totalCompanies - companiesWithSubs.length;

    // Companies by plan
    const subscriptionsByPlan = await this.subscriptionRepo
      .createQueryBuilder('sub')
      .innerJoin('sub.plan', 'plan')
      .select('plan.name', 'planName')
      .addSelect('plan.id', 'planId')
      .addSelect('COUNT(sub.id)', 'count')
      .where('sub.status = :status', { status: SubscriptionStatus.ACTIVE })
      .groupBy('plan.id')
      .getRawMany();

    // Trial expiring soon (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringSoon = await this.subscriptionRepo
      .createQueryBuilder('sub')
      .innerJoinAndSelect('sub.company', 'company')
      .innerJoinAndSelect('sub.plan', 'plan')
      .where('sub.status = :status', { status: SubscriptionStatus.TRIAL })
      .andWhere('sub.expires_at IS NOT NULL')
      .andWhere('sub.expires_at <= :endDate', { endDate: sevenDaysFromNow })
      .andWhere('sub.expires_at >= :now', { now: new Date() })
      .orderBy('sub.expires_at', 'ASC')
      .getMany();

    // Payment status breakdown
    const pendingPayments = await this.paymentRepo.count({ 
      where: { status: PaymentStatus.PENDING } 
    });
    
    const failedPayments = await this.paymentRepo.count({ 
      where: { status: PaymentStatus.FAILED } 
    });

    // MRR calculation
    const activeSubs = await this.subscriptionRepo.find({
      where: { status: SubscriptionStatus.ACTIVE },
      relations: ['plan']
    });
    
    const mrr = activeSubs.reduce((sum, sub) => {
      return sum + parseFloat(sub.plan?.price || '0');
    }, 0);

    // Total revenue
    const totalRevenue = await this.paymentRepo
      .createQueryBuilder('pt')
      .select('SUM(pt.amount)', 'total')
      .where('pt.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    return {
      companies: {
        total: totalCompanies,
        active: activeCompanies,
        inactive: totalCompanies - activeCompanies,
        free: freeCompanies
      },
      subscriptions: {
        active: activeSubscriptions,
        trial: trialSubscriptions,
        suspended: suspendedSubscriptions,
        canceled: canceledSubscriptions,
        byPlan: subscriptionsByPlan.map(p => ({
          planName: p.planName,
          planId: p.planId,
          count: parseInt(p.count)
        })),
        expiringSoon: expiringSoon.map(sub => ({
          companyId: sub.company_id,
          companyName: sub.company?.name,
          planName: sub.plan?.name,
          trialEndDate: sub.expires_at,
          daysRemaining: Math.ceil((new Date(sub.expires_at as Date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        }))
      },
      payments: {
        pending: pendingPayments,
        failed: failedPayments
      },
      financial: {
        mrr: mrr.toFixed(2),
        totalRevenue: parseFloat(totalRevenue?.total || '0').toFixed(2)
      }
    };
  }

  async listCompanies(status?: string) {
    const where: any = {};
    if (status === 'active') where.active = true;
    if (status === 'inactive') where.active = false;
    
    const companies = await this.companyRepo.find({ 
      where,
      order: { created_at: 'DESC' }
    });

    // Enrich with subscription info
    const enriched = await Promise.all(companies.map(async (company) => {
      const subscription = await this.subscriptionRepo.findOne({
        where: { company_id: company.id },
        relations: ['plan'],
        order: { created_at: 'DESC' }
      });
      return { ...company, subscription };
    }));

    return enriched;
  }

  async getCompanyDetails(id: number) {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) throw new Error('Company not found');

    const subscription = await this.subscriptionRepo.findOne({
      where: { company_id: id },
      relations: ['plan'],
      order: { created_at: 'DESC' }
    });

    const users = await this.userRepo.find({ where: { company_id: id } });
    
    const payments = await this.paymentRepo.find({
      where: { company_id: id },
      order: { created_at: 'DESC' },
      take: 20
    });

    return { company, subscription, users, payments };
  }

  async createCompany(dto: any) {
    const apiKey = randomBytes(32).toString('hex');
    const company = this.companyRepo.create({
      name: dto.name,
      email: dto.email,
      api_key: apiKey,
      active: dto.active ?? true
    });
    await this.companyRepo.save(company);

    // Create admin user for company
    if (dto.adminEmail && dto.adminPassword) {
      const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);
      const admin = this.userRepo.create({
        email: dto.adminEmail,
        name: dto.adminName || dto.name,
        password: hashedPassword,
        role: UserRole.COMPANY,
        company_id: company.id,
        active: true
      });
      await this.userRepo.save(admin);
    }

    return company;
  }

  async updateCompany(id: number, dto: any) {
    await this.companyRepo.update(id, {
      name: dto.name,
      email: dto.email,
      logo: dto.logo,
      active: dto.active
    });
    return this.companyRepo.findOne({ where: { id } });
  }

  async deleteCompany(id: number) {
    await this.companyRepo.delete(id);
    return { success: true };
  }

  async toggleCompanyStatus(id: number) {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) throw new Error('Company not found');
    
    company.active = !company.active;
    await this.companyRepo.save(company);
    return company;
  }

  async listSubscriptions(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    
    return this.subscriptionRepo.find({
      where,
      relations: ['company', 'plan'],
      order: { created_at: 'DESC' }
    });
  }

  async createSubscription(dto: any) {
    const subscription = this.subscriptionRepo.create({
      company_id: dto.company_id,
      plan_id: dto.plan_id,
      status: dto.status || SubscriptionStatus.ACTIVE,
      started_at: new Date(),
      next_billing_date: dto.next_billing_date
    });
    return this.subscriptionRepo.save(subscription);
  }

  async updateSubscription(id: number, dto: any) {
    await this.subscriptionRepo.update(id, dto);
    return this.subscriptionRepo.findOne({ where: { id }, relations: ['company', 'plan'] });
  }

  async suspendSubscription(id: number) {
    await this.subscriptionRepo.update(id, { status: SubscriptionStatus.SUSPENDED });
    return this.subscriptionRepo.findOne({ where: { id } });
  }

  async activateSubscription(id: number) {
    await this.subscriptionRepo.update(id, { status: SubscriptionStatus.ACTIVE });
    return this.subscriptionRepo.findOne({ where: { id } });
  }

  async getFinancialOverview() {
    const stats = await this.getDashboardStats();
    
    const monthlyRevenue = await this.paymentRepo
      .createQueryBuilder('pt')
      .select('DATE_FORMAT(pt.created_at, "%Y-%m")', 'month')
      .addSelect('SUM(pt.amount)', 'revenue')
      .where('pt.status = :status', { status: PaymentStatus.COMPLETED })
      .groupBy('month')
      .orderBy('month', 'DESC')
      .limit(12)
      .getRawMany();

    return {
      ...stats.financial,
      monthlyRevenue
    };
  }

  async listTransactions(from?: string, to?: string) {
    const query = this.paymentRepo.createQueryBuilder('pt')
      .leftJoinAndSelect('pt.company', 'company')
      .orderBy('pt.created_at', 'DESC');

    if (from) {
      query.andWhere('pt.created_at >= :from', { from });
    }
    if (to) {
      query.andWhere('pt.created_at <= :to', { to });
    }

    return query.getMany();
  }

  async exportTransactionsCSV(from?: string, to?: string) {
    const transactions = await this.listTransactions(from, to);
    
    const csv = [
      'ID,Company,Amount,Status,Created At,Paid At',
      ...transactions.map(t => 
        `${t.id},${t.company?.name || 'N/A'},${t.amount},${t.status},${t.created_at},${t.paid_at || 'N/A'}`
      )
    ].join('\n');

    return { csv, filename: `transactions_${Date.now()}.csv` };
  }

  async listPlans() {
    return this.planRepo.find({ order: { price: 'ASC' } });
  }

  async createPlan(dto: any) {
    const plan = this.planRepo.create(dto);
    return this.planRepo.save(plan);
  }

  async updatePlan(id: number, dto: any) {
    await this.planRepo.update(id, dto);
    return this.planRepo.findOne({ where: { id } });
  }

  async getSettings() {
    const settings = await this.settingsRepo.find();
    return settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
  }

  async updateSettings(dto: any) {
    for (const [key, value] of Object.entries(dto)) {
      const existing = await this.settingsRepo.findOne({ where: { key } });
      if (existing) {
        existing.value = String(value);
        await this.settingsRepo.save(existing);
      } else {
        const setting = this.settingsRepo.create({ key, value: String(value) });
        await this.settingsRepo.save(setting);
      }
    }
    return this.getSettings();
  }

  async togglePlansVisibility() {
    const key = 'plans_visible';
    const setting = await this.settingsRepo.findOne({ where: { key } });
    
    if (setting) {
      setting.value = setting.value === 'true' ? 'false' : 'true';
      await this.settingsRepo.save(setting);
    } else {
      const newSetting = this.settingsRepo.create({ 
        key, 
        value: 'true',
        description: 'Toggle plans visibility for companies'
      });
      await this.settingsRepo.save(newSetting);
    }
    
    return this.getSettings();
  }
}
