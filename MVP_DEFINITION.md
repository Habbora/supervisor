# 🎯 MVP - Definição Mínima Viável

**Objetivo:** Sistema funcional mínimo para automação residencial/industrial com controle de dispositivos via Modbus e interface web.

---

## ✅ O QUE JÁ ESTÁ FUNCIONANDO

### Backend (Elysia + Bun)
- ✅ API REST completa com rotas `/api/v1/*`
- ✅ Autenticação JWT (login/logout/validação)
- ✅ CRUD de usuários
- ✅ CRUD de controladores (Modbus TCP)
- ✅ CRUD de dispositivos genéricos
- ✅ Feature de Lights completa
- ✅ Sistema de agendamentos (Schedules)
- ✅ Dashboard com long-polling
- ✅ EventBus para comunicação entre features
- ✅ Banco de dados SQLite com Drizzle ORM

### Frontend (Next.js 15)
- ✅ Autenticação com cookies
- ✅ Proxy para backend configurado
- ✅ Hooks para todas as features:
  - `useAuth` - Autenticação
  - `useUsers` - Gerenciamento de usuários
  - `useControllers` - Controladores
  - `useDevices` - Dispositivos genéricos
  - `useLights` - Lâmpadas
  - `useSchedules` - Agendamentos
- ✅ Páginas implementadas:
  - `/login` - Login
  - `/` - Dashboard principal
  - `/lights` - Controle de iluminação
  - `/schedules` - Agendamentos
  - `/settings/devices` - Configuração de dispositivos
  - `/settings/controllers` - Configuração de controladores
  - `/settings/users` - Gerenciamento de usuários

---

## 🚨 PROBLEMAS CRÍTICOS A RESOLVER

### 1. Build do Backend Falhando ❌
```bash
error: ModuleNotFound resolving "workers\modbus" (entry point)
```

**Causa:** Referência a worker de Modbus que não existe mais ou está mal configurado.

**Solução:**
- [ ] Verificar `build.ts` e remover referência a `workers\modbus`
- [ ] OU criar o worker corretamente
- [ ] Testar build: `cd apps/backend && bun run build`

### 2. Sincronização em Tempo Real 🔄
**Status:** Parcialmente implementado

O dashboard usa long-polling, mas precisa verificar:
- [ ] Dashboard está retornando devices atualizados?
- [ ] EventBus está propagando mudanças corretamente?
- [ ] Lights estão sincronizando com o Dashboard?

### 3. Integração Modbus ⚡
**Status:** Código existe mas precisa validação

- [ ] Controladores Modbus se conectam?
- [ ] Endpoints são lidos corretamente?
- [ ] Comandos são enviados corretamente?
- [ ] Reconexão automática funciona?

---

## 📋 CHECKLIST MVP MÍNIMO

### 🔧 Backend - Essencial

#### 1. Build e Deploy
- [ ] **CRÍTICO:** Corrigir erro de build do backend
- [ ] Criar script de start production
- [ ] Testar com `NODE_ENV=production`

#### 2. Controladores Modbus
- [ ] Testar conexão com PLC real
- [ ] Validar leitura de coils/registers
- [ ] Validar escrita de coils/registers
- [ ] Implementar retry logic robusto
- [ ] Logs de erro informativos

#### 3. Devices Básicos
- [ ] Garantir que Lights funcionam 100%
  - [ ] Criar lâmpada via API
  - [ ] Ligar/desligar via comando
  - [ ] Atualização em tempo real no dashboard
- [ ] Implementar Device genérico digital (ON/OFF)
- [ ] Implementar Device genérico analógico (0-100)

#### 4. Schedules
- [ ] Testar criação de schedule
- [ ] Testar execução automática
- [ ] Testar toggle ativo/inativo
- [ ] Validar integração com devices

#### 5. Persistência
- [ ] Migrations do banco criadas e funcionando
- [ ] Seeds iniciais (usuário admin)
- [ ] Backup automático do SQLite

#### 6. Autenticação
- [ ] Login funcional
- [ ] Token JWT válido
- [ ] Proteção de rotas
- [ ] Logout limpa sessão

---

### 🎨 Frontend - Essencial

#### 1. Páginas Core
- [x] Login
- [x] Dashboard principal
- [x] Lights
- [x] Schedules
- [x] Settings > Devices
- [x] Settings > Controllers
- [x] Settings > Users

#### 2. Funcionalidades Core
- [ ] **Dashboard:**
  - [ ] Exibir status de devices em tempo real
  - [ ] Cards clicáveis para controle rápido
  - [ ] Indicador de conexão com backend

- [ ] **Lights:**
  - [ ] Listar todas as lâmpadas
  - [ ] Toggle ON/OFF funcional
  - [ ] Feedback visual imediato
  - [ ] Grupos funcionais (se aplicável)

- [ ] **Schedules:**
  - [ ] Criar novo schedule
  - [ ] Editar schedule existente
  - [ ] Deletar schedule
  - [ ] Toggle ativo/inativo
  - [ ] Executar manualmente

- [ ] **Settings:**
  - [ ] Criar controller Modbus
  - [ ] Criar device e vincular a endpoint
  - [ ] Criar/editar usuários

#### 3. UX/UI Básica
- [ ] Loading states
- [ ] Error messages claros
- [ ] Confirmação antes de deletar
- [ ] Toast notifications para ações

---

## 🎯 FLUXO DE TESTE MVP

### Cenário 1: Setup Inicial
1. [ ] Criar usuário admin via seed
2. [ ] Fazer login no frontend
3. [ ] Acessar dashboard vazio

