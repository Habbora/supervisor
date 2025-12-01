import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
    ControllerType,
    CreateControllerDTO,
    UpdateControllerDTO,
    Endpoint,
    CreateEndpointDTO,
    UpdateEndpointDTO
} from "../types";

const API_BASE = '/api';

type ResponseData<T> = {
    success: boolean;
    message: string;
    data: T;
}

export const useControllers = () => {
    const { token } = useAuth();
    const [controllers, setControllers] = useState<ControllerType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getControllers = () => {
        return controllers;
    }

    const getControllerById = async (id: string, includeEndpoints: boolean = false): Promise<ControllerType | null> => {
        if (!token) return null;

        try {
            const url = includeEndpoints
                ? `${API_BASE}/controllers/${id}?includeEndpoints=true`
                : `${API_BASE}/controllers/${id}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                return await response.json() as ControllerType;
            }

            const error = await response.json();
            console.error('Failed to get controller:', error);
            return null;
        } catch (error) {
            console.error('Error getting controller:', error);
            return null;
        }
    }

    const createController = async (controller: CreateControllerDTO): Promise<ControllerType | null> => {
        if (!token) return null;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/controllers`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                method: 'POST',
                body: JSON.stringify(controller),
            });

            if (response.ok) {
                const result = await response.json();
                const newController = result.controller as ControllerType;
                setControllers([...controllers, newController]);
                return newController;
            }

            const errorData = await response.json();
            setError(errorData.message || 'Failed to create controller');
            return null;
        } catch (error) {
            setError('Error creating controller');
            console.error('Error creating controller:', error);
            return null;
        } finally {
            setLoading(false);
        }
    }

    const updateController = async (id: string, data: UpdateControllerDTO): Promise<ControllerType | null> => {
        if (!token) return null

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/controllers/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                method: 'PUT',
                body: JSON.stringify(data),
            });

            const result = await response.json() as ResponseData<ControllerType>

            if (!result.success) {
                setError(result.message);
                return null;
            }

            return result.data;
        } catch (error) {
            setError('Error updating controller');
            console.error('Error updating controller:', error);
            return null;
        } finally {
            setLoading(false);
        }
    }

    const deleteController = async (id: string): Promise<boolean> => {
        if (!token) return false;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/controllers/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                method: 'DELETE',
            });

            if (response.ok) {
                setControllers(controllers.filter((c) => c.id !== id));
                return true;
            }

            const errorData = await response.json();
            setError(errorData.message || 'Failed to delete controller');
            console.error('Failed to delete controller:', errorData);
            return false;
        } catch (error) {
            setError('Error deleting controller');
            console.error('Error deleting controller:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════

    const getEndpoints = async (controllerId: string): Promise<Endpoint[]> => {
        if (!token) return [];

        try {
            const response = await fetch(`${API_BASE}/controllers/${controllerId}/endpoints`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const result = await response.json();
                return result.endpoints as Endpoint[];
            }

            const error = await response.json();
            console.error('Failed to get endpoints:', error);
            return [];
        } catch (error) {
            console.error('Error getting endpoints:', error);
            return [];
        }
    }

    const createEndpoint = async (controllerId: string, endpoint: CreateEndpointDTO): Promise<Endpoint | null> => {
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE}/controllers/${controllerId}/endpoints`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                method: 'POST',
                body: JSON.stringify(endpoint),
            });

            if (response.ok) {
                const result = await response.json();
                return result.endpoint as Endpoint;
            }

            const error = await response.json();
            console.error('Failed to create endpoint:', error);
            return null;
        } catch (error) {
            console.error('Error creating endpoint:', error);
            return null;
        }
    }

    const updateEndpoint = async (
        controllerId: string,
        endpointId: string,
        data: UpdateEndpointDTO
    ): Promise<Endpoint | null> => {
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE}/controllers/${controllerId}/endpoints/${endpointId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                method: 'PUT',
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                return result.endpoint as Endpoint;
            }

            const error = await response.json();
            console.error('Failed to update endpoint:', error);
            return null;
        } catch (error) {
            console.error('Error updating endpoint:', error);
            return null;
        }
    }

    const deleteEndpoint = async (controllerId: string, endpointId: string): Promise<boolean> => {
        if (!token) return false;

        try {
            const response = await fetch(`${API_BASE}/controllers/${controllerId}/endpoints/${endpointId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                method: 'DELETE',
            });

            if (response.ok) {
                return true;
            }

            const error = await response.json();
            console.error('Failed to delete endpoint:', error);
            return false;
        } catch (error) {
            console.error('Error deleting endpoint:', error);
            return false;
        }
    }

    return {
        // State
        controllers,
        loading,
        error,

        // Controllers
        setControllers,
        getControllerById,
        createController,
        updateController,
        deleteController,

        // Endpoints
        getEndpoints,
        createEndpoint,
        updateEndpoint,
        deleteEndpoint,
    };
}