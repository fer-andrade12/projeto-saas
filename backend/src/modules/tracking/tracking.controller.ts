import { Controller, Get, Param, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignSend } from '../../entities/campaign-send.entity';
import { CampaignEvent } from '../../entities/campaign-event.entity';
import { Campaign } from '../../entities/campaign.entity';

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  'R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
  'base64',
);

@Controller('t')
export class TrackingController {
  constructor(
    @InjectRepository(CampaignSend) private readonly sendRepo: Repository<CampaignSend>,
    @InjectRepository(CampaignEvent) private readonly eventRepo: Repository<CampaignEvent>,
    @InjectRepository(Campaign) private readonly campRepo: Repository<Campaign>,
  ) {}

  @Get('o/:trk')
  async open(@Param('trk') trk: string, @Res() res: any) {
    const send = await this.sendRepo.findOne({ where: { tracking_id: trk } });
    if (send) {
      await this.eventRepo.save({
        campaign_id: send.campaign_id,
        customer_id: send.customer_id,
        send_id: send.id,
        type: 'open',
        metadata: { channel: send.channel },
      });
    }
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.end(PIXEL);
  }

  @Get('c/:trk')
  async click(@Param('trk') trk: string, @Res() res: any) {
    const send = await this.sendRepo.findOne({ where: { tracking_id: trk } });
    let redirect = process.env.DEFAULT_LANDING_URL || 'https://example.com';
    if (send) {
      await this.eventRepo.save({
        campaign_id: send.campaign_id,
        customer_id: send.customer_id,
        send_id: send.id,
        type: 'click',
        metadata: { channel: send.channel },
      });
      const camp = await this.campRepo.findOne({ where: { id: send.campaign_id } });
      if (camp?.landing_url) redirect = camp.landing_url;
    }
    res.redirect(302, redirect);
  }
}
