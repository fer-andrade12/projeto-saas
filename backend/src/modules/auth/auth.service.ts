import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationToken } from '../../entities/verification-token.entity';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import * as crypto from 'crypto';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    @InjectRepository(VerificationToken) private readonly verifRepo: Repository<VerificationToken>,
    @InjectRepository(PasswordResetToken) private readonly resetRepo: Repository<PasswordResetToken>,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }
    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) throw new UnauthorizedException();

    if (!user.active) {
      throw new UnauthorizedException('account_inactive');
    }

    const payload = { sub: user.id, email, role: user.role || UserRole.COMPANY, company_id: user.company_id || null };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
      const accessToken = jwt.sign({ sub: decoded.sub }, JWT_SECRET, { expiresIn: '1h' });
      return { accessToken };
    } catch (err) {
      return { error: 'invalid_refresh' };
    }
  }

  // Sign up flow
  async signup(input: { name: string; email: string; password: string; acceptTerms: boolean }) {
    if (!input.acceptTerms) throw new BadRequestException('terms_required');
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new BadRequestException('email_in_use');
    if (!this.validatePassword(input.password)) throw new BadRequestException('weak_password');

    const user = await this.users.create({ email: input.email, password: input.password, active: false, role: UserRole.COMPANY });
    const token = this.randomToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.verifRepo.save({ user_id: user.id, token, expires_at: expires });

    const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/auth/verify?token=${token}`;
    // In dev, return the link; in prod, send an email using nodemailer
    return { status: 'pending_verification', verifyUrl };
  }

  async verify(token: string) {
    const rec = await this.verifRepo.findOne({ where: { token } });
    if (!rec) throw new BadRequestException('invalid_token');
    if (rec.used_at) throw new BadRequestException('token_used');
    if (rec.expires_at.getTime() < Date.now()) throw new BadRequestException('token_expired');
    await this.verifRepo.update(rec.id, { used_at: new Date() });
    // activate user
    // direct query to avoid circular deps; UsersService can expose update but we keep minimal
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const q = await this.verifRepo.manager.createQueryBuilder()
      .update('users')
      .set({ active: true })
      .where('id = :id', { id: rec.user_id })
      .execute();
    return { status: 'verified' };
  }

  async forgot(email: string) {
    const user = await this.users.findByEmail(email);
    if (!user) return { status: 'ok' }; // do not reveal existence
    const token = this.randomToken();
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2h
    await this.resetRepo.save({ user_id: user.id, token, expires_at: expires });
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/auth/reset?token=${token}`;
    return { status: 'email_sent', resetUrl };
  }

  async reset(token: string, newPassword: string) {
    if (!this.validatePassword(newPassword)) throw new BadRequestException('weak_password');
    const rec = await this.resetRepo.findOne({ where: { token } });
    if (!rec) throw new BadRequestException('invalid_token');
    if (rec.used_at) throw new BadRequestException('token_used');
    if (rec.expires_at.getTime() < Date.now()) throw new BadRequestException('token_expired');
    await this.resetRepo.update(rec.id, { used_at: new Date() });
    const hash = await bcrypt.hash(newPassword, 10);
    await this.resetRepo.manager.createQueryBuilder()
      .update('users')
      .set({ password: hash })
      .where('id = :id', { id: rec.user_id })
      .execute();
    return { status: 'password_updated' };
  }

  async getMe(user: any) {
    // Return user information from JWT payload
    if (!user?.sub) {
      throw new UnauthorizedException('Invalid user');
    }
    
    const fullUser = await this.users.repo.findOne({ where: { id: user.sub } });
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: fullUser.id,
      email: fullUser.email,
      role: fullUser.role,
      company_id: fullUser.company_id,
      active: fullUser.active,
      created_at: fullUser.created_at
    };
  }

  private randomToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  private validatePassword(pw: string) {
    // min 8 chars, at least 1 letter and 1 number
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W]{8,}$/.test(pw);
  }
}
