# 🏗️ Arquitetura do Schema - Supervisor

## 📋 Resumo

Esta documentação explica a **arquitetura em camadas** do sistema de supervisão, separando **responsabilidades físicas** (comunicação com hardware) e **lógicas** (regras de negócio).

## 🎯 Pergunta Principal

> **"Para definir uma saída digital, eu crio direto no Controller ou preciso de um Device?"**

**Resposta**: **AMBOS!** Você faz em 3 etapas:

1. **Controller** → Define o equipamento físico (CLP, Arduino)
2. **Endpoint** → Define a porta física (DO1, AI3)
3. **Device** → Adiciona lógica de negócio (Bomba, Luz, Sensor)

## 🔄 Fluxo de Criação

```
┌─────────────────────────────────────────────┐
│ PASSO 1: Criar Controller                  │
│ "Qual CLP vou usar?"                        │
├─────────────────────────────────────────────┤
│ POST /api/controllers                       │
│ {                                           │
│   name: "CLP Estufa 1",                     │
│   type: "modbus",                           │
│   configs: {                                │
│     host: "192.168.1.100",                  │
│     port: 502                               │
│   }                                         │
│ }                                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PASSO 2: Criar Endpoint                    │
│ "Qual porta vou usar?"                      │
├─────────────────────────────────────────────┤
│ POST /api/endpoints                         │
│ {                                           │
│   name: "DO1",                              │
│   type: "digital_output",                   │
│   controllerId: "uuid-do-clp",              │
│   configs: {                                │
│     address: 0,                             │
│     function: 5                             │
│   }                                         │
│ }                                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ PASSO 3: Criar Device                      │
│ "O que está conectado?"                     │
├─────────────────────────────────────────────┤
│ POST /api/devices                           │
│ {                                           │
│   name: "Bomba Principal",                  │
│   type: "pump",                             │
│   endpointId: "uuid-do-DO1",                │
│   config: {                                 │
│     flowRate: 100,                          │
│     maxRunTime: 3600                        │
│   }                                         │
│ }                                           │
└─────────────────────────────────────────────┘
```

## 🎨 Arquitetura em Camadas

```
┌──────────────────────────────────────────────────────────────┐
│                    CAMADA 4: UI/FRONTEND                     │
│  - Usuário interage com "Bomba Principal"                    │
│  - Não precisa saber que é Modbus, DO1, etc                  │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│              CAMADA 3: AGENDAMENTO (Schedule)                │
│  - "Ligar Bomba Principal às 6h"                             │
│  - Schedule → ScheduleAction → Device                        │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│              CAMADA 2: LÓGICA DE NEGÓCIO (Device)            │
│  - Device: "Bomba Principal"                                 │
│  - Sabe: flowRate, maxRunTime, estado atual                  │
│  - Não sabe: endereços Modbus, protocolos                    │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│           CAMADA 1: ABSTRAÇÃO FÍSICA (Endpoint)              │
│  - EndpointController: "DO1"                                 │
│  - Sabe: endereço 0, função 5, tipo coil                     │
│  - Abstrai protocolo específico                              │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│           CAMADA 0: HARDWARE (Controller)                    │
│  - Controller: "CLP Estufa 1"                                │
│  - Sabe: IP, porta, protocolo Modbus                         │
│  - Gerencia conexão física                                   │
└──────────────────────────────────────────────────────────────┘
                              ↓
                    [ Hardware Físico ]
```

## 🎯 Por que Separar em Camadas?

### ✅ Vantagens

#### 1. **Flexibilidade**
```typescript
// Trocar bomba de porta sem mudar lógica
await prisma.device.update({
  where: { id: bombaId },
  data: { endpointId: novoEndpointId } // DO1 → DO2
});
```

#### 2. **Reutilização**
```typescript
// Mesmo controller, múltiplos devices
Controller "CLP1"
  ├─ Endpoint DO1 → Device "Bomba 1"
  ├─ Endpoint DO2 → Device "Bomba 2"
  ├─ Endpoint AI1 → Device "Sensor pH"
  └─ Endpoint AI2 → Device "Sensor Temperatura"
```

#### 3. **Histórico e Rastreabilidade**
```typescript
// Ver qual device usou qual porta quando
const history = await prisma.device.findMany({
  where: { endpointId: "endpoint-DO1-uuid" },
  orderBy: { createdAt: "desc" }
});
// Resultado: "Bomba 1" (2024-01-01 a 2025-01-01)
//            "Bomba 2" (2025-01-02 a hoje)
```

#### 4. **Devices Virtuais**
```typescript
// Device SEM porta física (calculado)
const pHMedio = await prisma.device.create({
  data: {
    name: "pH Médio",
    type: "virtual",
    endpointId: null, // ← SEM endpoint!
    config: {
      calculation: "average",
      sources: ["sensor-1-uuid", "sensor-2-uuid"]
    }
  }
});
```

