# Problema Atual do Sistema

## Contexto

Estou desenvolvendo um sistema de automação industrial que precisa controlar dispositivos através de diferentes protocolos (Modbus TCP, MQTT, HTTP, etc.).

## Arquitetura Atual (Limitada)

Atualmente, o sistema tem uma arquitetura **rígida e acoplada**:

```
┌──────────────────────────────────────────────┐
│           Backend Monolítico                 │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │  Código hardcoded para cada        │     │
│  │  tipo de dispositivo               │     │
│  │                                    │     │
│  │  - ModbusService (fixo no código)  │     │
│  │  - DeviceService (fixo no código)  │     │
│  │  - Lógica acoplada                 │     │
│  └────────────────────────────────────┘     │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │  Database (PostgreSQL)             │     │
│  │  - Devices (endereços fixos)       │     │
│  │  - Controllers (configs estáticas) │     │
│  └────────────────────────────────────┘     │
└──────────────────────────────────────────────┘
```

## Problemas Identificados

### 1. **Falta de Flexibilidade**
- Para adicionar um novo protocolo, preciso modificar o código do backend
- Não consigo adicionar drivers dinamicamente
- Cada novo tipo de dispositivo exige deploy completo

### 2. **Acoplamento Forte**
- Devices estão acoplados diretamente aos Controllers
- Se um controller falhar, todos os devices param
- Não há abstração entre protocolo e endpoint

### 3. **Impossível Fazer Hot-Swap**
- Não consigo trocar um device de um controller para outro sem restart
- Não há failover automático
- Manutenção exige downtime

### 4. **Difícil de Testar**
- Preciso de hardware real para testar
- Não consigo mockar protocolos facilmente
- Testes end-to-end são complexos

### 5. **Limitado a Modbus**
- Sistema atual só funciona com Modbus TCP
- Para adicionar MQTT, HTTP, OPC-UA, etc., preciso reescrever muito código
- Cada protocolo tem sua própria implementação isolada

## O Que Eu Preciso

### Sistema Similar ao Control4/Savant

Quero um sistema onde:

1. **Drivers são módulos dinâmicos** que podem ser:
   - Carregados em runtime
   - Atualizados sem parar o sistema
   - Desenvolvidos independentemente
   - Armazenados no banco como código compilado

2. **Endpoints são agnósticos de protocolo**:
   - Um `DigitalOutput` funciona com qualquer driver
   - Posso trocar um relay de Modbus para MQTT sem mudar o endpoint
   - Endpoints podem se conectar/desconectar dinamicamente

3. **Bindings flexíveis**:
   - Driver exporta um `BindingMaster`
   - Endpoint cria um `BindingSlave`
   - Sistema gerencia a conexão entre eles
   - Posso trocar bindings em runtime (failover, load balancing)

4. **Zero Downtime**:
   - Posso atualizar drivers sem parar o sistema
   - Posso migrar endpoints entre drivers gradualmente
   - Failover automático se um driver falhar

## Exemplo de Caso de Uso

### Cenário: Bomba de Água com Redundância

```typescript
// 1. Criar dois drivers Modbus (principal e backup)
const mainDriver = await createDriver({
  name: 'CLP Principal',
  type: 'modbus_tcp',
  bindingId: 'modbus_main',
  config: { host: '192.168.1.100', port: 502 }
});

const backupDriver = await createDriver({
  name: 'CLP Backup',
  type: 'modbus_tcp',
  bindingId: 'modbus_backup',
  config: { host: '192.168.1.200', port: 502 }
});

// 2. Criar endpoint da bomba (SEM binding inicialmente)
const pump = await createEndpoint({
  name: 'Bomba Principal',
  type: 'DigitalOutput',
  address: 5
});

// 3. Conectar ao driver principal
await pump.connectToBinding('modbus_main');

// 4. Usar normalmente
await pump.setOn();  // ✅ Funciona via modbus_main

// 5. Se o driver principal falhar...
// Sistema detecta e faz failover automático:
await pump.switchBinding('modbus_backup');

// 6. Continua funcionando
await pump.setOn();  // ✅ Agora funciona via modbus_backup
```

## Solução Proposta

### Arquitetura com Bindings

