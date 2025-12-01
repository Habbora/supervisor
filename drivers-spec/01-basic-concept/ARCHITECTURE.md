# Driver Architecture

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                      DEVELOPER                              │
│  Escreve driver TypeScript com decorators                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Upload (.ts file)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      COMPILER                               │
│  • Parse TypeScript                                         │
│  • Extract metadata (@Driver, @SwitchService, etc)          │
│  • Validate contracts                                       │
│  • Compile & Minify                                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Save to DB
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                               │
│  drivers {                                                  │
│    id: uuid                                                 │
│    name: "Modbus TCP Driver"                                │
│    version: "1.0.0"                                         │
│    code: "class ModbusTCPDriver{...}" // minified           │
│    metadata: {                                              │
│      exports: [                                             │
│        { type: "switch", count: 16, addressStart: 0 },      │
│        { type: "input", count: 8, addressStart: 100 }       │
│      ]                                                      │
│    }                                                        │
│  }                                                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ User creates controller
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      RUNTIME                                │
│  1. Load driver code from DB                                │
│  2. Create sandbox with system runtime                      │
│  3. Inject config (host, port, etc)                         │
│  4. Execute driver code                                     │
│  5. Instantiate driver class                                │
│  6. Call lifecycle hooks (@OnInit)                          │
│  7. Auto-create services based on exports                   │
│  8. Setup polling (@Poll)                                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Services available
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICES                               │
│  • switch_0, switch_1, ..., switch_15                       │
│  • input_100, input_101, ..., input_107                     │
│                                                             │
│  Each service has:                                          │
│  - Commands (setOn, setOff, read)                           │
│  - State (on: boolean, value: boolean)                      │
│  - Events (state changes)                                   │
└─────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

### 1. Desenvolvimento

```typescript
// Developer writes driver
@Driver({ name: "Modbus TCP", version: "1.0.0" })
@UseNetwork({ type: "tcp" })
export class ModbusTCPDriver {
  @SwitchService({ count: 16, addressStart: 0 })
  async switches() { ... }
}
```

### 2. Upload & Compilação

```
POST /api/drivers
file: modbusTCP.ts
   ↓
[Compiler]
   ↓
{
  name: "Modbus TCP Driver",
  code: "minified code",
  metadata: { exports: [...] }
}
   ↓
[Database]
```

### 3. Criação de Controller

```
POST /api/controllers
{
  "name": "CLP Fábrica",
  "driver_id": "uuid-driver",
  "config": {
    "host": "192.168.1.100",
    "port": 502
  }
}
   ↓
[Runtime]
   ↓
1. Load driver code
2. Create sandbox:
   - system.network.createTcpSocket
   - system.modbus.*
   - config.host, config.port
3. Execute: new ModbusTCPDriver()
4. Call: driver.initialize()
5. Auto-create 24 services:
   - switch_0 to switch_15
   - input_100 to input_107
6. Start polling (1000ms)
```

### 4. Uso dos Services

```
POST /api/controllers/:id/services/switch_0/command
{ "command": "setOn" }
   ↓
[Runtime]
   ↓
driver.switches().setOn(0)
   ↓
system.modbus.writeCoil(0, true)
   ↓
system.network.send(buffer)
   ↓
[Physical Device]
   ↓
Switch 0 turns ON
   ↓
[Polling detects change]
   ↓
system.events.emit('switch:0:state', { on: true })
   ↓
[EventBus]
   ↓
[WebSocket to Frontend]
```

## Camadas da Arquitetura

### Layer 1: Driver Code (TypeScript)
- Desenvolvido pelo usuário
- Usa decorators para declarar exports
- Implementa contratos (SwitchService, InputService)
- Lifecycle hooks (@OnInit, @OnClose, etc)

### Layer 2: Compiler
- Parse & AST analysis
- Metadata extraction
- Contract validation
- Code minification
- Output: { code, metadata }

### Layer 3: Database
- Armazena drivers compilados
- Versioning
- Metadata indexado para queries

### Layer 4: Runtime (Sandbox)
- VM isolada (vm2)
- System runtime injetado
- Config injetado
- Execução segura do código

### Layer 5: Services
- Auto-gerados baseado nos exports
- Linked a devices
- Event-driven
- State management

### Layer 6: EventBus
- Comunicação entre services
- Publish/Subscribe
- WebSocket para frontend

## System Runtime API

```typescript
system = {
  network: {
    createTcpSocket(config) → TcpSocket
    createUdpSocket(config) → UdpSocket
  },

  modbus: {
    writeCoil(address, value) → Buffer
    readCoil(address) → Buffer
    readCoils(start, count) → Buffer
    parseCoil(buffer) → boolean
    parseCoils(buffer, count) → boolean[]
  },

  events: {
    emit(event, data) → void
    on(event, callback) → void
  },

  logger: {
    info, warn, error, debug
  },

  scheduler: {
    setTimeout, setInterval, clear*
  }
}
```

## Database Schema

```sql
-- Drivers (catálogo)
CREATE TABLE drivers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  code TEXT NOT NULL,              -- Código minificado
  metadata JSONB NOT NULL,         -- Exports, hooks, etc
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Controllers (instâncias)
CREATE TABLE controllers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  driver_id UUID REFERENCES drivers(id),
  config JSONB,                    -- { host, port, ... }
  created_at TIMESTAMP DEFAULT NOW()
);

-- Services (auto-gerados)
CREATE TABLE services (
  id UUID PRIMARY KEY,
  controller_id UUID REFERENCES controllers(id),
  type TEXT NOT NULL,              -- 'switch' | 'input'
  address INTEGER NOT NULL,
  name TEXT NOT NULL,              -- 'switch_0', 'input_100'
  enabled BOOLEAN DEFAULT TRUE
);
```

## Exemplo Completo: Ligar uma Lâmpada

```
1. User clicks "Ligar Lâmpada" no frontend
      ↓
2. Frontend envia: POST /api/devices/:deviceId/command { action: 'setOn' }
      ↓
3. Device está vinculado ao service 'switch_5' do controller 'CLP Fábrica'
      ↓
4. Backend chama: controller.executeCommand('switch_5', 'setOn')
      ↓
5. Runtime executa: driver.switches().setOn(5)
      ↓
6. Driver constrói comando Modbus: system.modbus.writeCoil(5, true)
      ↓
7. Driver envia via TCP: socket.send(buffer)
      ↓
8. PLC recebe comando e liga o relé 5
      ↓
9. Polling detecta mudança (1s depois)
      ↓
10. Driver emite evento: system.events.emit('switch:5:state', { on: true })
      ↓
11. EventBus propaga para todos os listeners
      ↓
12. WebSocket envia para frontend: { type: 'switch:5:state', data: { on: true } }
      ↓
13. Frontend atualiza UI: Lâmpada aparece como LIGADA
```

## Vantagens da Arquitetura

✅ **Extensível**: Novos drivers via upload
✅ **Type-safe**: Contratos forçados em compile-time
✅ **Seguro**: Sandbox isolado
✅ **Modular**: Drivers independentes
✅ **Versionável**: Múltiplas versões do mesmo driver
✅ **Auto-discovery**: Services criados automaticamente
✅ **Event-driven**: Real-time updates
✅ **Testável**: Drivers podem ser testados isoladamente
