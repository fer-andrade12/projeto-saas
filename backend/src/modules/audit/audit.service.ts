import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuditLog } from '../../entities/audit-log.entity'

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async log(input: {
    actor_user_id?: number
    company_id?: number
    action: string
    entity: string
    entity_id?: number
    data?: any
  }): Promise<AuditLog> {
    const log = this.repo.create(input as any)
    return (await this.repo.save(log)) as unknown as AuditLog
  }

  async getLogs(filters?: { company_id?: number; entity?: string; limit?: number }) {
    const query = this.repo.createQueryBuilder('audit_log')
    
    if (filters?.company_id) {
      query.andWhere('audit_log.company_id = :company_id', { company_id: filters.company_id })
    }
    
    if (filters?.entity) {
      query.andWhere('audit_log.entity = :entity', { entity: filters.entity })
    }
    
    query.orderBy('audit_log.created_at', 'DESC')
    query.limit(filters?.limit || 100)
    
    return query.getMany()
  }
}
