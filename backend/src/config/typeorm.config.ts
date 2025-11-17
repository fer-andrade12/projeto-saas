import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/user.entity';
import { VerificationToken } from '../entities/verification-token.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { Company } from '../entities/company.entity';
import { Campaign } from '../entities/campaign.entity';
import { Coupon } from '../entities/coupon.entity';
import { EndCustomer } from '../entities/end-customer.entity';
import { CampaignSend } from '../entities/campaign-send.entity';
import { CampaignEvent } from '../entities/campaign-event.entity';
import { CouponAssignment } from '../entities/coupon-assignment.entity';
import { CashbackWallet } from '../entities/cashback-wallet.entity';
import { CashbackTransaction } from '../entities/cashback-transaction.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { CustomerList } from '../entities/customer-list.entity';
import { CustomerListMembership } from '../entities/customer-list-membership.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { CompanySubscription } from '../entities/company-subscription.entity';
import { PaymentTransaction } from '../entities/payment-transaction.entity';
import { SaasSettings } from '../entities/saas-settings.entity';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'saas',
  entities: [
    User,
    VerificationToken,
    PasswordResetToken,
    Company,
    Campaign,
    Coupon,
    EndCustomer,
    CampaignSend,
    CampaignEvent,
    CouponAssignment,
    CashbackWallet,
    CashbackTransaction,
    AuditLog,
    CustomerList,
    CustomerListMembership,
    SubscriptionPlan,
    CompanySubscription,
    PaymentTransaction,
    SaasSettings,
  ],
  synchronize: true,
  logging: false,
};
