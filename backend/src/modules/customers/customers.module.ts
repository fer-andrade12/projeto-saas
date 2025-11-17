import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { EndCustomer } from '../../entities/end-customer.entity';
import { CustomerList } from '../../entities/customer-list.entity';
import { CustomerListMembership } from '../../entities/customer-list-membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EndCustomer, CustomerList, CustomerListMembership])],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService]
})
export class CustomersModule {}
