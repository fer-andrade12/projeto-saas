import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../entities/company.entity';
import * as crypto from 'crypto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly repo: Repository<Company>,
  ) {}

  async list() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: { name: string; email?: string }) {
    const company = this.repo.create({
      ...data,
      api_key: this.generateKey(),
      active: true,
    });
    return this.repo.save(company);
  }

  async generateApiKey(id: number) {
    const key = this.generateKey();
    await this.repo.update(id, { api_key: key });
    return { api_key: key };
  }

  private generateKey() {
    return 'sk_' + crypto.randomBytes(32).toString('hex');
  }
}

