# 🚀 Sistema de Proxy Genérico para API

Este sistema permite que **todas** as rotas de API do frontend sejam automaticamente encaminhadas para o backend na porta 4001.

## 📁 Arquivos Criados

- `apiProxy.ts` - Funções de proxy genéricas
- `config.ts` - Configurações centralizadas do backend
- `README.md` - Este arquivo de documentação

## 🎯 Como Usar

### **1. Para Rotas de Autenticação:**
```typescript
// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { proxyAuth } from '@/lib/apiProxy';

export async function POST(request: NextRequest) {
  return proxyAuth(request);
}
```

### **2. Para Rotas de Controllers:**
```typescript
// src/app/api/controllers/route.ts
import { NextRequest } from 'next/server';
import { proxyControllers } from '@/lib/apiProxy';

export async function GET(request: NextRequest) {
  return proxyControllers(request);
}

export async function POST(request: NextRequest) {
  return proxyControllers(request);
}
```

### **3. Para Qualquer Outra Rota:**
```typescript
// src/app/api/qualquer-coisa/route.ts
import { NextRequest } from 'next/server';
import { proxyGeneric } from '@/lib/apiProxy';

export async function GET(request: NextRequest) {
  return proxyGeneric(request);
}

export async function POST(request: NextRequest) {
  return proxyGeneric(request);
}

export async function PUT(request: NextRequest) {
  return proxyGeneric(request);
}

export async function DELETE(request: NextRequest) {
  return proxyGeneric(request);
}
```

## ⚙️ Configurações

### **Variáveis de Ambiente:**
```bash
# .env.local
BACKEND_URL=http://localhost:4001
```

### **Configurações no Código:**
```typescript
// src/lib/config.ts
export const BACKEND_CONFIG = {
  BASE_URL: process.env.BACKEND_URL || 'http://localhost:4001',
  TIMEOUT: 10000, // 10 segundos
  // ... outras configs
}
```

## 🔄 Como Funciona

1. **Frontend** faz requisição para `/api/qualquer-rota`
2. **Next.js** recebe na função da rota
3. **Função de proxy** encaminha para `http://localhost:4001/api/qualquer-rota`
4. **Backend** processa e retorna resposta
5. **Proxy** retorna resposta do backend para o frontend

## 🎨 Funcionalidades

- ✅ **Proxy automático** para todas as rotas
- ✅ **Preserva método HTTP** (GET, POST, PUT, DELETE)
- ✅ **Preserva headers** importantes (authorization, x-api-key)
- ✅ **Timeout configurável** (evita travamentos)
- ✅ **Logs detalhados** para debug
- ✅ **Tratamento de erros** robusto
- ✅ **Transformação de rotas** (ex: `/api/controllers` → `/api/v1/controllers`)
- ✅ **Exclusão de rotas** específicas

## 🚨 Exemplos de Uso

### **Rota Simples:**
```typescript
// GET /api/users
export async function GET(request: NextRequest) {
  return proxyGeneric(request);
}
```

### **Rota com Parâmetros:**
```typescript
// GET /api/users/123
export async function GET(request: NextRequest) {
  return proxyGeneric(request);
}
```

### **Rota com Query String:**
```typescript
// GET /api/users?page=1&limit=10
export async function GET(request: NextRequest) {
  return proxyGeneric(request);
}
```

## 🔧 Personalização

### **Adicionar Nova Transformação de Rota:**
```typescript
// src/lib/config.ts
TRANSFORM: {
  '/api/controllers': '/api/v1/controllers',
  '/api/users': '/api/v2/users', // Nova transformação
}
```

### **Excluir Rota:**
```typescript
// src/lib/config.ts
EXCLUDE: [
  '/api/health',
  '/api/status',
  '/api/debug', // Nova exclusão
]
```

## 📝 Logs

O sistema gera logs detalhados:
- 🔄 **Proxy iniciado** com URLs
- 📋 **Dados enviados** para o backend
- 📥 **Resposta recebida** do backend
- ❌ **Erros** com detalhes

## 🎉 Vantagens

1. **Código limpo** - Uma linha por rota
2. **Manutenção fácil** - Configuração centralizada
3. **Consistência** - Todas as rotas funcionam igual
4. **Debug simples** - Logs detalhados
5. **Flexibilidade** - Fácil de personalizar
6. **Robustez** - Tratamento de erros e timeouts

Agora você pode criar **qualquer rota de API** com apenas uma linha de código! 🚀
