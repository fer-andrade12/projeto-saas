import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@Controller('admin/coupons')
export class CouponsController {
  constructor(private readonly svc: CouponsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador')
  @Get()
  async list(@Query('campaign_id') campaign_id?: string) {
    return this.svc.list(campaign_id ? Number(campaign_id) : undefined);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador')
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.findById(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador')
  @Post('generate')
  async generate(@Body() body: { campaign_id: number; count: number; discount_value?: number }) {
    return this.svc.generate(body.campaign_id, body.count, body.discount_value);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador')
  @Post('redeem')
  async redeem(@Body() body: { code: string; redeemed_by: string; customer_id?: number }) {
    return this.svc.redeem(body.code, body.redeemed_by, body.customer_id);
  }
}
