# Arquitetura Técnica - Supervisor

Documentação detalhada da arquitetura, padrões e fluxos do sistema.

---

## 🏛️ Visão Geral da Arquitetura

### Padrão: Event-Driven Architecture + Layered

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Pages (Dashboard, Lights, Settings)                  │  │
│  │  Components (ModernLightCard, Tabs)                   │  │
│  │  Providers (DashboardProvider - Long Polling)         │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           │ Long Polling (/api/dashboard?sync=)
┌──────────────────────────┴──────────────────────────────────┐
│                    BACKEND (Bun + TypeScript)               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Layer (REST Routes)                              │  │
│  │  /auth, /dashboard, /devices, /controllers, /users    │  │
│  └───────────────────────┬───────────────────────────────┘  │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │  Service Layer                                        │  │
│  │  DeviceService, ControllerManager, Dashboard         │  │
│  └───────────┬───────────────────────┬───────────────────┘  │
│  ┌───────────┴───────────┐ ┌─────────┴─────────┐           │
│  │  Event Bus (Pub/Sub)  │ │ Database Layer    │           │
│  │  - endpoint_event     │ │ - SQLite (users)  │           │
│  │  - device_value_ch... │ │ - JSON (devices)  │           │
│  │  - controller_action  │ └───────────────────┘           │
│  └───────────┬───────────┘                                  │
│  ┌───────────┴───────────────────────────────────────────┐  │
│  │  Hardware Abstraction Layer                           │  │
│  │  Controllers → Workers → Modbus TCP/IP               │  │
│  │  MockLightSimulator (para desenvolvimento)            │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Modbus TCP/IP
┌──────────────────────────┴──────────────────────────────────┐
│                    HARDWARE (PLCs/CLPs)                     │
│  Lâmpadas, Bombas, Sensores de Nível, Válvulas            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Padrões de Design Implementados

### 1. Singleton Pattern

**Implementado em:**
- `EventBus.getInstance()`
- `DeviceService.getInstance()`
- `ControllerManager.getInstance()`
- `Dashboard.getInstance()`
- `DatabaseManager.getInstance()`

**Justificativa:**
- Garantir única instância
- Compartilhar estado global
- Evitar conflitos de listeners

### 2. Factory Pattern

**Implementado em:**
- `DeviceService.createDevice()`

**Código:**
```typescript
private createDevice(deviceDTO: DeviceSchema): Device {
    switch (deviceDTO.type) {
        case "light": return new Light(deviceDTO.id, deviceDTO);
        case "level": return new DeviceLevel(deviceDTO.id, deviceDTO);
        case "pump": return new DevicePump(deviceDTO.id, deviceDTO);
        case "pulse": return new Pulse(deviceDTO.id, deviceDTO);
        default: return new Device(deviceDTO.id, deviceDTO);
    }
}
```

**Justificativa:**
- Criação polimórfica de devices
- Facilita adição de novos tipos
- Desacoplamento

### 3. Observer Pattern (Event-Driven)

**Implementado em:**
- `EventBus` (Pub/Sub)

**Eventos principais:**
```typescript
// Hardware → Device
'endpoint_event'
  { controllerId, endpointName, value }

// Device → Dashboard
'device_value_changed'
  { id, name, value }

// Frontend → Hardware
'controller_action'
  { id, endpointName, type }

// Forçar leitura
'force_read_endpoint'
  { controllerId, endpointName }
```

**Justificativa:**
- Desacoplamento total entre camadas
- Escalabilidade
- Facilita testes

### 4. Repository Pattern

**Implementado em:**
- `UserRepository`
- `LoggerRepository`

**Justificativa:**
- Abstração do acesso a dados
- Facilita mudança de banco
- Testes mais fáceis

### 5. Worker Pool Pattern

**Implementado em:**
- `Controller` com Bun Workers

**Código:**
```typescript
this.worker = loadWorker(deviceConfig.protocol);
this.worker.addEventListener("message", this.handleWorkerMessage);
```

**Justificativa:**
- Não bloquear thread principal
- Isolamento de falhas
- Performance

---

## 🔄 Fluxos Principais

### Fluxo 1: Ligar uma Lâmpada

