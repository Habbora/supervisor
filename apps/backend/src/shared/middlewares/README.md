# Middlewares de Autenticação e Autorização

Este diretório contém os middlewares de autenticação JWT e autorização baseada em roles para a aplicação.

## Estrutura

```
shared/middlewares/
├── auth.middleware.ts          # Middleware de autenticação JWT
├── authorization.middleware.ts # Middlewares de autorização por role
└── index.ts                    # Exportação centralizada
```

## Auth Middleware

O `authMiddleware` é responsável por verificar e validar tokens JWT em todas as requisições protegidas.

### Como funciona

1. Verifica a presença do header `Authorization`
2. Extrai o token (formato: `Bearer <token>`)
3. Valida o token usando a secret key
4. Decodifica o payload e extrai informações do usuário
5. Disponibiliza o objeto `user` no contexto da requisição

### Configuração

```typescript
import { authMiddleware } from '@/shared/middlewares';

const app = new Elysia()
  .use(authMiddleware)
  .get('/protected', ({ user }) => {
    return { message: `Hello ${user.username}` };
  });
```

### Variáveis de Ambiente

- `JWT_SECRET`: Chave secreta para assinar tokens (obrigatório em produção)
- Token expira em 7 dias por padrão

### Estrutura do Token

O token JWT contém o seguinte payload:

```typescript
{
  id: string;        // ID do usuário
  username: string;  // Nome de usuário
  role: UserRole;    // Role do usuário
  iat: number;       // Timestamp de emissão
  exp: number;       // Timestamp de expiração
}
```

## Authorization Middleware

Os middlewares de autorização verificam se o usuário autenticado possui as permissões necessárias.

### Funções Disponíveis

#### `requireRole(...roles: UserRole[])`

Verifica se o usuário possui uma das roles especificadas.

```typescript
import { requireRole } from '@/shared/middlewares';

app.use(authMiddleware)
   .use(requireRole('super', 'admin'))
   .post('/admin-action', ({ user }) => {
     return { success: true };
   });
```

#### `requireAuth()`

Garante que o usuário está autenticado (qualquer role válida).

```typescript
import { requireAuth } from '@/shared/middlewares';

app.use(authMiddleware)
   .use(requireAuth())
   .get('/protected', ({ user }) => {
     return { message: 'You are authenticated' };
   });
```

#### `requireAdmin()`

Atalho para `requireRole('super', 'admin')`.

```typescript
import { requireAdmin } from '@/shared/middlewares';

app.use(authMiddleware)
   .use(requireAdmin())
   .delete('/critical-resource', ({ user }) => {
     return { deleted: true };
   });
```

#### `requireSuper()`

Atalho para `requireRole('super')`. Apenas super admins.

```typescript
import { requireSuper } from '@/shared/middlewares';

app.use(authMiddleware)
   .use(requireSuper())
   .post('/system-config', ({ user }) => {
     return { updated: true };
   });
```

## Hierarquia de Roles

```
super     → Acesso total ao sistema
  ↓
admin     → Pode gerenciar recursos (exceto super users)
  ↓
user      → Acesso padrão a funcionalidades
  ↓
viewer    → Apenas leitura
```

## Exemplo Completo: Rotas de Controllers

```typescript
import { Elysia } from 'elysia';
import { authMiddleware, requireAuth } from '@/shared/middlewares';
import { ControllerManager } from '@services/controllers/manager';

export const controllerRoutes = new Elysia({ prefix: '/api/v1/controllers' })
  // Aplica autenticação em todas as rotas
  .use(authMiddleware)
  .use(requireAuth())

  // GET - Qualquer usuário autenticado
  .get('/', ({ user }) => {
    const controllers = ControllerManager.getInstance().findAll();
    return controllers;
  })

  // POST - Apenas admin/super
  .post('/', ({ body, set, user }) => {
    if (!['admin', 'super'].includes(user.role)) {
      set.status = 403;
      return { error: 'Forbidden', message: 'Only admins can create controllers' };
    }

    const newController = ControllerManager.getInstance().create(body);
    return {
      success: true,
      controller: newController,
      createdBy: user.username
    };
  })

  // PUT - Apenas admin/super
  .put('/:id', ({ params, body, set, user }) => {
    if (!['admin', 'super'].includes(user.role)) {
      set.status = 403;
      return { error: 'Forbidden' };
    }

    const updated = ControllerManager.getInstance().update(params.id, body);
    return {
      success: true,
      controller: updated,
      updatedBy: user.username
    };
  })

  // DELETE - Apenas admin/super
  .delete('/:id', ({ params, set, user }) => {
    if (!['admin', 'super'].includes(user.role)) {
      set.status = 403;
      return { error: 'Forbidden' };
    }

    const deleted = ControllerManager.getInstance().remove(params.id);
    return {
      success: true,
      controller: deleted,
      deletedBy: user.username
    };
  });
```

## Integração com Frontend

### Hook useAuth

```typescript
import { useAuth } from '@/features/auth/hooks/useAuth';

export const useControllers = () => {
  const { token } = useAuth();

  const loadControllers = async () => {
    if (!token) return;

    const response = await fetch('/api/controllers', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error('Failed to load controllers');
  };

  return { loadControllers };
};
```

### Tratamento de Erros

```typescript
const createController = async (data: ControllerDTO) => {
  try {
    const response = await fetch('/api/controllers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      // Token inválido ou expirado
      // Redirecionar para login
      return null;
    }

    if (response.status === 403) {
      // Permissão negada
      alert('Você não tem permissão para esta ação');
      return null;
    }

    if (response.ok) {
      return await response.json();
    }

    throw new Error('Unexpected error');
  } catch (error) {
    console.error('Error creating controller:', error);
    return null;
  }
};
```

## Respostas de Erro

### 401 Unauthorized

```json
{
  "error": "Authorization header is required"
}
```

```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Only admins can create controllers"
}
```

```json
{
  "error": "Insufficient permissions"
}
```

## Segurança

### Boas Práticas

1. **Nunca** commitar a `JWT_SECRET` no código
2. Use senhas fortes para `JWT_SECRET` em produção (mínimo 32 caracteres)
3. Configure HTTPS em produção para proteger tokens em trânsito
4. Implemente refresh tokens para sessões longas
5. Valide e sanitize todas as entradas do usuário
6. Implemente rate limiting nas rotas de autenticação
7. Log todas as tentativas de acesso não autorizado

### Geração de Secret Key

```bash
# Gerar secret key segura
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Configuração de Produção

```bash
# .env.production
JWT_SECRET=sua-chave-super-secreta-de-32-caracteres-ou-mais
```

## Troubleshooting

### Token não está sendo enviado

Verifique se o hook `useAuth` está retornando o token corretamente:

```typescript
const { token } = useAuth();
console.log('Token:', token ? 'Present' : 'Missing');
```

### 401 em todas as requisições

1. Verifique se o token está no formato correto: `Bearer <token>`
2. Verifique se a `JWT_SECRET` é a mesma no login e na validação
3. Verifique se o token não expirou (padrão: 7 dias)

### 403 em operações admin

Verifique o role do usuário no token:

```typescript
const payload = jwt.decode(token);
console.log('User role:', payload.role);
```

## Próximos Passos

- [ ] Implementar refresh tokens
- [ ] Adicionar rate limiting
- [ ] Implementar audit logging
- [ ] Adicionar testes unitários
- [ ] Implementar revogação de tokens
- [ ] Adicionar validação de IP/device fingerprinting
