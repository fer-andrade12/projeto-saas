import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@Controller('admin/campaigns')
export class CampaignsController {
  constructor(private readonly svc: CampaignsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador')
  @Get()
  async list(@Query('company_id') company_id?: string) {
    return this.svc.list(company_id ? Number(company_id) : undefined);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador')
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.findById(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador')
  @Post()
  async create(@Body() body: any) {
    return this.svc.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador')
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(Number(id), body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador')
  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string) {
    return this.svc.duplicate(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador')
  @Post(':id/send')
  async send(
    @Param('id') id: string,
    @Body() body: { channel: 'email' | 'whatsapp' | 'both'; customer_ids: number[] },
  ) {
    return this.svc.sendCampaign(Number(id), body);
  }
}
