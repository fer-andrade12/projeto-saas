import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { Coupon } from '../../entities/coupon.entity';
import { Campaign } from '../../entities/campaign.entity';
import { CouponAssignment } from '../../entities/coupon-assignment.entity';
import { CampaignEvent } from '../../entities/campaign-event.entity';
import { CashbackModule } from '../cashback/cashback.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, Campaign, CouponAssignment, CampaignEvent]),
    CashbackModule,
  ],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService]
})
export class CouponsModule {}
