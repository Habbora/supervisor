import { useEffect, useState, useCallback } from "react";
import type {
    Schedule,
    CreateScheduleDto,
    UpdateScheduleDto,
    ExecuteScheduleResult,
} from "@/types/schedule";

const API_BASE = '/api/schedules';

export const useSchedules = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSchedulesLoaded, setIsSchedulesLoaded] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Busca todos os agendamentos
     */
    const getSchedules = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(API_BASE);
            if (!response.ok) {
                throw new Error('Erro ao buscar agendamentos');
            }

            const data = await response.json();
            setSchedules(data);
            setIsSchedulesLoaded(true);
        } catch (err: any) {
            console.error('Erro ao buscar schedules:', err);
            setError(err.message || 'Erro desconhecido');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Cria um novo agendamento
     */
    const createSchedule = async (dto: CreateScheduleDto): Promise<Schedule | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar agendamento');
            }

            const newSchedule = await response.json();

            // Atualiza lista local
            setSchedules(prev => [...prev, newSchedule]);

            return newSchedule;
        } catch (err: any) {
            console.error('Erro ao criar schedule:', err);
            setError(err.message || 'Erro desconhecido');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Atualiza um agendamento existente
     */
    const updateSchedule = async (id: string, dto: UpdateScheduleDto): Promise<Schedule | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao atualizar agendamento');
            }

            const updatedSchedule = await response.json();

            // Atualiza lista local
            setSchedules(prev =>
                prev.map(s => s.id === id ? updatedSchedule : s)
            );

            return updatedSchedule;
        } catch (err: any) {
            console.error('Erro ao atualizar schedule:', err);
            setError(err.message || 'Erro desconhecido');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Deleta um agendamento
     */
    const deleteSchedule = async (id: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao deletar agendamento');
            }

            // Remove da lista local
            setSchedules(prev => prev.filter(s => s.id !== id));

            return true;
        } catch (err: any) {
            console.error('Erro ao deletar schedule:', err);
            setError(err.message || 'Erro desconhecido');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Alterna status ativo/inativo
     */
    const toggleSchedule = async (id: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE}/${id}/toggle`, {
                method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao alternar status');
            }

            const data = await response.json();

            // Atualiza lista local
            setSchedules(prev =>
                prev.map(s => s.id === id ? { ...s, isActive: data.isActive } : s)
            );

            return true;
        } catch (err: any) {
            console.error('Erro ao alternar status do schedule:', err);
            setError(err.message || 'Erro desconhecido');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Executa um agendamento manualmente
     */
    const executeSchedule = async (id: string): Promise<ExecuteScheduleResult | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE}/${id}/execute`, {
                method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao executar agendamento');
            }

            const result = await response.json();
            return result;
        } catch (err: any) {
            console.error('Erro ao executar schedule:', err);
            setError(err.message || 'Erro desconhecido');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Recarrega a lista de agendamentos
     */
    const refresh = useCallback(() => {
        getSchedules();
    }, [getSchedules]);

    // Carrega schedules na montagem do componente
    useEffect(() => {
        getSchedules();
    }, [getSchedules]);

    return {
        schedules,
        isLoading,
        isSchedulesLoaded,
        error,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        toggleSchedule,
        executeSchedule,
        refresh,
    };
};
