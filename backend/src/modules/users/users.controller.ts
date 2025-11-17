import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get(':id')
  async get(@Param('id') id: string) {
    // minimal: fetch by id
    return { id };
  }

  @Post()
  async create(@Body() body: any) {
    return this.svc.create(body);
  }
}
