# 🎯 MVP ESSENCIAL - 4 Funcionalidades

**Status:** Backend roda ✅ | Frontend configurado ✅

---

## ✅ O QUE JÁ FUNCIONA

### 1. ✅ USUÁRIOS - **100% PRONTO**
- [x] Banco de dados SQLite funcionando
- [x] Usuário admin criado automaticamente (admin/admin)
- [x] API de autenticação JWT (`/api/v1/auth`)
- [x] API CRUD de usuários (`/api/v1/users`)
- [x] Frontend: Login page funcional
- [x] Frontend: Hook `useAuth` e `useUsers`
- [x] Frontend: Página de gerenciamento de usuários

**Teste:**
```bash
# Login
curl -X POST http://localhost:4000/api/v1/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Listar usuários (com token)
curl http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### 2. ✅ ILUMINAÇÃO - **90% PRONTO**
- [x] API Lights completa (`/api/v1/lights`)
- [x] LightService implementado
- [x] Frontend: Hook `useLights` criado
- [x] Frontend: Página `/lights` funcional
- [x] Comandos: turnOn, turnOff, toggle

**Falta:**
- [ ] **CRÍTICO:** Integrar com Modbus real (atualmente mock)
- [ ] Criar lâmpadas via interface ou seed

**Teste:**
```bash
# Listar lâmpadas
curl http://localhost:4000/api/v1/lights

# Criar lâmpada
curl -X POST http://localhost:4000/api/v1/lights \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luz Sala",
    "controllerId": "controller-id",
    "endpointName": "coil_0"
  }'

# Toggle lâmpada
curl -X POST http://localhost:4000/api/v1/lights/LIGHT_ID/command \
  -H "Content-Type: application/json" \
  -d '{"action": "toggle"}'
```

---

### 3. ✅ AGENDAMENTO - **95% PRONTO**
- [x] API Schedules completa (`/api/v1/schedules`)
- [x] ScheduleManager funcional
- [x] Execução automática por horário
- [x] Frontend: Hook `useSchedules` corrigido
- [x] Frontend: Página `/schedules` funcional
- [x] Formulário de criação/edição

**Falta:**
- [ ] **Testar:** Criar schedule e verificar execução
- [ ] **Testar:** Schedule executar comando em device real

**Teste:**
```bash
# Criar schedule (ligar luz às 18h diariamente)
curl -X POST http://localhost:4000/api/v1/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ligar Sala 18h",
    "time": {"hour": 18, "minute": 0},
    "recurrenceType": "daily",
    "actions": [{
      "deviceId": "DEVICE_ID",
      "action": "turnOn",
      "value": 1
    }]
  }'

# Listar schedules
curl http://localhost:4000/api/v1/schedules

# Executar manualmente
curl -X POST http://localhost:4000/api/v1/schedules/SCHEDULE_ID/execute
```

---

### 4. ⚠️ COMUNICAÇÃO COM CLP - **70% PRONTO**

**O que existe:**
- [x] ControllerManager implementado
- [x] Modbus TCP client (JSModbus)
- [x] API de controllers (`/api/v1/controllers`)
- [x] Reconexão automática
- [x] EventBus para comunicação
- [x] Frontend: Hook `useControllers`
- [x] Frontend: Página de configuração

**Falta (CRÍTICO):**
- [ ] **Testar conexão real** com PLC Modbus
- [ ] **Validar leitura** de coils/registers
- [ ] **Validar escrita** de coils/registers
- [ ] **Vincular Lights** aos endpoints Modbus

**Estrutura Atual:**
```
Controller (Modbus TCP)
  ├─ IP: 192.168.1.100
  ├─ Port: 502
  ├─ Slave ID: 1
  └─ Endpoints:
      ├─ coil_0: Luz Sala
      ├─ coil_1: Luz Quarto
      └─ register_0: Dimmer
```

**Como testar:**
```bash
# 1. Criar controller
curl -X POST http://localhost:4000/api/v1/controllers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CLP Principal",
    "type": "modbus"
  }'

# 2. Atualizar com configuração Modbus
curl -X PUT http://localhost:4000/api/v1/controllers/CONTROLLER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CLP Principal",
    "type": "modbus",
    "config": {
      "host": "192.168.1.100",
      "port": 502,
      "slaveId": 1,
      "timeout": 5000
    },
    "endpoints": [
      {"name": "coil_0", "type": "coil", "address": 0},
      {"name": "coil_1", "type": "coil", "address": 1}
    ]
  }'

# 3. Verificar status
curl http://localhost:4000/api/v1/controllers/CONTROLLER_ID
```

---

## 🚨 PROBLEMAS A RESOLVER

### 1. ❌ Build de Produção Falha
**Erro:** `ModuleNotFound resolving "workers\modbus"`

**Causa:** `build.ts` tenta incluir pasta `workers/modbus` que não tem entry point válido

**Solução:**
```typescript
// apps/backend/build.ts - CORRIGIR
const workersDir = path.join(import.meta.dir, 'workers');

