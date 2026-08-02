import 'reflect-metadata'
import 'dotenv/config'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(helmet())
  app.setGlobalPrefix('api')
  const allowedOrigins = new Set((process.env.FRONTEND_URL ?? '').split(',').map((origin) => origin.trim()).filter(Boolean))
  const localOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5180', 'http://127.0.0.1:5180'])
  app.enableCors({ origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => callback(null, !origin || allowedOrigins.has(origin) || (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') && localOrigins.has(origin)) })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen(Number(process.env.PORT ?? 3333))
}

bootstrap()
