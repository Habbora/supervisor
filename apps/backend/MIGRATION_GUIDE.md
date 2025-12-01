# Guia de Migração - JSON para Prisma

## 🔄 Como migrar seus dados existentes

Se você tem dados no sistema antigo (database.json), siga este guia para migrá-los.

### 1. Script de migração

Crie um arquivo `src/lib/migrate-from-json.ts`:

```typescript
import { prisma } from './prisma';
import fs from 'fs';
import path from 'path';

async function migrateFromJSON() {
  console.log('🔄 Migrando dados do JSON para Prisma...\n');

  // Ler arquivo JSON antigo
  const jsonPath = path.join(process.cwd(), 'database', 'database.json');

  if (!fs.existsSync(jsonPath)) {
    console.log('❌ Arquivo database.json não encontrado');
    return;
  }

  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // Migrar Controllers
  if (jsonData.controllers) {
    console.log('📦 Migrando controllers...');
    for (const ctrl of jsonData.controllers) {
      await prisma.controller.upsert({
        where: { id: ctrl.id },
        update: {},
        create: {
          id: ctrl.id,
          name: ctrl.name,
          type: ctrl.type,
          configs: ctrl.configs ? JSON.stringify(ctrl.configs) : null,
        },
      });
    }
    console.log(`✅ ${jsonData.controllers.length} controllers migrados`);
  }

  // Migrar Devices
  if (jsonData.devices) {
    console.log('📦 Migrando devices...');
    for (const device of jsonData.devices) {
      await prisma.device.upsert({
        where: { id: device.id },
        update: {},
        create: {
          id: device.id,
          name: device.name,
          type: device.type,
          endpoints: device.endpoints ? JSON.stringify(device.endpoints) : null,
          inputs: device.inputs ? JSON.stringify(device.inputs) : null,
          outputs: device.outputs ? JSON.stringify(device.outputs) : null,
          controllerId: device.controllerId || null,
        },
      });
    }
    console.log(`✅ ${jsonData.devices.length} devices migrados`);
  }

  // Migrar Users (se existir)
  if (jsonData.users) {
    console.log('📦 Migrando users...');
    for (const user of jsonData.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        },
      });
    }
    console.log(`✅ ${jsonData.users.length} users migrados`);
  }

  // Migrar Schedules (se existir)
  if (jsonData.schedules) {
    console.log('📦 Migrando schedules...');
    for (const sched of jsonData.schedules) {
      await prisma.schedule.create({
        data: {
          id: sched.id,
          name: sched.name,
          hour: sched.time.hour,
          minute: sched.time.minute,
          isActive: sched.isActive ?? true,
          recurrenceType: sched.recurrenceType || 'once',
          recurrenceConfig: sched.recurrenceConfig ? JSON.stringify(sched.recurrenceConfig) : null,
          nextExecution: sched.nextExecution ? new Date(sched.nextExecution) : null,
          lastExecution: sched.lastExecution ? new Date(sched.lastExecution) : null,
          createdAt: sched.createdAt ? new Date(sched.createdAt) : new Date(),
          updatedAt: sched.updatedAt ? new Date(sched.updatedAt) : new Date(),
          actions: {
            create: sched.actions?.map((action: any) => ({
              deviceId: action.deviceId,
              action: action.action,
              value: action.value,
            })) || [],
          },
        },
      });
    }
    console.log(`✅ ${jsonData.schedules.length} schedules migrados`);
  }

  console.log('\n🎉 Migração concluída!');
}

migrateFromJSON()
  .catch((e) => {
    console.error('❌ Erro na migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 2. Executar migração

```bash
bun run src/lib/migrate-from-json.ts
```

## 📝 Atualizando código existente

### Antes (Sistema JSON)

```typescript
import { Database } from './services/database';

const db = Database.getInstance();
const data = db.readDatabase();

// Buscar devices
const devices = data.devices;

// Adicionar device
data.devices.push(newDevice);
db.writeDatabase(data);
```

### Depois (Prisma)

```typescript
import { deviceService } from './services/database/prisma';

// Buscar devices
const devices = await deviceService.findAll();

// Adicionar device
await deviceService.create(newDevice);
```

## 🔧 Principais mudanças no código

### 1. Rotas/Controllers

**Antes:**
```typescript
app.get('/api/devices', (req, res) => {
  const db = Database.getInstance();
  const devices = db.readDatabase().devices;
  res.json(devices);
});
```

**Depois:**
```typescript
app.get('/api/devices', async (req, res) => {
  const devices = await deviceService.findAll();
  res.json(devices);
});
```

### 2. Services

**Antes:**
```typescript
class DeviceManager {
  getDevices() {
    const db = Database.getInstance();
    return db.readDatabase().devices;
  }

  addDevice(device) {
    const db = Database.getInstance();
    const data = db.readDatabase();
    data.devices.push(device);
    db.writeDatabase(data);
  }
}
```

**Depois:**
```typescript
class DeviceManager {
  async getDevices() {
    return await deviceService.findAll();
  }

  async addDevice(device) {
    return await deviceService.create(device);
  }
}
```

### 3. Queries complexas

**Antes:**
```typescript
const db = Database.getInstance();
const data = db.readDatabase();
const lights = data.devices.filter(d => d.type === 'light');
```

**Depois:**
```typescript
const lights = await deviceService.findByType('light');
// ou
const lights = await prisma.device.findMany({
  where: { type: 'light' }
});
```

## ✅ Checklist de migração

- [ ] Executar `bun run db:migrate` para criar o banco
- [ ] Executar `bun run db:seed` para criar usuários padrão
- [ ] Executar script de migração dos dados JSON (se necessário)
- [ ] Atualizar imports nos arquivos
- [ ] Adicionar `async/await` nas funções que usam banco
- [ ] Testar todas as rotas
- [ ] Fazer backup do database.json antes de remover
- [ ] Remover imports do sistema antigo
- [ ] Remover pasta `src/database` antiga (opcional)

## 🔒 Boas práticas

### 1. Sempre use transações para operações múltiplas

```typescript
await prisma.$transaction([
  prisma.device.create({ data: device1 }),
  prisma.device.create({ data: device2 }),
]);
```

### 2. Use include para carregar relacionamentos

```typescript
const device = await prisma.device.findUnique({
  where: { id },
  include: {
    controller: true,
    scheduleActions: {
      include: { schedule: true }
    }
  }
});
```

### 3. Use select para buscar apenas campos necessários

```typescript
const devices = await prisma.device.findMany({
  select: {
    id: true,
    name: true,
    type: true,
  }
});
```

### 4. Trate erros adequadamente

```typescript
try {
  const device = await deviceService.create(data);
  return device;
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    throw new Error('Device já existe');
  }
  throw error;
}
```

## 📚 Recursos

- [Documentação Prisma](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Arquivo PRISMA_MIGRATION.md](./PRISMA_MIGRATION.md)
