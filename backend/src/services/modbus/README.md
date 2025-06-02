# Módulo Modbus

Este módulo fornece funcionalidades para comunicação com dispositivos Modbus TCP, permitindo leitura e escrita de registros e coils, além de monitoramento automático de mudanças.

## Estrutura

```
services/modbus/
├── README.md
├── index.ts
├── service.ts
├── types.ts
└── worker.ts
```

## Funcionalidades

- Comunicação Modbus TCP
- Leitura de registros e coils
- Escrita de registros e coils
- Polling automático
- Tratamento de erros
- Notificação de mudanças

## Como Usar

```typescript
import { ModbusWorker } from "./services/modbus";

// Criar instância do worker
const worker = new ModbusWorker({
  host: "192.168.1.100",
  port: 502,
  postMessage: (message) => {
    // Processar mensagens do worker
  }
});

// Inicializar o worker
await worker.initialize();

// Enviar mensagem para escrita
worker.handleMessage({
  id: "write-1",
  type: "WRITE",
  payload: {
    address: 0,
    value: 1,
    type: "coil"
  },
  timestamp: Date.now(),
  requestId: "req-1"
});
```

## Tipos de Mensagens

### Requisição (Request)
```typescript
{
  id: string;
  type: "WRITE" | "READ" | "STATUS" | "ERROR" | "UPDATE" | "SOCKET" | "FINISH";
  payload: {
    address: number;
    value?: number | boolean | number[];
    type: "coil" | "register";
    status?: boolean;
    error?: string;
    network?: string;
  };
  timestamp: number;
  requestId: string;
}
```

### Resposta (Response)
```typescript
{
  id: string;
  type: "WRITE" | "READ" | "STATUS" | "ERROR" | "UPDATE" | "SOCKET" | "FINISH";
  payload: {
    address: number;
    value?: number | boolean | number[];
    type: "coil" | "register";
    status?: boolean;
    error?: string;
  };
  timestamp: number;
  requestId: string;
  error?: string;
}
```

## Observações

- O polling é executado a cada 1 segundo
- Mudanças são detectadas comparando o estado atual com o último estado conhecido
- Erros de conexão são tratados e notificados via callback
- O worker mantém uma conexão persistente com o dispositivo Modbus 