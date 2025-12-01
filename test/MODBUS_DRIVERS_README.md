# Modbus Drivers - Documentação Completa

## 📦 Drivers Disponíveis

### 1. modbus-tcp-client.js
**Bidding Master** - Driver base de comunicação Modbus TCP

### 2. modbus-coil.js
**Bidding Slave** - Controle de saída digital (ON/OFF)
- ✅ Leitura/Escrita (configurável)
- ✅ Modo somente leitura

### 3. modbus-discrete-input.js
**Bidding Slave** - Leitura de entrada digital (sensores, botões)
- 🔒 **SEMPRE somente leitura**

### 4. modbus-input-register.js
**Bidding Slave** - Leitura de sensor analógico
- 🔒 **SEMPRE somente leitura**
- ✅ Conversão de escala
- ✅ Alarmes min/max

### 5. modbus-holding-register.js
**Bidding Slave** - Controle de valor analógico (setpoints)
- ✅ Leitura/Escrita (configurável)
- ✅ Modo somente leitura
- ✅ Conversão de escala
- ✅ Validação min/max

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    APLICAÇÃO                            │
│                                                         │
│  emit('coil-set', ...)                                  │
│  emit('holding-register-set', ...)                      │
│                                                         │
│  on('coil-changed', ...)                                │
│  on('input-register-value', ...)                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Bidding Events
                     │
     ┌───────────────┼────────────────┬──────────────┐
     │               │                │              │
┌────▼─────┐  ┌─────▼──────┐  ┌─────▼─────┐  ┌────▼──────┐
│  Coil    │  │ Discrete   │  │  Input    │  │ Holding   │
│  Driver  │  │   Input    │  │ Register  │  │ Register  │
│          │  │   Driver   │  │  Driver   │  │  Driver   │
│ (SLAVE)  │  │  (SLAVE)   │  │ (SLAVE)   │  │  (SLAVE)  │
└────┬─────┘  └─────┬──────┘  └─────┬─────┘  └────┬──────┘
     │              │                │              │
     └──────────────┼────────────────┴──────────────┘
                    │
                    │ Modbus Commands
                    │
           ┌────────▼─────────┐
           │ Modbus TCP Client│
           │    (MASTER)      │
           └────────┬─────────┘
                    │
                    │ TCP/IP
                    │
           ┌────────▼─────────┐
           │  Servidor Modbus │
           │  (PLC, CLP, etc) │
           └──────────────────┘
```

---

## 🚀 Guia Rápido

### Exemplo Completo

```javascript
// 1. Inicializar Modbus TCP Client
await modbusClient.onInit(system, {
  host: '192.168.1.100',
  port: 502,
  unitId: 1,
});

// 2. Inicializar Drivers
await coilDriver.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  address: 0,
  readOnly: false,
  label: 'Bomba Principal',
});

await inputRegisterDriver.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  address: 10,
  label: 'Temperatura',
  unit: '°C',
  scale: 0.1,
  minValue: 0,
  maxValue: 100,
});

// 3. Escutar eventos
bidding.on('coil-changed', (data) => {
  console.log(`Bomba: ${data.newState ? 'ON' : 'OFF'}`);
});

bidding.on('input-register-value', (data) => {
  console.log(`${data.label}: ${data.value} ${data.unit}`);
});

bidding.on('input-register-alarm', (data) => {
  console.error(`ALARME: ${data.alarms[0].message}`);
});

// 4. Enviar comandos
bidding.emit('coil-set', { value: true });
bidding.emit('holding-register-set', { value: 25.5 });
```

---

## 📋 API de Cada Driver

### modbus-coil.js

#### Comandos (Input)

```javascript
// Ligar/Desligar
emit('coil-set', { value: true, requestId: 'req-1' });

// Toggle
emit('coil-toggle', { requestId: 'req-2' });

// Pulso (liga e desliga automaticamente)
emit('coil-pulse', { duration: 1000, requestId: 'req-3' });

// Consultar estado (cache)
emit('coil-get', { requestId: 'req-4' });

// Forçar leitura
emit('coil-refresh', { requestId: 'req-5' });
```

#### Eventos (Output)

```javascript
on('coil-changed', { address, label, oldState, newState, timestamp })
on('coil-value', { address, label, state, timestamp })
on('coil-status', { event, address, label, timestamp })
on('coil-error', { operation, address, error, timestamp })
```

#### Configuração

```javascript
{
  biddingChannel: 'modbus-tcp-events',
  address: 0,
  readOnly: false,           // ⭐ Modo somente leitura
  pollingInterval: 1000,
  autoRead: true,
  label: 'Bomba Principal'
}
```

---

### modbus-discrete-input.js

#### Comandos (Input)

```javascript
// Consultar estado
emit('discrete-input-get', { requestId: 'req-1' });

