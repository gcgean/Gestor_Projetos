# Gestor_Projetos

Sistema full-stack para gestão estratégica de projetos e portfólio financeiro.

## Estrutura

- `src/`: frontend React + Vite + TypeScript
- `backend/`: API NestJS + Prisma + PostgreSQL + JWT
- `docker-compose.yml`: banco PostgreSQL local

## Rodar localmente

1. Suba o banco:

```powershell
docker compose up -d postgres
```

2. Configure o backend:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
```

3. Em dois terminais separados:

```powershell
# terminal 1 — API em http://localhost:3333/api
npm run dev:back

# terminal 2 — frontend em http://localhost:5173
npm run dev:front
```

## Validação

```powershell
npm run build:front
npm run build:back
```

Endpoints iniciais:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/projects` (Bearer JWT)
- `POST /api/projects` (Bearer JWT)
- `GET /api/dashboard/summary` (Bearer JWT)
