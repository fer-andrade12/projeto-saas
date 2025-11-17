import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { CompanySubscription, SubscriptionStatus } from '../../entities/company-subscription.entity';
import { PaymentTransaction, PaymentStatus } from '../../entities/payment-transaction.entity';
import { SaasSettings } from '../../entities/saas-settings.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(CompanySubscription)
    private subscriptionRepo: Repository<CompanySubscription>,
    @InjectRepository(PaymentTransaction)
    private paymentRepo: Repository<PaymentTransaction>,
    @InjectRepository(SaasSettings)
    private settingsRepo: Repository<SaasSettings>,
  ) {}

  async getAvailablePlans() {
    return this.planRepo.find({ 
      where: { active: true },
      order: { price: 'ASC' }
    });
  }

  async arePlansVisible() {
    const setting = await this.settingsRepo.findOne({ 
      where: { key: 'plans_visible' } 
    });
    return { visible: setting?.value === 'true' };
  }

  async getCompanySubscription(companyId: number) {
    if (!companyId) return null;
    
    const subscription = await this.subscriptionRepo.findOne({
      where: { company_id: companyId },
      relations: ['plan'],
      order: { created_at: 'DESC' }
    });

    return subscription;
  }

  async subscribeToPlan(companyId: number, planId: number) {
    if (!companyId) throw new Error('Company ID required');

    // Check if already has active subscription
    const existing = await this.subscriptionRepo.findOne({
      where: { 
        company_id: companyId,
        status: SubscriptionStatus.ACTIVE
      }
    });

    if (existing) {
      throw new Error('Company already has an active subscription');
    }

    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new Error('Plan not found');

    // Create subscription
    const subscription = this.subscriptionRepo.create({
      company_id: companyId,
      plan_id: planId,
      status: SubscriptionStatus.ACTIVE,
      started_at: new Date(),
      next_billing_date: this.calculateNextBillingDate()
    });

    await this.subscriptionRepo.save(subscription);

    // Create initial payment record
    const payment = this.paymentRepo.create({
      company_id: companyId,
      amount: plan.price,
      status: PaymentStatus.PENDING,
      description: `Subscription to ${plan.name}`
    });

    await this.paymentRepo.save(payment);

    return { subscription, payment };
  }

  async upgradePlan(companyId: number, newPlanId: number) {
    if (!companyId) throw new Error('Company ID required');

    const currentSub = await this.subscriptionRepo.findOne({
      where: { 
        company_id: companyId,
        status: SubscriptionStatus.ACTIVE
      },
      relations: ['plan']
    });

    if (!currentSub) {
      throw new Error('No active subscription found');
    }

    const newPlan = await this.planRepo.findOne({ where: { id: newPlanId } });
    if (!newPlan) throw new Error('Plan not found');

    // Calculate prorated amount (simplified)
    const priceDiff = parseFloat(newPlan.price) - parseFloat(currentSub.plan?.price || '0');

    // Update subscription
    currentSub.plan_id = newPlanId;
    await this.subscriptionRepo.save(currentSub);

    // Create payment for difference
    if (priceDiff > 0) {
      const payment = this.paymentRepo.create({
        company_id: companyId,
        amount: priceDiff.toFixed(2),
        status: PaymentStatus.PENDING,
        description: `Upgrade to ${newPlan.name}`
      });
      await this.paymentRepo.save(payment);
    }

    return this.subscriptionRepo.findOne({ 
      where: { id: currentSub.id },
      relations: ['plan']
    });
  }

  async cancelSubscription(companyId: number) {
    if (!companyId) throw new Error('Company ID required');

    const subscription = await this.subscriptionRepo.findOne({
      where: { 
        company_id: companyId,
        status: SubscriptionStatus.ACTIVE
      }
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceled_at = new Date();
    await this.subscriptionRepo.save(subscription);

    return subscription;
  }

  async getPaymentHistory(companyId: number) {
    if (!companyId) return [];

    return this.paymentRepo.find({
      where: { company_id: companyId },
      order: { created_at: 'DESC' }
    });
  }

  // Super Admin: Get all plans (including inactive)
  async getAllPlans() {
    return this.planRepo.find({ 
      order: { created_at: 'DESC' }
    });
  }

  // Super Admin: Create new plan
  async createPlan(dto: {
    name: string;
    type: string;
    price: number;
    billing_period?: string;
    description?: string;
    max_campaigns?: number;
    max_customers?: number;
    max_emails_per_month?: number;
  }) {
    const plan = this.planRepo.create({
      name: dto.name,
      type: dto.type as any,
      price: dto.price.toFixed(2),
      billing_period: dto.billing_period as any || 'monthly',
      description: dto.description,
      max_campaigns: dto.max_campaigns,
      max_customers: dto.max_customers,
      max_emails_per_month: dto.max_emails_per_month,
      active: true
    });

    return this.planRepo.save(plan);
  }

  // Super Admin: Update plan
  async updatePlan(id: number, dto: any) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new Error('Plan not found');

    if (dto.name) plan.name = dto.name;
    if (dto.type) plan.type = dto.type;
    if (dto.price !== undefined) plan.price = Number(dto.price).toFixed(2);
    if (dto.billing_period) plan.billing_period = dto.billing_period;
    if (dto.description !== undefined) plan.description = dto.description;
    if (dto.max_campaigns !== undefined) plan.max_campaigns = dto.max_campaigns;
    if (dto.max_customers !== undefined) plan.max_customers = dto.max_customers;
    if (dto.max_emails_per_month !== undefined) plan.max_emails_per_month = dto.max_emails_per_month;

    return this.planRepo.save(plan);
  }

  // Super Admin: Toggle plan status
  async togglePlanStatus(id: number) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new Error('Plan not found');

    plan.active = !plan.active;
    return this.planRepo.save(plan);
  }

  // Super Admin: Delete plan
  async deletePlan(id: number) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new Error('Plan not found');

    // Check if any company is subscribed to this plan
    const subscriptions = await this.subscriptionRepo.count({
      where: { 
        plan_id: id,
        status: SubscriptionStatus.ACTIVE
      }
    });

    if (subscriptions > 0) {
      throw new Error('Cannot delete plan with active subscriptions. Deactivate it instead.');
    }

    await this.planRepo.remove(plan);
    return { message: 'Plan deleted successfully' };
  }

  private calculateNextBillingDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }
}
