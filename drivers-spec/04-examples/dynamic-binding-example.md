# Exemplo: Binding Dinâmico

## Conceito

Endpoints podem ser criados **sem binding** e conectados/desconectados dinamicamente em runtime.

## Fluxo de Uso

### 1. Criar Driver (Binding Master)

```typescript
POST /api/drivers

{
  "name": "CLP Fábrica",
  "driverType": "modbus_tcp",
  "config": {
    "host": "192.168.1.100",
    "port": 502,
    "bindingId": "modbus_factory" // ID do binding master
  }
}

Response:
{
  "id": "driver-uuid-123",
  "bindingMasterId": "modbus_factory",
  "status": "connected"
}
```

### 2. Criar Endpoint SEM Binding

```typescript
POST /api/endpoints

{
  "name": "Bomba Principal",
  "type": "DigitalOutput",
  "config": {
    "address": 5
    // NÃO especifica bindingMasterId
  }
}

Response:
{
  "id": "endpoint-uuid-456",
  "name": "Bomba Principal",
  "type": "DigitalOutput",
  "address": 5,
  "connected": false,      // ← NÃO conectado
  "bindingMaster": null
}
```

### 3. Conectar Dinamicamente

```typescript
POST /api/endpoints/endpoint-uuid-456/connect

{
  "bindingMasterId": "modbus_factory"
}

Response:
{
  "success": true,
  "endpoint": "Bomba Principal",
  "connected": true,
  "bindingMaster": "modbus_factory"
}
```

### 4. Usar o Endpoint

```typescript
POST /api/endpoints/endpoint-uuid-456/command

{
  "command": "setOn"
}

// Agora funciona porque está conectado!
Response:
{
  "success": true,
  "state": { "value": true }
}
```

### 5. Desconectar

```typescript
POST /api/endpoints/endpoint-uuid-456/disconnect

Response:
{
  "success": true,
  "connected": false,
  "bindingMaster": null
}
```

### 6. Trocar de Binding

```typescript
// Criar segundo driver
POST /api/drivers
{
  "name": "CLP Backup",
  "driverType": "modbus_tcp",
  "config": {
    "host": "192.168.1.200",
    "port": 502,
    "bindingId": "modbus_backup"
  }
}

// Trocar endpoint para o novo binding
POST /api/endpoints/endpoint-uuid-456/switch

{
  "bindingMasterId": "modbus_backup"
}

Response:
{
  "success": true,
  "previousBinding": "modbus_factory",
  "currentBinding": "modbus_backup"
}
```

## Casos de Uso

### 1. Failover Automático

```typescript
// Endpoint monitora binding master
bindingSlave.on('disconnected', async () => {
  system.log.warn('Primary binding lost, switching to backup...');

  // Tenta conectar ao backup
  await endpoint.switchBinding('modbus_backup');
});
```

### 2. Load Balancing

```typescript
// Distribuir endpoints entre múltiplos drivers
const drivers = ['modbus_1', 'modbus_2', 'modbus_3'];
const endpoints = [...]; // Lista de endpoints

endpoints.forEach((endpoint, index) => {
  const driverId = drivers[index % drivers.length];
  await endpoint.connectToBinding(driverId);
});
```

### 3. Manutenção sem Downtime

```typescript
// 1. Criar novo driver (versão atualizada)
const newDriver = await createDriver({ bindingId: 'modbus_v2' });

// 2. Migrar endpoints um por um
for (const endpoint of endpoints) {
  await endpoint.switchBinding('modbus_v2');
  await delay(100); // Gradual
}

// 3. Desligar driver antigo
await oldDriver.close();
```

### 4. Multi-protocol

```typescript
// Endpoint pode trocar de protocolo dinamicamente
await endpoint.switchBinding('modbus_factory');  // Modbus
await endpoint.switchBinding('mqtt_factory');    // MQTT
await endpoint.switchBinding('http_factory');    // HTTP
```

## API de Gerenciamento

### Listar Bindings Disponíveis

```typescript
GET /api/bindings

Response:
[
  {
    "id": "modbus_factory",
    "type": "modbus",
    "driverId": "driver-uuid-123",
    "status": "connected",
    "connectedEndpoints": 12
  },
  {
    "id": "modbus_backup",
    "type": "modbus",
    "driverId": "driver-uuid-789",
    "status": "connected",
    "connectedEndpoints": 0
  }
]
```

### Ver Endpoints de um Binding

```typescript
GET /api/bindings/modbus_factory/endpoints

Response:
[
  {
    "id": "endpoint-uuid-456",
    "name": "Bomba Principal",
    "type": "DigitalOutput",
    "address": 5
  },
  // ... mais endpoints
]
```

### Mover Múltiplos Endpoints

```typescript
POST /api/bindings/migrate

{
  "from": "modbus_factory",
  "to": "modbus_backup",
  "endpointIds": ["uuid-1", "uuid-2", "uuid-3"]
}

Response:
{
  "success": true,
  "migrated": 3,
  "failed": 0
}
```

## Frontend Integration

```typescript
function EndpointControl({ endpointId }: { endpointId: string }) {
  const [endpoint, setEndpoint] = useState<any>(null);
  const [bindings, setBindings] = useState<any[]>([]);

  // Carrega endpoint e bindings disponíveis
  useEffect(() => {
    loadEndpoint();
    loadBindings();
  }, []);

  const handleConnect = async (bindingId: string) => {
    await fetch(`/api/endpoints/${endpointId}/connect`, {
      method: 'POST',
      body: JSON.stringify({ bindingMasterId: bindingId })
    });
    loadEndpoint();
  };

  const handleDisconnect = async () => {
    await fetch(`/api/endpoints/${endpointId}/disconnect`, {
      method: 'POST'
    });
    loadEndpoint();
  };

  return (
    <div>
      <h3>{endpoint?.name}</h3>

      {/* Status */}
      <div>
        Status: {endpoint?.connected ? '🟢 Connected' : '🔴 Disconnected'}
        {endpoint?.bindingMaster && ` to ${endpoint.bindingMaster}`}
      </div>

      {/* Seletor de Binding */}
      <select onChange={(e) => handleConnect(e.target.value)}>
        <option value="">Disconnect</option>
        {bindings.map(binding => (
          <option key={binding.id} value={binding.id}>
            {binding.id} ({binding.type})
          </option>
        ))}
      </select>

      {/* Controle (só funciona se conectado) */}
      <button
        onClick={() => endpoint.setOn()}
        disabled={!endpoint?.connected}
      >
        Turn ON
      </button>
    </div>
  );
}
```

## Vantagens

✅ **Flexibilidade** - Endpoints podem trocar de driver em runtime
✅ **Failover** - Fallback automático para backup
✅ **Zero Downtime** - Migração sem parar o sistema
✅ **Multi-protocol** - Mesmo endpoint pode usar diferentes protocolos
✅ **Load Balancing** - Distribuir carga entre drivers
✅ **Testabilidade** - Conectar a mock bindings para testes
