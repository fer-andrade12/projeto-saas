import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CashbackService } from './cashback.service'
import { CashbackWallet } from '../../entities/cashback-wallet.entity'
import { CashbackTransaction } from '../../entities/cashback-transaction.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CashbackWallet, CashbackTransaction])],
  providers: [CashbackService],
  exports: [CashbackService],
})
export class CashbackModule {}
