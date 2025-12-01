import { Elysia, t } from 'elysia';
import { DeviceService } from '@services/devices/DeviceService';
import type { CreateDeviceDTO, UpdateDeviceDTO, DeviceCommand } from '@services/devices/types/device.types';

export const deviceRoutes = new Elysia({ prefix: '/api/v1/devices' })
    // GET /api/v1/devices - Listar todos os dispositivos
    .get('/', () => {
        const devices = DeviceService.getInstance()
            .findAll()
            .map((device) => device.toJSON());
        return devices;
    })

    // POST /api/v1/devices - Criar novo dispositivo
    .post('/', async ({ body, set }) => {
        try {
            const dto = body as CreateDeviceDTO;

            if (!dto.name || !dto.type || !dto.controllerId || !dto.endpointName) {
                set.status = 400;
                return {
                    error: 'Campos obrigatórios: name, type, controllerId, endpointName'
                };
            }

            const device = DeviceService.getInstance().create(dto);

            set.status = 201;
            return device.toJSON();
        } catch (error) {
            console.error('[Devices] Erro ao criar device:', error);
            set.status = 500;
            return {
                error: 'Erro ao criar dispositivo',
                message: String(error)
            };
        }
    }, {
        body: t.Object({
            name: t.String(),
            type: t.Union([t.Literal('digital'), t.Literal('analog')]),
            controllerId: t.String(),
            endpointName: t.String(),
            metadata: t.Optional(t.Object({
                subType: t.Optional(t.String()),
                description: t.Optional(t.String()),
                location: t.Optional(t.String()),
                unit: t.Optional(t.String()),
                min: t.Optional(t.Number()),
                max: t.Optional(t.Number()),
                icon: t.Optional(t.String()),
                color: t.Optional(t.String())
            }))
        })
    })

    // GET /api/v1/devices/:id - Buscar dispositivo por ID
    .get('/:id', ({ params, set }) => {
        try {
            const { id } = params;
            const device = DeviceService.getInstance().findById(id);

            if (!device) {
                set.status = 404;
                return {
                    error: 'Device not found',
                    message: 'Dispositivo não encontrado'
                };
            }

            return device.toJSON();
        } catch (error) {
            set.status = 500;
            return {
                error: 'Internal server error',
                message: String(error)
            };
        }
    })

    // PATCH /api/v1/devices/:id - Atualizar dispositivo
    .patch('/:id', async ({ params, body, set }) => {
        try {
            const { id } = params;
            const dto = body as UpdateDeviceDTO;

            const device = DeviceService.getInstance().update(id, dto);

            if (!device) {
                set.status = 404;
                return {
                    error: 'Device not found',
                    message: 'Dispositivo não encontrado'
                };
            }

            return device.toJSON();
        } catch (error) {
            console.error('[Devices] Erro ao atualizar:', error);
            set.status = 500;
            return {
                error: 'Internal server error',
                message: String(error)
            };
        }
    }, {
        body: t.Object({
            name: t.Optional(t.String()),
            metadata: t.Optional(t.Any())
        })
    })

    // DELETE /api/v1/devices/:id - Deletar dispositivo
    .delete('/:id', ({ params, set }) => {
        try {
            const { id } = params;
            const success = DeviceService.getInstance().remove(id);

            if (!success) {
                set.status = 404;
                return {
                    error: 'Device not found',
                    message: 'Dispositivo não encontrado'
                };
            }

            return {
                success: true,
                message: 'Dispositivo removido com sucesso'
            };
        } catch (error) {
            set.status = 500;
            return {
                error: 'Internal server error',
                message: String(error)
            };
        }
    })

    // POST /api/v1/devices/:id/command - Enviar comando para dispositivo
    .post('/:id/command', async ({ params, body, set }) => {
        try {
            const { id } = params;
            const command = body as DeviceCommand;

            const device = DeviceService.getInstance().findById(id);
            if (!device) {
                set.status = 404;
                return {
                    error: 'Device not found',
                    message: 'Dispositivo não encontrado'
                };
            }

            await DeviceService.getInstance().sendCommand(id, command);

            return {
                success: true,
                message: `Comando '${command.action}' enviado com sucesso`,
                device: device.toJSON()
            };
        } catch (error) {
            console.error('[Devices] Erro ao executar comando:', error);
            set.status = 500;
            return {
                error: 'Erro ao executar comando',
                message: String(error)
            };
        }
    }, {
        body: t.Union([
            t.Object({ action: t.Literal('turnOn') }),
            t.Object({ action: t.Literal('turnOff') }),
            t.Object({ action: t.Literal('toggle') }),
            t.Object({
                action: t.Literal('setValue'),
                value: t.Number()
            }),
            t.Object({
                action: t.Literal('pulse'),
                duration: t.Optional(t.Number())
            })
        ])
    });
