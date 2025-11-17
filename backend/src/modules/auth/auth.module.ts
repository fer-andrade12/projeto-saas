import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationToken } from '../../entities/verification-token.entity';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([VerificationToken, PasswordResetToken])],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
