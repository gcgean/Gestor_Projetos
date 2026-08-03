import { Body, Controller, Inject, Post } from '@nestjs/common'
import { IsEmail, IsString, MinLength } from 'class-validator'
import { AuthService } from './auth.service'

class CredentialsDto {
  @IsString() name = ''
  @IsEmail() email = ''
  @IsString() @MinLength(8) password = ''
}

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}
  @Post('register') register(@Body() dto: CredentialsDto) { return this.auth.register(dto.name, dto.email, dto.password) }
  @Post('login') login(@Body() dto: CredentialsDto) { return this.auth.login(dto.email, dto.password) }
}
