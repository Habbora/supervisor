# Quick Reference - Supervisor

Guia rápido de comandos e troubleshooting.

---

## 🚀 Comandos Principais

```bash
# Instalar dependências
bun install

# Rodar tudo (backend + frontend)
bun run dev

# Rodar separado
bun run dev:backend
bun run dev:frontend

# Build
bun run build

# Limpar cache
bun run clean
rm -rf apps/frontend/.next
```

---

## 🔐 Login

```
URL: http://localhost:3000/login
Usuário: admin
Senha: admin
```

---

## 📍 URLs Importantes

```
Frontend: http://localhost:3000
Backend:  http://localhost:4001

Páginas:
- Login:      /login
- Dashboard:  /
- Iluminação: /lights
- Settings:   /settings
  - Users:    /settings/users
  - Devices:  /settings/devices
```

---

## 🐛 Troubleshooting

### Frontend não atualiza após mudanças

```bash
# 1. Limpar cache do Next.js
rm -rf apps/frontend/.next

# 2. Reiniciar
bun run dev

# 3. No navegador
Ctrl + Shift + R (hard refresh)
```

### Lâmpadas não aparecem

```bash
# Verificar se backend está rodando
# Logs devem mostrar:
🔆 Mock Light Simulator iniciado
📊 Estados iniciais das lâmpadas

# Se não aparecer, reiniciar backend
Ctrl + C
bun run dev
```

### Tabs não aparecem

**Problema:** Campo `group` não está no retorno do backend

**Solução:**
1. Verificar `apps/backend/src/services/devices/Device.ts`
2. Método `toDashboard()` deve incluir `group: this.group`
3. Reiniciar backend

### Erro "Device config not found"

**Problema:** Falta config do driver

**Solução:**
Criar arquivo em `apps/backend/src/services/controllers/controllerConfigs/`

Exemplo `modbus.json`:
```json
{
  "name": "modbus",
  "protocol": "modbus",
  "endpoints_register": []
}
```

### Erro "Worker not found"

**Problema:** Driver não existe ou caminho errado

**Solução:**
1. Verificar `apps/backend/src/workers/`
2. Criar worker se não existir
3. Atualizar `WorkerPathLoader`

---

## 📝 Arquivos Importantes

### Backend
```
apps/backend/
├── src/index.ts                    # Entry point
├── src/mock-lights-simulator.ts    # Mock hardware
├── database/database.json          # Devices + controllers
├── database/supervisor.db          # Users + logs
└── src/services/devices/Device.ts  # ⚠️ Tem campo group!
```

### Frontend
```
apps/frontend/
├── src/app/(dashboard)/lights/page.tsx          # Página iluminação
├── src/components/devices/ModernLightCard.tsx   # Card de luz
├── src/components/ui/tabs.tsx                   # Tabs
├── src/types/devices/light.type.ts              # ⚠️ Tem campo group!
└── src/features/dashboard/provider/             # Dashboard context
```

---

## 🎨 Adicionar Nova Lâmpada

**Arquivo:** `apps/backend/database/database.json`

```json
{
  "id": "uuid-aqui",
  "name": "Iluminação Nova",
  "type": "light",
  "group": "Internos",  ← escolher grupo
  "endpoints": [
    {
      "name": "default",
      "controllerId": "uuid-controller",
      "endpointName": "DO1"
    }
  ],
  "inputs": [],
  "outputs": []
}
```

Reiniciar backend → Aparece automaticamente!

---

## 🏷️ Adicionar Novo Grupo

1. Editar lâmpadas em `database.json`
2. Mudar campo `"group": "NovoGrupo"`
3. Reiniciar backend
4. Tab aparece automaticamente com ícone padrão

Para customizar ícone, editar:
`apps/frontend/src/app/(dashboard)/lights/page.tsx`

```typescript
icon: group === 'NovoGrupo'
  ? <NovoIcone className="w-4 h-4" />
  : <Building className="w-4 h-4" />
```

---

## 🔍 Debug

### Ver estado das lâmpadas

Adicionar no componente:
```typescript
console.log('lightDevices:', lightDevices);
console.log('groups:', groups);
```

### Ver dados do backend

Logs do backend mostram:
```
📊 Estados iniciais das lâmpadas:
  1. DO1: ✅ LIGADA
  2. DO2: ❌ DESLIGADA
  ...
```

### Ver chamadas API

F12 → Network → Filtrar: `dashboard`

Deve aparecer:
```
GET /api/dashboard?sync=123456789
Response: { sync: ..., devices: [...], controllers: [...] }
```

### Verificar se group está vindo

