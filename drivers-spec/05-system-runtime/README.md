# System Runtime - Binding Architecture

Este diretório contém a implementação genérica do sistema de bindings.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    DRIVER (Modbus)                          │
│                                                             │
│  master = system.createBindingMaster('modbus', {            │
│    id: 'modbus_0'                                           │
│  });                                                        │
│                                                             │
│  master.on('write:coil', (data) => {                        │
│    modbusWriteCoil(data.address, data.value);              │
│  });                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│              SYSTEM (Binding Manager)                       │
│                                                             │
│  systemBindings.createBindingMaster()                       │
│  systemBindings.createBindingSlave()                        │
│  systemBindings.connectSlaveToMaster()                      │
│                                                             │
│  Roteia mensagens entre masters e slaves                   │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                 ENDPOINT (Digital Output)                   │
│                                                             │
│  slave = system.createBindingSlave({                        │
│    endpointId: this.id                                      │
│  });                                                        │
│                                                             │
│  await slave.connect('modbus_0');                           │
│  await slave.write('coil', 5, true);                        │
└─────────────────────────────────────────────────────────────┘
```

## Componentes

### 1. BindingMaster ([binding-master.ts](binding-master.ts))

Classe genérica que representa o lado **Master** de um binding.

**Responsabilidades:**
- Registrar/desregistrar slaves conectados
- Rotear comandos dos slaves para event handlers do driver
- Fazer broadcast de atualizações de estado para slaves
- Gerenciar lifecycle (close)

**Criado por:** Drivers (Modbus, MQTT, HTTP, etc.)

**Exemplo:**
```typescript
const master = system.createBindingMaster('modbus', {
  id: 'modbus_factory',
  unitId: 1
});

// Escuta comandos dos slaves
master.on('write:coil', async (data) => {
  await modbusWriteCoil(data.address, data.value);
});

// Faz broadcast após polling
master.broadcastState('coil', 5, true);
```

### 2. BindingSlave ([binding-slave.ts](binding-slave.ts))

Classe genérica que representa o lado **Slave** de um binding.

**Responsabilidades:**
- Conectar/desconectar de um master
- Trocar de master dinamicamente
- Enviar comandos (write/read) ao master
- Receber atualizações de estado do master
- Registrar interesse em endereços específicos

**Criado por:** Endpoints (DigitalOutput, AnalogInput, etc.)

**Exemplo:**
```typescript
const slave = system.createBindingSlave({
  endpointId: 'pump_001',
  endpointType: 'DigitalOutput'
});

// Conecta ao master
await slave.connect('modbus_factory');

// Registra interesse em receber updates
slave.listenTo('coil', 5);

// Envia comandos
await slave.write('coil', 5, true);
const value = await slave.read('coil', 5);

// Recebe updates do master
slave.on('state:updated', (data) => {
  console.log('New value:', data.value);
});
```

### 3. SystemBindingsManager ([system-bindings.ts](system-bindings.ts))

Gerenciador central de todos os bindings do sistema.

**Responsabilidades:**
- Criar/remover masters e slaves
- Conectar slaves a masters
- Fazer roteamento de mensagens
- Fornecer APIs de gerenciamento
- Estatísticas e queries

**Singleton global:** `systemBindings`

**API:**
```typescript
// Criar master (chamado por drivers)
const master = systemBindings.createBindingMaster('modbus', config);

// Criar slave (chamado por endpoints)
const slave = systemBindings.createBindingSlave(config);

// Conectar slave a master
await systemBindings.connectSlaveToMaster(slaveId, masterId);

// Trocar master de um slave
await systemBindings.switchSlaveMaster(slaveId, newMasterId);

// Estatísticas
const stats = systemBindings.getStats();
```

## Fluxo de Comunicação

### Write Command (Endpoint → Driver)

```
1. Endpoint chama:
   await slave.write('coil', 5, true)

2. BindingSlave roteia para master:
   await master.handleSlaveWrite(slaveId, 'coil', 5, true)

3. BindingMaster emite evento:
   emit('write:coil', { slaveId, address: 5, value: true })

4. Driver processa:
   master.on('write:coil', async (data) => {
     await modbusWriteCoil(data.address, data.value);
   })

5. Driver faz broadcast do novo valor:
   master.broadcastState('coil', 5, true)

6. Todos os slaves escutando recebem:
   slave.notifyStateUpdate('coil', 5, true)
   slave.emit('state:updated', { value: true })
```

### Read Command (Endpoint → Driver)

```
1. Endpoint chama:
   const value = await slave.read('coil', 5)

2. BindingSlave roteia para master:
   const value = await master.handleSlaveRead(slaveId, 'coil', 5)

3. BindingMaster emite evento:
   const handlers = eventHandlers.get('read:coil')
   return await handlers[0]({ slaveId, address: 5 })

4. Driver processa e retorna:
   master.on('read:coil', async (data) => {
     const value = await modbusReadCoil(data.address);
     return value;
   })

5. Valor retorna ao endpoint:
   return value
```

### State Broadcast (Driver → Endpoints)

```
1. Driver faz polling ou recebe notificação:
   const value = await modbusReadCoil(5);

