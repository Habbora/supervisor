import { useEffect, useState } from "react";
import { CreateDeviceDTO, DeviceType } from "../types";

const API_URL = 'http://localhost:4001/api/v1/devices';

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
            console.log('Device created successfully');

            readDevices();

            return
        }

        console.error('Failed to create device');
    }

    const readDevices = async () => {
        const response = await fetch(API_URL);
        const data = await response.json() as DeviceType[];
        setDevices(data);
        setIsDevicesLoaded(true);
        console.log(data);
    }

    const updateDevice = async (device: DeviceType) => {
        const response = await fetch(API_URL, {
            method: 'PUT',
            body: JSON.stringify(device),
        });

        if (response.ok) {
            console.log('useDevices: Device updated successfully');
            readDevices();
            return
        }

        console.error('Failed to update device');
    }

    const deleteDevice = async (device: DeviceType) => {
        const response = await fetch(API_URL, {
            method: 'DELETE',
            body: JSON.stringify(device),
        });

        if (response.ok) {
            console.log('Device deleted successfully');

            readDevices();

            return
        }
    }

    return { devices, isDevicesLoaded, setDevices, createDevice, getDevices: readDevices, updateDevice, deleteDevice };
}