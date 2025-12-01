# Modbus TCP Driver - API Reference

## Visão Geral

Driver Modbus TCP Client completo com comunicação baseada em eventos via sistema de bidding.

## Configuração

### Config Schema

```javascript
{
  host: string,              // Endereço IP do servidor Modbus (padrão: '127.0.0.1')
  port: number,              // Porta TCP (padrão: 502)
  unitId: number,            // Identificador da unidade Modbus (padrão: 1)
  timeout: number,           // Timeout em ms (padrão: 5000)
  reconnectInterval: number, // Intervalo de reconexão em ms (padrão: 5000)
  autoReconnect: boolean     // Reconectar automaticamente (padrão: true)
}
```

## Eventos de Entrada (Comandos)

O driver escuta os seguintes eventos via bidding:

### 1. read-holding-registers

Lê registradores Holding (função Modbus 0x03).

```javascript
bidding.emit('read-holding-registers', {
  address: 0,        // Endereço inicial
  quantity: 10,      // Quantidade de registradores
  requestId: 'req-1' // ID único da requisição
});
```

**Resposta:** `read-holding-registers-response`

### 2. read-input-registers

Lê registradores Input (função Modbus 0x04).

```javascript
bidding.emit('read-input-registers', {
  address: 100,      // Endereço inicial
  quantity: 5,       // Quantidade de registradores
  requestId: 'req-2' // ID único da requisição
});
```

**Resposta:** `read-input-registers-response`

### 3. write-single-register

Escreve um único registrador (função Modbus 0x06).

```javascript
bidding.emit('write-single-register', {
  address: 50,       // Endereço do registrador
  value: 1234,       // Valor a escrever (16-bit)
  requestId: 'req-3' // ID único da requisição
});
```

**Resposta:** `write-single-register-response`

### 4. write-multiple-registers

Escreve múltiplos registradores (função Modbus 0x10).

```javascript
bidding.emit('write-multiple-registers', {
  address: 100,            // Endereço inicial
  values: [10, 20, 30],    // Array de valores (16-bit cada)
  requestId: 'req-4'       // ID único da requisição
});
```

**Resposta:** `write-multiple-registers-response`

### 5. read-coils

Lê coils/bobinas (função Modbus 0x01).

```javascript
bidding.emit('read-coils', {
  address: 0,        // Endereço inicial
  quantity: 16,      // Quantidade de coils
  requestId: 'req-5' // ID único da requisição
});
```

**Resposta:** `read-coils-response`

### 6. write-single-coil

Escreve uma única coil (função Modbus 0x05).

```javascript
bidding.emit('write-single-coil', {
  address: 10,       // Endereço da coil
  value: true,       // true ou false
  requestId: 'req-6' // ID único da requisição
});
```

**Resposta:** `write-single-coil-response`

## Eventos de Saída (Respostas e Notificações)

### Respostas de Comandos

#### read-holding-registers-response

```javascript
{
  requestId: 'req-1',
  success: true,
  address: 0,
  quantity: 10,
  values: [100, 200, 300, ...], // Array com os valores lidos
  timestamp: 1234567890
}
```

**Em caso de erro:**
```javascript
{
  requestId: 'req-1',
  success: false,
  address: 0,
  quantity: 10,
  error: 'Request timeout',
  timestamp: 1234567890
}
```

#### read-input-registers-response

Mesmo formato que `read-holding-registers-response`.

#### write-single-register-response

```javascript
{
  requestId: 'req-3',
  success: true,
  address: 50,
  value: 1234,
  timestamp: 1234567890
}
```

#### write-multiple-registers-response

```javascript
{
  requestId: 'req-4',
  success: true,
  address: 100,
  quantity: 3,
  timestamp: 1234567890
}
```

#### read-coils-response

```javascript
{
  requestId: 'req-5',
  success: true,
  address: 0,
  quantity: 16,
  values: [true, false, true, ...], // Array de booleanos
  timestamp: 1234567890
}
```

#### write-single-coil-response

```javascript
{
  requestId: 'req-6',
  success: true,
  address: 10,
  value: true,
  timestamp: 1234567890
}
```

### Eventos de Status

#### connection-status

Emitido quando o status da conexão muda.

```javascript
// Conectado
{
  status: 'connected',
  host: '192.168.1.100',
  port: 502,
  timestamp: 1234567890
}

// Desconectado
{
  status: 'disconnected',
  timestamp: 1234567890
}

// Fechado
{
  status: 'closed',
  timestamp: 1234567890
}
```

#### data-received

Emitido quando dados Modbus são recebidos (antes do processamento).

```javascript
{
  transactionId: 123,
  functionCode: 3,
  unitId: 1,
  dataLength: 5,
  timestamp: 1234567890
}
```

#### socket-error

Emitido quando ocorre erro no socket TCP.

```javascript
{
  message: 'Connection refused',
  timestamp: 1234567890
}
```

#### parse-error

Emitido quando ocorre erro ao processar resposta Modbus.

```javascript
{
  message: 'Response too short',
  timestamp: 1234567890
}
```

## Exemplo de Uso Completo

```javascript
const config = {
  host: '192.168.1.100',
  port: 502,
  unitId: 1,
  timeout: 5000,
  reconnectInterval: 5000,
  autoReconnect: true,
};

// Mock do sistema
const bidding = system.bidding.createMaster('modbus-tcp-events');

// Escuta eventos de status
bidding.on('connection-status', (data) => {
  console.log('Status da conexão:', data.status);
});

// Escuta respostas de leitura
bidding.on('read-holding-registers-response', (response) => {
  if (response.success) {
    console.log('Valores lidos:', response.values);
  } else {
    console.error('Erro na leitura:', response.error);
  }
});

// Inicializa o driver
await modbusDriver.onInit(system, config);

// Aguarda conexão
await new Promise(resolve => setTimeout(resolve, 1000));

// Faz uma leitura
bidding.emit('read-holding-registers', {
  address: 0,
  quantity: 10,
  requestId: 'read-1'
});

// Aguarda resposta
await new Promise(resolve => setTimeout(resolve, 2000));

// Finaliza
modbusDriver.onClose(system);
```

## Códigos de Função Modbus Suportados

- **0x01**: Read Coils
- **0x02**: Read Discrete Inputs (não implementado)
- **0x03**: Read Holding Registers
- **0x04**: Read Input Registers
- **0x05**: Write Single Coil
- **0x06**: Write Single Register
- **0x0F**: Write Multiple Coils (não implementado)
- **0x10**: Write Multiple Registers

## Tratamento de Erros

O driver trata automaticamente:

- **Timeout de requisições**: Configurable via `timeout`
- **Desconexões**: Reconexão automática se `autoReconnect: true`
- **Exceções Modbus**: Detecta function code com bit 0x80
- **Erros de parsing**: Valida tamanho mínimo de resposta

## Notas Importantes

1. **Transaction IDs**: Gerenciados automaticamente pelo driver
2. **Requisições concorrentes**: Suportadas via Map de pending requests
3. **Reconexão**: Automática com intervalo configurável
4. **Buffer management**: Usa Buffer do Node.js/Bun
5. **Timestamps**: Todos os eventos incluem timestamp em milissegundos

## Performance

- Transaction ID: 16-bit (0-65535, circular)
- Timeout padrão: 5 segundos
- Intervalo de reconexão: 5 segundos
- Sem limite de requisições pendentes (use com cuidado)
