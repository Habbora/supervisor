# Exemplos de Uso do Schema Refatorado

Este documento mostra exemplos práticos de como usar a nova arquitetura Controller → Endpoint → Device.

## 📋 Índice
- [Conceitos](#conceitos)
- [Exemplo 1: Bomba Simples](#exemplo-1-bomba-simples)
- [Exemplo 2: Bomba com Sensor de Vazão](#exemplo-2-bomba-com-sensor-de-vazão)
- [Exemplo 3: Luz Dimmerizável](#exemplo-3-luz-dimmerizável)
- [Exemplo 4: Device Virtual](#exemplo-4-device-virtual)
- [Queries Úteis](#queries-úteis)
- [Migration Path](#migration-path)

---

## Conceitos

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA FÍSICA                                │
├─────────────────────────────────────────────────────────────────┤
│ Controller (CLP Modbus)                                         │
│   ├─ EndpointController: DO1 (saída digital)                    │
│   ├─ EndpointController: DO2 (saída digital)                    │
│   ├─ EndpointController: AI1 (entrada analógica)                │
│   └─ EndpointController: AI2 (entrada analógica)                │
└─────────────────────────────────────────────────────────────────┘
                            ↕ vincula via endpointId
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA LÓGICA                                │
├─────────────────────────────────────────────────────────────────┤
│ Device: "Bomba Principal"                                       │
│   ├─ type: "pump"                                               │
│   ├─ endpointId: DO1 (controla liga/desliga)                    │
│   ├─ config: { flowRate: 100, maxRunTime: 3600 }               │
│   └─ Usado em Schedule "Irrigação Manhã"                       │
└─────────────────────────────────────────────────────────────────┘
```

**Separação de responsabilidades:**
- **Controller**: Gerencia comunicação física (Modbus, MQTT, etc)
- **EndpointController**: Define portas/registradores específicos
- **Device**: Adiciona lógica de negócio e metadados

---

## Exemplo 1: Bomba Simples

Uma bomba ligada em uma saída digital (DO1) do CLP.

### 1. Criar o Controller

```typescript
const controller = await prisma.controller.create({
  data: {
    name: "CLP Principal",
    type: "modbus",
    configs: JSON.stringify({
      host: "192.168.1.100",
      port: 502,
      slaveId: 1
    }),
    isConnected: false
  }
});
```

### 2. Criar o Endpoint (porta física)

```typescript
const endpointDO1 = await prisma.endpointController.create({
  data: {
    name: "DO1",
    type: "digital_output",
    description: "Saída digital 1 - Bomba Principal",
    configs: JSON.stringify({
      address: 0,         // Endereço Modbus
      function: 5,        // Write Single Coil
      dataType: "coil"
    }),
    controllerId: controller.id
  }
});
```

### 3. Criar o Device (lógica)

```typescript
const bomba = await prisma.device.create({
  data: {
    name: "Bomba Principal",
    type: "pump",
    description: "Bomba de irrigação do setor A",
    location: "Estufa 1 - Setor A",
    config: JSON.stringify({
      flowRate: 100,      // L/min
      maxRunTime: 3600,   // 1 hora máxima
      minRestTime: 600    // 10 min descanso mínimo
    }),
    state: JSON.stringify({
      value: false,
      timestamp: new Date().toISOString()
    }),
    endpointId: endpointDO1.id,
    controllerId: controller.id,
    isActive: true
  }
});
```

### 4. Usar em um Schedule

```typescript
const schedule = await prisma.schedule.create({
  data: {
    name: "Irrigação Manhã",
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

---

## Exemplo 2: Bomba com Sensor de Vazão

Uma bomba mais complexa que tem:
- 1 saída digital (DO1) para controlar liga/desliga
- 1 entrada analógica (AI1) para ler vazão

### 1. Criar endpoints adicionais

```typescript
// DO1 já existe do exemplo anterior

const endpointAI1 = await prisma.endpointController.create({
  data: {
    name: "AI1",
    type: "analog_input",
    description: "Entrada analógica 1 - Sensor de vazão",
    unit: "L/min",
    configs: JSON.stringify({
      address: 100,
      function: 3,        // Read Holding Registers
      dataType: "holding_register",
      scale: 0.1          // Multiplica valor lido por 0.1
    }),
    controllerId: controller.id
  }
});
```

### 2. Criar Device com múltiplos endpoints

```typescript
const bombaAvancada = await prisma.device.create({
  data: {
    name: "Bomba com Medidor",
    type: "pump_with_sensor",

    // Endpoint PRINCIPAL (controle)
    endpointId: endpointDO1.id,

    // Endpoints ADICIONAIS (leitura)
    additionalEndpoints: JSON.stringify([
      {
        role: "flow_sensor",
        endpointId: endpointAI1.id,
        description: "Sensor de vazão"
      }
    ]),

    config: JSON.stringify({
      flowRate: 100,
      maxRunTime: 3600,
      minRestTime: 600,
      // Novos campos para sensor
      minFlowAlarm: 50,   // Alarme se vazão < 50 L/min
      maxFlowAlarm: 150   // Alarme se vazão > 150 L/min
    }),

    controllerId: controller.id
  }
});
```

### 3. Lógica de leitura do sensor

```typescript
// No seu DeviceService
async readDeviceState(deviceId: string) {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: {
      endpoint: true,  // Endpoint principal
      controller: true
    }
  });

  if (!device) throw new Error("Device not found");

  // Ler endpoints adicionais
  const additionalEndpoints = JSON.parse(device.additionalEndpoints || "[]");

  const state: any = {
    mainOutput: false,
    sensors: {}
  };

  // Ler endpoint principal (bomba ligada/desligada)
  if (device.endpoint) {
    const value = await this.driverManager.read(
      device.controller.type,
      device.controller.configs,
      device.endpoint.configs
    );
    state.mainOutput = value;
  }

  // Ler sensores adicionais
  for (const addEndpoint of additionalEndpoints) {
    const endpoint = await prisma.endpointController.findUnique({
      where: { id: addEndpoint.endpointId }
    });

    if (endpoint) {
      const value = await this.driverManager.read(
        device.controller.type,
        device.controller.configs,
        endpoint.configs
      );

      state.sensors[addEndpoint.role] = {
        value,
        unit: endpoint.unit,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Atualizar cache do estado
  await prisma.device.update({
    where: { id: deviceId },
    data: {
      state: JSON.stringify(state)
    }
  });

  return state;
}
```

---

## Exemplo 3: Luz Dimmerizável

Uma luz que aceita valores de 0-100% (entrada analógica).

### 1. Criar endpoint analógico de saída

```typescript
const endpointAO1 = await prisma.endpointController.create({
  data: {
    name: "AO1",
    type: "analog_output",
    description: "Saída analógica 1 - Controle de intensidade",
    unit: "%",
    configs: JSON.stringify({
      address: 200,
      function: 6,        // Write Single Register
      dataType: "holding_register",
      minValue: 0,
      maxValue: 100
    }),
    controllerId: controller.id
  }
});
```

### 2. Criar Device

```typescript
const luz = await prisma.device.create({
  data: {
    name: "Luz Estufa 1",
    type: "dimmable_light",
    config: JSON.stringify({
      maxPower: 200,      // Watts
      warmupTime: 30,     // Segundos para atingir intensidade máxima
      defaultIntensity: 80 // % padrão ao ligar
    }),
    state: JSON.stringify({
      value: 0,           // Intensidade atual (0-100)
      isOn: false,
      timestamp: new Date().toISOString()
    }),
    endpointId: endpointAO1.id,
    controllerId: controller.id
  }
});
```

### 3. Usar em Schedule com valor variável

```typescript
const schedule = await prisma.schedule.create({
  data: {
    name: "Luz 60% às 6h",
    hour: 6,
    minute: 0,
    recurrenceType: "daily",
    actions: {
      create: [
        {
          deviceId: luz.id,
          action: "set_intensity",
          value: 60  // 60%
        }
      ]
    }
  }
});
```

---

## Exemplo 4: Device Virtual

Um "device" que não tem porta física, apenas calcula valores.

Exemplo: Um medidor de pH que calcula a média de 3 sensores.

```typescript
const pHVirtual = await prisma.device.create({
  data: {
    name: "pH Médio Tanque",
    type: "virtual_sensor",
    description: "Média dos 3 sensores de pH",

    // SEM endpoint físico!
    endpointId: null,
    controllerId: null,

    config: JSON.stringify({
      sourceDevices: [
        "uuid-sensor-ph-1",
        "uuid-sensor-ph-2",
        "uuid-sensor-ph-3"
      ],
      calculation: "average"
    }),

    state: JSON.stringify({
      value: 7.2,
      unit: "pH",
      timestamp: new Date().toISOString()
    })
  }
});
```

---

## Queries Úteis

### Listar todos os devices de um controller

```typescript
const devices = await prisma.device.findMany({
  where: {
    controllerId: "controller-uuid"
  },
  include: {
    endpoint: true  // Inclui dados do endpoint físico
  }
});
```

### Listar endpoints disponíveis (não usados)

```typescript
const freeEndpoints = await prisma.endpointController.findMany({
  where: {
    controllerId: "controller-uuid",
    devices: {
      none: {}  // Nenhum device usando este endpoint
    }
  }
});
```

### Buscar device com todos os dados

```typescript
const device = await prisma.device.findUnique({
  where: { id: "device-uuid" },
  include: {
    endpoint: {
      include: {
        controller: true
      }
    },
    scheduleActions: {
      include: {
        schedule: true
      }
    }
  }
});
```

### Trocar um device de endpoint

```typescript
// Mover bomba do DO1 para DO2
await prisma.device.update({
  where: { id: bomba.id },
  data: {
    endpointId: endpointDO2.id
  }
});
```

---

## Migration Path

### Migrar dados antigos para nova estrutura

```typescript
// 1. Buscar devices antigos
const oldDevices = await prisma.device.findMany();

for (const oldDevice of oldDevices) {
  // 2. Parse dos campos JSON antigos
  const endpoints = JSON.parse(oldDevice.endpoints || "{}");
  const inputs = JSON.parse(oldDevice.inputs || "{}");
  const outputs = JSON.parse(oldDevice.outputs || "{}");

  // 3. Criar endpoints no controller (se não existir)
  let endpointId = null;

  if (outputs.address !== undefined) {
    const endpoint = await prisma.endpointController.create({
      data: {
        name: `Migrated_${oldDevice.name}`,
        type: "digital_output",
        configs: JSON.stringify({
          address: outputs.address,
          function: 5
        }),
        controllerId: oldDevice.controllerId
      }
    });
    endpointId = endpoint.id;
  }

  // 4. Atualizar device com novo schema
  await prisma.device.update({
    where: { id: oldDevice.id },
    data: {
      endpointId,
      // Remove campos antigos
      endpoints: null,
      inputs: null,
      outputs: null
    }
  });
}
```

---

## Vantagens desta Arquitetura

### ✅ Separação de responsabilidades
- Controller cuida da comunicação
- Endpoint define portas físicas
- Device adiciona lógica de negócio

### ✅ Flexibilidade
- Devices podem ter 0, 1 ou N endpoints
- Fácil trocar um device de porta
- Devices virtuais sem porta física

### ✅ Reusabilidade
- Mesmo endpoint pode ser reutilizado ao longo do tempo
- Configurações do driver centralizadas no controller

### ✅ Rastreabilidade
- Histórico de qual device usou qual porta quando
- Fácil debug (qual porta está livre?)

### ✅ Escalabilidade
- Adicionar novos tipos de device sem mudar schema
- Suporte a protocolos diferentes (Modbus, MQTT, HTTP)
- Devices complexos com múltiplos sensores