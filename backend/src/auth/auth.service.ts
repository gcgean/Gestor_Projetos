import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Inject(JwtService) private readonly jwt: JwtService) {}

  async register(name: string, email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await this.prisma.user.create({ data: { name, email, passwordHash } })
    return this.issueToken(user.id, user.email, user.role)
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException('Credenciais inválidas')
    return this.issueToken(user.id, user.email, user.role)
  }

  private issueToken(sub: string, email: string, role: string) {
    return { accessToken: this.jwt.sign({ sub, email, role }), user: { id: sub, email, role } }
  }
}
