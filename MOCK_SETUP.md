# 🔆 Mock de Iluminação - Guia Rápido

## 🔐 Credenciais de Acesso

**Usuário:** `admin`
**Senha:** `admin`

---

## O que foi configurado?

Sistema de demonstração completo com **8 lâmpadas mock** funcionando sem precisar de hardware real!

### 📦 O que foi criado:

1. **Database Mock** (`apps/backend/database/database.json`)
   - 2 Controllers (CLPs) simulados
   - 8 Dispositivos de iluminação

2. **Simulador de Luzes** (`apps/backend/src/mock-lights-simulator.ts`)
   - Simula comportamento real das lâmpadas
   - Responde aos comandos de ligar/desligar
   - Publica eventos via EventBus

3. **Página de Iluminação** (`apps/frontend/src/app/(dashboard)/lights/page.tsx`)
   - Interface moderna e responsiva
   - Estatísticas em tempo real
   - Busca e filtros
   - Controle individual e em massa

---

## 🚀 Como usar:

### 1. Inicie o projeto:

```bash
# Na raiz do projeto
bun install
bun run dev
```

### 2. Acesse a interface:

Abra no navegador: **http://localhost:3000/lights**

---

## 💡 Lâmpadas disponíveis (estado inicial):

### 🏠 Grupo Internos (5 lâmpadas):
1. **Iluminação Sala de Estar** ✅ LIGADA
2. **Iluminação Cozinha** ❌ DESLIGADA
3. **Iluminação Quarto Principal** ✅ LIGADA
4. **Iluminação Quarto 2** ❌ DESLIGADA
5. **Iluminação Banheiro** ✅ LIGADA

### 🏗️ Grupo Externos (3 lâmpadas):
6. **Iluminação Garagem** ❌ DESLIGADA
7. **Iluminação Jardim** ❌ DESLIGADA
8. **Iluminação Quadra de Tênis** ✅ LIGADA

**Estado inicial:** 4 ligadas, 4 desligadas (50/50)

---

## ✨ Funcionalidades:

- ✅ **Grupos de Lâmpadas:** Organize por Internos, Externos ou veja Todas
- ✅ **Tabs Interativas:** Alterne entre grupos com contador de lâmpadas
- ✅ Ligar/desligar luzes individualmente
- ✅ Ligar/desligar todas do grupo ativo de uma vez
- ✅ Buscar luzes por nome ou ID (dentro do grupo)
- ✅ Estatísticas em tempo real (por grupo)
- ✅ Animações e feedback visual
- ✅ Atualização automática via long polling
- ✅ Tooltips nos IDs para evitar overflow

---

## 🔧 Testando:

1. **Navegue pelas abas** - Clique em "Todas", "Internos" ou "Externos"
2. **Clique em uma luz** - Ela vai ligar/desligar com animação
3. **Use "Ligar Todas"** - Todas as luzes do grupo ativo ligam com delay
4. **Use "Desligar Todas"** - Todas as luzes do grupo ativo desligam
5. **Busque** - Digite "Sala" para filtrar dentro do grupo
6. **Veja as estatísticas** - Mudam conforme o grupo ativo
7. **Passe o mouse no ID** - Veja o ID completo no tooltip

---

## 📊 Como funciona:

```
Frontend (clique)
  → POST /api/dashboard {deviceId, action: "setToggle"}
  → Backend recebe
  → EventBus publica 'controller_action'
  → MockSimulator escuta e responde
  → EventBus publica 'endpoint_event'
  → Device atualiza valor
  → Dashboard detecta mudança
  → Frontend recebe via long polling
  → UI atualiza automaticamente
```

---

## 🎨 Design:

- **Luzes ligadas**: Gradiente amarelo/âmbar com brilho
- **Luzes desligadas**: Branco/cinza clean
- **Animações**: Pulse, scale, smooth transitions
- **Responsivo**: 1-4 colunas dependendo do tamanho da tela

---

## 🐛 Troubleshooting:

**Luzes não aparecem?**
- Verifique se o backend está rodando
- Confirme que o arquivo `database.json` foi atualizado
- Veja os logs do backend no terminal

**Não consigo ligar/desligar?**
- Abra o console do navegador (F12) para ver erros
- Verifique se o simulador foi iniciado (logs do backend)

**Backend não inicia?**
- Execute `bun install` novamente
- Verifique se está na pasta raiz
- Confira se tem o Bun instalado (`bun --version`)

---

## 🎯 Próximos passos:

Para conectar hardware real:
1. Configure os IPs dos CLPs reais em `database.json`
2. Comente/remova a inicialização do MockLightSimulator no `index.ts`
3. Configure os endpoints Modbus corretos

---

**Desenvolvido com ❤️ usando Bun + Next.js 15 + React 19**
