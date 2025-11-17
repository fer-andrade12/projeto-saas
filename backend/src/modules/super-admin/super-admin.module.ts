import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { Company } from '../../entities/company.entity';
import { User } from '../../entities/user.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { CompanySubscription } from '../../entities/company-subscription.entity';
import { PaymentTransaction } from '../../entities/payment-transaction.entity';
import { SaasSettings } from '../../entities/saas-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      User,
      SubscriptionPlan,
      CompanySubscription,
      PaymentTransaction,
      SaasSettings
    ])
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
  exports: [SuperAdminService]
})
export class SuperAdminModule {}