2. Driver faz broadcast:
   master.broadcastState('coil', 5, value)

3. Master notifica slaves interessados:
   for (const slave of slaves) {
     if (slave.isListening('coil', 5)) {
       slave.notifyStateUpdate('coil', 5, value);
     }
   }

4. Slave emite evento para endpoint:
   slave.emit('state:updated', { value })

5. Endpoint atualiza estado:
   slave.on('state:updated', (data) => {
     this.state.value = data.value;
   })
```

## Binding Dinâmico

Um dos recursos mais poderosos é a capacidade de conectar/desconectar/trocar bindings em runtime.

### Conectar

```typescript
// Endpoint criado SEM binding
const endpoint = new DigitalOutputEndpoint('pump_001', 5);
await endpoint.initialize({}); // Não conectado

// Conectar dinamicamente
await endpoint.connectToBinding('modbus_factory');
```

### Desconectar

```typescript
await endpoint.disconnect();
// Endpoint fica inativo, mas não é destruído
```

### Trocar Binding

```typescript
// Trocar de um driver para outro
await endpoint.switchBinding('modbus_backup');

// Ou via system
await systemBindings.switchSlaveMaster('pump_001', 'modbus_backup');
```

## Casos de Uso

### 1. Failover Automático

```typescript
slave.on('master:closed', async () => {
  console.log('Primary binding lost, switching to backup...');
  await slave.connect('modbus_backup');
});
```

### 2. Load Balancing

```typescript
const drivers = ['modbus_1', 'modbus_2', 'modbus_3'];

endpoints.forEach((endpoint, index) => {
  const driverId = drivers[index % drivers.length];
  await endpoint.connectToBinding(driverId);
});
```

### 3. Manutenção Zero Downtime

```typescript
// Criar novo driver
const newDriver = await createDriver({ bindingId: 'modbus_v2' });

// Migrar endpoints um por um
for (const endpoint of endpoints) {
  await systemBindings.switchSlaveMaster(endpoint.id, 'modbus_v2');
  await delay(100); // Gradual
}

// Desligar driver antigo
await oldDriver.close();
```

### 4. Multi-Protocol

```typescript
// Mesmo endpoint pode trocar de protocolo
await endpoint.switchBinding('modbus_factory');  // Modbus TCP
await endpoint.switchBinding('mqtt_factory');    // MQTT
await endpoint.switchBinding('http_factory');    // HTTP REST
```

## API REST Sugerida

```typescript
// Listar bindings disponíveis
GET /api/bindings
→ [{ id: 'modbus_factory', type: 'modbus', slaveCount: 12 }]

// Ver endpoints de um binding
GET /api/bindings/:id/endpoints
→ [{ id: 'pump_001', name: 'Bomba Principal', type: 'DigitalOutput' }]

// Conectar endpoint
POST /api/endpoints/:id/connect
{ "bindingMasterId": "modbus_factory" }

// Desconectar endpoint
POST /api/endpoints/:id/disconnect

// Trocar binding
POST /api/endpoints/:id/switch
{ "bindingMasterId": "modbus_backup" }

// Migrar múltiplos endpoints
POST /api/bindings/migrate
{
  "from": "modbus_factory",
  "to": "modbus_backup",
  "endpointIds": ["pump_001", "pump_002"]
}

// Estatísticas
GET /api/stats
→ { totalMasters: 2, totalSlaves: 15, ... }
```

## Integração com System Global

O objeto `system` global fornecido ao runtime deve incluir:

```typescript
declare global {
  const system: {
    // Bindings
    createBindingMaster(type: string, config: any): BindingMaster;
    createBindingSlave(config: any): BindingSlave;

    // Acesso ao manager (opcional)
    bindings: SystemBindingsManager;

    // Outras primitivas
    tcp: { createSocket(): Socket };
    events: EventBus;
    log: Logger;
    time: { setTimeout(fn: Function, ms: number): void };
  };
}
```

## Vantagens

✅ **Desacoplamento** - Driver e Endpoint não se conhecem diretamente
✅ **Flexibilidade** - Endpoints podem trocar de driver em runtime
✅ **Failover** - Fallback automático para backup
✅ **Zero Downtime** - Migração sem parar o sistema
✅ **Multi-protocol** - Mesmo endpoint funciona com diferentes protocolos
✅ **Load Balancing** - Distribuir carga entre drivers
✅ **Testabilidade** - Mock bindings para testes
✅ **Event-driven** - Comunicação assíncrona
✅ **Type-safe** - TypeScript garante tipos corretos

## Próximos Passos

1. ✅ Implementar BindingMaster genérico
2. ✅ Implementar BindingSlave genérico
3. ✅ Implementar SystemBindingsManager
4. ✅ Criar exemplo de uso completo
5. ⏳ Implementar runtime real (sandbox, global system object)
6. ⏳ Implementar driver compiler (TypeScript → JS minified)
7. ⏳ Integrar com database (salvar drivers compilados)
8. ⏳ Criar APIs REST para gerenciamento
9. ⏳ Frontend para gerenciar bindings dinamicamente
