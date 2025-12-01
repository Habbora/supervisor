# Getting Started - Drivers Modbus + Validador + Compilador

Guia rápido para usar todo o sistema.

## 📦 O que você tem agora

1. **5 Drivers Modbus** (TypeScript compilado para JS)
   - `modbus-tcp-client-v2.js` - Cliente Modbus TCP
   - `modbus-coil-v2.js` - Saída digital (ON/OFF)
   - `modbus-discrete-input-v2.js` - Entrada digital (sensores)
   - `modbus-input-register-v2.js` - Sensor analógico
   - `modbus-holding-register-v2.js` - Setpoint/parâmetro

2. **Validador** (TypeScript + JavaScript compilado)
   - `validator.ts` - Código fonte TypeScript
   - `validator.js` - Compilado para JavaScript

3. **Compilador Bun**
   - `compiler.ts` - Compilador TS → JS
   - `build.ts` - Build script completo

---

## 🚀 Quick Start

### 1. Compilar TypeScript para JavaScript

```bash
# Compilar um arquivo
bun compiler.ts validator.ts

# Compilar tudo
bun build.ts

# Watch mode (recompila ao modificar)
bun compiler.ts validator.ts --watch
```

### 2. Usar os Drivers

```typescript
// Importa drivers
const modbusClient = require('./modbus-tcp-client-v2');
const coilDriver = require('./modbus-coil-v2');

// Mock do sistema (você vai substituir pelo seu)
const system = {
  log: console.log,
  network: { createTcpSocket: Bun.connect },
  bidding: {
    createMaster: (name) => ({ on: () => {}, emit: () => {} }),
    createSlave: (name) => ({ on: () => {}, emit: () => {} })
  }
};

// 1. Inicializa cliente Modbus
const client = await modbusClient.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  host: '192.168.1.100',
  port: 502,
  unitId: 1,
});

// 2. Cria driver de coil (bomba)
const bomba = await coilDriver.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  address: 0,
  label: 'Bomba Principal',
  readOnly: false,
});

// 3. Usa a bomba
bomba.set(true);   // Liga
bomba.set(false);  // Desliga
bomba.toggle();    // Inverte
bomba.pulse(1000); // Pulso de 1 segundo

// 4. Fecha quando terminar
bomba.close();
client.close();
```

### 3. Validar Configurações

```typescript
const validator = require('./validator');

// Schema do driver
const schema = {
  host: {
    name: 'Host',
    type: 'string',
    required: true,
    default: '127.0.0.1',
  },
  port: {
    name: 'Port',
    type: 'number',
    required: true,
    min: 1,
    max: 65535,
  },
};

// Config do usuário
const config = {
  host: '192.168.1.100',
  port: 502,
};

// Valida (com defaults aplicados)
const result = validator.validate(schema, config);

if (!result.valid) {
  console.error('Config inválido:', result.errors);
  process.exit(1);
}

// Usa config validado
console.log('Config válido:', result.config);
```

---

## 🎯 Exemplos Práticos

### Exemplo 1: Sistema de Tanque de Água

```typescript
const modbusClient = require('./modbus-tcp-client-v2');
const coilDriver = require('./modbus-coil-v2');
const inputRegisterDriver = require('./modbus-input-register-v2');

// Inicializa cliente Modbus
const client = await modbusClient.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  host: '192.168.1.100',
  port: 502,
});

// Bomba (coil)
const bomba = await coilDriver.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  address: 0,
  label: 'Bomba',
});

// Nível do tanque (input register)
const nivelTanque = await inputRegisterDriver.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  address: 0,
  label: 'Nível Tanque',
  unit: '%',
  scale: 0.1,
  minValue: 0,
  maxValue: 100,
});

// Escuta mudanças no nível
nivelTanque.on('input-register-changed', (data) => {
  console.log(`Nível: ${data.newValue}%`);

  // Liga bomba se nível < 20%
  if (data.newValue < 20) {
    bomba.set(true);
  }

  // Desliga bomba se nível > 80%
  if (data.newValue > 80) {
    bomba.set(false);
  }
});

// Alarme de nível baixo
nivelTanque.on('input-register-alarm', (data) => {
  console.error('ALARME:', data.alarms);
});
```

### Exemplo 2: Controle de Temperatura

```typescript
const holdingRegisterDriver = require('./modbus-holding-register-v2');

// Setpoint de temperatura
const setpoint = await holdingRegisterDriver.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  address: 10,
  label: 'Setpoint Temperatura',
  unit: '°C',
  scale: 0.1,
  readOnly: false,
  minValue: 0,
  maxValue: 100,
});

// Define temperatura desejada
setpoint.set(25.5);  // 25.5°C

// Incrementa 2°C
setpoint.increment(2.0);

// Consulta valor atual
console.log('Setpoint atual:', setpoint.getValue(), '°C');
```

### Exemplo 3: Botão de Emergência