// VERIFICAR: workers/modbus tem index.ts ou worker.ts?
// Se não tiver, remover do build
```

**Workaround temporário:**
```bash
# Rodar em modo dev (funciona)
cd apps/backend
bun run src/index.ts
```

### 2. ⚠️ Modbus Não Testado com Hardware Real
**Status:** Código existe mas não foi validado

**Próximos passos:**
1. Conectar um PLC Modbus TCP (ou simulador)
2. Criar controller via API
3. Criar device vinculado ao endpoint
4. Testar comando ON/OFF

### 3. ⚠️ Lights Sem Conexão Modbus
**Status:** LightService funciona mas não envia comandos reais

**Solução:**
- Garantir que Light use EventBus para enviar `controller_action`
- ControllerManager escuta e envia via Modbus
- Validar fluxo: Frontend → API → LightService → EventBus → ControllerManager → Modbus → PLC

---

## 📋 CHECKLIST MVP MÍNIMO

### 🎯 Fase 1: Validar o Básico (30 min)

#### Usuários
- [x] Backend roda
- [x] Login admin/admin funciona no frontend
- [x] Página de usuários lista admin
- [ ] Criar novo usuário via interface
- [ ] Fazer login com novo usuário

#### Backend Health
- [ ] Corrigir `build.ts` (remover workers\modbus ou criar entry point)
- [ ] `bun run build` funciona sem erros
- [ ] Testar em modo produção

---

### 🎯 Fase 2: Conectar CLP (1-2 horas)

#### Setup Hardware
- [ ] PLC Modbus TCP conectado na rede
- [ ] IP e porta configurados
- [ ] Testar conectividade com ferramenta externa (modbus-cli, ModbusTool)

#### Configurar no Sistema
- [ ] Criar controller via interface
  - Nome: "CLP Principal"
  - Tipo: Modbus
  - IP: 192.168.x.x
  - Porta: 502
  - Slave ID: 1

- [ ] Salvar e verificar logs do backend
  - Deve mostrar: "Conectado ao controller CLP Principal"
  - Se falhar: checar IP, firewall, cabo

#### Criar Endpoints
- [ ] Adicionar endpoints manualmente no controller:
  ```json
  {
    "endpoints": [
      {"name": "luz_sala", "type": "coil", "address": 0},
      {"name": "luz_quarto", "type": "coil", "address": 1}
    ]
  }
  ```

---

### 🎯 Fase 3: Configurar Iluminação (30 min)

#### Criar Lights
- [ ] Ir em `/lights` no frontend
- [ ] Criar nova lâmpada:
  - Nome: "Luz da Sala"
  - Controller: CLP Principal
  - Endpoint: luz_sala

#### Testar Comando
- [ ] Clicar toggle ON
- [ ] **Verificar:** Luz física acende?
- [ ] **Verificar:** Dashboard atualiza status?
- [ ] Clicar toggle OFF
- [ ] **Verificar:** Luz física apaga?

#### Validar Sincronização
- [ ] Ligar luz fisicamente (botão ou forçar coil)
- [ ] **Verificar:** Dashboard atualiza em < 5s?
- [ ] Desligar luz fisicamente
- [ ] **Verificar:** Dashboard atualiza?

---

### 🎯 Fase 4: Configurar Agendamento (15 min)

#### Criar Schedule
- [ ] Ir em `/schedules`
- [ ] Criar schedule:
  - Nome: "Ligar Luz Sala às 18h"
  - Horário: 18:00
  - Recorrência: Diário
  - Ação: turnOn
  - Device: Luz da Sala

#### Testar Execução Manual
- [ ] Clicar "Executar Agora"
- [ ] **Verificar:** Luz acende?
- [ ] **Verificar:** Logs mostram execução?

#### Testar Execução Automática
- [ ] Criar schedule para daqui 2 minutos
- [ ] Aguardar execução
- [ ] **Verificar:** Luz liga no horário?
- [ ] **Verificar:** Logs mostram execução?

---

## 🧪 TESTES DE VALIDAÇÃO

### Teste 1: Fluxo Completo Manual
```
1. Login → OK
2. Criar Controller → OK
3. Controller conecta → OK
4. Criar Light → OK
5. Toggle Light → Luz acende ✅
6. Dashboard atualiza → OK ✅
```

### Teste 2: Agendamento Automático
```
1. Criar schedule (2 min futuro) → OK
2. Aguardar 2 minutos → OK
3. Luz liga automaticamente → ✅
4. Dashboard mostra mudança → ✅
```

### Teste 3: Sincronização Tempo Real
```
1. Abrir dashboard em 2 navegadores
2. Ligar luz em navegador 1
3. Verificar atualização em navegador 2 < 5s → ✅
```

### Teste 4: Reconexão Modbus
```
1. Luz funcionando → OK
2. Desconectar PLC (cabo/power)
3. Tentar comando → Falha gracefully (erro claro)
4. Reconectar PLC
5. Tentar comando → Funciona novamente ✅
```

---

## 📊 CRITÉRIOS DE SUCESSO

✅ **MVP está pronto quando:**

1. ✅ Usuário admin consegue fazer login
2. ✅ Controller Modbus conecta ao PLC real
3. ✅ Criar lâmpada vinculada a coil Modbus
4. ✅ Ligar/desligar lâmpada via interface
5. ✅ Lâmpada física responde aos comandos
6. ✅ Dashboard atualiza status em < 5 segundos
7. ✅ Schedule executa ação no horário correto
8. ✅ Sistema roda por 1 hora sem crashes

---

## 🚀 PRÓXIMOS PASSOS (Ordem de Execução)

### ⚡ AGORA (15 min)
1. [ ] Corrigir `build.ts` - remover workers\modbus do build
2. [ ] Testar `bun run build` - deve funcionar
3. [ ] Documentar configuração inicial

### ⚡ HOJE (1-2 horas)
4. [ ] Conectar PLC Modbus real
5. [ ] Testar conexão com ferramenta externa
6. [ ] Criar controller no sistema
7. [ ] Validar logs de conexão

### ⚡ HOJE (30 min)
8. [ ] Criar primeira lâmpada
9. [ ] Testar comando ON/OFF
10. [ ] Validar hardware responde

### ⚡ HOJE (30 min)
11. [ ] Criar schedule teste (2 min futuro)
12. [ ] Aguardar execução
13. [ ] Validar funcionamento

### ⚡ AMANHÃ (Polimento)
14. [ ] Seeds do banco (fixtures)
15. [ ] README com setup
16. [ ] Melhorar error handling
17. [ ] Testes de reconexão

---

## 🐛 BUGS CONHECIDOS

### Críticos
- [ ] Build falha (workers\modbus)
- [ ] Modbus não testado com hardware

### Importantes
- [ ] Sem loading state em algumas páginas
- [ ] Erro não mostra mensagem clara ao usuário
- [ ] Dashboard pode demorar a atualizar

### Desejáveis
- [ ] Logs muito verbosos
- [ ] Sem indicador de conexão com backend
- [ ] Sem toast notifications

---

## 📁 ESTRUTURA DE ARQUIVOS PRINCIPAIS

```
apps/backend/
├── src/
│   ├── index.ts                    ✅ Entry point (funciona)
│   ├── server.ts                   ✅ Elysia server
│   ├── routes/elysia/
│   │   ├── auth.ts                 ✅ Login/logout
│   │   ├── users.ts                ✅ CRUD usuários
│   │   ├── controllers.ts          ✅ CRUD controllers
│   │   ├── devices.ts              ✅ CRUD devices
│   │   ├── lights.ts               ✅ API lights
│   │   └── schedules.ts            ✅ API schedules
│   ├── services/
│   │   ├── controllers/            ⚠️ Modbus não testado
│   │   │   └── manager.ts
│   │   ├── devices/                ✅ DeviceService OK
│   │   ├── event-bus/              ✅ EventBus OK
│   │   └── dashboard/              ✅ Long-polling OK
│   ├── features/
│   │   ├── lights/                 ✅ LightService OK
│   │   └── schedules/              ✅ ScheduleManager OK
│   └── db/                         ✅ SQLite + Drizzle OK
└── build.ts                        ❌ PRECISA CORRIGIR

