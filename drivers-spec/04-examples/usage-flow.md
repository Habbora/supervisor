# Fluxo de Uso - Arquitetura de Bindings

## Conceito

**Driver** exporta **Bindings** (interfaces de protocolo)
**Endpoint** consome **Bindings** (lógica de dispositivo)

```
┌─────────────────────────────────────────────────────────────┐
│                        DRIVER                               │
│  (Modbus TCP)                                               │
│                                                             │
│  Exporta Bindings:                                          │
│  ├─ modbus_coil          (boolean read/write)               │
│  ├─ modbus_holding       (number read/write)                │
│  └─ modbus_dimmer        (dimmer read/write/fade)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓ Conecta
┌─────────────────────────────────────────────────────────────┐
│                       ENDPOINT                              │
│  (DigitalOutput - "Bomba Principal")                        │
│                                                             │
│  Requer Binding: modbus_coil                                │
│  Config:                                                    │
│    - address: 5                                             │
│    - invertLogic: false                                     │
│                                                             │
│  Comandos:                                                  │
│    - setOn() → binding.write(5, true)                       │
│    - setOff() → binding.write(5, false)                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Passo a Passo

### 1. Criar Driver (Modbus TCP)

**Request:**
```json
POST /api/drivers

{
  "name": "CLP Fábrica",
  "driverType": "modbus_tcp",
  "config": {
    "host": "192.168.1.100",
    "port": 502
  }
}
```

**Response:**
```json
{
  "id": "driver-uuid-123",
  "name": "CLP Fábrica",
  "type": "modbus_tcp",
  "bindings": [
    {
      "name": "modbus_coil",
      "type": "boolean",
      "capabilities": ["read", "write"]
    },
    {
      "name": "modbus_holding_register",
      "type": "number",
      "capabilities": ["read", "write"],
      "dataType": "int16"
    },
    {
      "name": "modbus_dimmer",
      "type": "dimmer",
      "capabilities": ["read", "write", "fade"]
    }
  ],
  "status": "connected"
}
```

### 2. Criar Endpoint (Bomba - DigitalOutput)

**Request:**
```json
POST /api/endpoints

{
  "name": "Bomba Principal",
  "type": "DigitalOutput",
  "driverId": "driver-uuid-123",
  "binding": "modbus_coil",
  "config": {
    "address": 5,
    "invertLogic": false
  }
}
```

**Response:**
```json
{
  "id": "endpoint-uuid-456",
  "name": "Bomba Principal",
  "type": "DigitalOutput",
  "driver": {
    "id": "driver-uuid-123",
    "name": "CLP Fábrica"
  },
  "binding": "modbus_coil",
  "config": {
    "address": 5,
    "invertLogic": false
  },
  "state": {
    "value": false
  }
}
```

### 3. Controlar Endpoint

**Ligar Bomba:**
```json
POST /api/endpoints/endpoint-uuid-456/command

{
  "command": "setOn"
}
```

**Internamente:**
```
1. Endpoint recebe comando setOn()
2. Endpoint chama: binding.write(5, true)
3. Driver executa: Modbus Write Coil(address=5, value=true)
4. Socket TCP envia comando Modbus
5. PLC recebe e liga bomba
6. Endpoint emite evento: endpoint:456:changed { value: true }
7. WebSocket notifica frontend
```

**Response:**
```json
{
  "success": true,
  "endpoint": "Bomba Principal",
  "command": "setOn",
  "state": {
    "value": true,
    "lastChanged": "2025-01-14T12:34:56.789Z"
  }
}
```

### 4. Criar Outro Endpoint (Dimmer)

**Request:**
```json
POST /api/endpoints

{
  "name": "Luz Principal",
  "type": "Dimmer",
  "driverId": "driver-uuid-123",
  "binding": "modbus_dimmer",
  "config": {
    "address": 100
  }
}
```

**Controlar:**
```json
POST /api/endpoints/endpoint-uuid-789/command

{
  "command": "setLevel",
  "params": {
    "level": 75
  }
}
```

## Database Schema

### Tabela: drivers
```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  driver_type TEXT NOT NULL,          -- 'modbus_tcp', 'mqtt', etc
  code TEXT NOT NULL,                 -- Código compilado do driver
  config JSONB,                       -- { host, port, ... }

  -- Bindings exportados (extraído na compilação)
  bindings JSONB,                     -- [{ name, type, capabilities }, ...]

  status TEXT DEFAULT 'disconnected',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: endpoints