// Forçar leitura
emit('discrete-input-refresh', { requestId: 'req-2' });
```

#### Eventos (Output)

```javascript
on('discrete-input-changed', {
  address, label, oldState, newState,
  risingEdge,   // true se mudou de false → true
  fallingEdge,  // true se mudou de true → false
  timestamp
})

on('discrete-input-value', { address, label, state, timestamp })
on('discrete-input-status', { event, address, label, timestamp })
on('discrete-input-error', { address, error, timestamp })
```

#### Configuração

```javascript
{
  biddingChannel: 'modbus-tcp-events',
  address: 0,
  pollingInterval: 500,
  autoRead: true,
  label: 'Botão Emergência',
  invertLogic: false        // ⭐ Inverter lógica (NOT)
}
```

---

### modbus-input-register.js

#### Comandos (Input)

```javascript
// Consultar valor
emit('input-register-get', { requestId: 'req-1' });

// Forçar leitura
emit('input-register-refresh', { requestId: 'req-2' });
```

#### Eventos (Output)

```javascript
on('input-register-changed', {
  address, label,
  oldValue, newValue, delta,
  unit, rawValue, alarms,
  timestamp
})

on('input-register-value', {
  address, label, value, rawValue, unit, alarms, timestamp
})

on('input-register-alarm', {
  address, label, value,
  alarms: [{ type, message, severity }],
  timestamp
})

on('input-register-status', { event, address, label, unit, timestamp })
on('input-register-error', { address, error, timestamp })
```

#### Configuração

```javascript
{
  biddingChannel: 'modbus-tcp-events',
  address: 0,
  pollingInterval: 1000,
  autoRead: true,
  label: 'Temperatura Forno',
  unit: '°C',
  scale: 0.1,               // ⭐ valor_real = raw * scale + offset
  offset: 0,
  decimals: 2,
  signed: false,            // ⭐ int16 vs uint16
  minValue: 0,              // ⭐ Alarme de valor baixo
  maxValue: 300             // ⭐ Alarme de valor alto
}
```

---

### modbus-holding-register.js

#### Comandos (Input)

```javascript
// Definir valor
emit('holding-register-set', { value: 25.5, requestId: 'req-1' });

// Incrementar/Decrementar
emit('holding-register-increment', { amount: 5.0, requestId: 'req-2' });
emit('holding-register-increment', { amount: -2.5, requestId: 'req-3' });

// Consultar valor
emit('holding-register-get', { requestId: 'req-4' });

// Forçar leitura
emit('holding-register-refresh', { requestId: 'req-5' });
```

#### Eventos (Output)

```javascript
on('holding-register-changed', {
  address, label,
  oldValue, newValue, delta,
  unit, rawValue,
  timestamp
})

on('holding-register-value', {
  address, label, value, rawValue, unit, timestamp
})

on('holding-register-status', {
  event, address, label, unit, readOnly, timestamp
})

on('holding-register-error', {
  operation, address, error, timestamp
})
```

#### Configuração

```javascript
{
  biddingChannel: 'modbus-tcp-events',
  address: 10,
  readOnly: false,          // ⭐ Modo somente leitura
  pollingInterval: 1000,
  autoRead: true,
  label: 'Setpoint Temperatura',
  unit: '°C',
  scale: 0.1,
  offset: 0,
  decimals: 2,
  signed: false,
  minValue: 0,              // ⭐ Validação de escrita
  maxValue: 300
}
```

---

## 🔧 Recursos Especiais

### 1. Modo Somente Leitura

**Coil e Holding Register** podem ser configurados como somente leitura:

```javascript
{
  readOnly: true  // Bloqueia comandos de escrita
}
```

Útil para:
- Monitorar equipamentos sem risco de acionar
- Modo de visualização/auditoria
- Sistemas críticos

### 2. Conversão de Escala (Registers)

```javascript
// Exemplo: Sensor de temperatura
// PLC envia: 235 (raw)
// Configuração:
{
  scale: 0.1,
  offset: 0,
  decimals: 1
}
// Resultado: 23.5°C

// Exemplo: Sensor com offset
// PLC envia: 500 (raw)
// Configuração:
{
  scale: 0.01,
  offset: -5.0,
  decimals: 2
}
// Resultado: 0.00 (500 * 0.01 - 5.0)
```

### 3. Valores com Sinal (Signed)

```javascript
{
  signed: true  // Interpreta como int16 (-32768 a 32767)
}
```

Quando o PLC envia valores negativos (temperatura, erro, etc).

### 4. Alarmes Automáticos

```javascript
// Input Register com alarmes
{
  minValue: 10,
  maxValue: 50
}

