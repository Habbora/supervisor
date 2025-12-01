# Contexto do Projeto - Supervisor

**Última atualização:** 2025-11-06
**Sessão:** Implementação do sistema de iluminação com grupos

---

## 📋 Visão Geral

**Supervisor** é um sistema de supervisão e controle de dispositivos industriais/prediais que monitora e controla:
- 💡 Iluminação (controle on/off)
- 💧 Bombas hidráulicas (liga/desliga + detecção de falhas)
- 📊 Sensores de nível (monitoramento de reservatórios)
- ⚡ Pulsos (acionamentos de curta duração)

---

## 🏗️ Arquitetura

### Tipo: Monorepo Full-Stack

```
supervisor/
├── apps/
│   ├── backend/          # API Backend (Bun + TypeScript)
│   ├── frontend/         # Interface Web (Next.js 15 + React 19)
│   └── driver_demo/      # Demonstração de Drivers
├── packages/             # Pacotes compartilhados
├── .context/             # Contexto do projeto
└── docker-compose.yml    # Orquestração
```

### Stack Tecnológica

**Backend:**
- Runtime: Bun v1.x
- Linguagem: TypeScript 5.8.2
- Protocolo: Modbus TCP/IP (jsmodbus)
- Auth: JWT + Bun.password (bcrypt)
- Database: SQLite + Drizzle ORM, JSON flat files
- Validação: Zod

**Frontend:**
- Framework: Next.js 15.5.2
- React: 19.1.1
- TypeScript: 5.9.3
- UI: TailwindCSS 4 + Radix UI + Lucide Icons
- Build: Turbopack

---

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Iluminação (COMPLETO)

**Localização:** `apps/frontend/src/app/(dashboard)/lights/page.tsx`

**Características:**
- **Grupos/Tags personalizados:** Organize lâmpadas em grupos (ex: Internos, Externos)
- **Tabs interativas:** Alterne entre "Todas", "Internos", "Externos" com contadores
- **Filtros por grupo:** Estatísticas, busca e ações afetam apenas o grupo ativo
- **Controles:**
  - Ligar/desligar individual com animações
  - Ligar/desligar todas do grupo
  - Busca por nome ou ID (dentro do grupo)
- **Cards modernos:**
  - Animações suaves (pulse, scale, transitions)
  - Estados visuais (ligada/desligada/offline/alerta)
  - Tooltips no ID para evitar overflow
  - Gradientes amarelo/âmbar quando ligada
- **Estatísticas em tempo real:**
  - Total, Ligadas, Desligadas, Offline
  - Atualiza conforme grupo ativo
- **Long polling:** Atualização automática via `/api/dashboard?sync=`

**Componentes criados:**
- `ModernLightCard` - Card individual de lâmpada
- `Tabs` - Componente de tabs reutilizável
- Integração com `DashboardProvider`

**Mock configurado:**
- 8 lâmpadas divididas em 2 grupos:
  - **Internos (5):** Sala, Cozinha, Quarto Principal, Quarto 2, Banheiro
  - **Externos (3):** Garagem, Jardim, Quadra de Tênis
- Estado inicial: 4 ligadas, 4 desligadas (50/50)

---

## 🗂️ Estrutura de Arquivos Importantes

### Backend

