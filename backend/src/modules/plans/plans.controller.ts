import { Controller, Get, Post, Put, Delete, Body, UseGuards, Req, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { PlansService } from './plans.service';
import { UserRole } from '../../entities/user.entity';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  // Public: list available plans
  @Get()
  async listPlans() {
    return this.plansService.getAvailablePlans();
  }

  // Super Admin: list all plans (including inactive)
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async listAllPlans() {
    return this.plansService.getAllPlans();
  }

  // Super Admin: create new plan
  @Post('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async createPlan(@Body() dto: any) {
    return this.plansService.createPlan(dto);
  }

  // Super Admin: update plan
  @Put('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updatePlan(@Param('id') id: number, @Body() dto: any) {
    return this.plansService.updatePlan(id, dto);
  }

  // Super Admin: toggle plan active status
  @Put('admin/:id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async togglePlan(@Param('id') id: number) {
    return this.plansService.togglePlanStatus(id);
  }

  // Super Admin: delete plan
  @Delete('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async deletePlan(@Param('id') id: number) {
    return this.plansService.deletePlan(id);
  }

  // Check if plans are visible
  @Get('visibility')
  async checkVisibility() {
    return this.plansService.arePlansVisible();
  }

  // Company endpoints
  @Get('my-subscription')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  async getMySubscription(@Req() req: any) {
    const companyId = req.user?.company_id;
    return this.plansService.getCompanySubscription(companyId);
  }

  @Post('subscribe')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  async subscribe(@Req() req: any, @Body() dto: { plan_id: number }) {
    const companyId = req.user?.company_id;
    return this.plansService.subscribeToPlan(companyId, dto.plan_id);
  }

  @Post('upgrade')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  async upgrade(@Req() req: any, @Body() dto: { plan_id: number }) {
    const companyId = req.user?.company_id;
    return this.plansService.upgradePlan(companyId, dto.plan_id);
  }

  @Post('cancel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  async cancel(@Req() req: any) {
    const companyId = req.user?.company_id;
    return this.plansService.cancelSubscription(companyId);
  }

  @Get('payment-history')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  async getPaymentHistory(@Req() req: any) {
    const companyId = req.user?.company_id;
    return this.plansService.getPaymentHistory(companyId);
  }
}
