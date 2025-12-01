# 📦 Prisma Multi-Schema Structure

Este projeto usa a estrutura **multi-file schema** do Prisma para organizar os models em arquivos separados.

## 📂 Estrutura de Arquivos

```
prisma/
├── schema.prisma              ← Configuração principal (generator + datasource)
└── schema/                    ← Models separados por domínio
    ├── README.md              ← Você está aqui
    ├── user.prisma            ← Usuários e autenticação
    ├── controller.prisma      ← Controllers (equipamentos físicos)
    ├── endpoint.prisma        ← Endpoints (portas/registradores)
    ├── device.prisma          ← Devices (lógica de negócio)
    └── schedule.prisma        ← Schedules e ScheduleActions
```

## 🏗️ Arquitetura em Camadas

```
┌─────────────────────────────────────────────┐
│     CAMADA DE AGENDAMENTO                   │
│  schedule.prisma                            │
│  - Schedule                                 │
│  - ScheduleAction                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│     CAMADA LÓGICA                           │
│  device.prisma                              │
│  - Device (bomba, luz, sensor)              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│     CAMADA FÍSICA                           │
│  endpoint.prisma + controller.prisma        │
│  - EndpointController (portas físicas)      │
│  - Controller (CLP, Arduino, etc)           │
└─────────────────────────────────────────────┘
```

## 📋 Descrição dos Schemas

### [user.prisma](./user.prisma)
**Responsabilidade**: Autenticação e autorização

**Models**:
- `User` - Usuários do sistema

**Campos principais**:
- `email`, `password`, `role`

---

### [controller.prisma](./controller.prisma)
**Responsabilidade**: Equipamentos físicos de controle

**Models**:
- `Controller` - CLP, Arduino, Raspberry Pi, etc

**Campos principais**:
- `type` - Tipo do driver ("modbus", "mqtt", "http")
- `configs` - Configurações do protocolo (JSON)
- `isConnected` - Status da conexão
- `lastSeen` - Timestamp da última comunicação

**Exemplo**:
```typescript
{
  name: "CLP Principal",
  type: "modbus",
  configs: { host: "192.168.1.100", port: 502, slaveId: 1 }
}
```

---

### [endpoint.prisma](./endpoint.prisma)
**Responsabilidade**: Portas e registradores físicos

**Models**:
- `EndpointController` - Portas digitais/analógicas, registradores

**Tipos de endpoint**:
- `digital_output` - Saída digital (ON/OFF)
- `digital_input` - Entrada digital
- `analog_output` - Saída analógica (0-10V, PWM)
- `analog_input` - Entrada analógica (sensores)

**Campos principais**:
- `type` - Tipo do endpoint
- `configs` - Endereço Modbus, topic MQTT, etc (JSON)
- `unit` - Unidade de medida para sensores

**Exemplo**:
```typescript
{
  name: "DO1",
  type: "digital_output",
  configs: { address: 0, function: 5, dataType: "coil" }
}
```

---

### [device.prisma](./device.prisma)
**Responsabilidade**: Equipamentos com lógica de negócio

**Models**:
- `Device` - Bomba, luz, sensor, tanque, etc

**Tipos comuns**:
- `pump` - Bomba ON/OFF
- `dimmable_light` - Luz dimmerizável
- `sensor_temperature`, `sensor_ph`, `sensor_level` - Sensores
- `tank` - Tanque
- `virtual` - Device calculado (sem hardware)

**Campos principais**:
- `type` - Tipo do device
- `config` - Configurações específicas (JSON)
- `state` - Cache do estado atual (JSON)
- `endpointId` - Endpoint principal
- `additionalEndpoints` - Endpoints adicionais (JSON array)

**Exemplo**:
```typescript
{
  name: "Bomba Principal",
  type: "pump",
  endpointId: "endpoint-do1-uuid",
  config: { flowRate: 100, maxRunTime: 3600 }
}
```

---

### [schedule.prisma](./schedule.prisma)
**Responsabilidade**: Agendamento de ações

**Models**:
- `Schedule` - Agendamento
- `ScheduleAction` - Ação a executar

**Tipos de recorrência**:
- `once` - Uma única vez
- `daily` - Diariamente
- `weekly` - Semanal
- `monthly` - Mensal

**Exemplo**:
```typescript
{
  name: "Irrigação Manhã",
  hour: 6,
  minute: 0,
  recurrenceType: "daily",
  actions: [
    { deviceId: "bomba-uuid", action: "turn_on", value: 1 }
  ]
}
```

## 🚀 Como Usar

### 1. Gerar Prisma Client

```bash
cd apps/backend
bun run db:generate
```

### 2. Criar Migration

```bash
bun run db:migrate
```