F12 → Console:
```javascript
fetch('/api/dashboard').then(r => r.json()).then(d => console.log(d.devices[0]))
// Deve ter: { id, name, type, group, ... }
```

---

## ⚡ Ações Rápidas

### Ligar todas as lâmpadas (API direta)

```bash
curl -X POST http://localhost:4001/api/v1/dashboard \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"650e8400-e29b-41d4-a716-446655440101","action":"setToggle"}'
```

### Criar usuário

Frontend: `/settings/users` → Adicionar

Ou via API:
```bash
curl -X POST http://localhost:4001/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Novo User",
    "username":"novo",
    "password":"123456",
    "role":"user"
  }'
```

---

## 🎯 Checklist de Inicialização

Quando iniciar o projeto pela primeira vez ou após muito tempo:

- [ ] `bun install` (instalar dependências)
- [ ] Verificar se `database.json` existe
- [ ] Verificar se `modbus.json` existe em `controllerConfigs/`
- [ ] `bun run dev` (rodar tudo)
- [ ] Aguardar logs: "🔆 Mock Light Simulator iniciado"
- [ ] Aguardar logs: "Sistema inicializado em XXms"
- [ ] Acessar `http://localhost:3000/login`
- [ ] Login: `admin` / `admin`
- [ ] Ir em `/lights`
- [ ] Verificar se tabs aparecem
- [ ] Verificar se lâmpadas respondem ao click

---

## 🔧 Modificações Comuns

### Mudar estado inicial das lâmpadas

**Arquivo:** `apps/backend/src/mock-lights-simulator.ts`

```typescript
private mockEndpoints = [
  { controllerId: "...", endpointName: "DO1", value: true },  // ligada
  { controllerId: "...", endpointName: "DO2", value: false }, // desligada
  ...
]
```

### Mudar cores da lâmpada ligada

**Arquivo:** `apps/frontend/src/components/devices/ModernLightCard.tsx`

```typescript
${isOn
  ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-300'
  : 'bg-white border-gray-200'
}
```

### Mudar tempo do long polling

**Backend:** `apps/backend/src/services/dashboard/index.ts`
```typescript
setTimeout(listener, 5000) // 5 segundos
```

---

## 📊 Estrutura do database.json

```json
{
  "controllers": [
    {
      "id": "uuid",
      "name": "CLP Mock",
      "type": "modbus",
      "configs": {
        "network": { "host": "192.168.1.100", "port": 502 }
      },
      "endpoints": [
        { "name": "DO1", "address": 0, "type": "output" }
      ]
    }
  ],
  "devices": [
    {
      "id": "uuid",
      "name": "Iluminação Sala",
      "type": "light",
      "group": "Internos",
      "endpoints": [
        {
          "name": "default",
          "controllerId": "controller-uuid",
          "endpointName": "DO1"
        }
      ],
      "inputs": [],
      "outputs": []
    }
  ]
}
```

---

## 🎨 Paleta de Cores

```
Lâmpada ligada:
- Background: from-amber-50 via-yellow-50 to-orange-50
- Border: border-amber-300
- Badge: bg-amber-500 text-white
- Shadow: shadow-amber-200/50

Lâmpada desligada:
- Background: bg-white
- Border: border-gray-200
- Badge: bg-gray-200 text-gray-700

Offline:
- Badge: bg-red-100 text-red-700
- Border: border-red-400

Alerta:
- Badge: bg-red-100 text-red-700
```

---

## 🚨 Erros Comuns

### "Cannot find module '@/...'"

**Causa:** Paths do TypeScript
**Solução:** Verificar `tsconfig.json` tem:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### "Database not initialized"

**Causa:** SQLite não foi criado
**Solução:** Backend cria automaticamente em `apps/backend/database/supervisor.db`

### "Port 3000 already in use"

**Causa:** Frontend já está rodando
**Solução:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### "Port 4001 already in use"

**Causa:** Backend já está rodando
**Solução:**
```bash
# Windows
netstat -ano | findstr :4001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4001 | xargs kill -9
```

---

## ✅ Tudo Funcionando?

Se você vê isso, está tudo OK:

**Backend:**
```
✅ Database imported
✅ EventBus imported
✅ MockLightSimulator imported
🔆 Mock Light Simulator iniciado
📊 Estados iniciais das lâmpadas:
  1. DO1: ✅ LIGADA
  ...
Sistema inicializado em 41ms
```

**Frontend:**
```
✓ Ready in 3s
○ Compiling /lights ...
✓ Compiled /lights in 2s
```

**Navegador:**
- Login funciona
- `/lights` mostra 3 tabs
- Lâmpadas aparecem com cores
- Click liga/desliga
- Animações suaves

🎉 **Tudo OK!**
