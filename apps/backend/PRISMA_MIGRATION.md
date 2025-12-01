# Migração para Prisma + SQLite

## ✅ O que foi feito

1. **Schema Prisma criado** ([prisma/schema.prisma](prisma/schema.prisma))
   - Models: User, Controller, Device, Schedule, ScheduleAction
   - SQLite configurado como database
   - Relacionamentos entre entidades definidos

2. **Prisma Client configurado** ([src/lib/prisma.ts](src/lib/prisma.ts))
   - Singleton pattern para evitar múltiplas conexões
   - Logs em desenvolvimento

3. **Services criados** ([src/services/database/prisma/](src/services/database/prisma/))
   - `users.service.ts` - CRUD completo para usuários
   - `controllers.service.ts` - CRUD para controllers com parsing de configs JSON
   - `devices.service.ts` - CRUD para devices com parsing de endpoints/inputs/outputs
   - `schedules.service.ts` - CRUD para schedules com actions e recurrence

4. **Scripts NPM atualizados**
   - `db:generate` - Gera Prisma Client
   - `db:migrate` - Cria e aplica migrations
   - `db:studio` - Abre Prisma Studio (interface visual)
   - `db:push` - Sincroniza schema sem migrations
   - `db:seed` - Popula dados iniciais

5. **Dependências limpas**
   - Removido: `drizzle-orm`, `drizzle-kit`, `pg`, `@prisma/adapter-better-sqlite3`
   - Mantido: `@prisma/client`, `prisma`

## 📦 Como usar

### 1. Gerar Prisma Client
```bash
bun run db:generate
```

### 2. Criar/Aplicar migrations
```bash
bun run db:migrate
```

### 3. Abrir Prisma Studio (Database GUI)
```bash
bun run db:studio
```

### 4. Popular dados iniciais (opcional)
```bash
bun run db:seed
```

## 🔧 Exemplos de uso nos seus arquivos

### Importar serviços
```typescript
import { userService, deviceService, controllerService, scheduleService } from './services/database/prisma';
// ou
import { prisma } from './lib/prisma';
```

### Exemplos de queries

#### Criar usuário
```typescript
const user = await userService.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedPassword',
  role: UserRoles.USER,
});
```

#### Buscar device com controller
```typescript
const device = await deviceService.findById('device-id', true);
console.log(device?.controller); // Controller relacionado
```

#### Criar schedule com actions
```typescript
const schedule = await scheduleService.create({
  name: 'Morning Lights',
  hour: 8,
  minute: 0,
  isActive: true,
  recurrenceType: 'daily',
  actions: [
    {
      deviceId: 'device-1',
      action: 'turnOn',
      value: 100,
    },
  ],
});
```

#### Query direta com Prisma
```typescript
const users = await prisma.user.findMany({
  where: {
    role: 'admin',
  },
  include: {
    // relacionamentos
  },
});
```

## 📊 Database Location

O arquivo SQLite será criado em:
```
apps/backend/prisma/dev.db
```

## 🔄 Migrations

As migrations ficam em:
```
apps/backend/prisma/migrations/
```

Cada migration tem:
- Timestamp + nome
- Arquivo `migration.sql` com as alterações

## 🎨 Prisma Studio

Para visualizar/editar dados com interface gráfica:
```bash
bun run db:studio
```

Abre em: `http://localhost:5555`

## 🚀 Próximos passos

1. **Atualizar suas rotas** para usar os novos services
2. **Migrar dados** do sistema antigo (JSON) se necessário
3. **Testar** todas as funcionalidades
4. **Remover** arquivos antigos do Drizzle/JSON database

## 📝 Diferenças principais

### Antes (JSON)
```typescript
const db = Database.getInstance();
const data = db.readDatabase();
const users = data.users;
```

### Agora (Prisma)
```typescript
const users = await userService.findAll();
// ou
const users = await prisma.user.findMany();
```

## ⚠️ Importante

- O arquivo `dev.db` NÃO está no git (.gitignore)
- Sempre rode `db:generate` após alterar o schema
- Use `db:migrate` para alterações em produção
- Use `db:push` apenas para desenvolvimento rápido

## 🛠️ Troubleshooting

### Erro "Prisma Client not generated"
```bash
bun run db:generate
```

### Resetar database
```bash
rm prisma/dev.db
bun run db:migrate
bun run db:seed
```

### Ver queries SQL no console
Já configurado em desenvolvimento! As queries aparecem no terminal.
