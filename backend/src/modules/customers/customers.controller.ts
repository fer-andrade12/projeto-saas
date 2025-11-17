import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@Controller('admin/customers')
export class CustomersController {
  constructor(private readonly svc: CustomersService) {}

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
  @Post('lists')
  async createList(@Body() body: { company_id: number; name: string }) {
    return this.svc.createList(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador')
  @Get('lists')
  async listLists(@Query('company_id') company_id: string) {
    return this.svc.listLists(Number(company_id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador')
  @Post('lists/:id/members')
  async addMembers(@Param('id') id: string, @Body() body: { customer_ids: number[] }) {
    return this.svc.addMembers(Number(id), body.customer_ids || []);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gestor', 'operador')
  @Post('import')
  async importCsv(@Body() body: { company_id: number; csv: string }) {
    return this.svc.importCsv(body.company_id, body.csv);
  }
}