```sql
CREATE TABLE endpoints (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  endpoint_type TEXT NOT NULL,        -- 'DigitalOutput', 'Dimmer', etc

  driver_id UUID REFERENCES drivers(id),
  binding_name TEXT NOT NULL,         -- 'modbus_coil', 'modbus_dimmer', etc

  config JSONB,                       -- { address, invertLogic, ... }
  state JSONB,                        -- { value, lastChanged }

  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: endpoint_device_links (opcional)
```sql
CREATE TABLE endpoint_device_links (
  id UUID PRIMARY KEY,
  endpoint_id UUID REFERENCES endpoints(id),
  device_id UUID REFERENCES devices(id),

  -- Mapping de comandos
  mapping JSONB,                      -- { "device.turnOn": "endpoint.setOn" }

  created_at TIMESTAMP DEFAULT NOW()
);
```

## Frontend Integration

### Listar Drivers e Bindings

```typescript
const { data: drivers } = await fetch('/api/drivers');

// UI mostra drivers disponíveis
drivers.forEach(driver => {
  console.log(`Driver: ${driver.name}`);
  console.log(`Bindings disponíveis:`);
  driver.bindings.forEach(binding => {
    console.log(`  - ${binding.name} (${binding.type})`);
  });
});
```

### Criar Endpoint com Binding

```typescript
// User escolhe:
// 1. Tipo de endpoint: "DigitalOutput"
// 2. Driver: "CLP Fábrica"
// 3. Binding compatível: "modbus_coil" (filtrado automaticamente)
// 4. Config: { address: 5 }

const endpoint = await fetch('/api/endpoints', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Bomba Principal',
    type: 'DigitalOutput',
    driverId: selectedDriver.id,
    binding: selectedBinding.name,
    config: { address: 5 }
  })
});
```

### Controlar Endpoint

```typescript
function useEndpoint(endpointId: string) {
  const [state, setState] = useState({ value: false });

  // WebSocket para updates em tempo real
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3000/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === `endpoint:${endpointId}:changed`) {
        setState(data.state);
      }
    };

    return () => ws.close();
  }, [endpointId]);

  const setOn = async () => {
    await fetch(`/api/endpoints/${endpointId}/command`, {
      method: 'POST',
      body: JSON.stringify({ command: 'setOn' })
    });
  };

  const setOff = async () => {
    await fetch(`/api/endpoints/${endpointId}/command`, {
      method: 'POST',
      body: JSON.stringify({ command: 'setOff' })
    });
  };

  return { state, setOn, setOff };
}
```

## Vantagens da Arquitetura

✅ **Flexível**: Endpoint pode usar qualquer driver compatível
✅ **Reutilizável**: Mesmo endpoint funciona com Modbus, MQTT, HTTP
✅ **Plug-and-Play**: Adicionar novo driver = endpoints automaticamente compatíveis
✅ **Type-safe**: Bindings são tipados e validados
✅ **Testável**: Endpoints podem ser testados com mock bindings
✅ **Escalável**: Novos tipos de endpoints sem modificar drivers

## Exemplo de Compatibilidade

```typescript
// DigitalOutput pode usar qualquer binding boolean
const compatibleBindings = [
  'modbus_coil',        // Modbus TCP Driver
  'mqtt_relay',         // MQTT Driver
  'http_switch',        // HTTP REST Driver
  'opcua_boolean',      // OPC-UA Driver
  'serial_relay',       // Serial/RS485 Driver
];

// Sistema automaticamente filtra bindings compatíveis
// baseado no tipo do endpoint
```

## Próximos Passos

1. ✅ Definir tipos de endpoints (DigitalOutput, AnalogInput, etc)
2. ✅ Definir tipos de bindings (BooleanBinding, NumberBinding, etc)
3. ✅ Criar exemplo de driver (Modbus TCP)
4. ✅ Criar exemplo de endpoint (DigitalOutput)
5. ⏳ Implementar compilador de drivers
6. ⏳ Implementar runtime de bindings
7. ⏳ Criar API de CRUD para drivers/endpoints
8. ⏳ Implementar UI no frontend