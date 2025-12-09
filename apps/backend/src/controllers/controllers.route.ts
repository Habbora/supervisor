import { Elysia, t } from 'elysia'
import { ControllerManager, ControllerService } from '@/controllers'
import {
    ControllerNotFoundError,
    ControllerAlreadyExistsError
} from '@/services/controllers-service';
// import { authMiddleware, requireAuth } from '@/shared/middlewares';

export const controllerRoutes = new Elysia({ prefix: '/api/v1/controllers' })
    // GET /api/v1/controllers - Listar todos os controladores
    // .use(authMiddleware)
    // .use(requireAuth())
    .get('/', async () => {
        return await ControllerService.getInstance().findAll()
    })

    // POST /api/v1/controllers - Criar novo controlador
    .post('/', async ({ body, set }) => {
        try {
            const controller = await ControllerService.getInstance().create(body)

            set.status = 201;
            return {
                success: true,
                message: 'Controller created successfully',
                data: controller
            };
        } catch (error) {

            if (error instanceof ControllerAlreadyExistsError) {
                set.status = 409;
                return {
                    success: false,
                    message: error.message
                };
            }

            console.error('Error creating controller:', error);
            set.status = 500;
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }, {
        body: t.Object({
            name: t.String(),
            driver: t.String(),
        })
    })

    // GET /api/v1/controllers/:id - Buscar controlador por ID
    .get('/:id', async ({ params, set }) => {
        const { id } = params

        try {
            const controller = await ControllerService
                .getInstance()
                .findById(id)

            if (!controller) {
                set.status = 404;
                return {
                    error: 'Controller not found',
                    message: `Controller with id '${params.id}' does not exist`
                };
            }

            return controller
        } catch (error) {
            console.error('Error fetching controller:', error);
            set.status = 500;
            return {
                error: 'Internal server error',
                message: 'Failed to fetch controller'
            };
        }
    })

    // PUT /api/v1/controllers/:id - Atualizar controlador
    .put('/:id', async ({ params, body, set }) => {
        const { id } = params

        try {
            const controller = await ControllerService
                .getInstance()
                .update(id, body)

            return {
                success: true,
                message: 'Controller updated successfully',
                data: controller,
            };
        } catch (error) {
            if (error instanceof ControllerNotFoundError) {
                set.status = 404;
                return {
                    error: 'Controller not found',
                    message: error.message
                };
            }

            if (error instanceof ControllerAlreadyExistsError) {
                set.status = 409;
                return {
                    error: 'Controller already exists',
                    message: error.message
                };
            }

            console.error('Error updating controller:', error);
            set.status = 500;
            return {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }, {
        body: t.Object({
            name: t.Optional(t.String({ minLength: 1 })),
            configs: t.Optional(t.Record(t.String(), t.Any())),
            tags: t.Optional(t.Any()),
        })
    })

    // DELETE /api/v1/controllers/:id - Deletar controlador
    .delete('/:id', async ({ params, set }) => {
        try {
            const controller = await ControllerService.getInstance().delete(params.id);

            return {
                success: true,
                message: 'Controller deleted successfully',
                controller
            };
        } catch (error) {
            if (error instanceof ControllerNotFoundError) {
                set.status = 404;
                return {
                    error: 'Controller not found',
                    message: error.message
                };
            }

            console.error('Error deleting controller:', error);
            set.status = 500;
            return {
                error: 'Internal server error',
                message: 'Failed to delete controller'
            };
        }
    })

    // GET /api/v1/controllers/:id/schema - Buscar schema do controlador
    .get('/:id/schema', async ({ params, set }) => {
        try {
            const controller = await ControllerManager.getInstance().findById(params.id)

            if (!controller) {
                set.status = 404;
                return {
                    error: 'Controller not found',
                    message: `Controller with id '${params.id}' does not exist`
                };
            }

            return controller.configSchemaJSON
        } catch (error) {
            console.error('Error fetching controller:', error);
            set.status = 500;
            return {
                error: 'Internal server error',
                message: 'Failed to fetch controller'
            };
        }
    })

    // GET /api/v1/controllers/drivers - Listar drivers disponíveis
    .get('/drivers', async ({ set }) => {
        try {
            const drivers = ControllerManager.getInstance().getAvailableDrivers()
            return {
                success: true,
                data: drivers
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
            set.status = 500;
            return {
                error: 'Failed to fetch drivers',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    })