```
apps/backend/
├── src/
│   ├── index.ts                                    # Entry point
│   ├── mock-lights-simulator.ts                    # Simulador de hardware
│   ├── database/
│   │   ├── index.ts                               # DatabaseManager (SQLite)
│   │   ├── migrations/                            # Migrations (users, loggers)
│   │   └── repositories/                          # Data access layer
│   ├── services/
│   │   ├── devices/
│   │   │   ├── Device.ts                         # Classe base (c/ group!)
│   │   │   ├── Light.ts                          # Luz
│   │   │   ├── Level.ts                          # Sensor de nível
│   │   │   ├── pump/index.ts                     # Bomba
│   │   │   └── DeviceService.ts                  # Gerenciador de devices
│   │   ├── controllers/
│   │   │   ├── controller/controller.ts          # Controller (CLP)
│   │   │   ├── manager/index.ts                  # ControllerManager
│   │   │   ├── controllerConfigs/                # Configs dos drivers
│   │   │   │   ├── modbus.json                   # ⚠️ Criado manualmente
│   │   │   │   ├── mcp46a.json
│   │   │   │   └── mcp17.json
│   │   │   └── utils/readDeviceConfig.ts
│   │   ├── event-bus/                            # Pub/Sub pattern
│   │   ├── dashboard/                            # Dashboard service
│   │   └── Logger/                               # Logging
│   ├── routes/api/v1/
│   │   ├── auth/                                 # Login, validate
│   │   ├── dashboard/route.ts                    # GET + POST dashboard
│   │   ├── users/                                # CRUD users
│   │   ├── devices/                              # CRUD devices
│   │   └── controllers/                          # CRUD controllers
│   └── workers/
│       └── driver-modbus.ts                       # Modbus worker
└── database/
    ├── database.json                              # Devices + Controllers (c/ groups!)
    └── supervisor.db                              # SQLite (users, logs)
```

### Frontend

```
apps/frontend/
├── src/
│   ├── app/(dashboard)/
│   │   ├── lights/page.tsx                       # ⭐ Página de iluminação
│   │   ├── layout.tsx                            # Layout com sidebar
│   │   └── page.tsx                              # Dashboard principal
│   ├── components/
│   │   ├── devices/
│   │   │   ├── ModernLightCard.tsx               # ⭐ Card moderno de luz
│   │   │   └── index.ts
│   │   ├── modern/
│   │   │   ├── modern-sidebar.tsx                # Sidebar (c/ link lights)
│   │   │   ├── device-level-card.tsx
│   │   │   └── device-pump-card.tsx
│   │   └── ui/
│   │       ├── tabs.tsx                          # ⭐ Componente Tabs
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ...
│   ├── features/
│   │   ├── dashboard/provider/
│   │   │   └── dashboardProvider.tsx             # Context + long polling
│   │   └── auth/hooks/useAuth.ts
│   ├── types/
│   │   └── devices/
│   │       └── light.type.ts                     # ⭐ Light type (c/ group!)
│   └── lib/
│       └── utils.ts
└── tailwind.config.ts
```

---

## 🔑 Credenciais Padrão

```
Usuário: admin
Senha: admin
```

---

## 🚀 Como Rodar

### 1. Instalar dependências:
```bash
bun install
```

### 2. Rodar (backend + frontend):
```bash
bun run dev
```

**Portas:**
- Backend: `http://localhost:4001`
- Frontend: `http://localhost:3000`

### 3. Acessar:
- Login: `http://localhost:3000/login`
- Iluminação: `http://localhost:3000/lights`

---

## 🔧 Decisões Técnicas Importantes

### 1. **Campo `group` em Devices**
- **Tipo frontend:** `apps/frontend/src/types/devices/light.type.ts`
  ```typescript
  export type Light = {
    id: string;
    name: string;
    value?: number;
    group?: string;  // ⭐ ADICIONADO
    ...
  }
  ```

- **Classe backend:** `apps/backend/src/services/devices/Device.ts`
  ```typescript
  export interface DeviceDTO {
    name: string;
    type: string;
    group?: string;  // ⭐ ADICIONADO
    ...
  }

  export class Device {
    public readonly group?: string;  // ⭐ ADICIONADO

    constructor(id: string, dto: DeviceDTO) {
      this.group = dto.group;  // ⭐ ADICIONADO
      ...
    }

    public toDashboard() {
      return {
        ...
        group: this.group,  // ⭐ ADICIONADO ao retorno
        ...
      }
    }
  }
  ```

### 2. **Mock Light Simulator**
**Arquivo:** `apps/backend/src/mock-lights-simulator.ts`

- Simula comportamento de hardware real sem CLPs físicos
- Estados iniciais definidos (4 ligadas, 4 desligadas)
- Escuta `controller_action` do EventBus
- Publica `endpoint_event` de volta
- Intervalo de 5s para simular leituras

### 3. **Config do Modbus**
**Arquivo criado manualmente:** `apps/backend/src/services/controllers/controllerConfigs/modbus.json`

```json
{
  "name": "modbus",
  "protocol": "modbus",
  "endpoints_register": []
}
```

