import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@Controller('admin/campaigns')
export class CampaignsController {
  constructor(private readonly svc: CampaignsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'gestor', 'operador', 'company')
  @Get('metrics')
  async getMetrics(@Request() req: any) {
    const companyId = req.user.company_id;
    const role = req.user.role;
    
    // Super admin can see all metrics or filter by company_id
    if (role === 'super_admin') {
      return this.svc.getMetrics(companyId || null);
    }
    
    if (!companyId) {
      return { error: 'company_id not found in token' };
    }
    return this.svc.getMetrics(companyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador', 'company')
  @Get()
  async list(@Query('company_id') company_id?: string) {
    return this.svc.list(company_id ? Number(company_id) : undefined);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador', 'company')
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.findById(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador', 'company')
  @Post()
  async create(@Body() body: any) {
    return this.svc.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador', 'company')
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(Number(id), body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador', 'company')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.svc.delete(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador', 'company')
  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string) {
    return this.svc.duplicate(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador', 'company')
  @Post(':id/send')
  async send(
    @Param('id') id: string,
    @Body() body: { channel: 'email' | 'whatsapp' | 'both'; customer_ids: number[] },
  ) {
    return this.svc.sendCampaign(Number(id), body);
  }
}
