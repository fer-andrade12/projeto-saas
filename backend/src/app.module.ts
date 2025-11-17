import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { UsersModule } from './modules/users/users.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { CustomersModule } from './modules/customers/customers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { TrackingModule } from './modules/tracking/tracking.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { PlansModule } from './modules/plans/plans.module';
import { ImpersonationModule } from './modules/impersonation/impersonation.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    CompaniesModule,
    UsersModule,
    CampaignsModule,
    CouponsModule,
    CustomersModule,
    TrackingModule,
    MetricsModule,
    SuperAdminModule,
    PlansModule,
    ImpersonationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
