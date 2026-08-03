import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Gestor@123', 12)
  const user = await prisma.user.upsert({ where: { email: 'admin@gestorprojetos.local' }, update: { passwordHash }, create: { name: 'Administrador', email: 'admin@gestorprojetos.local', passwordHash, role: 'ADMIN' } })
  const projectCount = await prisma.project.count({ where: { ownerId: user.id } })
  if (projectCount === 0) await prisma.project.createMany({ data: [{ name: 'SaaS Contábil', type: 'SaaS', status: 'SCALING', color: '#7c6cff', ownerId: user.id }, { name: 'Canal Growth', type: 'YouTube', status: 'LAUNCHED', color: '#f17878', ownerId: user.id }, { name: 'Curso Pro', type: 'Produto digital', status: 'SCALING', color: '#57d39b', ownerId: user.id }] })
  console.log(`Usuário de teste pronto: ${user.email}`)
}

main().finally(() => prisma.$disconnect())
