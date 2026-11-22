import { Body, Controller, Get, NotFoundException, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
interface AuthRequest {
  user: { sub: number; email: string };
}
@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private users: UsersService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
  @ApiBearerAuth()  
  @UseGuards(JwtAuthGuard)
@Get('profile')
async profile(@Req() req: AuthRequest) {
  const user = await this.users.findById(req.user.sub);
  if (!user) {
    throw new NotFoundException('User not found'); // 404
  }
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
}