```
[1] User clica no card da lâmpada
    ↓
[2] ModernLightCard.handleClick()
    ↓
[3] onToggle(deviceId)
    ↓
[4] handleToggleLight(deviceId)
    ↓
[5] fetch('/api/dashboard', {
      method: 'POST',
      body: { deviceId, action: 'setToggle' }
    })
    ↓
[6] Backend: POST /api/dashboard route
    ↓
[7] DeviceService.findById(deviceId)
    ↓
[8] device.actions['setToggle']()
    ↓
[9] Light.setToggle() → EventBus.publish('controller_action')
    ↓
[10] MockLightSimulator.listenToActions() recebe evento
    ↓
[11] Mock atualiza estado interno: lightStates.set(key, !currentState)
    ↓
[12] Mock publica: EventBus.publish('endpoint_event', {
       controllerId, endpointName, value: newValue
     })
    ↓
[13] Device.onUpdateEndpoints() recebe evento
    ↓
[14] device.value = newValue
    ↓
[15] EventBus.publish('device_value_changed')
    ↓
[16] Dashboard.listener detecta mudança
    ↓
[17] Dashboard.__sync atualizado
    ↓
[18] Frontend long polling recebe resposta:
     GET /api/dashboard?sync=old_value
     Response: { sync: new_value, devices: [...] }
    ↓
[19] DashboardContext.setDashboard(data)
    ↓
[20] useDashboard() hook notifica componentes
    ↓
[21] ModernLightCard re-renderiza com novo estado
    ↓
[22] Animação: setIsAnimating(true) → setTimeout(false, 600ms)
    ↓
[23] Visual: Cores mudam (amarelo = ligada)
```

**Tempo total:** ~200-500ms (mock) ou ~1-3s (hardware real)

---

### Fluxo 2: Long Polling (Dashboard Provider)

```
[1] Frontend: DashboardProvider.useEffect()
    ↓
[2] fetchLoop(sync) iniciado
    ↓
[3] fetch(`/api/dashboard?sync=${sync}`)
    ↓
[4] Backend: Dashboard.getDashboard(sync)
    ↓
[5] Verifica: this.__sync !== sync ?
    ├─ SIM → [6a] Retorna imediatamente { sync, devices, controllers }
    └─ NÃO → [6b] Aguarda:
              - Timeout de 5 segundos OU
              - Listener notificar mudança
    ↓
[7] Frontend recebe resposta
    ↓
[8] setDashboard(data)
    ↓
[9] setSync(data.sync)
    ↓
[10] fetchLoop(data.sync) → LOOP infinito
```

**Otimização:**
- Só retorna quando há mudança ou timeout
- Evita polling desnecessário
- Economiza banda e processamento

---

### Fluxo 3: Inicialização do Backend

```
[1] Bun executa src/index.ts
    ↓
[2] Imports:
    ├─ Database
    ├─ ControllerManager
    ├─ Dashboard
    ├─ DeviceService
    ├─ EventBus
    ├─ HistoryManager
    ├─ ScheduleManager
    ├─ logger
    └─ MockLightSimulator
    ↓
[3] await database (migrations)
    ├─ Cria tabela users (se não existe)
    ├─ Cria tabela loggers (se não existe)
    └─ Insere admin/admin (se não existe)
    ↓
[4] Database.getInstance()
    └─ Carrega database.json (devices + controllers)
    ↓
[5] EventBus.getInstance()
    └─ Singleton pronto para pub/sub
    ↓
[6] HistoryManager.getInstance()
    └─ Escuta device_value_changed
    ↓
[7] ControllerManager.getInstance()
    ├─ Carrega todos controllers do database.json
    ├─ Para cada controller:
    │   ├─ Lê config do driver (ex: modbus.json)
    │   ├─ Carrega worker
    │   ├─ Inicializa worker
    │   └─ Registra listeners
    └─ Controllers prontos
    ↓
[8] DeviceService.getInstance()
    ├─ Carrega todos devices do database.json
    ├─ Para cada device:
    │   ├─ Factory cria instância (Light, Level, Pump, etc)
    │   ├─ Device registra listeners em EventBus
    │   └─ device.forceReadEndpoints()
    └─ Devices prontos
    ↓
[9] MockLightSimulator.start()
    ├─ Define estados iniciais (4 on, 4 off)
    ├─ Registra listener em 'controller_action'
    ├─ Publica estados iniciais via 'endpoint_event'
    └─ Inicia intervalo de 5s (simula leituras)
    ↓
[10] ScheduleManager.getInstance()
     └─ Carrega agendamentos (futuro)
     ↓
[11] Dashboard.getInstance()
     ├─ Inicia WebService (HTTP server)
     ├─ Registra listeners em device_value_changed
     └─ Pronto para long polling
     ↓
[12] Sistema pronto! 🎉
     └─ Log: "Sistema inicializado em XXms"
```