**⚠️ Importante:** Este arquivo era necessário mas não existia, causava erro ao iniciar.

### 4. **Padrões de Design**
- **Singleton:** EventBus, DeviceService, ControllerManager, Dashboard
- **Factory:** DeviceFactory cria Light, Level, Pump, Pulse
- **Observer:** Event-Driven via EventBus
- **Repository:** UserRepository, LoggerRepository
- **Worker Pool:** Drivers rodam em Bun Workers

### 5. **Long Polling Otimizado**
- Frontend: `GET /api/dashboard?sync={timestamp}`
- Backend aguarda mudanças ou timeout 5s
- Frontend faz loop infinito com sync atualizado
- Eficiente: só retorna quando há mudança

---

## 📊 Fluxo de Dados - Iluminação

```
[Frontend] Usuário clica em lâmpada
    ↓
POST /api/dashboard { deviceId, action: "setToggle" }
    ↓
[Backend] DeviceService.findById(deviceId)
    ↓
device.actions["setToggle"]()
    ↓
EventBus.publish('controller_action', {...})
    ↓
MockLightSimulator.listenToActions()
    ↓
Mock atualiza estado interno
    ↓
EventBus.publish('endpoint_event', {...})
    ↓
Device.onUpdateEndpoints()
    ↓
device.value atualizado
    ↓
EventBus.publish('device_value_changed', {...})
    ↓
Dashboard detecta mudança (atualiza __sync)
    ↓
[Frontend] Long polling retorna com novos dados
    ↓
DashboardContext atualiza
    ↓
Componentes re-renderizam (useDashboard)
    ↓
ModernLightCard mostra novo estado com animação
```

---

## 📝 Estado Atual do Projeto

### ✅ Completo
- Sistema de autenticação (JWT)
- Página de iluminação com grupos
- Cards modernos com animações
- Tabs interativas
- Mock de 8 lâmpadas funcionando
- Long polling em tempo real
- Sidebar com navegação
- Tooltips e feedback visual
- Filtros e busca por grupo
- Estatísticas dinâmicas

### ⚠️ Em Progresso / Pendente
- Página de bombas (pump)
- Página de sensores de nível (level)
- Página de agendamentos (schedules)
- Página de configurações completa
- Gestão de usuários (existe mas precisa melhorias)
- Gestão de dispositivos (existe mas precisa melhorias)
- Gestão de controladores (existe mas precisa melhorias)
- Hardware real (atualmente só mock)

---

## 🐛 Problemas Conhecidos e Soluções

### 1. **Tabs não aparecem após modificação**
**Causa:** Backend não foi reiniciado, campo `group` não está no retorno
**Solução:** Reiniciar backend (`Ctrl+C` e `bun run dev`)

### 2. **Frontend não atualiza após mudanças**
**Causa:** Cache do Next.js
**Solução:**
```bash
rm -rf apps/frontend/.next
bun run dev
```
No navegador: `Ctrl+Shift+R` (hard refresh)

### 3. **Lâmpadas não respondem**
**Causa:** MockLightSimulator não iniciado
**Solução:** Verificar logs do backend, deve ter:
```
🔆 Mock Light Simulator iniciado
📊 Estados iniciais das lâmpadas:
```

### 4. **Erro: "Device config not found"**
**Causa:** Falta config do driver em `controllerConfigs/`
**Solução:** Criar arquivo JSON do driver (ex: `modbus.json`)

---

## 🎨 Guia de Estilo - UI

### Cores
- **Lâmpada ligada:** Gradiente `from-amber-50 via-yellow-50 to-orange-50`
- **Borda ligada:** `border-amber-300`
- **Badge ligada:** `bg-amber-500 text-white`
- **Lâmpada desligada:** `bg-white border-gray-200`
- **Offline:** `bg-red-100 text-red-700`

### Animações
- **Hover:** `hover:scale-[1.02]`
- **Active:** `active:scale-[0.98]`
- **Pulse:** `animate-pulse` (quando ligada)
- **Transições:** `transition-all duration-300`

