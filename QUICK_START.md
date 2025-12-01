# 🚀 Quick Start - MVP Funcionando

**Atualizado:** 2025-11-13 15:15

---

## ✅ STATUS ATUAL

### Frontend
- ✅ Build funciona sem erros
- ✅ Todos os tipos TypeScript corretos
- ✅ Menu sem keys duplicadas
- ✅ Logout direto funcional
- ✅ Roles mapeados corretamente

### Backend
- ✅ Servidor roda em dev mode
- ✅ Usuário admin criado (admin/admin)
- ✅ Todas as APIs funcionando

---

## 🎯 Como Rodar (MVP)

### 1. Backend
```bash
cd apps/backend
bun install
bun run src/index.ts
```

**Porta:** 4000
**API:** http://localhost:4000

### 2. Frontend
```bash
cd apps/frontend

# Limpar cache (se necessário)
rm -rf .next

# Instalar e rodar
bun install
bun run dev
```

**Porta:** 3000 (ou 3001 se 3000 estiver ocupado)
**URL:** http://localhost:3000 (ou http://localhost:3001)

---

## 🔑 Credenciais Padrão

```
Username: admin
Password: admin
Role: super (Administrador)
```

---

## 📋 Teste Rápido

### 1. Login
1. Acesse http://localhost:3001/login (ou 3000 se disponível)
2. Entre com admin/admin
3. Será redirecionado para dashboard

### 2. Navegação
- **Dashboard:** http://localhost:3001
- **Iluminação:** http://localhost:3001/lights
- **Agendamentos:** http://localhost:3001/schedules
- **Usuários:** http://localhost:3001/settings/users
- **Controladores:** http://localhost:3001/settings/controllers
- **Dispositivos:** http://localhost:3001/settings/devices

### 3. APIs (Backend)
```bash
# Health check
curl http://localhost:4000/health

# Login
curl -X POST http://localhost:4000/api/v1/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Controllers
curl http://localhost:4000/api/v1/controllers

# Lights
curl http://localhost:4000/api/v1/lights

# Devices
curl http://localhost:4000/api/v1/devices

# Schedules
curl http://localhost:4000/api/v1/schedules
```

---

## 🐛 Problemas Resolvidos

### ✅ Keys Duplicadas
- **Erro:** "Encountered two children with the same key"
- **Causa:** Menu tinha "Iluminação" duplicado
- **Solução:** Renomeado para "Dispositivos"

### ✅ Tipos TypeScript
- **Erro:** Light type incompatible
- **Causa:** Hook useLights tinha tipo diferente do global
- **Solução:** Importar tipo global Light

### ✅ Logout
- **Antes:** Página intermediária
- **Depois:** Botão direto no sidebar

### ✅ Roles
- **Backend:** super, admin, operator
- **Frontend:** Mapeamento automático para PT-BR

---

## ⚠️ Problemas Conhecidos

### 1. Build do Backend
```bash
bun run build  # ❌ FALHA (workers\modbus)
```

**Workaround:** Rodar em dev mode
```bash
bun run src/index.ts  # ✅ FUNCIONA
```

### 2. Modbus Não Testado
- Código existe
- Não foi validado com PLC real
- Precisa teste de conexão

### 3. Erro de Hidratação (Dev Mode)
Se aparecer erro de hidratação:
```bash
# Limpar cache
cd apps/frontend
rm -rf .next
bun run dev
```

---

## 🎯 Próximos Passos

### CRÍTICO (Bloqueante)
1. [ ] Corrigir build do backend (build.ts)
2. [ ] Testar Modbus com PLC real
3. [ ] Validar comando ON/OFF físico

### IMPORTANTE
4. [ ] Seeds do banco (fixtures)
5. [ ] Documentação de setup inicial
6. [ ] Error handling melhorado

### DESEJÁVEL
7. [ ] Toast notifications
8. [ ] Loading states
9. [ ] Confirmações de ações
10. [ ] Logs estruturados

---

## 📦 Estrutura de Portas

| Serviço | Porta | URL |
|---------|-------|-----|
| Backend | 4000 | http://localhost:4000 |
| Frontend | 3000 | http://localhost:3000 |
| Modbus PLC | 502 | 192.168.x.x:502 |

---

## 🔧 Comandos Úteis

### Limpar Tudo
```bash
# Frontend
cd apps/frontend
rm -rf .next node_modules
bun install

# Backend
cd apps/backend
rm -rf node_modules
bun install
```

### Verificar Portas
```bash
# Windows
netstat -an | findstr "3000"
netstat -an | findstr "4000"

# Linux/Mac
lsof -i :3000
lsof -i :4000
```

### Logs do Backend
```bash
cd apps/backend
bun run src/index.ts 2>&1 | tee backend.log
```

---

## 📚 Documentos Relacionados

- [MVP_ESSENCIAL.md](MVP_ESSENCIAL.md) - Definição do MVP mínimo
- [FRONTEND_FIXES.md](FRONTEND_FIXES.md) - Correções aplicadas
- [MVP_DEFINITION.md](MVP_DEFINITION.md) - Definição completa

---

## 🎉 Sucesso!

Se tudo rodou corretamente:
- ✅ Backend respondendo na porta 4000
- ✅ Frontend carregando na porta 3000
- ✅ Login funcionando
- ✅ Navegação sem erros

**Próximo passo:** Conectar PLC Modbus e testar comandos reais!

---

**Última atualização:** 2025-11-13 15:15
**Status:** Sistema rodando em dev mode ✅
