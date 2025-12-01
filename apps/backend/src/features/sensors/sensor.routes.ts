import { Elysia, t } from 'elysia';
import { SensorService } from './SensorService';

/**
 * ROTAS DE SENSORES - READ-ONLY
 *
 * Sensores NÃO aceitam comandos (somente leitura)
 *
 * GET    /api/v1/sensors           - Lista todos os sensores
 * GET    /api/v1/sensors/:id       - Busca por ID
 * GET    /api/v1/sensors/:id/history - Histórico de leituras
 * GET    /api/v1/sensors/type/:type - Filtra por tipo
 * GET    /api/v1/sensors/status    - Status do serviço
 * POST   /api/v1/sensors/light     - Cria sensor de luz
 * POST   /api/v1/sensors/temperature - Cria sensor de temperatura
 * POST   /api/v1/sensors/pressure  - Cria sensor de pressão
 * POST   /api/v1/sensors/flow      - Cria sensor de fluxo
 * POST   /api/v1/sensors/level     - Cria sensor de nível
 * POST   /api/v1/sensors/motion    - Cria sensor de movimento
 * PATCH  /api/v1/sensors/:id       - Atualiza sensor
 * DELETE /api/v1/sensors/:id       - Remove sensor
 */
export const sensorRoutes = new Elysia({ prefix: '/api/v1/sensors' })
    /**
     * Lista todos os sensores
     */
    .get('/', () => {
        const sensors = SensorService.getInstance().findAll();
        return sensors.map(sensor => sensor.toJSON());
    })

    /**
     * Status do serviço
     */
    .get('/status', () => {
        return SensorService.getInstance().getStatus();
    })

    /**
     * Busca sensor por ID
     */
    .get('/:id', ({ params, set }) => {
        const sensor = SensorService.getInstance().findById(params.id);

        if (!sensor) {
            set.status = 404;
            return { error: 'Sensor não encontrado' };
        }

        return sensor.toJSON();
    })

    /**
     * Histórico de leituras do sensor
     */
    .get('/:id/history', ({ params, query, set }) => {
        try {
            const limit = query.limit ? parseInt(query.limit as string) : 100;
            const history = SensorService.getInstance().getHistory(params.id, limit);
            return history;
        } catch (error: any) {
            set.status = 404;
            return { error: error.message };
        }
    })

    /**
     * Filtra sensores por tipo
     */
    .get('/type/:type', ({ params, set }) => {
        const validTypes = [
            'light_sensor',
            'temperature_sensor',
            'pressure_sensor',
            'flow_sensor',
            'level_sensor',
            'motion_sensor'
        ];

        if (!validTypes.includes(params.type)) {
            set.status = 400;
            return {
                error: 'Tipo inválido',
                validTypes
            };
        }

        const sensors = SensorService.getInstance().findByType(params.type as any);
        return sensors.map(sensor => sensor.toJSON());
    })

    /**
     * Cria sensor de LUZ
     */
    .post('/light', async ({ body, set }) => {
        try {
            const sensor = SensorService.getInstance().create({
                type: 'light_sensor',
                data: body
            });

            set.status = 201;
            return sensor.toJSON();
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        body: t.Object({
            name: t.String({ minLength: 1 }),
            location: t.Optional(t.String()),
            controllerId: t.String({ minLength: 1 }),
            endpointName: t.String({ minLength: 1 }),
            unit: t.Union([t.Literal('lux'), t.Literal('%'), t.Literal('cd/m²')]),
            min: t.Optional(t.Number({ minimum: 0 })),
            max: t.Optional(t.Number())
        })
    })

    /**
     * Cria sensor de TEMPERATURA
     */
    .post('/temperature', async ({ body, set }) => {
        try {
            const sensor = SensorService.getInstance().create({
                type: 'temperature_sensor',
                data: body
            });

            set.status = 201;
            return sensor.toJSON();
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        body: t.Object({
            name: t.String({ minLength: 1 }),
            location: t.Optional(t.String()),
            controllerId: t.String({ minLength: 1 }),
            endpointName: t.String({ minLength: 1 }),
            unit: t.Union([t.Literal('°C'), t.Literal('°F'), t.Literal('K')]),
            min: t.Optional(t.Number()),
            max: t.Optional(t.Number())
        })
    })

    /**
     * Cria sensor de PRESSÃO
     */
    .post('/pressure', async ({ body, set }) => {
        try {
            const sensor = SensorService.getInstance().create({
                type: 'pressure_sensor',
                data: body
            });

            set.status = 201;
            return sensor.toJSON();
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        body: t.Object({
            name: t.String({ minLength: 1 }),
            location: t.Optional(t.String()),
            controllerId: t.String({ minLength: 1 }),
            endpointName: t.String({ minLength: 1 }),
            unit: t.Union([
                t.Literal('PSI'),
                t.Literal('bar'),
                t.Literal('Pa'),
                t.Literal('kPa')
            ]),
            min: t.Optional(t.Number({ minimum: 0 })),
            max: t.Optional(t.Number())
        })
    })

    /**
     * Cria sensor de FLUXO
     */
    .post('/flow', async ({ body, set }) => {
        try {
            const sensor = SensorService.getInstance().create({
                type: 'flow_sensor',
                data: body
            });

            set.status = 201;
            return sensor.toJSON();
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        body: t.Object({
            name: t.String({ minLength: 1 }),
            location: t.Optional(t.String()),
            controllerId: t.String({ minLength: 1 }),
            endpointName: t.String({ minLength: 1 }),
            unit: t.Union([
                t.Literal('L/min'),
                t.Literal('L/h'),
                t.Literal('m³/h'),
                t.Literal('GPM')
            ]),
            min: t.Optional(t.Number({ minimum: 0 })),
            max: t.Optional(t.Number())
        })
    })

    /**
     * Cria sensor de NÍVEL
     */
    .post('/level', async ({ body, set }) => {
        try {
            const sensor = SensorService.getInstance().create({
                type: 'level_sensor',
                data: body
            });

            set.status = 201;
            return sensor.toJSON();
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        body: t.Object({
            name: t.String({ minLength: 1 }),
            location: t.Optional(t.String()),
            controllerId: t.String({ minLength: 1 }),
            endpointName: t.String({ minLength: 1 }),
            unit: t.Union([
                t.Literal('%'),
                t.Literal('m'),
                t.Literal('cm'),
                t.Literal('mm'),
                t.Literal('ft')
            ]),
            min: t.Optional(t.Number({ minimum: 0 })),
            max: t.Optional(t.Number())
        })
    })

    /**
     * Cria sensor de MOVIMENTO
     */
    .post('/motion', async ({ body, set }) => {
        try {
            const sensor = SensorService.getInstance().create({
                type: 'motion_sensor',
                data: body
            });

            set.status = 201;
            return sensor.toJSON();
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        body: t.Object({
            name: t.String({ minLength: 1 }),
            location: t.Optional(t.String()),
            controllerId: t.String({ minLength: 1 }),
            endpointName: t.String({ minLength: 1 })
        })
    })

    /**
     * Atualiza sensor
     */
    .patch('/:id', async ({ params, body, set }) => {
        try {
            const sensor = SensorService.getInstance().update(params.id, body);
            return sensor.toJSON();
        } catch (error: any) {
            set.status = 404;
            return { error: error.message };
        }
    }, {
        body: t.Object({
            name: t.Optional(t.String({ minLength: 1 })),
            location: t.Optional(t.String())
        })
    })

    /**
     * Remove sensor
     */
    .delete('/:id', ({ params, set }) => {
        try {
            SensorService.getInstance().delete(params.id);
            set.status = 204;
            return;
        } catch (error: any) {
            set.status = 404;
            return { error: error.message };
        }
    });
