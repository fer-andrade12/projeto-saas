import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../../entities/campaign.entity';
import { CampaignSend } from '../../entities/campaign-send.entity';
import { EndCustomer } from '../../entities/end-customer.entity';
import { CampaignEvent } from '../../entities/campaign-event.entity';
import { CouponAssignment } from '../../entities/coupon-assignment.entity';
import { EmailService } from '../email/email.service';
import { CashbackService } from '../cashback/cashback.service';
import * as crypto from 'crypto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly repo: Repository<Campaign>,
    @InjectRepository(CampaignSend)
    private readonly sendRepo: Repository<CampaignSend>,
    @InjectRepository(EndCustomer)
    private readonly customerRepo: Repository<EndCustomer>,
    @InjectRepository(CampaignEvent)
    private readonly eventRepo: Repository<CampaignEvent>,
    @InjectRepository(CouponAssignment)
    private readonly couponAssignmentRepo: Repository<CouponAssignment>,
    private readonly emailService: EmailService,
    private readonly cashbackService: CashbackService,
  ) {}

  async list(company_id?: number) {
    if (company_id) {
      return this.repo.find({ where: { company_id }, order: { id: 'DESC' } });
    }
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: { company_id: number; name: string; description?: string; start_date?: Date; end_date?: Date }) {
    const campaign = this.repo.create(data);
    return this.repo.save(campaign);
  }

  async update(id: number, data: Partial<Campaign>) {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    const campaign = await this.findById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    await this.repo.delete(id);
    return { success: true, message: 'Campaign deleted successfully' };
  }

  async duplicate(id: number) {
    const original = await this.findById(id);
    if (!original) return null;
    const copy = this.repo.create({
      ...original,
      id: undefined as unknown as number,
      name: original.name + ' (copy)',
      created_at: undefined as unknown as Date,
      updated_at: undefined as unknown as Date,
    } as any);
    return this.repo.save(copy);
  }

  async sendCampaign(
    id: number,
    input: { channel: 'email' | 'whatsapp' | 'both'; customer_ids: number[] },
  ) {
    const campaign = await this.findById(id);
    if (!campaign) return { error: 'not_found' };
    
    // Check if campaign has expired
    if (campaign.end_date && new Date(campaign.end_date) < new Date()) {
      return { error: 'campaign_expired' };
    }
    
    const channels: Array<'email' | 'whatsapp'> =
      input.channel === 'both' ? ['email', 'whatsapp'] : [input.channel];

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';

    const records: Array<CampaignSend & { click_url: string; open_url: string }> = [];
    for (const customer_id of input.customer_ids) {
      const customer = await this.customerRepo.findOne({ where: { id: customer_id } });
      if (!customer) continue;

      for (const ch of channels) {
        const tracking_id = crypto.randomBytes(16).toString('hex');
        const send = this.sendRepo.create({
          campaign_id: id,
          customer_id,
          channel: ch,
          tracking_id,
          status: 'pending',
        });
        const saved = await this.sendRepo.save(send);
        const click_url = `${baseUrl}/api/v1/t/c/${tracking_id}`;
        const open_url = `${baseUrl}/api/v1/t/o/${tracking_id}`;

        // Credit cashback if campaign has cashback_value
        if (campaign.cashback_value && parseFloat(campaign.cashback_value.toString()) > 0) {
          const expiresAt = campaign.end_date ? new Date(campaign.end_date) : undefined;
          await this.cashbackService.creditCashback({
            customer_id,
            campaign_id: id,
            amount: parseFloat(campaign.cashback_value.toString()),
            expires_at: expiresAt,
            reference: `Campaign ${campaign.name} - Send ${tracking_id}`,
          });
        }

        // Send email if channel is email
        if (ch === 'email' && customer.email) {
          const message = campaign.message_template || 'Confira nossa campanha!';
          const html = this.emailService.buildCampaignEmailHtml({
            message,
            clickUrl: click_url,
            openUrl: open_url,
            imageUrl: campaign.image_url || undefined,
          });
          const result = await this.emailService.sendCampaignEmail({
            to: customer.email,
            subject: campaign.name,
            html,
          });
          if (result.success) {
            saved.status = 'sent';
            await this.sendRepo.save(saved);
          } else {
            saved.status = 'failed';
            await this.sendRepo.save(saved);
          }
        } else if (ch === 'whatsapp') {
          // WhatsApp sending would go here
          saved.status = 'sent'; // Mark as sent for now
          await this.sendRepo.save(saved);
        }

        records.push({ ...saved, click_url, open_url } as any);
      }
    }
    return { created: records.length, sends: records };
  }

  /**
   * Get campaign metrics for a company
   * Returns: active campaigns, total sends, clicks, redemptions, financial return
   * If company_id is null (super_admin), returns metrics for all companies
   */
  async getMetrics(company_id: number | null) {
    // Get all campaigns for this company (or all campaigns if super_admin)
    const whereClause = company_id !== null ? { company_id } : {};
    const campaigns = await this.repo.find({ where: whereClause });
    const campaignIds = campaigns.map(c => c.id);

    if (campaignIds.length === 0) {
      return {
        active_campaigns: 0,
        total_sends: 0,
        total_clicks: 0,
        total_redemptions: 0,
        financial_return: 0,
        click_rate: '0.00%',
        conversion_rate: '0.00%',
        campaigns: []
      };
    }

    // Count active campaigns (campaigns with end_date in the future or null)
    const now = new Date();
    const activeCampaigns = campaigns.filter(c => 
      !c.end_date || new Date(c.end_date) >= now
    );

    // Get total sends
    const totalSends = await this.sendRepo
      .createQueryBuilder('send')
      .where('send.campaign_id IN (:...ids)', { ids: campaignIds })
      .andWhere('send.status = :status', { status: 'sent' })
      .getCount();

    // Get total clicks (events with type 'click')
    const totalClicks = await this.eventRepo
      .createQueryBuilder('event')
      .where('event.campaign_id IN (:...ids)', { ids: campaignIds })
      .andWhere('event.type = :type', { type: 'click' })
      .getCount();

    // Get total redemptions (coupon assignments that were redeemed)
    const totalRedemptions = await this.couponAssignmentRepo
      .createQueryBuilder('assignment')
      .where('assignment.campaign_id IN (:...ids)', { ids: campaignIds })
      .andWhere('assignment.redeemed_at IS NOT NULL')
      .getCount();

    // Calculate financial return based on cashback credited
    const cashbackEvents = await this.eventRepo
      .createQueryBuilder('event')
      .where('event.campaign_id IN (:...ids)', { ids: campaignIds })
      .andWhere('event.type = :type', { type: 'cashback_credit' })
      .getMany();

    let financialReturn = 0;
    cashbackEvents.forEach(event => {
      if (event.metadata && event.metadata.amount) {
        financialReturn += parseFloat(event.metadata.amount);
      }
    });

    // Get detailed metrics per campaign
    const campaignMetrics = await Promise.all(
      campaigns.map(async (campaign) => {
        const sends = await this.sendRepo
          .createQueryBuilder('send')
          .where('send.campaign_id = :id', { id: campaign.id })
          .andWhere('send.status = :status', { status: 'sent' })
          .getCount();

        const clicks = await this.eventRepo
          .createQueryBuilder('event')
          .where('event.campaign_id = :id', { id: campaign.id })
          .andWhere('event.type = :type', { type: 'click' })
          .getCount();

        const redemptions = await this.couponAssignmentRepo
          .createQueryBuilder('assignment')
          .where('assignment.campaign_id = :id', { id: campaign.id })
          .andWhere('assignment.redeemed_at IS NOT NULL')
          .getCount();

        const campaignCashback = await this.eventRepo
          .createQueryBuilder('event')
          .where('event.campaign_id = :id', { id: campaign.id })
          .andWhere('event.type = :type', { type: 'cashback_credit' })
          .getMany();

        let campaignReturn = 0;
        campaignCashback.forEach(event => {
          if (event.metadata && event.metadata.amount) {
            campaignReturn += parseFloat(event.metadata.amount);
          }
        });

        const clickRate = sends > 0 ? ((clicks / sends) * 100).toFixed(2) : '0.00';
        const conversionRate = clicks > 0 ? ((redemptions / clicks) * 100).toFixed(2) : '0.00';

        return {
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          sends,
          clicks,
          redemptions,
          financial_return: campaignReturn,
          click_rate: clickRate + '%',
          conversion_rate: conversionRate + '%',
          is_active: !campaign.end_date || new Date(campaign.end_date) >= now
        };
      })
    );

    return {
      active_campaigns: activeCampaigns.length,
      total_sends: totalSends,
      total_clicks: totalClicks,
      total_redemptions: totalRedemptions,
      financial_return: financialReturn,
      click_rate: totalSends > 0 ? ((totalClicks / totalSends) * 100).toFixed(2) + '%' : '0.00%',
      conversion_rate: totalClicks > 0 ? ((totalRedemptions / totalClicks) * 100).toFixed(2) + '%' : '0.00%',
      campaigns: campaignMetrics
    };
  }
}
