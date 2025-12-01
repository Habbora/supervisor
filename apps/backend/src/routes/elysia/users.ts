import { Elysia, t } from 'elysia';
import { userService } from '@/services/users-service/users.service';

export const userRoutes = new Elysia({ prefix: '/api/v1/users' })
    // GET /api/v1/users - Listar todos os usuários
    .get('/', async () => {
        const users = await userService.findAll();
        return users
    })
    // POST /api/v1/users - Criar novo usuário
    .post('/', async ({ body, set }) => {
        try {
            const { name, username, password, role } = body;

            const newUser = await userService.create({
                name,
                username,
                password,
                role
            })

            set.status = 201
            return newUser
        } catch (error) {
            console.log(error);
            set.status = 500;
            return {
                error: 'Internal server error',
                message: error
            };
        }
    }, {
        body: t.Object({
            name: t.String(),
            username: t.String(),
            password: t.String(),
            role: t.Union([t.Literal('admin'), t.Literal('user'), t.Literal('viewer')])
        })
    })
    // GET /api/v1/users/:id - Buscar usuário por ID
    .get('/:id', async ({ params, set }) => {
        try {
            const { id } = params
            const user = await userService.findById(id)

            if (!user) {
                set.status = 404;
                return {
                    error: 'User not found',
                    message: 'No user found with the provided ID'
                };
            }

            return user;
        } catch (error) {
            set.status = 500;
            return {
                error: 'Internal server error',
                message: error
            };
        }
    })
    // PUT /api/v1/users/:id - Atualizar usuário
    .put('/:id', async ({ params, body, set }) => {
        try {
            const { id } = params;
            const { name, role, password } = body;

            const user = await userService.update(id, {
                name,
                password,
                role
            })

            return user;
        } catch (error) {
            set.status = 500;
            return {
                error: 'Internal server error',
                message: 'Failed to update user',
                other: error
            };
        }
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            name: t.Optional(t.String()),
            email: t.Optional(t.String()),
            password: t.Optional(t.String()),
            role: t.Optional(t.Union([t.Literal('admin'), t.Literal('user'), t.Literal('viewer')]))
        })
    })
    // DELETE /api/v1/users/:id - Deletar usuário
    .delete('/:id', async ({ params, set }) => {
        try {
            const { id } = params;
            const user = await userService.delete(id)
            set.status = 200;
            return user;
        } catch (error) {
            set.status = 500;
            return {
                error: 'Internal server error',
                message: 'Failed to delete user'
            };
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    });
