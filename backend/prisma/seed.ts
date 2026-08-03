import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seed de demonstração desabilitado: os dados devem ser criados pela aplicação.')
}

main().finally(() => prisma.$disconnect())