---

## 🗃️ Estrutura de Dados

### Device (Backend)

```typescript
class Device {
  id: string              // UUID
  name: string            // "Iluminação Sala"
  type: string            // "light" | "level" | "pump" | "pulse"
  group?: string          // "Internos" | "Externos" | ...
  value: number | boolean // Estado atual
  endpoints: Endpoint[]   // Ligação com hardware
  inputs: Variable[]      // Entradas (ex: minValue, maxValue)
  outputs: Variable[]     // Saídas (ex: porcentagem)
  isAlert: boolean        // Tem alerta?
  actions: {              // Ações disponíveis
    [key: string]: () => void
  }
}
```

### Endpoint

```typescript
type Endpoint = {
  name: string           // "default" | "falha" | ...
  type: string           // "input" | "output"
  value?: any            // Valor atual
  controllerId?: string  // UUID do controller
  endpointName?: string  // "DO1", "AI1", etc
}
```

### Controller

```typescript
class Controller {
  id: string
  name: string           // "CLP Mock - Setor A"
  type: string           // "modbus" | "mcp46a" | "mcp17"
  configs: {
    network: {
      host: string       // "192.168.1.100"
      port: number       // 502
    }
  }
  endpoints: ControllerEndpoint[]
  worker?: Worker        // Bun Worker
  status: {
    isEnabled: boolean
    isRunning: boolean
    isConnected: boolean
  }
}
```

### Light (Frontend)

```typescript
type Light = {
  id: string
  name: string
  value?: number         // 0 = off, 1 = on
  group?: string         // "Internos" | "Externos"
  isOnline?: boolean
  isAlert?: boolean
}
```

---

## 🔌 API Endpoints

### POST /api/v1/auth
**Descrição:** Login
**Body:**
```json
{
  "username": "admin",
  "password": "admin"
}
```
**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "Admin",
    "username": "admin",
    "role": "admin"
  }
}
```

### POST /api/v1/auth/validate
**Descrição:** Validar token JWT
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "valid": true,
  "user": { ... }
}
```

### GET /api/v1/dashboard?sync={timestamp}
**Descrição:** Long polling dashboard
**Query:**
- `sync` (opcional): Último sync recebido

**Response:**
```json
{
  "sync": "1699234567890",
  "devices": [
    {
      "id": "uuid",
      "name": "Iluminação Sala",
      "type": "light",
      "group": "Internos",
      "value": 1,
      "endpoints": [...],
      "isAlert": false
    }
  ],
  "controllers": [...]
}
```

### POST /api/v1/dashboard
**Descrição:** Executar ação em device
**Body:**
```json
{
  "deviceId": "uuid",
  "action": "setToggle"
}
```
**Response:**
```json
{
  "success": true
}
```

### GET /api/v1/devices
**Descrição:** Listar devices
**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Iluminação Sala",
    "type": "light",
    "group": "Internos",
    ...
  }
]
```

### GET /api/v1/users
**Descrição:** Listar usuários
**Response:**
```json
[
  {
    "id": 1,
    "name": "Admin",
    "username": "admin",
    "role": "admin",
    "created_at": "..."
  }
]
```

---

## 🎭 Estados de um Device

### Ciclo de vida:

```
[Criação]
  ↓
Database.json → DeviceService.createDevice() → new Light()
  ↓
[Inicialização]
  ↓
constructor() → Registra listener 'endpoint_event'
  ↓
forceReadEndpoints() → Publica 'force_read_endpoint'
  ↓
[Operação Normal]
  ↓
Recebe 'endpoint_event' → onUpdateEndpoints()
  ↓
Calcula novo value → this.value = ...
  ↓
Publica 'device_value_changed'
  ↓
[Ação do Usuário]
  ↓
Frontend chama action → device.actions['setToggle']()
  ↓
Publica 'controller_action'
  ↓
Mock/Hardware responde → 'endpoint_event'
  ↓
[Loop continua...]
  ↓
[Destruição]
  ↓
