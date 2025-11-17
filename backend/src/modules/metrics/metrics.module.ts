import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsController } from './metrics.controller';
import { Campaign } from '../../entities/campaign.entity';
import { CampaignSend } from '../../entities/campaign-send.entity';
import { CampaignEvent } from '../../entities/campaign-event.entity';
import { Coupon } from '../../entities/coupon.entity';
import { EndCustomer } from '../../entities/end-customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, CampaignSend, CampaignEvent, Coupon, EndCustomer])],
  controllers: [MetricsController],
})
export class MetricsModule {}
