import { userService, InvalidCredentialsError } from '@/services/users-service';
import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// ═══════════════════════════════════════════════════════════════════
// JWT PAYLOAD TYPE
// ═══════════════════════════════════════════════════════════════════

interface JWTPayload {
    id: string;
    username: string;
    role: string;
}

// ═══════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════

export const authRoutes = new Elysia({ prefix: '/api/v1/auth' })
    // Configura o plugin JWT
    .use(
        jwt({
            name: 'jwt',
            secret: JWT_SECRET,
            exp: '7d', // Token expira em 7 dias
        })
    )
    // POST /api/v1/auth/login - Login
    .post('/login', async ({ body, set, jwt }) => {
        try {
            const { username, password } = body;

            // Validar credenciais usando o service
            const user = await userService.validateCredentials(username, password);

            // Gerar token JWT
            const token = await jwt.sign({
                id: user.id,
                username: user.username,
                role: user.role
            } as JWTPayload);

            return {
                message: 'Login realizado com sucesso.',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    role: user.role
                }
            };
        } catch (error) {
            if (error instanceof InvalidCredentialsError) {
                set.status = 401;
                return { error: 'Credenciais inválidas' };
            }

            set.status = 500;
            return { error: 'Erro interno do servidor' };
        }
    }, {
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
    // POST /api/v1/auth/validate - Valida token
    .post('/validate', async ({ headers, set, jwt }) => {
        const authHeader = headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!token) {
            set.status = 400;
            return { error: 'Token is required' };
        }

        try {
            // Verificar e decodificar token
            const payload = await jwt.verify(token) as JWTPayload | false;

            if (!payload) {
                set.status = 401;
                return { error: 'Invalid or expired token' };
            }

            // Buscar usuário atualizado no banco
            const user = await userService.findById(payload.id);

            if (!user) {
                set.status = 404;
                return { error: 'User not found' };
            }

            return {
                valid: true,
                user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    role: user.role
                }
            };
        } catch (error) {
            set.status = 401;
            return { error: 'Invalid or expired token' };
        }
    })
    // GET /api/v1/auth/me - Retorna usuário autenticado
    .get('/me', async ({ headers, set, jwt }) => {
        const authHeader = headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!token) {
            set.status = 401;
            return { error: 'Authorization header is required' };
        }

        try {
            const payload = await jwt.verify(token) as JWTPayload | false;

            if (!payload) {
                set.status = 401;
                return { error: 'Invalid or expired token' };
            }

            const user = await userService.findById(payload.id);

            if (!user) {
                set.status = 404;
                return { error: 'User not found' };
            }

            return { user };
        } catch (error) {
            set.status = 401;
            return { error: 'Invalid or expired token' };
        }
    });
