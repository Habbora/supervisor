import { Elysia, t } from 'elysia';
import { Dashboard } from '@/services/dashboard/index';
import { logger } from '@/services/Logger';
import { LightService } from '@/features/lights/LightService';

export const dashboardRoutes = new Elysia({ prefix: '/api/v1' })
    // GET /api/v1/dashboard - Buscar dados do dashboard (com long-polling)
    .get('/dashboard', async ({ query }) => {
        const sync = query.sync || '';
        const dashboard = await Dashboard.getInstance().getDashboard(sync);
        return dashboard;
    }, {
        query: t.Object({
            sync: t.Optional(t.String()),
        })
    })

    // POST /api/v1/dashboard - Enviar comando para dispositivo (compatibilidade frontend)
    .post('/dashboard', async ({ body, set }) => {
        try {
            const { deviceId, action } = body;

            // Mapear ação antiga para nova API
            if (action === 'setToggle') {
                await LightService.getInstance().sendCommand(deviceId, {
                    action: 'toggle'
                });
                return { success: true };
            }

            set.status = 400;
            return { error: 'Ação não suportada' };
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        body: t.Object({
            deviceId: t.String(),
            action: t.String()
        })
    })

    // GET /api/v1/log - Buscar logs
    .get('/log', async () => {
        const loggers = await logger.getAllLoggers();
        return loggers;
    });
