import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private users: UsersService) {}
  @ApiBearerAuth()  
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: QueryUsersDto) {
    return this.users.findAll(query);
  }
}