# Clean Nest — Clean Architecture skeleton

## Quick start
```bash
npm i -g @nestjs/cli
npm i
npm run start:dev
```

- API: `http://localhost:3000/users`
- Docs: `http://localhost:3000/docs`

## Enable Prisma (optional)
1. Set `DATABASE_URL` in `.env`.
2. Install Prisma:
```bash
npm i -D prisma
npm i @prisma/client
npx prisma generate
npx prisma migrate dev -n init
```
3. Run again.

## Layers
- **core/domain**: entities + ports
- **core/application**: use cases + DTOs + mappers
- **interface/http**: controllers/modules (Nest)
- **infrastructure**: adapters (InMemory/Prisma)

Swap repos by setting/unsetting `DATABASE_URL`.
