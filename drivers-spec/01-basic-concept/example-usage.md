# Exemplo de Uso dos Drivers

## 1. Upload de Driver

### Request
```bash
curl -X POST http://localhost:3000/api/drivers \
  -H "Authorization: Bearer <token>" \
  -F "file=@modbusTCP.ts"
```

### Response
```json
{
  "success": true,
  "driver": {
    "id": "01943d7d-8d80-7000-ab0e-fecdf2ac4430",
    "name": "Modbus TCP Driver",
    "version": "1.0.0",
    "exports": {
      "switches": 16,
      "inputs": 8
    }
  }
}
```

## 2. Listar Drivers Disponíveis

### Request
```bash
curl http://localhost:3000/api/drivers \
  -H "Authorization: Bearer <token>"
```

### Response
```json
[
  {
    "id": "01943d7d-8d80-7000-ab0e-fecdf2ac4430",
    "name": "Modbus TCP Driver",
    "version": "1.0.0",
    "metadata": {
      "network": {
        "type": "tcp",
        "defaultPort": 502
      },
      "exports": [
        {
          "type": "switch",
          "count": 16,
          "addressStart": 0
        },
        {
          "type": "input",
          "count": 8,
          "addressStart": 100
        }
      ]
    }
  }
]
```

## 3. Criar Controller usando Driver

### Request
```bash
curl -X POST http://localhost:3000/api/controllers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CLP Fábrica",
    "driverId": "01943d7d-8d80-7000-ab0e-fecdf2ac4430",
    "config": {
      "host": "192.168.1.100",
      "port": 502,
      "timeout": 3000
    }
  }'
```

### Response
```json
{
  "success": true,
  "controller": {
    "id": "01943e2a-4f60-7000-9c1e-8ab2f1de5678",
    "name": "CLP Fábrica",
    "driver": {
      "id": "01943d7d-8d80-7000-ab0e-fecdf2ac4430",
      "name": "Modbus TCP Driver",
      "version": "1.0.0"
    },
    "config": {
      "host": "192.168.1.100",
      "port": 502,
      "timeout": 3000
    },
    "status": "connected",
    "services": [
      { "id": "switch_0", "type": "switch", "address": 0 },
      { "id": "switch_1", "type": "switch", "address": 1 },
      "... 14 more switches",
      { "id": "input_100", "type": "input", "address": 100 },
      { "id": "input_101", "type": "input", "address": 101 },
      "... 6 more inputs"
    ]
  }
}
```

## 4. Ligar um Switch

### Request
```bash
curl -X POST http://localhost:3000/api/controllers/01943e2a-4f60-7000-9c1e-8ab2f1de5678/services/switch_0/command \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "setOn"
  }'
```

### Response
```json
{
  "success": true,
  "service": "switch_0",
  "command": "setOn",
  "state": {
    "on": true
  }
}
```

## 5. Ler um Input

### Request
```bash
curl http://localhost:3000/api/controllers/01943e2a-4f60-7000-9c1e-8ab2f1de5678/services/input_100 \
  -H "Authorization: Bearer <token>"
```

### Response
```json
{
  "success": true,
  "service": "input_100",
  "type": "input",
  "address": 100,
  "state": {
    "value": true
  },
  "lastRead": "2025-01-14T12:34:56.789Z"
}
```

## 6. WebSocket - Receber Eventos em Tempo Real

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3000/ws?token=<token>');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event received:', data);
};
```

### Event Examples
```javascript
// Switch state changed
{
  "type": "switch:0:state",
  "controllerId": "01943e2a-4f60-7000-9c1e-8ab2f1de5678",
  "serviceId": "switch_0",
  "data": {
    "on": true
  },
  "timestamp": "2025-01-14T12:34:56.789Z"
}

// Input value changed
{
  "type": "input:100:value",
  "controllerId": "01943e2a-4f60-7000-9c1e-8ab2f1de5678",
  "serviceId": "input_100",
  "data": {
    "value": false
  },
  "timestamp": "2025-01-14T12:34:57.123Z"
}

// Driver connected
{
  "type": "driver:connected",
  "controllerId": "01943e2a-4f60-7000-9c1e-8ab2f1de5678",
  "data": {
    "host": "192.168.1.100",
    "port": 502
  },
  "timestamp": "2025-01-14T12:30:00.000Z"
}