### Ícones (Lucide)
- **Todas:** `Sparkles`
- **Internos:** `Home`
- **Externos:** `Building`
- **Ligada:** `Zap`
- **Desligada:** `Lightbulb`
- **Power:** `Power`

---

## 🔮 Próximos Passos Sugeridos

### Alta Prioridade
1. **Página de Bombas** - Similar à iluminação
2. **Página de Níveis** - Com gráficos de % e barras
3. **Agendamentos** - Ligar/desligar luzes em horários
4. **Gestão de Grupos** - Interface para criar/editar grupos

### Média Prioridade
5. **Histórico de acionamentos** - Log de quem ligou/desligou e quando
6. **Notificações** - Alertas quando dispositivo fica offline
7. **Temas** - Dark mode
8. **Dashboard home** - Widgets resumidos de todos os sistemas

### Baixa Prioridade
9. **Conexão com hardware real** - Substituir mock por Modbus TCP/IP real
10. **Mobile app** - PWA ou React Native
11. **Integração com Alexa/Google Home**
12. **Relatórios** - Consumo, tempo ligado, etc.

---

## 📚 Referências Úteis

### Documentação
- Bun: https://bun.sh/docs
- Next.js 15: https://nextjs.org/docs
- React 19: https://react.dev
- TailwindCSS 4: https://tailwindcss.com/docs
- Modbus: https://www.npmjs.com/package/jsmodbus

### Arquivos de Referência
- `MOCK_SETUP.md` - Guia do mock de iluminação
- `apps/backend/src/mock-lights-simulator.ts` - Como simular hardware
- `apps/frontend/src/app/(dashboard)/lights/page.tsx` - Exemplo completo de página
- `apps/frontend/src/components/devices/ModernLightCard.tsx` - Card bem feito

---

## 🤝 Como Adicionar Novos Recursos

### Adicionar novo grupo de lâmpadas:
1. Editar `apps/backend/database/database.json`
2. Adicionar campo `"group": "NovoGrupo"` nos devices
3. Reiniciar backend
4. As tabs aparecem automaticamente!

### Adicionar novo tipo de dispositivo:
1. Criar classe em `apps/backend/src/services/devices/NovoTipo.ts`
2. Estender `Device` e implementar `actions`
3. Adicionar no `DeviceFactory.createDevice()`
4. Criar componente frontend em `apps/frontend/src/components/devices/`
5. Criar página em `apps/frontend/src/app/(dashboard)/novo-tipo/page.tsx`

### Adicionar novo driver/protocolo:
1. Criar config em `apps/backend/src/services/controllers/controllerConfigs/novo.json`
2. Criar worker em `apps/backend/src/workers/driver-novo.ts`
3. Atualizar `loadWorker()` em `WorkerPathLoader`

---

## 💾 Backup Importante

**Arquivos críticos para não perder:**
- `apps/backend/database/database.json` - Configuração de todos os devices
- `apps/backend/database/supervisor.db` - Usuários e logs
- `apps/backend/src/mock-lights-simulator.ts` - Simulador
- `apps/frontend/src/app/(dashboard)/lights/page.tsx` - Página completa
- `.env` (se existir) - Variáveis de ambiente

---

## 🎯 Resumo da Última Sessão (2025-11-06)

**Implementado:**
1. ✅ Sistema completo de iluminação
2. ✅ Grupos/tags personalizados para lâmpadas
3. ✅ Tabs interativas (Todas, Internos, Externos)
4. ✅ Cards modernos com animações
5. ✅ Mock com 8 lâmpadas (4 ligadas, 4 desligadas)
6. ✅ Filtros e estatísticas por grupo
7. ✅ Tooltips no ID para evitar overflow
8. ✅ Long polling funcionando
9. ✅ Integração completa frontend ↔ backend

**Bugs corrigidos:**
- ❌→✅ Campo `group` não aparecia no frontend (faltava em `toDashboard()`)
- ❌→✅ Config modbus.json não existia (criado manualmente)
- ❌→✅ IDs grandes vazando do card (tooltip + truncate)
- ❌→✅ Logger com chamadas sem await (adicionado await)

**Arquivos modificados:** 11
**Arquivos criados:** 3
**Tempo total:** ~2h

---

**🎉 Projeto funcional e pronto para continuar!**