apps/frontend/
├── src/
│   ├── app/
│   │   ├── login/                  ✅ Login page
│   │   └── (dashboard)/
│   │       ├── page.tsx            ✅ Dashboard
│   │       ├── lights/             ✅ Lights page
│   │       ├── schedules/          ✅ Schedules page
│   │       └── settings/           ✅ Settings pages
│   ├── features/
│   │   ├── auth/hooks/             ✅ useAuth
│   │   ├── device/hooks/           ✅ useDevices
│   │   ├── lights/hooks/           ✅ useLights
│   │   ├── schedules/hooks/        ✅ useSchedules
│   │   └── controllers/hooks/      ✅ useControllers
│   └── components/                 ✅ UI components
└── next.config.ts                  ✅ Proxy configurado
```

---

## 📖 COMANDOS ÚTEIS

### Backend
```bash
# Dev mode (funciona)
cd apps/backend
bun run src/index.ts

# Build (PRECISA CORRIGIR)
bun run build

# Prod mode
NODE_ENV=production bun run src/index.ts
```

### Frontend
```bash
# Dev
cd apps/frontend
bun run dev

# Build
bun run build

# Start production
bun run start
```

### Testes Manuais
```bash
# Health check
curl http://localhost:4000/health

# Login
curl -X POST http://localhost:4000/api/v1/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Listar controllers
curl http://localhost:4000/api/v1/controllers

# Listar lights
curl http://localhost:4000/api/v1/lights

# Listar schedules
curl http://localhost:4000/api/v1/schedules
```

---

**Última atualização:** 2025-11-13 14:58
**Status:** Pronto para conectar hardware Modbus
**Próxima ação:** Corrigir build.ts e testar Modbus real
