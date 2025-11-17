import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { ImpersonationService } from './impersonation.service';
import { UserRole } from '../../entities/user.entity';

@Controller('impersonation')
@UseGuards(JwtAuthGuard)
export class ImpersonationController {
  constructor(private readonly impersonationService: ImpersonationService) {}

  @Post('start')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async startImpersonation(@Req() req: any, @Body() dto: { company_id: number }) {
    const superAdminId = req.user?.sub
    return this.impersonationService.startImpersonation(superAdminId, dto.company_id);
  }

  @Post('stop')
  // No role guard here - anyone with original_user_id can stop
  async stopImpersonation(@Req() req: any) {
    const currentUserId = req.user?.sub
    const originalUserId = req.user?.original_user_id
    
    if (!originalUserId) {
      throw new Error('Not currently impersonating')
    }
    
    return this.impersonationService.stopImpersonation(currentUserId, originalUserId);
  }
}
