# Driver Compiler

## Como funciona

O compilador processa o arquivo `.ts` do driver e:

1. **Extrai metadados** dos decorators
2. **Valida** se os contratos estão sendo cumpridos
3. **Compila e minifica** o código
4. **Gera bundle** pronto para execução

## Processo de Compilação

### 1. Parse e Extração

```typescript
import { parseSync } from '@swc/core';

const ast = parseSync(sourceCode, {
  syntax: 'typescript',
  decorators: true,
});

// Extrai metadados
const metadata = {
  driver: extractDriverDecorator(ast),  // @Driver({ name, version })
  network: extractNetworkDecorator(ast), // @UseNetwork({ type: 'tcp' })
  exports: extractExports(ast),          // @SwitchService, @InputService
  hooks: extractHooks(ast),              // @OnInit, @OnClose, etc
  polls: extractPolls(ast),              // @Poll({ interval })
};
```

### 2. Validação

```typescript
// Valida se os services implementam os contratos
metadata.exports.forEach((service) => {
  if (service.type === 'switch') {
    validateContract(service, ['setOn', 'setOff']);
  } else if (service.type === 'input') {
    validateContract(service, ['read']);
  }
});
```

### 3. Compilação e Minificação

```typescript
import { transformSync } from '@swc/core';

const compiled = transformSync(sourceCode, {
  jsc: {
    parser: { syntax: 'typescript', decorators: true },
    transform: { decoratorMetadata: true },
    target: 'es2022',
    minify: {
      compress: true,
      mangle: true,
    },
  },
});
```

### 4. Resultado Final

```typescript
{
  id: uuid(),
  name: "Modbus TCP Driver",
  version: "1.0.0",
  code: "class ModbusTCPDriver{constructor(){this.connected=false}async initialize(){...}", // Minificado
  metadata: {
    driver: {
      name: "Modbus TCP Driver",
      version: "1.0.0",
      description: "Driver para comunicação Modbus TCP/IP"
    },
    network: {
      type: "tcp",
      defaultPort: 502
    },
    exports: [
      {
        type: "switch",
        id: "switch_{{address}}",
        count: 16,
        addressStart: 0,
        methods: ["setOn", "setOff"]
      },
      {
        type: "input",
        id: "input_{{address}}",
        count: 8,
        addressStart: 100,
        methods: ["read"]
      }
    ],
    hooks: {
      onInit: "initialize",
      onClose: "cleanup",
      onConnect: "onConnect",
      onDisconnect: "onDisconnect",
      onError: "handleError"
    },
    polls: [
      {
        method: "updateStates",
        interval: 1000
      }
    ]
  }
}
```

## Execução do Driver

### 1. Carregar do Banco

```typescript
const driver = await db.query.drivers.findFirst({
  where: eq(drivers.id, driverId),
});
```

### 2. Preparar Runtime

```typescript
// Cria sandbox com system runtime injetado
const runtime = createSystemRuntime();
const driverConfig = controller.config; // { host, port, ... }

// Injeta globals
const sandbox = {
  system: runtime,
  config: driverConfig,
};
```

### 3. Executar Código

```typescript
import { VM } from 'vm2';

const vm = new VM({
  timeout: 10000,
  sandbox,
});

// Executa o código compilado
const DriverClass = vm.run(driver.code);

// Instancia
const instance = new DriverClass();

// Chama lifecycle hooks
await instance[driver.metadata.hooks.onInit](); // initialize()
```

### 4. Criar Services Automaticamente

```typescript
// Baseado nos exports do driver
driver.metadata.exports.forEach(async (exportDef) => {
  for (let i = 0; i < exportDef.count; i++) {
    const address = exportDef.addressStart + i;
    const serviceId = exportDef.id.replace('{{address}}', address.toString());

    // Cria service no banco
    await db.insert(services).values({
      controller_id: controller.id,
      type: exportDef.type,
      address,
      name: serviceId,
    });
  }
});

// Resultado:
// services = [
//   { type: "switch", address: 0, name: "switch_0" },
//   { type: "switch", address: 1, name: "switch_1" },
//   ...
//   { type: "input", address: 100, name: "input_100" },
//   ...
// ]
```

### 5. Setup Polling

```typescript
driver.metadata.polls.forEach((poll) => {
  setInterval(() => {
    instance[poll.method](); // updateStates()
  }, poll.interval);
});
```

## API de Upload

```typescript
POST /api/drivers
Content-Type: multipart/form-data

file: modbusTCP.ts
```

```typescript
// Handler
.post('/api/drivers', async ({ body, user }) => {
  // 1. Ler arquivo
  const sourceCode = await body.file.text();

  // 2. Compilar
  const compiled = await compileDriver(sourceCode);

  // 3. Validar
  validateDriverMetadata(compiled.metadata);

  // 4. Salvar no DB
  const driver = await db.insert(drivers).values({
    name: compiled.metadata.driver.name,
    version: compiled.metadata.driver.version,
    code: compiled.code,
    metadata: compiled.metadata,
    created_by: user.id,
  });

  return {
    success: true,
    driver: {
      id: driver.id,
      name: driver.name,
      version: driver.version,
    },
  };
});
```

## Exemplo de Uso no Frontend

### 1. Listar Drivers Disponíveis

```typescript
GET /api/drivers

Response:
[
  {
    id: "uuid-1",
    name: "Modbus TCP Driver",
    version: "1.0.0",
    exports: {
      switches: 16,
      inputs: 8
    }
  }
]
```

### 2. Criar Controller usando um Driver

```typescript
POST /api/controllers

{
  "name": "CLP Fábrica",
  "driver_id": "uuid-1",
  "config": {
    "host": "192.168.1.100",
    "port": 502,
    "timeout": 3000
  }
}

Response:
{
  "id": "controller-uuid",
  "name": "CLP Fábrica",
  "driver": {
    "name": "Modbus TCP Driver",
    "version": "1.0.0"
  },
  "services": [
    { "type": "switch", "address": 0, "name": "switch_0" },
    { "type": "switch", "address": 1, "name": "switch_1" },
    ...
    { "type": "input", "address": 100, "name": "input_100" },
    ...
  ]
}
```

### 3. Controlar um Switch

```typescript
POST /api/controllers/:id/services/:serviceId/command

{
  "command": "setOn"
}

// Internamente chama:
// instance.switches().setOn(address)
```

## Segurança

- ✅ Código roda em sandbox isolado (vm2)
- ✅ Timeout de 10 segundos por operação
- ✅ Sem acesso ao filesystem
- ✅ Sem acesso a process/require/import
- ✅ Apenas admin/super pode fazer upload de drivers
- ✅ Validação de código antes de salvar
