import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];
    if (!apiKey) {
      return false;
    }
    // TODO: validate apiKey against DB; for scaffold, accept any non-empty value
    // resolve company_id for downstream handlers
    req.company_id = 1; // stubbed
    return true;
  }
}