### 3. Aplicar Schema (sem migration)

```bash
bun run db:push
```

### 4. Abrir Prisma Studio

```bash
bun run db:studio
```

### 5. Seed (popular banco)

```bash
bun run db:seed
```

## 🎯 Fluxo Completo: Criar uma Bomba

### 1. Criar Controller

```typescript
const controller = await prisma.controller.create({
  data: {
    name: "CLP Estufa 1",
    type: "modbus",
    configs: JSON.stringify({
      host: "192.168.1.100",
      port: 502,
      slaveId: 1
    })
  }
});
```

### 2. Criar Endpoint

```typescript
const endpoint = await prisma.endpointController.create({
  data: {
    name: "DO1",
    type: "digital_output",
    description: "Saída para bomba",
    configs: JSON.stringify({
      address: 0,
      function: 5,
      dataType: "coil"
    }),
    controllerId: controller.id
  }
});
```

### 3. Criar Device

```typescript
const bomba = await prisma.device.create({
  data: {
    name: "Bomba Principal",
    type: "pump",
    config: JSON.stringify({
      flowRate: 100,
      maxRunTime: 3600
    }),
    endpointId: endpoint.id,
    controllerId: controller.id
  }
});
```

### 4. Criar Schedule

```typescript
const schedule = await prisma.schedule.create({
  data: {
    name: "Irrigação 6h",
    hour: 6,
    minute: 0,
    recurrenceType: "daily",
    actions: {
      create: [
        {
          deviceId: bomba.id,
          action: "turn_on",
          value: 1
        }
      ]
    }
  }
});
```

## 📊 Relacionamentos

```
Controller (1) ─┬─ (N) EndpointController
                │
                └─ (N) Device ─── (N) ScheduleAction ─── (N) Schedule
                       │
                       └─ (1) EndpointController
```

## 🎨 Convenções

### Naming

**Controllers**:
- ✅ "CLP Estufa 1", "Arduino Irrigação"
- ❌ "controller1", "clp"

**Endpoints**:
- ✅ "DO1", "AI3", "AO1"
- ❌ "porta1", "saida_bomba"

**Devices**:
- ✅ "Bomba Principal", "Luz LED Estufa 1"
- ❌ "device1", "bomba"

### Types (usar strings padronizadas)

**Controller.type**:
- `"modbus"`, `"mqtt"`, `"http"`, `"websocket"`

**EndpointController.type**:
- `"digital_output"`, `"digital_input"`
- `"analog_output"`, `"analog_input"`

**Device.type**:
- `"pump"`, `"dimmable_light"`, `"on_off_light"`
- `"sensor_temperature"`, `"sensor_ph"`, `"sensor_level"`
- `"valve"`, `"tank"`, `"virtual"`

**ScheduleAction.action**:
- `"turn_on"`, `"turn_off"`
- `"set_value"`, `"set_intensity"`

## ⚠️ Boas Práticas

### 1. Sempre use JSON.stringify para campos JSON

```typescript
✅ configs: JSON.stringify({ host: "192.168.1.100" })
❌ configs: { host: "192.168.1.100" }
```

### 2. Valide configs antes de salvar

```typescript
import { z } from "zod";

const modbusConfigSchema = z.object({
  host: z.string().ip(),
  port: z.number().min(1).max(65535),
  slaveId: z.number().min(1).max(247)
});

const validated = modbusConfigSchema.parse(JSON.parse(configs));
```

### 3. Use transações para operações relacionadas

```typescript
await prisma.$transaction([
  prisma.controller.create({ data: { ... } }),
  prisma.endpointController.create({ data: { ... } })
]);
```

### 4. Não delete resources em uso

```typescript
// Verificar antes de deletar controller
const hasDevices = await prisma.device.count({
  where: { controllerId, isActive: true }
});

if (hasDevices > 0) {
  throw new Error("Cannot delete controller with active devices");
}
```

## 📚 Mais Exemplos

Veja [SCHEMA_EXAMPLES.md](../SCHEMA_EXAMPLES.md) para exemplos práticos de:
- Bomba simples
- Bomba com sensor de vazão
- Luz dimmerizável
- Sensor de pH
- Device virtual
- Queries úteis

## 🔧 Troubleshooting

### Erro: "Schema not found"

Certifique-se que o `package.json` tem:

```json
{
  "prisma": {
    "schema": "./prisma/schema/"
  }
}
```

### Erro ao gerar client

```bash
# Limpar cache e regenerar
rm -rf node_modules/.prisma
bun run db:generate
```

### VSCode não reconhece Prisma Client

```bash
# Recarregar window do VSCode
Ctrl+Shift+P → "Reload Window"
```
