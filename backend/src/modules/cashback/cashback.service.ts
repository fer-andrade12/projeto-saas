import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThan } from 'typeorm'
import { CashbackWallet } from '../../entities/cashback-wallet.entity'
import { CashbackTransaction } from '../../entities/cashback-transaction.entity'

@Injectable()
export class CashbackService {
  constructor(
    @InjectRepository(CashbackWallet)
    private readonly walletRepo: Repository<CashbackWallet>,
    @InjectRepository(CashbackTransaction)
    private readonly transactionRepo: Repository<CashbackTransaction>,
  ) {}

  async getOrCreateWallet(customer_id: number): Promise<CashbackWallet> {
    let wallet = await this.walletRepo.findOne({ where: { customer_id } })
    if (!wallet) {
      wallet = this.walletRepo.create({ customer_id, balance: '0' })
      wallet = await this.walletRepo.save(wallet)
    }
    return wallet
  }

  async creditCashback(input: {
    customer_id: number
    campaign_id: number
    amount: number
    expires_at?: Date
    reference?: string
  }): Promise<{ success: boolean; transaction?: CashbackTransaction; error?: string }> {
    try {
      const wallet = await this.getOrCreateWallet(input.customer_id)
      
      const transaction = this.transactionRepo.create({
        customer_id: input.customer_id,
        campaign_id: input.campaign_id,
        amount: input.amount.toFixed(2),
        direction: 'credit',
        expires_at: input.expires_at,
        reference: input.reference,
      })
      const saved = await this.transactionRepo.save(transaction)

      const newBalance = parseFloat(wallet.balance) + input.amount
      wallet.balance = newBalance.toFixed(2)
      await this.walletRepo.save(wallet)

      return { success: true, transaction: saved }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async debitCashback(input: {
    customer_id: number
    campaign_id?: number
    amount: number
    reference?: string
  }): Promise<{ success: boolean; transaction?: CashbackTransaction; error?: string }> {
    try {
      const wallet = await this.getOrCreateWallet(input.customer_id)
      const currentBalance = parseFloat(wallet.balance)

      // Check available balance (excluding expired credits)
      const availableBalance = await this.getAvailableBalance(input.customer_id)
      if (availableBalance < input.amount) {
        return { success: false, error: 'insufficient_balance' }
      }

      const transaction = this.transactionRepo.create({
        customer_id: input.customer_id,
        campaign_id: input.campaign_id,
        amount: input.amount.toFixed(2),
        direction: 'debit',
        reference: input.reference,
        used_at: new Date(),
      })
      const saved = await this.transactionRepo.save(transaction)

      const newBalance = currentBalance - input.amount
      wallet.balance = newBalance.toFixed(2)
      await this.walletRepo.save(wallet)

      return { success: true, transaction: saved }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getAvailableBalance(customer_id: number): Promise<number> {
    const wallet = await this.getOrCreateWallet(customer_id)
    const now = new Date()

    // Get all credit transactions that haven't expired
    const credits = await this.transactionRepo.find({
      where: {
        customer_id,
        direction: 'credit',
      },
    })

    const validCredits = credits.filter(
      (t) => !t.expires_at || t.expires_at > now
    )

    const totalCredits = validCredits.reduce(
      (sum, t) => sum + parseFloat(t.amount.toString()),
      0
    )

    // Get all debits
    const debits = await this.transactionRepo.find({
      where: {
        customer_id,
        direction: 'debit',
      },
    })

    const totalDebits = debits.reduce(
      (sum, t) => sum + parseFloat(t.amount.toString()),
      0
    )

    return Math.max(0, totalCredits - totalDebits)
  }

  async getWalletInfo(customer_id: number) {
    const wallet = await this.getOrCreateWallet(customer_id)
    const availableBalance = await this.getAvailableBalance(customer_id)
    
    const transactions = await this.transactionRepo.find({
      where: { customer_id },
      order: { created_at: 'DESC' },
      take: 50,
    })

    return {
      wallet,
      availableBalance,
      transactions,
    }
  }
}