### Cenário 2: Configurar Controller
1. [ ] Ir em Settings > Controllers
2. [ ] Criar controller Modbus TCP
3. [ ] Configurar IP, porta, slave ID
4. [ ] Salvar e verificar conexão

### Cenário 3: Criar Device (Lâmpada)
1. [ ] Ir em Settings > Devices
2. [ ] Criar novo device tipo "light"
3. [ ] Vincular a controller e endpoint (ex: coil 0)
4. [ ] Salvar

### Cenário 4: Controlar Lâmpada
1. [ ] Ir em página Lights
2. [ ] Ver lâmpada listada
3. [ ] Clicar toggle ON/OFF
4. [ ] Verificar comando Modbus enviado
5. [ ] Ver feedback visual imediato

### Cenário 5: Criar Schedule
1. [ ] Ir em Schedules
2. [ ] Criar schedule: "Ligar luz às 18h"
3. [ ] Selecionar device (lâmpada)
4. [ ] Selecionar ação (turnOn)
5. [ ] Definir horário
6. [ ] Salvar e ativar

### Cenário 6: Dashboard Tempo Real
1. [ ] Abrir Dashboard
2. [ ] Ligar lâmpada fisicamente ou via Modbus
3. [ ] Verificar atualização automática no dashboard (via long-polling)

---

## 📦 DEPLOYMENT MÍNIMO

### Backend
```bash
# Build
cd apps/backend
bun install
bun run build  # PRECISA FUNCIONAR!

# Start
bun run start  # ou bun run src/index.ts
```

### Frontend
```bash
# Build
cd apps/frontend
bun install
bun run build

# Start
bun run start
```

### Docker (Opcional para MVP)
```yaml
version: '3.8'
services:
  backend:
    build: ./apps/backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=seu_secret_aqui

  frontend:
    build: ./apps/frontend
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://backend:4000
```

---

## 🚀 PRIORIDADES IMEDIATAS

### 🔴 CRÍTICO (Bloqueante)
1. **Corrigir build do backend** (erro de workers\modbus)
2. **Testar conexão Modbus real** com PLC
3. **Validar comando ON/OFF** em device real

### 🟡 IMPORTANTE (Alta prioridade)
4. **Seeds do banco** (usuário admin padrão)
5. **Validar long-polling** do dashboard
6. **Error handling** robusto (frontend + backend)

### 🟢 DESEJÁVEL (Pode vir depois)
7. Logs estruturados (pino/winston)
8. Métricas básicas (devices online, comandos/min)
9. Backup automático do banco
10. Docker compose funcional

---

## 📊 CRITÉRIOS DE SUCESSO MVP

O MVP está pronto quando:

✅ **Build funciona** sem erros
✅ **Login/logout** funcional
✅ **Criar controller** Modbus e conectar
✅ **Criar device** (lâmpada) vinculado a endpoint
✅ **Ligar/desligar** lâmpada via interface
✅ **Dashboard atualiza** em tempo real (< 5s)
✅ **Schedule executa** ação no horário certo
✅ **Sem crashes** por 1 hora de uso contínuo

---

## 🧪 TESTES MANUAIS ESSENCIAIS

### Teste 1: Ciclo Completo
- [ ] Setup → Controller → Device → Comando → Sucesso

### Teste 2: Reconexão
- [ ] Desconectar PLC
- [ ] Tentar comando (deve falhar gracefully)
- [ ] Reconectar PLC
- [ ] Comando deve voltar a funcionar

### Teste 3: Múltiplos Usuários
- [ ] Login em 2 navegadores
- [ ] Ação em um deve refletir no outro (dashboard)

### Teste 4: Schedules
- [ ] Criar schedule para daqui 2 minutos
- [ ] Aguardar execução automática
- [ ] Verificar que foi executado

---

## 📝 PRÓXIMOS PASSOS RECOMENDADOS

1. **AGORA:** Corrigir build do backend
2. **HOJE:** Testar Modbus com device real
3. **HOJE:** Validar fluxo completo (Teste 1)
4. **AMANHÃ:** Polir UI/UX básico
5. **AMANHÃ:** Criar seeds e documentação de setup

---

## 🐛 BUGS CONHECIDOS A CORRIGIR

- [ ] Build do backend falhando (workers\modbus)
- [ ] Dashboard pode não atualizar se EventBus não propagar
- [ ] Sem tratamento de erro se PLC offline
- [ ] Sem loading state em algumas páginas
- [ ] Schedules podem não executar se backend reiniciar

---

## 📚 DOCUMENTAÇÃO NECESSÁRIA

- [ ] README.md principal
  - [ ] Como fazer setup inicial
  - [ ] Como configurar primeiro controller
  - [ ] Como criar primeiro device

- [ ] INSTALL.md
  - [ ] Dependências (Bun, Node, etc)
  - [ ] Variáveis de ambiente
  - [ ] Primeiro usuário

- [ ] API.md
  - [ ] Endpoints principais
  - [ ] Exemplos de uso
  - [ ] Schemas de request/response

---

## 🎉 PÓS-MVP (Fase 2)

Após MVP funcional:
- Sensors (nível, temperatura, etc)
- Pumps (bombas)
- Valves (válvulas)
- Water tanks com lógica de controle
- Gráficos e histórico
- Alertas e notificações
- App mobile
- MQTT integration

---

**Última atualização:** 2025-11-13
**Status:** Definição completa - Pronto para execução
**Próxima ação:** Corrigir build do backend
