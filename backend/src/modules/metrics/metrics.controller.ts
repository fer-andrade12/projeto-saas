import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { Campaign } from '../../entities/campaign.entity';
import { CampaignSend } from '../../entities/campaign-send.entity';
import { CampaignEvent } from '../../entities/campaign-event.entity';
import { Coupon } from '../../entities/coupon.entity';
import { EndCustomer } from '../../entities/end-customer.entity';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'gestor')
@Controller('admin/metrics')
export class MetricsController {
  constructor(
    @InjectRepository(Campaign) private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(CampaignSend) private readonly sendRepo: Repository<CampaignSend>,
    @InjectRepository(CampaignEvent) private readonly eventRepo: Repository<CampaignEvent>,
    @InjectRepository(Coupon) private readonly couponRepo: Repository<Coupon>,
    @InjectRepository(EndCustomer) private readonly customerRepo: Repository<EndCustomer>,
  ) {}

  @Get('overview')
  async overview(@Query('company_id') company_id?: string) {
    const now = new Date();
    const whereCamp: any = {};
    if (company_id) whereCamp.company_id = Number(company_id);
    const activeCampaigns = await this.campaignRepo.count({
      where: {
        ...whereCamp,
        active: true,
      },
    });

    const whereSend: any = {};
    if (company_id) whereSend.campaign_id = MoreThanOrEqual(0); // placeholder to use join if needed
    const totalSent = await this.sendRepo.count();

    const couponsUsed = await this.couponRepo.count({ where: { is_redeemed: true } });

    const cashbackUsed = await this.eventRepo.count({ where: { type: 'cashback_debit' } });

    const couponsExpired = await this.campaignRepo.count({ where: { end_date: MoreThanOrEqual(new Date(0)), active: false } });

    const opens = await this.eventRepo.count({ where: { type: 'open' } });
    const clicks = await this.eventRepo.count({ where: { type: 'click' } });
    const redemptions = await this.eventRepo.count({ where: { type: 'redeem' } });

    const openRate = totalSent ? Math.round((opens / totalSent) * 100) : 0;
    const conversionRate = totalSent ? Math.round((redemptions / totalSent) * 100) : 0;

    // Approximate opened vs not opened by sends with any open event
    const openedCount = opens; // simplistic proxy
    const notOpenedCount = totalSent - openedCount;

    return {
      activeCampaigns,
      totalSent,
      couponsUsed,
      cashbackUsed,
      couponsExpired,
      openRate,
      conversionRate,
      openedCount,
      notOpenedCount,
      clicks,
      redemptions,
    };
  }

  @Get('timeseries')
  async timeseries(
    @Query('metric') metric: 'open' | 'click' | 'redeem' = 'open',
    @Query('days') days = '7',
  ) {
    const n = Math.max(1, Math.min(90, Number(days) || 7));
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - (n - 1));
    const events = await this.eventRepo.find({
      where: { type: metric, created_at: Between(start, today) as any },
      order: { created_at: 'ASC' },
    });
    const buckets: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }
    for (const ev of events) {
      const key = ev.created_at.toISOString().slice(0, 10);
      if (buckets[key] !== undefined) buckets[key] += 1;
    }
    return Object.entries(buckets).map(([date, value]) => ({ date, value }));
  }

  @Get('channel')
  async channelBreakdown() {
    const sends = await this.sendRepo.find();
    const by: Record<string, number> = { email: 0, whatsapp: 0 } as any;
    for (const s of sends) by[s.channel] = (by[s.channel] || 0) + 1;
    return by;
  }
}
