import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signupdto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-tokens.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //POST signup
  @Post('signup') //auth/signup
  async signUp(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData);
  }

  //POST Login
  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  //POST Refresh token
  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @UseGuards(AuthGuard)
  @Put('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    return this.authService.changePassword(
      req.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @UseGuards(AuthGuard)
  @Get('user')
  async getUser(@Req() req) {
    return this.authService.getUser(req.userId);
  }
}