```typescript
const discreteInputDriver = require('./modbus-discrete-input-v2');

const botaoEmergencia = await discreteInputDriver.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  address: 0,
  label: 'Botão Emergência',
  pollingInterval: 100,  // Polling rápido (100ms)
});

// Detecta quando botão é pressionado
botaoEmergencia.on('discrete-input-changed', (data) => {
  if (data.risingEdge) {
    console.log('🚨 EMERGÊNCIA ACIONADA!');

    // Desliga todos os equipamentos
    bomba.set(false);
    aquecedor.set(false);

    // Envia notificação
    sendAlert('Botão de emergência acionado!');
  }

  if (data.fallingEdge) {
    console.log('Botão de emergência solto');
  }
});
```

---

## 📂 Estrutura do Projeto

```
test/
├── modbus-tcp-client-v2.js       # Cliente Modbus TCP
├── modbus-coil-v2.js              # Driver de Coil
├── modbus-discrete-input-v2.js    # Driver de Discrete Input
├── modbus-input-register-v2.js    # Driver de Input Register
├── modbus-holding-register-v2.js  # Driver de Holding Register
│
├── validator.ts                   # Validador (TypeScript)
├── validator.js                   # Validador (compilado)
│
├── compiler.ts                    # Compilador TS → JS
├── build.ts                       # Build script
│
├── test-validator.ts              # Testes do validador
├── test-v2-all-drivers.ts         # Testes dos drivers
│
├── MODBUS_DRIVERS_README.md       # Doc dos drivers
├── VALIDATOR_README.md            # Doc do validador
├── COMPILER_README.md             # Doc do compilador
└── GETTING_STARTED.md             # Este arquivo
```

---

## 🛠️ Comandos Úteis

```bash
# Compilar tudo
bun build.ts

# Compilar com watch
bun compiler.ts validator.ts --watch

# Testar validador
bun test-validator.ts

# Testar drivers
bun test-v2-all-drivers.ts

# Compilar para produção
bun compiler.ts validator.ts --outdir dist --minify --sourcemap external
```

---

## 📚 Documentação

- **[MODBUS_DRIVERS_README.md](MODBUS_DRIVERS_README.md)** - Documentação completa dos drivers
- **[VALIDATOR_README.md](VALIDATOR_README.md)** - Documentação do validador
- **[COMPILER_README.md](COMPILER_README.md)** - Documentação do compilador
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Referência rápida Modbus

---

## 🎯 Próximos Passos

1. **Implementar seu sistema de bidding**
   - Os drivers usam `system.bidding.createMaster/Slave`
   - Você precisa implementar isso no seu sistema

2. **Implementar sistema de rede**
   - Os drivers usam `system.network.createTcpSocket`
   - Pode usar `Bun.connect` diretamente

3. **Conectar com servidor Modbus real**
   - Substitua os mocks por conexões reais
   - Configure IP e porta corretos

4. **Adicionar mais drivers**
   - Use os drivers atuais como template
   - Siga o padrão de closures (sem classes)

5. **Adicionar persistência**
   - Salve configurações em arquivo
   - Use validador antes de carregar

---

## 💡 Dicas

1. **Sempre valide configs antes de usar**
   ```typescript
   const result = validator.validate(schema, userConfig);
   if (result.valid) {
     await driver.onInit(system, result.config);
   }
   ```

2. **Use labels descritivos**
   ```typescript
   { label: 'Bomba Principal' }  // Facilita debug
   ```

3. **Configure polling adequado**
   ```typescript
   { pollingInterval: 100 }   // Crítico
   { pollingInterval: 1000 }  // Normal
   { pollingInterval: 5000 }  // Lento
   { pollingInterval: 0 }     // Desabilitado
   ```

4. **Aproveite o modo read-only**
   ```typescript
   { readOnly: true }  // Protege contra escritas acidentais
   ```

5. **Use eventos para reatividade**
   ```typescript
   driver.on('coil-changed', (data) => {
     // Reage a mudanças
   });
   ```

---

## 🐛 Troubleshooting

### Erro: "Modbus não conectado"

O driver precisa receber o evento `connection-status` do client. Verifique se:
- Client foi inicializado primeiro
- Mesmo `biddingChannel` em todos os drivers
- Sistema de bidding está funcionando

### Erro: "Config inválido"

Use o validador para descobrir o problema:
```typescript
const result = validator.validate(schema, config);
console.log(result.errors);  // Lista todos os erros
```

### Performance lenta

- Reduza `pollingInterval`
- Use `pollingInterval: 0` e leia sob demanda
- Agrupe leituras de múltiplos registros

---

## 📞 Suporte

- **Issues**: Documente problemas claramente
- **Testes**: Use os arquivos `test-*.ts` como referência
- **Docs**: Toda a documentação está em `/test/*.md`

---

Bom desenvolvimento! 🚀
