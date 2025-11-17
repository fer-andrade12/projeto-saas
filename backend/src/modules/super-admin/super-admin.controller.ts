import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { SuperAdminService } from './super-admin.service';
import { UserRole } from '../../entities/user.entity';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  // Dashboard KPIs
  @Get('dashboard')
  async getDashboard() {
    return this.superAdminService.getDashboardStats();
  }

  // Companies Management
  @Get('companies')
  async listCompanies(@Query('status') status?: string) {
    return this.superAdminService.listCompanies(status);
  }

  @Get('companies/:id')
  async getCompany(@Param('id') id: number) {
    return this.superAdminService.getCompanyDetails(id);
  }

  @Post('companies')
  async createCompany(@Body() dto: any) {
    return this.superAdminService.createCompany(dto);
  }

  @Put('companies/:id')
  async updateCompany(@Param('id') id: number, @Body() dto: any) {
    return this.superAdminService.updateCompany(id, dto);
  }

  @Delete('companies/:id')
  async deleteCompany(@Param('id') id: number) {
    return this.superAdminService.deleteCompany(id);
  }

  @Post('companies/:id/toggle-status')
  async toggleCompanyStatus(@Param('id') id: number) {
    return this.superAdminService.toggleCompanyStatus(id);
  }

  // Subscriptions Management
  @Get('subscriptions')
  async listSubscriptions(@Query('status') status?: string) {
    return this.superAdminService.listSubscriptions(status);
  }

  @Post('subscriptions')
  async createSubscription(@Body() dto: any) {
    return this.superAdminService.createSubscription(dto);
  }

  @Put('subscriptions/:id')
  async updateSubscription(@Param('id') id: number, @Body() dto: any) {
    return this.superAdminService.updateSubscription(id, dto);
  }

  @Post('subscriptions/:id/suspend')
  async suspendSubscription(@Param('id') id: number) {
    return this.superAdminService.suspendSubscription(id);
  }

  @Post('subscriptions/:id/activate')
  async activateSubscription(@Param('id') id: number) {
    return this.superAdminService.activateSubscription(id);
  }

  // Financials
  @Get('financial/overview')
  async getFinancialOverview() {
    return this.superAdminService.getFinancialOverview();
  }

  @Get('financial/transactions')
  async listTransactions(@Query('from') from?: string, @Query('to') to?: string) {
    return this.superAdminService.listTransactions(from, to);
  }

  @Get('financial/export')
  async exportTransactions(@Query('from') from?: string, @Query('to') to?: string) {
    return this.superAdminService.exportTransactionsCSV(from, to);
  }

  // Plans Management
  @Get('plans')
  async listPlans() {
    return this.superAdminService.listPlans();
  }

  @Post('plans')
  async createPlan(@Body() dto: any) {
    return this.superAdminService.createPlan(dto);
  }

  @Put('plans/:id')
  async updatePlan(@Param('id') id: number, @Body() dto: any) {
    return this.superAdminService.updatePlan(id, dto);
  }

  // Settings
  @Get('settings')
  async getSettings() {
    return this.superAdminService.getSettings();
  }

  @Put('settings')
  async updateSettings(@Body() dto: any) {
    return this.superAdminService.updateSettings(dto);
  }

  @Post('settings/toggle-plans-visibility')
  async togglePlansVisibility() {
    return this.superAdminService.togglePlansVisibility();
  }
}
