import { Elysia, t } from 'elysia';
import { LightService } from '../../features/lights/LightService';
import { db, lights } from '@/db';

export const lightRoutes = new Elysia({ prefix: '/api/v1/lights' })
    .post('/', async ({ body, set }) => {
        try {
            const [newLight] = await db.insert(lights).values({
                name: body.name,
                controller_id: body.controllerId,
                endpoint_name: body.endpointName,
            }).returning();

            const light = LightService.getInstance().create(newLight.id, {
                name: body.name,
                controllerId: body.controllerId,
                endpointName: body.endpointName
            });

            set.status = 201;
            return light.toJSON();
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        body: t.Object({
            name: t.String({ minLength: 1 }),
            controllerId: t.String({ minLength: 1 }),
            endpointName: t.String({ minLength: 1 })
        })
    })
    .get('/', () => {
        const lights = LightService.getInstance().findAll();
        return lights.map(light => light.toJSON());
    })
    .get('/:id', ({ params, set }) => {
        const light = LightService.getInstance().findById(params.id);

        if (!light) {
            set.status = 404;
            return { error: 'Lâmpada não encontrada' };
        }

        return light.toJSON();
    })
    .patch('/:id', async ({ params, body, set }) => {
        try {
            const light = LightService.getInstance().update(params.id, body);
            return light.toJSON();
        } catch (error: any) {
            set.status = 404;
            return { error: error.message };
        }
    }, {
        body: t.Object({
            name: t.Optional(t.String({ minLength: 1 }))
        })
    })
    .delete('/:id', ({ params, set }) => {
        try {
            LightService.getInstance().delete(params.id);
            set.status = 204;
            return;
        } catch (error: any) {
            set.status = 404;
            return { error: error.message };
        }
    })
    .post('/:id/command', async ({ params, body, set }) => {
        try {
            const light = LightService.getInstance().findById(params.id);

            if (!light) {
                set.status = 404;
                return { error: 'Lâmpada não encontrada' };
            }

            await LightService.getInstance().sendCommand(params.id, body);

            return {
                success: true,
                light: light.toJSON()
            };
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        body: t.Object({
            action: t.Union([
                t.Literal('turnOn'),
                t.Literal('turnOff'),
                t.Literal('toggle')
            ])
        })
    });