```
┌─────────────────────────────────────────────────────────┐
│                    DRIVER (Plugin)                      │
│  Código TypeScript compilado e salvo no banco           │
│                                                         │
│  const master = system.createBindingMaster('modbus', {  │
│    id: 'modbus_main'                                    │
│  });                                                    │
│                                                         │
│  master.on('write:coil', async (data) => {              │
│    await modbusWriteCoil(data.address, data.value);    │
│  });                                                    │
└─────────────────────────────────────────────────────────┘
                          ↕ Binding Channel
┌─────────────────────────────────────────────────────────┐
│              SYSTEM RUNTIME (Gerenciador)               │
│                                                         │
│  - Carrega drivers do banco                             │
│  - Cria sandboxes isolados                              │
│  - Gerencia BindingMasters e BindingSlaves              │
│  - Roteia mensagens entre masters e slaves              │
│  - Fornece primitivas (tcp, events, log)                │
└─────────────────────────────────────────────────────────┘
                          ↕ Binding Channel
┌─────────────────────────────────────────────────────────┐
│                  ENDPOINT (Configurável)                │
│  Configuração salva no banco                            │
│                                                         │
│  const slave = system.createBindingSlave({              │
│    endpointId: 'pump_001',                              │
│    endpointType: 'DigitalOutput'                        │
│  });                                                    │
│                                                         │
│  await slave.connect('modbus_main');                    │
│  await slave.write('coil', 5, true);                    │
└─────────────────────────────────────────────────────────┘
```

## Vantagens da Nova Arquitetura

### ✅ Flexibilidade Total
- Adicionar novos drivers sem deploy
- Atualizar drivers em runtime
- Desenvolver drivers independentemente

### ✅ Desacoplamento
- Endpoints não conhecem o protocolo
- Drivers não conhecem os endpoints
- Sistema gerencia tudo

### ✅ Failover e Redundância
- Múltiplos drivers para o mesmo equipamento
- Troca automática se um falhar
- Zero downtime em manutenções

### ✅ Multi-Protocolo
- Mesmo endpoint funciona com qualquer protocolo
- Trocar de Modbus para MQTT é só mudar o binding
- Testar com mock drivers

### ✅ Load Balancing
- Distribuir endpoints entre múltiplos drivers
- Otimizar performance
- Evitar sobrecarga

### ✅ Testabilidade
- Mock drivers para testes
- Não precisa de hardware real
- Testes unitários e de integração simples

## Estado Atual da Solução

Já criei a especificação completa em `drivers-spec/`:

### ✅ Concluído

1. **Tipos de Endpoints** (`02-endpoint-types/`)
   - DigitalOutput (DO), DigitalInput (DI)
   - AnalogOutput (AO), AnalogInput (AI)
   - Dimmer, Counter, Register

2. **Arquitetura de Binding** (`03-binding-architecture/`)
   - Decorators (@Driver, @Endpoint, @OnInit, @OnClose, @Poll)
   - Interfaces de binding

3. **Exemplos** (`04-examples/`)
   - Driver Modbus TCP completo
   - Endpoint DigitalOutput dinâmico
   - Casos de uso (failover, load balancing, etc.)

4. **Runtime Genérico** (`05-system-runtime/`)
   - BindingMaster (lado do driver)
   - BindingSlave (lado do endpoint)
   - SystemBindingsManager (gerenciador central)
   - Exemplos de uso completos

### ⏳ Próximos Passos

1. **Implementar Runtime Real**
   - Sandbox para executar drivers isoladamente
   - Global `system` object com primitivas
   - Loader de drivers do banco

2. **Compilador de Drivers**
   - Parser de TypeScript com decorators
   - Extração de metadados
   - Compilação e minificação com Bun
   - Armazenamento no banco

3. **Backend Integration**
   - APIs REST para gerenciar drivers/endpoints/bindings
   - WebSocket para comunicação em tempo real
   - Persistência no PostgreSQL

4. **Frontend**
   - Interface para upload de drivers
   - Gerenciamento de bindings
   - Visualização de estado em tempo real
   - Drag-and-drop para conectar endpoints a drivers

## Por Que Isso Resolve Meu Problema?

### Antes (Sistema Atual)
```typescript
// Criar device direto no código
const device = new ModbusDevice({
  controllerId: 'clp1',  // Acoplado ao controller
  address: 5
});

// Se o controller falhar → device para
// Para mudar de controller → precisa recriar device
// Para adicionar MQTT → precisa modificar código
```

### Depois (Sistema com Bindings)
```typescript
// Criar endpoint abstrato
const pump = await createEndpoint({
  type: 'DigitalOutput',
  address: 5
  // NÃO está acoplado a nenhum driver ainda
});

// Conectar dinamicamente ao driver que eu quiser
await pump.connectToBinding('modbus_clp1');  // Modbus
// ou
await pump.connectToBinding('mqtt_broker');  // MQTT
// ou
await pump.connectToBinding('http_api');     // HTTP

// Se o driver falhar → troca automaticamente
// Para mudar de driver → só trocar o binding
// Para adicionar MQTT → só criar novo driver (sem tocar no código)
```

## Resumo

**Problema**: Sistema rígido, acoplado, sem flexibilidade para hot-swap ou multi-protocolo

**Solução**: Arquitetura baseada em bindings dinâmicos (Master/Slave) inspirada em Control4/Savant

**Benefícios**: Flexibilidade total, zero downtime, multi-protocolo, failover automático, fácil de testar

**Status**: Especificação completa, pronto para implementar o runtime
