import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../../entities/coupon.entity';
import { Campaign } from '../../entities/campaign.entity';
import * as crypto from 'crypto';
import { CouponAssignment } from '../../entities/coupon-assignment.entity';
import { CampaignEvent } from '../../entities/campaign-event.entity';
import { CashbackService } from '../cashback/cashback.service';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly repo: Repository<Coupon>,
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(CouponAssignment)
    private readonly assignRepo: Repository<CouponAssignment>,
    @InjectRepository(CampaignEvent)
    private readonly eventRepo: Repository<CampaignEvent>,
    private readonly cashbackService: CashbackService,
  ) {}

  async list(campaign_id?: number) {
    if (campaign_id) {
      return this.repo.find({ where: { campaign_id }, order: { id: 'DESC' } });
    }
    return this.repo.find({ order: { id: 'DESC' }, take: 100 });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async generate(campaign_id: number, count: number, discount_value?: number) {
    const coupons = [];
    for (let i = 0; i < count; i++) {
      const code = this.generateCode();
      coupons.push({ campaign_id, code, discount_value: discount_value || 0, is_redeemed: false });
    }
    return this.repo.save(coupons);
  }

  async redeem(code: string, redeemed_by: string, customer_id?: number) {
    const coupon = await this.repo.findOne({ where: { code } });
    if (!coupon) throw new Error('coupon_not_found');
    
    const campaign = await this.campaignRepo.findOne({ where: { id: coupon.campaign_id } });
    
    // Check if campaign has expired
    if (campaign && campaign.end_date && new Date(campaign.end_date) < new Date()) {
      throw new Error('campaign_expired');
    }
    
    const assignment = await this.assignRepo.findOne({ where: { coupon_code: code } });
    if (assignment) {
      if (customer_id && assignment.customer_id !== customer_id) throw new Error('coupon_not_assigned_to_customer');
      if (assignment.usage_count >= (assignment.limit_per_customer || 1)) throw new Error('coupon_limit_reached');
      assignment.usage_count += 1;
      assignment.redeemed_at = new Date();
      await this.assignRepo.save(assignment);
    }
    if (coupon.is_redeemed) throw new Error('coupon_already_redeemed');
    
    // Debit cashback if campaign requires cashback payment
    if (campaign && campaign.type === 'cashback' && campaign.cashback_value) {
      const amount = parseFloat(campaign.cashback_value.toString());
      if (customer_id) {
        const result = await this.cashbackService.debitCashback({
          customer_id,
          campaign_id: coupon.campaign_id,
          amount,
          reference: `Coupon redemption: ${code}`,
        });
        if (!result.success) {
          throw new Error(result.error || 'cashback_debit_failed');
        }
      }
    }
    
    await this.repo.update(coupon.id, { is_redeemed: true, redeemed_at: new Date(), redeemed_by });
    await this.eventRepo.save({
      campaign_id: coupon.campaign_id,
      customer_id: assignment?.customer_id || 0,
      type: 'redeem',
      metadata: { code, redeemed_by },
    });
    return this.findById(coupon.id);
  }

  private generateCode() {
    return crypto.randomBytes(6).toString('hex').toUpperCase();
  }
}
