import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { Campaign } from '../../entities/campaign.entity';
import { CampaignSend } from '../../entities/campaign-send.entity';
import { EmailModule } from '../email/email.module';
import { EndCustomer } from '../../entities/end-customer.entity';
import { CashbackModule } from '../cashback/cashback.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, CampaignSend, EndCustomer]),
    EmailModule,
    CashbackModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService]
})
export class CampaignsModule {}