device.destroy() → Unsubscribe de eventos
```

---

## 🧩 Componentes React Principais

### DashboardProvider

**Responsabilidade:** Context + Long Polling

```typescript
export const DashboardProvider = ({ children }) => {
  const [sync, setSync] = useState("0");
  const [dashboard, setDashboard] = useState({
    devices: [],
    controllers: [],
    sync: "",
  });

  useEffect(() => {
    async function fetchLoop(currentSync) {
      const response = await fetch(`/api/dashboard?sync=${currentSync}`);
      const data = await response.json();
      setDashboard(data);
      setSync(data.sync);
      fetchLoop(data.sync); // Loop infinito
    }
    fetchLoop(sync);
  }, []);

  return (
    <DashboardContext.Provider value={{ dashboard, devices, controllers, sync }}>
      {children}
    </DashboardContext.Provider>
  );
};
```

### useDashboard Hook

```typescript
const { devices, controllers, sync } = useDashboard();
```

### Lights Page (Estrutura)

```typescript
export default function LightsPage() {
  // 1. Estados
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Dados do dashboard
  const { devices } = useDashboard();

  // 3. Filtros
  const lightDevices = useMemo(() =>
    devices.filter(d => d.type === 'light'), [devices]
  );

  const groups = useMemo(() =>
    [...new Set(lightDevices.map(l => l.group))], [lightDevices]
  );

  const filteredByGroup = useMemo(() =>
    activeTab === 'all' ? lightDevices : lightDevices.filter(l => l.group === activeTab),
    [lightDevices, activeTab]
  );

  const filteredLights = useMemo(() =>
    searchQuery ? filteredByGroup.filter(l => l.name.includes(searchQuery)) : filteredByGroup,
    [filteredByGroup, searchQuery]
  );

  // 4. Estatísticas
  const stats = useMemo(() => ({
    total: filteredByGroup.length,
    onCount: filteredByGroup.filter(l => l.value).length,
    offCount: ...,
    offlineCount: ...
  }), [filteredByGroup]);

  // 5. Actions
  const handleToggleLight = async (deviceId) => {
    await fetch('/api/dashboard', {
      method: 'POST',
      body: JSON.stringify({ deviceId, action: 'setToggle' })
    });
  };

  // 6. Render
  return (
    <div>
      <Header />
      <Stats />
      <Tabs /> {/* Grupos */}
      <Controls /> {/* Busca + Botões */}
      <Grid>
        {filteredLights.map(light =>
          <ModernLightCard key={light.id} device={light} onToggle={handleToggleLight} />
        )}
      </Grid>
    </div>
  );
}
```

---

## 🔐 Segurança

### Autenticação
- JWT com secret configurável
- Token armazenado em cookies httpOnly
- Expiração configurável

### Senhas
- Hash bcrypt via `Bun.password.hash()`
- Verificação via `Bun.password.verify()`
- Mínimo 6 caracteres

### Validação
- Zod schemas para todos os DTOs
- Validação no backend antes de processar

### CORS
- Configurado no backend
- `Access-Control-Allow-Origin: *` (desenvolvimento)
- Ajustar para produção

---

## 📈 Performance

### Long Polling
- Evita polling desnecessário com `sync`
- Timeout de 5s para não bloquear
- Reconnection automática

### Workers
- Drivers rodam em Bun Workers
- Não bloqueia thread principal
- Isolamento de falhas

### Caching
- Dashboard mantém estado em memória
- Só atualiza quando há mudança real

### Bundle Size (Frontend)
- Next.js 15 com Turbopack
- Code splitting automático
- Tree shaking

---

## 🧪 Testabilidade

### Backend
- EventBus permite mock fácil
- Repository Pattern facilita testes de dados
- MockLightSimulator substitui hardware

### Frontend
- Componentes desacoplados
- Context separado do componente
- Props tipadas com TypeScript

---

## 🔮 Extensibilidade

### Adicionar novo tipo de device:
1. Criar classe em `services/devices/NovoTipo.ts` extendendo `Device`
2. Implementar `actions` e `onEndpointEvent()`
3. Adicionar no `DeviceFactory.createDevice()`
4. Criar componente frontend
5. Pronto!

### Adicionar novo driver:
1. Criar config JSON em `controllerConfigs/`
2. Criar worker em `workers/`
3. Atualizar `WorkerPathLoader`
4. Pronto!

### Adicionar novo grupo:
1. Editar `database.json`
2. Adicionar campo `"group": "NovoGrupo"`
3. Reiniciar backend
4. Pronto! (detecta automaticamente)

---

**🎯 Arquitetura escalável, testável e extensível!**