#### 5. **Devices Complexos**
```typescript
// Device com MÚLTIPLOS endpoints
const bombaAvancada = await prisma.device.create({
  data: {
    name: "Bomba Industrial",
    type: "pump_with_sensors",
    endpointId: "DO1-uuid", // Controle principal
    additionalEndpoints: JSON.stringify([
      { role: "flow_sensor", endpointId: "AI1-uuid" },
      { role: "pressure", endpointId: "AI2-uuid" },
      { role: "temperature", endpointId: "AI3-uuid" }
    ])
  }
});
```

## 📊 Comparação: Com vs Sem Camadas

### ❌ Sem Camadas (Tudo junto)

```typescript
const bomba = {
  name: "Bomba 1",
  modbusAddress: 0,
  modbusFunction: 5,
  host: "192.168.1.100",
  port: 502,
  flowRate: 100
};

// Problemas:
// - Como trocar de porta?
// - Como usar outro protocolo (MQTT)?
// - Como ter device virtual?
// - Como compartilhar conexão entre devices?
```

### ✅ Com Camadas (Separado)

```typescript
// Controller (reutilizável)
const controller = {
  name: "CLP1",
  type: "modbus",
  configs: { host: "192.168.1.100", port: 502 }
};

// Endpoint (porta física)
const endpoint = {
  name: "DO1",
  type: "digital_output",
  controllerId: controller.id,
  configs: { address: 0, function: 5 }
};

// Device (lógica)
const bomba = {
  name: "Bomba 1",
  type: "pump",
  endpointId: endpoint.id,
  config: { flowRate: 100 }
};

// Vantagens:
// ✅ Trocar porta: muda endpointId
// ✅ Trocar protocolo: muda controller.type
// ✅ Device virtual: endpointId = null
// ✅ Múltiplos devices: reutiliza controller
```

## 🔄 Fluxo de Dados

### Escrita (Controlar Device)

```
Frontend
   ↓ "Ligar Bomba Principal"
DeviceService.turnOn(bombaId)
   ↓ Busca device + endpoint + controller
DriverManager.write(
  type: "modbus",
  configs: { host: "192.168.1.100", port: 502 },
  endpoint: { address: 0, function: 5 },
  value: true
)
   ↓ Seleciona driver Modbus
ModbusDriver.writeCoil(address: 0, value: true)
   ↓ Envia via TCP
Hardware (CLP) → DO1 = ON → Bomba liga
```

### Leitura (Monitorar Device)

```
Hardware (CLP) → AI1 = 6.8 (valor raw)
   ↑
ModbusDriver.readRegister(address: 100)
   ↑
DriverManager.read(...)
   ↑ Aplica scale/offset do endpoint
EndpointConfig: { scale: 0.1, offset: 0 }
   ↑ Valor final: 0.68
Device.state = { value: 6.8, unit: "pH", timestamp: "..." }
   ↑
Frontend exibe: "Sensor pH: 6.8"
```

## 🎯 Casos de Uso

### Caso 1: Bomba Simples
```
Controller → Endpoint (DO1) → Device (Bomba)
```

### Caso 2: Luz Dimmerizável
```
Controller → Endpoint (AO1) → Device (Luz com intensidade)
```

### Caso 3: Bomba + Sensor
```
Controller → Endpoint (DO1) ─┐
          → Endpoint (AI1) ─┐ │
                            ├─→ Device (Bomba Avançada)
```

### Caso 4: Tank com Múltiplos Sensores
```
Controller → DO1 (válvula entrada) ─┐
          → DO2 (válvula saída)    ─┤
          → AI1 (sensor nível)     ─┤
          → AI2 (sensor temperatura)─→ Device (Tanque)
```

### Caso 5: Device Virtual
```
Sensor pH 1 ─┐
Sensor pH 2 ─┼─→ Device Virtual (pH Médio)
Sensor pH 3 ─┘
(sem controller, sem endpoint)
```

## 📝 Convenções

### Naming

| Model | Exemplo Bom | Exemplo Ruim |
|-------|-------------|--------------|
| Controller | `"CLP Estufa 1"` | `"controller1"` |
| Endpoint | `"DO1"`, `"AI3"` | `"porta_bomba"` |
| Device | `"Bomba Principal"` | `"device1"` |

### Types (strings padronizadas)

| Campo | Valores |
|-------|---------|
| Controller.type | `"modbus"`, `"mqtt"`, `"http"` |
| Endpoint.type | `"digital_output"`, `"analog_input"` |
| Device.type | `"pump"`, `"light"`, `"sensor_ph"` |
| ScheduleAction.action | `"turn_on"`, `"set_intensity"` |

## 🚀 Próximos Passos

1. **Leia os schemas**:
   - [controller.prisma](./controller.prisma)
   - [endpoint.prisma](./endpoint.prisma)
   - [device.prisma](./device.prisma)
   - [schedule.prisma](./schedule.prisma)

2. **Veja exemplos**: [README.md](./README.md)

3. **Execute a migration**:
   ```bash
   bun run db:migrate
   ```

4. **Explore no Studio**:
   ```bash
   bun run db:studio
   ```
