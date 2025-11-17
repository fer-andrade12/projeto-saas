import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    // Return current user info from JWT
    return this.authService.getMe(req.user);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // stubbed: validate and return JWT
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('signup')
  async signup(@Body() body: { name: string; email: string; password: string; acceptTerms: boolean }) {
    return this.authService.signup(body);
  }

  @Post('verify')
  async verify(@Body() body: { token: string }) {
    return this.authService.verify(body.token);
  }

  @Get('verify')
  async verifyGet(@Query('token') token: string) {
    return this.authService.verify(token);
  }

  @Post('forgot')
  async forgot(@Body() body: { email: string }) {
    return this.authService.forgot(body.email);
  }

  @Post('reset')
  async reset(@Body() body: { token: string; newPassword: string }) {
    return this.authService.reset(body.token, body.newPassword);
  }
}
