import { Elysia, t } from 'elysia';
import { ScheduleManager } from '@/features/schedules/schedule-manager';
import { DeviceService } from '@/services/devices/DeviceService';

export const scheduleRoutes = new Elysia({ prefix: '/api/v1/schedules' })
    // GET /api/v1/schedules - Listar todos os agendamentos
    .get('/', () => {
        try {
            const schedules = ScheduleManager.getInstance().findAll();

            // Serializa para JSON (converte Dates para strings)
            const serializedSchedules = schedules.map(schedule => ({
                id: schedule.id,
                name: schedule.name,
                time: schedule.time,
                isActive: schedule.isActive,
                recurrenceType: schedule.recurrenceType,
                recurrenceConfig: schedule.recurrenceConfig,
                actions: schedule.actions,
                nextExecution: schedule.nextExecution.toISOString(),
                lastExecution: schedule.lastExecution.getTime() === 0 ? null : schedule.lastExecution.toISOString(),
                createdAt: schedule.createdAt.toISOString(),
                updatedAt: schedule.updatedAt.toISOString(),
            }));

            return serializedSchedules;
        } catch (error) {
            console.error('[API] Erro ao listar schedules:', error);
            throw error;
        }
    })
    // POST /api/v1/schedules - Criar novo agendamento
    .post('/', async ({ body, set }) => {
        try {
            const { name, time, recurrenceType, recurrenceConfig, isActive, actions } = body as any;

            const schedule = ScheduleManager.getInstance().create({
                name,
                time,
                recurrenceType,
                recurrenceConfig,
                isActive,
                actions
            });

            set.status = 201;
            return {
                id: schedule.id,
                name: schedule.name,
                time: schedule.time,
                isActive: schedule.isActive,
                recurrenceType: schedule.recurrenceType,
                recurrenceConfig: schedule.recurrenceConfig,
                actions: schedule.actions,
                nextExecution: schedule.nextExecution.toISOString(),
                createdAt: schedule.createdAt.toISOString(),
            };
        } catch (error: any) {
            console.error('[API] Erro ao criar schedule:', error);
            set.status = 400;
            return {
                error: 'Erro ao criar agendamento',
                message: error.message
            };
        }
    })
    // GET /api/v1/schedules/:id - Buscar agendamento por ID
    .get('/:id', ({ params, set }) => {
        try {
            const schedule = ScheduleManager.getInstance().findById(params.id);

            if (!schedule) {
                set.status = 404;
                return { error: 'Agendamento não encontrado' };
            }

            return {
                id: schedule.id,
                name: schedule.name,
                time: schedule.time,
                isActive: schedule.isActive,
                recurrenceType: schedule.recurrenceType,
                recurrenceConfig: schedule.recurrenceConfig,
                actions: schedule.actions,
                nextExecution: schedule.nextExecution.toISOString(),
                lastExecution: schedule.lastExecution.getTime() === 0 ? null : schedule.lastExecution.toISOString(),
                createdAt: schedule.createdAt.toISOString(),
                updatedAt: schedule.updatedAt.toISOString(),
            };
        } catch (error) {
            console.error(`[API] Erro ao buscar schedule ${params.id}:`, error);
            set.status = 500;
            return { error: 'Erro ao buscar agendamento' };
        }
    })
    // PUT /api/v1/schedules/:id - Atualizar agendamento
    .put('/:id', async ({ params, body, set }) => {
        try {
            const { name, time, recurrenceType, recurrenceConfig, isActive, actions } = body as any;

            const updated = ScheduleManager.getInstance().update(params.id, {
                name,
                time,
                recurrenceType,
                recurrenceConfig,
                isActive,
                actions
            });

            if (!updated) {
                set.status = 404;
                return { error: 'Agendamento não encontrado' };
            }

            return {
                id: updated.id,
                name: updated.name,
                time: updated.time,
                isActive: updated.isActive,
                recurrenceType: updated.recurrenceType,
                recurrenceConfig: updated.recurrenceConfig,
                actions: updated.actions,
                nextExecution: updated.nextExecution.toISOString(),
                updatedAt: updated.updatedAt.toISOString(),
            };
        } catch (error: any) {
            console.error(`[API] Erro ao atualizar schedule ${params.id}:`, error);
            set.status = 400;
            return {
                error: 'Erro ao atualizar agendamento',
                message: error.message
            };
        }
    })
    // DELETE /api/v1/schedules/:id - Deletar agendamento
    .delete('/:id', ({ params, set }) => {
        try {
            const success = ScheduleManager.getInstance().delete(params.id);

            if (!success) {
                set.status = 404;
                return { error: 'Agendamento não encontrado' };
            }

            return { success: true, message: 'Agendamento deletado com sucesso' };
        } catch (error: any) {
            console.error(`[API] Erro ao deletar schedule ${params.id}:`, error);
            set.status = 500;
            return {
                error: 'Erro ao deletar agendamento',
                message: error.message
            };
        }
    })
    // POST /api/v1/schedules/:id/toggle - Alternar status ativo/inativo
    .post('/:id/toggle', ({ params, set }) => {
        try {
            const schedule = ScheduleManager.getInstance().toggleActive(params.id);

            if (!schedule) {
                set.status = 404;
                return { error: 'Agendamento não encontrado' };
            }

            return {
                id: schedule.id,
                name: schedule.name,
                isActive: schedule.isActive,
                message: schedule.isActive ? 'Agendamento ativado' : 'Agendamento desativado'
            };
        } catch (error: any) {
            console.error(`[API] Erro ao alternar status do schedule ${params.id}:`, error);
            set.status = 500;
            return {
                error: 'Erro ao alternar status',
                message: error.message
            };
        }
    })
    // POST /api/v1/schedules/:id/execute - Executar agendamento manualmente
    .post('/:id/execute', ({ params, set }) => {
        try {
            const schedule = ScheduleManager.getInstance().findById(params.id);

            if (!schedule) {
                set.status = 404;
                return { error: 'Agendamento não encontrado' };
            }

            console.log(`[API] Executando manualmente schedule "${schedule.name}"`);

            let executedCount = 0;
            let failedCount = 0;
            const results: any[] = [];

            schedule.actions.forEach((action) => {
                const device = DeviceService.getInstance().findById(action.deviceId);

                if (!device) {
                    console.warn(`  ⚠️  Dispositivo ${action.deviceId} não encontrado`);
                    failedCount++;
                    results.push({
                        deviceId: action.deviceId,
                        action: action.action,
                        status: 'failed',
                        error: 'Dispositivo não encontrado'
                    });
                    return;
                }

                if (!device.actions || typeof device.actions[action.action] !== 'function') {
                    console.warn(`  ⚠️  Ação ${action.action} não disponível no dispositivo ${device.name}`);
                    failedCount++;
                    results.push({
                        deviceId: action.deviceId,
                        deviceName: device.name,
                        action: action.action,
                        status: 'failed',
                        error: 'Ação não disponível'
                    });
                    return;
                }

                try {
                    device.actions[action.action](action.value);
                    executedCount++;
                    console.log(`  ✅ ${action.action} executado em ${device.name}`);
                    results.push({
                        deviceId: action.deviceId,
                        deviceName: device.name,
                        action: action.action,
                        value: action.value,
                        status: 'success'
                    });
                } catch (error: any) {
                    failedCount++;
                    console.error(`  ❌ Erro ao executar ${action.action} em ${device.name}:`, error);
                    results.push({
                        deviceId: action.deviceId,
                        deviceName: device.name,
                        action: action.action,
                        status: 'failed',
                        error: error.message
                    });
                }
            });

            console.log(`  📊 Resultado: ${executedCount} sucesso, ${failedCount} falhas`);

            return {
                success: true,
                message: 'Execução manual concluída',
                stats: {
                    total: schedule.actions.length,
                    executed: executedCount,
                    failed: failedCount
                },
                results
            };
        } catch (error: any) {
            console.error(`[API] Erro ao executar schedule ${params.id}:`, error);
            set.status = 500;
            return {
                error: 'Erro ao executar agendamento',
                message: error.message
            };
        }
    });