// Driver error
{
  "type": "driver:error",
  "controllerId": "01943e2a-4f60-7000-9c1e-8ab2f1de5678",
  "data": {
    "error": "Connection timeout"
  },
  "timestamp": "2025-01-14T12:35:00.000Z"
}
```

## 7. Vincular Service a Device

### Request
```bash
curl -X POST http://localhost:3000/api/devices/light-123/bind \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "controllerId": "01943e2a-4f60-7000-9c1e-8ab2f1de5678",
    "serviceId": "switch_5"
  }'
```

### Response
```json
{
  "success": true,
  "device": {
    "id": "light-123",
    "name": "Lâmpada Sala",
    "type": "light",
    "binding": {
      "controllerId": "01943e2a-4f60-7000-9c1e-8ab2f1de5678",
      "serviceId": "switch_5",
      "type": "switch",
      "address": 5
    }
  }
}
```

## 8. Controlar Device (Abstração)

Depois de vinculado, o device pode ser controlado diretamente:

### Request
```bash
curl -X POST http://localhost:3000/api/devices/light-123/command \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "setOn"
  }'
```

### Internamente
```
1. Resolve binding: light-123 → controller/switch_5
2. Chama: controller.executeCommand('switch_5', 'setOn')
3. Driver executa: switches().setOn(5)
4. Modbus: writeCoil(5, true)
5. TCP: send to 192.168.1.100:502
6. PLC liga relé 5
7. Polling detecta mudança
8. Event: switch:5:state { on: true }
9. WebSocket broadcast
10. Frontend atualiza UI
```

## Frontend Integration Example

```typescript
// React hook para controlar um device
function useDevice(deviceId: string) {
  const [state, setState] = useState({ power: false });
  const { token } = useAuth();

  useEffect(() => {
    // WebSocket para receber updates
    const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Filtra eventos deste device
      if (data.deviceId === deviceId) {
        setState(data.state);
      }
    };

    return () => ws.close();
  }, [deviceId, token]);

  const setOn = async () => {
    await fetch(`/api/devices/${deviceId}/command`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'setOn' }),
    });
  };

  const setOff = async () => {
    await fetch(`/api/devices/${deviceId}/command`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'setOff' }),
    });
  };

  return { state, setOn, setOff };
}

// Uso no componente
function LightControl({ deviceId }: { deviceId: string }) {
  const { state, setOn, setOff } = useDevice(deviceId);

  return (
    <div>
      <h3>Lâmpada {state.power ? '💡 LIGADA' : '⚫ DESLIGADA'}</h3>
      <button onClick={setOn}>Ligar</button>
      <button onClick={setOff}>Desligar</button>
    </div>
  );
}
```

## Testing the Driver

```typescript
// test-modbus-driver.ts

import { ModbusTCPDriver } from './modbusTCP';
import { createMockSystem } from './test-utils';

describe('ModbusTCP Driver', () => {
  let driver: ModbusTCPDriver;
  let mockSystem: any;

  beforeEach(() => {
    mockSystem = createMockSystem({
      host: '192.168.1.100',
      port: 502,
    });

    // Inject mock system
    global.system = mockSystem;
    global.config = { host: '192.168.1.100', port: 502 };

    driver = new ModbusTCPDriver();
  });

  test('should connect on init', async () => {
    await driver.initialize();
    expect(mockSystem.network.createTcpSocket).toHaveBeenCalledWith({
      host: '192.168.1.100',
      port: 502,
      timeout: 5000,
    });
  });

  test('should turn on switch', async () => {
    await driver.initialize();
    const switches = await driver.switches();

    await switches.setOn(5);

    expect(mockSystem.modbus.writeCoil).toHaveBeenCalledWith(5, true);
    expect(mockSystem.events.emit).toHaveBeenCalledWith('switch:5:state', { on: true });
  });

  test('should read input', async () => {
    mockSystem.modbus.parseCoil.mockReturnValue(true);

    await driver.initialize();
    const inputs = await driver.inputs();

    const value = await inputs.read(100);

    expect(value).toBe(true);
    expect(mockSystem.modbus.readCoil).toHaveBeenCalledWith(100);
  });
});
```
