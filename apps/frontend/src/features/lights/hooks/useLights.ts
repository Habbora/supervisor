import { useEffect, useState } from "react";
import type { Light } from "@/types/devices/light.type";

export interface CreateLightDTO {
    name: string;
    controllerId: string;
    endpointName: string;
}

export type { Light };

const API_URL = '/api/lights';

export const useLights = () => {
    const [lights, setLights] = useState<Light[]>([]);
    const [isLightsLoaded, setIsLightsLoaded] = useState<boolean>(false);

    useEffect(() => {
        readLights();
    }, []);

    const createLight = async (light: CreateLightDTO) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(light),
            });

            if (response.ok) {
                const newLight = await response.json();
                readLights();
                return newLight;
            } else {
                const error = await response.json();
                console.error('Error creating light:', error);
                throw new Error(error.error || 'Failed to create light');
            }
        } catch (error) {
            console.error('Error creating light:', error);
            throw error;
        }
    }

    const readLights = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json() as Light[];
                setLights(data);
                setIsLightsLoaded(true);
            } else {
                console.error('Error fetching lights');
                setIsLightsLoaded(true);
            }
        } catch (error) {
            console.error('Error fetching lights:', error);
            setIsLightsLoaded(true);
        }
    }

    const updateLight = async (id: string, light: Partial<Light>) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(light),
            });

            if (response.ok) {
                const lightUpdated = await response.json();
                readLights();
                return lightUpdated;
            } else {
                const error = await response.json();
                console.error('Error updating light:', error);
                throw new Error(error.error || 'Failed to update light');
            }
        } catch (error) {
            console.error('Error updating light:', error);
            throw error;
        }
    }

    const deleteLight = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                readLights();
                return true;
            } else {
                const error = await response.json();
                console.error('Error deleting light:', error);
                throw new Error(error.error || 'Failed to delete light');
            }
        } catch (error) {
            console.error('Error deleting light:', error);
            throw error;
        }
    }

    const getLightById = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (response.ok) {
                const data = await response.json() as Light;
                return data;
            } else {
                const error = await response.json();
                console.error('Error fetching light:', error);
                throw new Error(error.error || 'Failed to fetch light');
            }
        } catch (error) {
            console.error('Error fetching light:', error);
            throw error;
        }
    }

    const sendCommand = async (id: string, action: 'turnOn' | 'turnOff' | 'toggle') => {
        try {
            const response = await fetch(`${API_URL}/${id}/command`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });

            if (response.ok) {
                const result = await response.json();
                readLights();
                return result;
            } else {
                const error = await response.json();
                console.error('Error sending command:', error);
                throw new Error(error.error || 'Failed to send command');
            }
        } catch (error) {
            console.error('Error sending command:', error);
            throw error;
        }
    }

    return {
        lights,
        isLightsLoaded,
        setLights,
        createLight,
        readLights,
        updateLight,
        deleteLight,
        getLightById,
        sendCommand
    };
}
