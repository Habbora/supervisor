# Modbus Drivers - Referência Rápida

## 🎯 Qual Driver Usar?

```
┌────────────────────────────────────────────────────────────────┐
│ Preciso controlar...                                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ 💡 Saída ON/OFF (lâmpada, relé, motor)                        │
│    → modbus-coil.js                                            │
│                                                                │
│ 🔘 Entrada ON/OFF (botão, sensor presença)                    │
│    → modbus-discrete-input.js                                  │
│                                                                │
│ 📈 Sensor analógico (temperatura, pressão)                    │
│    → modbus-input-register.js                                  │
│                                                                │
│ ⚙️ Setpoint/parâmetro (temperatura desejada, velocidade)      │
│    → modbus-holding-register.js                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Configuração em 30 Segundos

### 1️⃣ Saída Digital (Coil)

```javascript
await coilDriver.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  address: 0,
  readOnly: false,        // ⭐ pode desabilitar escrita
  label: 'Bomba Principal'
});

// Usar
emit('coil-set', { value: true });
emit('coil-toggle', {});
emit('coil-pulse', { duration: 1000 });
```

### 2️⃣ Entrada Digital (Discrete Input)

```javascript
await discreteInputDriver.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  address: 0,
  pollingInterval: 500,
  invertLogic: false,     // ⭐ inverter sensor NC
  label: 'Botão Emergência'
});

// Escutar
on('discrete-input-changed', (data) => {
  if (data.risingEdge) console.log('PRESSIONADO');
});
```

### 3️⃣ Sensor Analógico (Input Register)

```javascript
await inputRegisterDriver.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  address: 0,
  label: 'Temperatura',
  unit: '°C',
  scale: 0.1,            // ⭐ raw 250 = 25.0°C
  minValue: 0,           // ⭐ alarme automático
  maxValue: 100
});

// Escutar
on('input-register-value', (data) => {
  console.log(`${data.value} ${data.unit}`);
});
```

### 4️⃣ Setpoint (Holding Register)

```javascript
await holdingRegisterDriver.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  address: 10,
  readOnly: false,       // ⭐ pode desabilitar escrita
  label: 'Setpoint',
  unit: '°C',
  scale: 0.1,
  minValue: 0,
  maxValue: 100
});

// Usar
emit('holding-register-set', { value: 25.5 });
emit('holding-register-increment', { amount: 5 });
```

---

## 📋 Comandos Mais Usados

### Coil (Saída Digital)
```javascript
emit('coil-set', { value: true })           // Liga
emit('coil-set', { value: false })          // Desliga
emit('coil-toggle', {})                     // Inverte
emit('coil-pulse', { duration: 1000 })      // Pulso 1s
emit('coil-get', {})                        // Consulta
```

### Discrete Input (Entrada Digital)
```javascript
emit('discrete-input-get', {})              // Consulta
emit('discrete-input-refresh', {})          // Força leitura
```

### Input Register (Sensor)
```javascript
emit('input-register-get', {})              // Consulta
emit('input-register-refresh', {})          // Força leitura
```

### Holding Register (Setpoint)
```javascript
emit('holding-register-set', { value: 30 }) // Define valor
emit('holding-register-increment', { amount: 5 })  // +5
emit('holding-register-increment', { amount: -3 }) // -3
emit('holding-register-get', {})            // Consulta
```

---

## 🎧 Eventos Mais Usados

### Coil
```javascript
on('coil-changed', (data) => {
  console.log(`${data.label}: ${data.newState}`);
});
```

### Discrete Input
```javascript
on('discrete-input-changed', (data) => {
  if (data.risingEdge) {
    console.log('ATIVADO');
  }
});
```

### Input Register
```javascript
on('input-register-value', (data) => {
  console.log(`${data.label}: ${data.value} ${data.unit}`);
});

