# Contexto do Projeto: Supervisor

Este arquivo serve como um ponto de referência central para o desenvolvimento do projeto Supervisor, ajudando a alinhar o desenvolvedor e a IA (Cursor).

## 1. Objetivo do Projeto

Sistema de supervisão e controle de dispositivos industriais/automáticos, incluindo:
- Controle de iluminação
- Sistema hidráulico (bombas, válvulas, sensores)
- Monitoramento de níveis de reservatórios
- Interface web para controle e monitoramento

## 2. Visão Geral da Arquitetura

- **Backend:** Bun (runtime JavaScript), TypeScript, Modbus (jsmodbus), Drizzle ORM
- **Frontend:** Next.js 15, React 19, TypeScript, TailwindCSS
- **Comunicação:** WebSocket (para tempo real), API REST, Modbus TCP/IP

## 3. Componentes Específicos

### 3.1 Controladores (Controller)
- **O que são:** Controladores Lógicos Programáveis (CLPs) que gerenciam equipamentos físicos
- **Tipos:** 
  - CLPs (Controladores Lógicos Programáveis)
- **Comunicação:** Modbus TCP/IP (porta 502), podendo ter outros tipos de comunicação mas ainda pedente.
- **Estrutura de dados:** Configurados em `backend/data/devices.json`
- **Descrição** O controlador tem chamados 'endpoint' que são represetação fisica de cada entrada/saída do controlador onde os dispositivos vão controlar.

### 3.1 Dispositivos (Devices)
- **O que são:** Controladores Lógicos Programáveis (CLPs) que gerenciam equipamentos físicos
- **Tipos:** 
  - CLPs (Controladores Lógicos Programáveis)
  - Sensores de nível (Level sensors)
  - Luzes/Iluminação
  - Bombas e válvulas hidráulicas
- **Comunicação:** Modbus TCP/IP (porta 502)
- **Estrutura de dados:** Configurados em `backend/data/devices.json`
- **Controles:** Leitura de sensores, controle de atuadores, monitoramento de status

### 3.2 Sistema de Iluminação
- **Funcionalidades:** Controle de luzes individuais e grupos
- **Interface:** Página `/dashboard/iluminacao` no frontend
- **Protocolos:** Modbus TCP/IP via CLPs

### 3.3 Sistema Hidráulico
- **Funcionalidades:** Controle de bombas, válvulas, sensores de pressão e nível
- **Interface:** Página `/dashboard/hidraulico` no frontend
- **Protocolos:** Modbus TCP/IP via CLPs
- **Componentes:** Reservatório Inferior, Reservatório Superior

### 3.4 Autenticação e Usuários
- **Sistema de login:** JWT (jsonwebtoken) + bcryptjs
- **Permissões:** (A definir)
- **Segurança:** Tokens JWT para autenticação

## 4. Estrutura de Dados

### 4.1 Banco de Dados
- **Tecnologia:** SQLite com Drizzle ORM
- **Tabelas principais:** (Verificar schemas em `backend/src/database/schemas/`)
- **Relacionamentos:** (A definir)

### 4.2 APIs
- **Endpoints principais:** (Verificar em `backend/src/routes/`)
- **Formato de dados:** JSON
- **Autenticação:** JWT tokens

## 5. Próximos Passos

- [ ] Implementar páginas do dashboard (iluminação e hidráulico)
- [ ] Conectar frontend com backend via WebSocket
- [ ] Implementar autenticação completa
- [ ] Testar comunicação Modbus com CLPs
- [ ] Criar interface para configuração de dispositivos

## 6. Notas de Desenvolvimento

### 6.1 Comandos Úteis
```bash
# Backend
cd backend
bun run dev

# Frontend
cd frontend
bun run dev

# Banco de dados
bun run db:generate
bun run db:push
bun run db:studio
```

### 6.2 Arquivos Importantes
- `backend/src/index.ts` - Ponto de entrada do backend
- `backend/data/devices.json` - Configuração de dispositivos CLPs
- `frontend/src/app/dashboard/page.tsx` - Página principal do dashboard
- `backend/src/services/core/SupervisorService.ts` - Serviço principal
- `backend/src/services/devices/manager.ts` - Gerenciador de dispositivos

### 6.3 Configuração de Dispositivos
Os CLPs são configurados com:
- **CLP1:** IP 192.168.0.240, Porta 502
- **CLP2:** IP 192.168.1.100, Porta 502

### 6.4 Estrutura de Pastas
```
backend/
├── src/
│   ├── services/          # Serviços do sistema
│   ├── database/          # Configuração do banco
│   ├── routes/            # APIs REST
│   └── workers/           # Workers para comunicação
├── data/                  # Dados de configuração
└── workers/               # Workers específicos (Modbus, IR)

frontend/
├── src/
│   ├── app/              # Páginas Next.js
│   ├── components/       # Componentes React
│   └── contexts/         # Contextos React
``` 

### 6.5 Novo Arquivo de Configuração
```
[
  {
    "id": "1",
    "type": "level",
    "name": "Reservatorio Inferior",
    "controllerName": "CLP1",
    "endpoints": { "0": "DO1" }
  },
  {
    "id": "2",
    "type": "level",
    "name": "Reservatorio Superior",
    "controllerName": "CLP1",
    "endpoints": { "0": "DO1" }
  },
  {
    "id": "luz-garagem",
    "type": "light",
    "name": "Luz da Garagem",
    "controllerName": "CLP2",
    "endpoints": { "0": "RELAY3" }
  }
] 