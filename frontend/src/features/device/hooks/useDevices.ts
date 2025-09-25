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
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(device),
        });

        if (response.ok) {
            readDevices();
            return await response.json();
        }
    }

    const readDevices = async () => {
        const response = await fetch(API_URL);
        const data = await response.json() as DeviceType[];
        setDevices(data);
        setIsDevicesLoaded(true);
        console.log(data);
    }

    const updateDevice = async (id: string, device: DeviceType) => {
        const response = await fetch(API_URL + `/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(device),
        });

        if (response.ok) {
            readDevices();
            const deviceUpdated = await response.json();
            return deviceUpdated;
        }
    }

    const deleteDevice = async (device: DeviceType) => {
        const response = await fetch(API_URL + `/${device.id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            readDevices();
            return response.json();
        }
    }

    const getDeviceById = async (id: string) => {
        const response = await fetch(API_URL + `/${id}`);
        const data = await response.json() as DeviceType;
        return data;
    }

    return { devices, isDevicesLoaded, setDevices, createDevice, readDevices, updateDevice, deleteDevice, getDeviceById };
}