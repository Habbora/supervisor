# Conceito de Bindings

## Arquitetura Master/Slave

O sistema usa **bindings** como canais de comunicação entre drivers e endpoints.

```
┌─────────────────────────────────────────────────────────────┐
│                    DRIVER (Master)                          │
│  Modbus TCP Client                                          │
│                                                             │
│  binding = system.createBindingMaster('modbus', {           │
│    id: 'modbus_0',                                          │
│    socket: this.socket                                      │
│  });                                                        │
│                                                             │
│  binding.write('coil', 5, true)  ← Escreve no canal         │
│  binding.read('coil', 5)         ← Lê do canal              │
└─────────────────────────────────────────────────────────────┘
                          ↕ Binding Channel
┌─────────────────────────────────────────────────────────────┐
│                   SYSTEM (Binding Manager)                  │
│  Gerencia canais de comunicação                             │
│                                                             │
│  BindingMaster ←→ BindingSlave                              │
│                                                             │
│  Roteia mensagens entre master e slaves                     │
└─────────────────────────────────────────────────────────────┘
                          ↕ Binding Channel
┌─────────────────────────────────────────────────────────────┐
│                   ENDPOINT (Slave)                          │
│  DigitalOutput - "Bomba Principal"                          │
│                                                             │
│  binding = system.connectToBinding('modbus_0');             │
│                                                             │
│  await binding.write(5, true)  ← Envia comando ao master    │
│  value = await binding.read(5) ← Recebe do master           │
└─────────────────────────────────────────────────────────────┘
```

## Fluxo de Comunicação

### 1. Driver cria BindingMaster
```typescript
// Driver Modbus
@OnInit()
async initialize() {
  this.socket = system.tcp.createSocket();
  await this.socket.connect(config.host, 502);

  // Cria binding master
  this.binding = system.createBindingMaster('modbus', {
    id: 'modbus_0',
    socket: this.socket,
    unitId: 1
  });
}
```

### 2. Endpoint conecta como BindingSlave
```typescript
// Endpoint DO
@OnInit()
async initialize() {
  // Conecta ao binding master
  this.binding = await system.connectToBinding('modbus_0');

  this.config.address = 5; // Endereço Modbus
}
```

### 3. Comunicação através do Binding
```typescript
// Endpoint envia comando
await endpoint.setOn();
  → binding.write(address, true)
  → system routing
  → bindingMaster.write('coil', address, true)
  → driver executa Modbus Write Coil
  → socket.send(modbusPacket)
```

## System API

### CreateBindingMaster
```typescript
system.createBindingMaster(type: string, config: object): BindingMaster

// Tipos disponíveis:
- 'modbus'  → Modbus binding
- 'mqtt'    → MQTT binding
- 'http'    → HTTP binding
- 'serial'  → Serial binding
```

### ConnectToBinding
```typescript
system.connectToBinding(bindingId: string): Promise<BindingSlave>

// Retorna um slave conectado ao master
```

### BindingMaster Interface
```typescript
interface BindingMaster {
  id: string;
  type: string;

  // Envia comando
  write(type: string, address: number, value: any): Promise<void>;

  // Lê valor
  read(type: string, address: number): Promise<any>;

  // Eventos
  on(event: string, callback: Function): void;
  emit(event: string, data: any): void;

  // Fecha binding
  close(): Promise<void>;
}
```

### BindingSlave Interface
```typescript
interface BindingSlave {
  masterId: string;

  // Envia comando ao master
  write(address: number, value: any): Promise<void>;

  // Lê do master
  read(address: number): Promise<any>;

  // Eventos
  on(event: string, callback: Function): void;

  // Desconecta
  disconnect(): Promise<void>;
}
```

## Exemplo Completo

### Driver Modbus (Master)
```typescript
@Driver({ name: "Modbus TCP" })
export class ModbusTCPDriver {
  private socket: any;
  private bindingMaster: any;

  @OnInit()
  async initialize() {
    // Socket TCP
    this.socket = system.tcp.createSocket();
    await this.socket.connect(config.host, config.port);

    // Cria binding master
    this.bindingMaster = system.createBindingMaster('modbus', {
      id: config.bindingId || 'modbus_0',
      socket: this.socket,
      unitId: config.unitId || 1,
      timeout: 5000
    });

    // Escuta comandos dos slaves
    this.bindingMaster.on('write:coil', async (data) => {
      const { address, value } = data;
      await this.modbusWriteCoil(address, value);
    });

    this.bindingMaster.on('read:coil', async (data) => {
      const { address } = data;
      const value = await this.modbusReadCoil(address);
      return value;
    });
  }

  private async modbusWriteCoil(address: number, value: boolean) {
    // Lógica Modbus real
    const packet = this.buildModbusPacket(0x05, address, value);
    await this.socket.send(packet);
  }
}
```

### Endpoint DO (Slave)
```typescript
@Endpoint({ type: "DigitalOutput" })
export class DOEndpoint implements DigitalOutput {
  private binding: any;
  private address = 0;

  @OnInit()
  async initialize() {
    // Conecta ao binding master
    this.binding = await system.connectToBinding(config.bindingId);
    this.address = config.address;
  }

  async setOn() {
    // Envia comando ao master via binding
    await this.binding.write(this.address, true);
  }

  async setOff() {
    await this.binding.write(this.address, false);
  }

  async read() {
    // Lê do master via binding
    const value = await this.binding.read(this.address);
    return value;
  }
}
```

## Vantagens

✅ **Desacoplamento** - Driver e Endpoint não se conhecem diretamente
✅ **Roteamento** - System gerencia comunicação
✅ **Multiple Slaves** - Vários endpoints no mesmo driver
✅ **Type-safe** - Binding valida tipos de dados
✅ **Event-driven** - Comunicação assíncrona
✅ **Testável** - Mock bindings para testes

## Database

```sql
-- Drivers com binding masters
CREATE TABLE drivers (
  id UUID PRIMARY KEY,
  name TEXT,
  binding_master_id TEXT, -- 'modbus_0'
  config JSONB
);

-- Endpoints conectados a bindings
CREATE TABLE endpoints (
  id UUID PRIMARY KEY,
  name TEXT,
  type TEXT,              -- 'DigitalOutput'
  binding_master_id TEXT, -- 'modbus_0'
  address INTEGER,
  config JSONB
);
```

## Próximos Passos

1. Implementar BindingMaster/Slave no system runtime
2. Criar roteamento de mensagens
3. Adicionar validação de tipos
4. Implementar event bus para bindings
