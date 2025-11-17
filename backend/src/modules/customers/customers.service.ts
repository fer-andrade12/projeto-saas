import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EndCustomer } from '../../entities/end-customer.entity';
import { CustomerList } from '../../entities/customer-list.entity';
import { CustomerListMembership } from '../../entities/customer-list-membership.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(EndCustomer)
    private readonly repo: Repository<EndCustomer>,
    @InjectRepository(CustomerList)
    private readonly listRepo: Repository<CustomerList>,
    @InjectRepository(CustomerListMembership)
    private readonly memberRepo: Repository<CustomerListMembership>,
  ) {}

  async list(company_id?: number) {
    if (company_id) {
      return this.repo.find({ where: { company_id }, order: { id: 'DESC' } });
    }
    return this.repo.find({ order: { id: 'DESC' }, take: 100 });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: { company_id: number; name: string; email?: string; phone?: string; metadata?: string }) {
    const customer = this.repo.create(data);
    return this.repo.save(customer);
  }

  async createList(data: { company_id: number; name: string }) {
    const l = this.listRepo.create(data);
    return this.listRepo.save(l);
  }

  async listLists(company_id: number) {
    return this.listRepo.find({ where: { company_id }, order: { id: 'DESC' } });
  }

  async addMembers(list_id: number, customer_ids: number[]) {
    const rows = customer_ids.map((cid) => ({ list_id, customer_id: cid }));
    return this.memberRepo.save(rows);
  }

  async importCsv(company_id: number, csv: string) {
    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { created: 0 };
    const header = lines[0].split(',').map((s) => s.trim().toLowerCase());
    const idxName = header.indexOf('name');
    const idxEmail = header.indexOf('email');
    const idxPhone = header.indexOf('phone');
    const created: EndCustomer[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const payload: Partial<EndCustomer> = { company_id } as any;
      if (idxName >= 0) payload.name = (cols[idxName] || '').trim();
      if (idxEmail >= 0) payload.email = (cols[idxEmail] || '').trim();
      if (idxPhone >= 0) payload.phone = (cols[idxPhone] || '').trim();
      if (!payload.name && !payload.email && !payload.phone) continue;
      created.push(this.repo.create(payload as EndCustomer));
    }
    if (created.length === 0) return { created: 0 };
    const saved = await this.repo.save(created);
    return { created: saved.length };
  }
}
