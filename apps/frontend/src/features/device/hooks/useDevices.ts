import { useEffect, useState } from "react";
import { CreateDeviceDTO, DeviceType } from "../types";

const API_URL = '/api/devices';

export const useDevices = () => {
    const [devices, setDevices] = useState<DeviceType[]>([]);
    const [isDevicesLoaded, setIsDevicesLoaded] = useState<boolean>(false);

    useEffect(() => {
        readDevices();
    }, []);

    const createDevice = async (device: CreateDeviceDTO) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(device),
            });

            if (response.ok) {
                const newDevice = await response.json();
                readDevices();
                return newDevice;
            } else {
                const error = await response.json();
                console.error('Error creating device:', error);
                throw new Error(error.error || 'Failed to create device');
            }
        } catch (error) {
            console.error('Error creating device:', error);
            throw error;
        }
    }

    const readDevices = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json() as DeviceType[];
                setDevices(data);
                setIsDevicesLoaded(true);
            } else {
                console.error('Error fetching devices');
                setIsDevicesLoaded(true);
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
            setIsDevicesLoaded(true);
        }
    }

    const updateDevice = async (id: string, device: DeviceType) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(device),
            });

            if (response.ok) {
                const deviceUpdated = await response.json();
                readDevices();
                return deviceUpdated;
            } else {
                const error = await response.json();
                console.error('Error updating device:', error);
                throw new Error(error.error || 'Failed to update device');
            }
        } catch (error) {
            console.error('Error updating device:', error);
            throw error;
        }
    }

    const deleteDevice = async (device: DeviceType) => {
        try {
            const response = await fetch(`${API_URL}/${device.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                readDevices();
                return response.json();
            } else {
                const error = await response.json();
                console.error('Error deleting device:', error);
                throw new Error(error.error || 'Failed to delete device');
            }
        } catch (error) {
            console.error('Error deleting device:', error);
            throw error;
        }
    }

    const getDeviceById = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (response.ok) {
                const data = await response.json() as DeviceType;
                return data;
            } else {
                const error = await response.json();
                console.error('Error fetching device:', error);
                throw new Error(error.error || 'Failed to fetch device');
            }
        } catch (error) {
            console.error('Error fetching device:', error);
            throw error;
        }
    }

    const sendCommand = async (id: string, command: { action: string; value?: number; duration?: number }) => {
        try {
            const response = await fetch(`${API_URL}/${id}/command`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(command),
            });

            if (response.ok) {
                const result = await response.json();
                readDevices();
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

    return { devices, isDevicesLoaded, setDevices, createDevice, readDevices, updateDevice, deleteDevice, getDeviceById, sendCommand };
}