import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { CompanySubscription } from '../../entities/company-subscription.entity';
import { PaymentTransaction } from '../../entities/payment-transaction.entity';
import { SaasSettings } from '../../entities/saas-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      CompanySubscription,
      PaymentTransaction,
      SaasSettings
    ])
  ],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService]
})
export class PlansModule {}