// Evento emitido quando valor < 10 ou > 50
on('input-register-alarm', (data) => {
  // data.alarms = [{ type: 'low'/'high', message: '...' }]
});
```

### 5. Detecção de Bordas (Discrete Input)

```javascript
on('discrete-input-changed', (data) => {
  if (data.risingEdge) {
    console.log('Botão PRESSIONADO');
  }
  if (data.fallingEdge) {
    console.log('Botão SOLTO');
  }
});
```

### 6. Inversão de Lógica (Discrete Input)

```javascript
{
  invertLogic: true  // Inverte estado (NOT)
}
```

Para sensores normalmente fechados (NC).

---

## 🎯 Casos de Uso Reais

### Sistema de Controle de Temperatura

```javascript
// Sensor de temperatura (Input Register)
await inputRegisterDriver.onInit(system, {
  address: 0,
  label: 'Temperatura Atual',
  unit: '°C',
  scale: 0.1,
  minValue: 0,
  maxValue: 100,
  pollingInterval: 500,
});

// Setpoint de temperatura (Holding Register)
await holdingRegisterDriver.onInit(system, {
  address: 10,
  label: 'Setpoint Temperatura',
  unit: '°C',
  scale: 0.1,
  readOnly: false,
  minValue: 0,
  maxValue: 100,
});

// Aquecedor (Coil)
await coilDriver.onInit(system, {
  address: 0,
  label: 'Aquecedor',
  readOnly: false,
});

// Lógica de controle
bidding.on('input-register-value', (data) => {
  const tempAtual = data.value;
  // Se temperatura < setpoint, liga aquecedor
  if (tempAtual < setpoint) {
    bidding.emit('coil-set', { value: true });
  } else {
    bidding.emit('coil-set', { value: false });
  }
});
```

### Botão de Emergência

```javascript
await discreteInputDriver.onInit(system, {
  address: 0,
  label: 'Botão Emergência',
  pollingInterval: 100,  // Polling rápido
});

bidding.on('discrete-input-changed', (data) => {
  if (data.risingEdge) {
    console.log('🚨 EMERGÊNCIA ACIONADA!');
    // Desliga todos os equipamentos
    bidding.emit('coil-set', { value: false });
  }
});
```

### Controle de Velocidade de Motor

```javascript
await holdingRegisterDriver.onInit(system, {
  address: 20,
  label: 'Velocidade Motor',
  unit: 'RPM',
  scale: 1,
  minValue: 0,
  maxValue: 3000,
  readOnly: false,
});

// Acelerar motor
bidding.emit('holding-register-set', { value: 1500 });

// Incrementar 100 RPM
bidding.emit('holding-register-increment', { amount: 100 });
```

---

## 🧪 Como Testar

```bash
# Teste completo de todos os drivers
bun run test/test-all-drivers.ts
```

---

## 📊 Resumo de Recursos

| Driver | R/W | Modo RO Config | Escala | Alarmes | Polling | Eventos Especiais |
|--------|-----|----------------|--------|---------|---------|-------------------|
| **Coil** | ✅/✅ | ✅ | ❌ | ❌ | ✅ | pulse, toggle |
| **Discrete Input** | ✅/❌ | 🔒 | ❌ | ❌ | ✅ | rising/falling edge |
| **Input Register** | ✅/❌ | 🔒 | ✅ | ✅ | ✅ | alarmes min/max |
| **Holding Register** | ✅/✅ | ✅ | ✅ | ✅ | ✅ | increment/decrement |

---

## 💡 Dicas de Uso

1. **Sempre inicie o `modbus-tcp-client` primeiro**
2. **Use o mesmo `biddingChannel`** em todos os drivers
3. **Configure `pollingInterval`** adequado ao tipo de dado:
   - Botões/sensores críticos: 100-500ms
   - Temperatura/pressão: 1000-2000ms
   - Setpoints: 2000-5000ms
4. **Use `readOnly: true`** para proteção de equipamentos críticos
5. **Configure `minValue`/`maxValue`** para alarmes automáticos
6. **Use `label`** descritivos para facilitar debug

---

## 🔍 Troubleshooting

### Driver não recebe eventos?
- Verifique se `biddingChannel` é o mesmo em todos
- Confirme que `modbus-tcp-client` foi inicializado primeiro

### Valores estranhos em registers?
- Verifique `scale` e `offset`
- Confirme se `signed: true/false` está correto
- Verifique `decimals`

### Comandos de escrita bloqueados?
- Verifique se `readOnly: false`
- Confirme que Modbus está conectado
- Verifique validação `minValue`/`maxValue`

---

## 📝 Licença

Drivers de exemplo para uso educacional e desenvolvimento.