on('input-register-alarm', (data) => {
  console.log('ALARME:', data.alarms);
});
```

### Holding Register
```javascript
on('holding-register-changed', (data) => {
  console.log(`${data.label}: ${data.newValue} ${data.unit}`);
});
```

---

## ⚙️ Recursos Especiais

### ✅ Modo Somente Leitura
```javascript
{ readOnly: true }  // Coil e Holding Register
```

### ✅ Conversão de Escala
```javascript
{
  scale: 0.1,      // raw 250 → 25.0
  offset: 0,
  decimals: 1
}
```

### ✅ Números com Sinal
```javascript
{ signed: true }   // -32768 a 32767
```

### ✅ Validação/Alarmes
```javascript
{
  minValue: 0,
  maxValue: 100    // Valida escrita + alarmes
}
```

### ✅ Inverter Lógica
```javascript
{ invertLogic: true }  // Discrete Input (sensor NC)
```

### ✅ Detecção de Bordas
```javascript
on('discrete-input-changed', (data) => {
  data.risingEdge   // false → true
  data.fallingEdge  // true → false
});
```

---

## 🚀 Template Básico

```javascript
// 1. Modbus TCP Client (obrigatório)
await modbusClient.onInit(system, {
  host: '192.168.1.100',
  port: 502,
  unitId: 1,
});

// 2. Seus drivers
await coilDriver.onInit(system, {
  biddingChannel: 'modbus-tcp-events',
  address: 0,
  label: 'Bomba',
});

// 3. Bidding slave
const bidding = system.bidding.createSlave('modbus-tcp-events');

// 4. Listeners
bidding.on('coil-changed', (data) => {
  console.log('Mudou:', data.newState);
});

// 5. Comandos
bidding.emit('coil-set', { value: true });
```

---

## 📊 Comparação Rápida

| Tipo | Bits | R/W | Modo RO | Exemplos |
|------|------|-----|---------|----------|
| **Coil** | 1 | ✅/✅ | ✅ | Relé, lâmpada, motor |
| **Discrete Input** | 1 | ✅/❌ | 🔒 | Botão, sensor porta |
| **Input Register** | 16 | ✅/❌ | 🔒 | Temperatura, pressão |
| **Holding Register** | 16 | ✅/✅ | ✅ | Setpoint, velocidade |

---

## 💡 Exemplos Práticos

### Controlar Lâmpada
```javascript
emit('coil-set', { value: true });  // Liga
```

### Ler Botão
```javascript
on('discrete-input-changed', (data) => {
  if (data.risingEdge) alert('Botão pressionado!');
});
```

### Ler Temperatura
```javascript
on('input-register-value', (data) => {
  console.log(`Temp: ${data.value}°C`);
});
```

### Ajustar Setpoint
```javascript
emit('holding-register-set', { value: 25.0 });
```

### Pulso (Campainha)
```javascript
emit('coil-pulse', { duration: 200 });
```

---

## 🔍 Debug Rápido

❌ **Não recebe eventos?**
- Mesmo `biddingChannel` em todos?
- Inicializou `modbus-tcp-client` primeiro?

❌ **Valores errados em registers?**
- Confira `scale`, `offset`, `decimals`
- `signed: true` se valores negativos

❌ **Escrita bloqueada?**
- `readOnly: false`?
- Dentro de `minValue`/`maxValue`?

---

## 📝 Checklist de Implementação

- [ ] Inicializei `modbus-tcp-client`?
- [ ] Todos os drivers usam o mesmo `biddingChannel`?
- [ ] Configurei `label` descritivos?
- [ ] Defini `pollingInterval` adequado?
- [ ] Configurei `scale`/`offset` para registers?
- [ ] Defini `minValue`/`maxValue` para validação?
- [ ] Adicionei listeners para os eventos que preciso?
- [ ] Testei com servidor Modbus real ou mock?

---

## 🎓 Próximos Passos

1. ✅ Rode o teste: `bun run test/test-all-drivers.ts`
2. 📖 Leia a doc completa: `MODBUS_DRIVERS_README.md`
3. 🔧 Adapte para seu caso de uso
4. 🚀 Conecte em servidor Modbus real

---

**Dica:** Use `label` descritivos sempre! Facilita MUITO o debug.
