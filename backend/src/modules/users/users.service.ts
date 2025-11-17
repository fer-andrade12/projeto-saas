import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    public readonly repo: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async create(payload: Partial<User>) {
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }
    const u = this.repo.create(payload as User);
    return this.repo.save(u);
  }
}
