import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../../entities/campaign.entity';
import { CampaignSend } from '../../entities/campaign-send.entity';
import { EndCustomer } from '../../entities/end-customer.entity';
import { EmailService } from '../email/email.service';
import { CashbackService } from '../cashback/cashback.service';
import * as crypto from 'crypto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly repo: Repository<Campaign>,
    @InjectRepository(CampaignSend)
    private readonly sendRepo: Repository<CampaignSend>,
    @InjectRepository(EndCustomer)
    private readonly customerRepo: Repository<EndCustomer>,
    private readonly emailService: EmailService,
    private readonly cashbackService: CashbackService,
  ) {}

  async list(company_id?: number) {
    if (company_id) {
      return this.repo.find({ where: { company_id }, order: { id: 'DESC' } });
    }
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: { company_id: number; name: string; description?: string; start_date?: Date; end_date?: Date }) {
    const campaign = this.repo.create(data);
    return this.repo.save(campaign);
  }

  async update(id: number, data: Partial<Campaign>) {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async duplicate(id: number) {
    const original = await this.findById(id);
    if (!original) return null;
    const copy = this.repo.create({
      ...original,
      id: undefined as unknown as number,
      name: original.name + ' (copy)',
      created_at: undefined as unknown as Date,
      updated_at: undefined as unknown as Date,
    } as any);
    return this.repo.save(copy);
  }

  async sendCampaign(
    id: number,
    input: { channel: 'email' | 'whatsapp' | 'both'; customer_ids: number[] },
  ) {
    const campaign = await this.findById(id);
    if (!campaign) return { error: 'not_found' };
    
    // Check if campaign has expired
    if (campaign.end_date && new Date(campaign.end_date) < new Date()) {
      return { error: 'campaign_expired' };
    }
    
    const channels: Array<'email' | 'whatsapp'> =
      input.channel === 'both' ? ['email', 'whatsapp'] : [input.channel];

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';

    const records: Array<CampaignSend & { click_url: string; open_url: string }> = [];
    for (const customer_id of input.customer_ids) {
      const customer = await this.customerRepo.findOne({ where: { id: customer_id } });
      if (!customer) continue;

      for (const ch of channels) {
        const tracking_id = crypto.randomBytes(16).toString('hex');
        const send = this.sendRepo.create({
          campaign_id: id,
          customer_id,
          channel: ch,
          tracking_id,
          status: 'pending',
        });
        const saved = await this.sendRepo.save(send);
        const click_url = `${baseUrl}/api/v1/t/c/${tracking_id}`;
        const open_url = `${baseUrl}/api/v1/t/o/${tracking_id}`;

        // Credit cashback if campaign has cashback_value
        if (campaign.cashback_value && parseFloat(campaign.cashback_value.toString()) > 0) {
          const expiresAt = campaign.end_date ? new Date(campaign.end_date) : undefined;
          await this.cashbackService.creditCashback({
            customer_id,
            campaign_id: id,
            amount: parseFloat(campaign.cashback_value.toString()),
            expires_at: expiresAt,
            reference: `Campaign ${campaign.name} - Send ${tracking_id}`,
          });
        }

        // Send email if channel is email
        if (ch === 'email' && customer.email) {
          const message = campaign.message_template || 'Confira nossa campanha!';
          const html = this.emailService.buildCampaignEmailHtml({
            message,
            clickUrl: click_url,
            openUrl: open_url,
            imageUrl: campaign.image_url || undefined,
          });
          const result = await this.emailService.sendCampaignEmail({
            to: customer.email,
            subject: campaign.name,
            html,
          });
          if (result.success) {
            saved.status = 'sent';
            await this.sendRepo.save(saved);
          } else {
            saved.status = 'failed';
            await this.sendRepo.save(saved);
          }
        } else if (ch === 'whatsapp') {
          // WhatsApp sending would go here
          saved.status = 'sent'; // Mark as sent for now
          await this.sendRepo.save(saved);
        }

        records.push({ ...saved, click_url, open_url } as any);
      }
    }
    return { created: records.length, sends: records };
  }
}
