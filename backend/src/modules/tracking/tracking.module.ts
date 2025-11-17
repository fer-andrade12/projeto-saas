import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingController } from './tracking.controller';
import { CampaignSend } from '../../entities/campaign-send.entity';
import { CampaignEvent } from '../../entities/campaign-event.entity';
import { Campaign } from '../../entities/campaign.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CampaignSend, CampaignEvent, Campaign])],
  controllers: [TrackingController],
})
export class TrackingModule {}
