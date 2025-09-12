import { useEffect, useState } from "react";
import { ControllerCreateDTO, ControllerUpdateDTO, ControllerType, CreateControllerDTO } from "../types";

export const useControllers = () => {
    const [controllers, setControllers] = useState<ControllerType[]>([]);
    const [isControllersLoaded, setIsControllersLoaded] = useState<boolean>(false);

    useEffect(() => {
        loadControllers();
    }, []);

    useEffect(() => {
        console.log('Controllers: ', controllers);
    }, [controllers]);

    const loadControllers = async () => {
        const response = await fetch('/api/controllers');
        const data = await response.json() as ControllerType[];
        setControllers(data);
        setIsControllersLoaded(true);
    }

    const createController = async (controller: CreateControllerDTO) => {
        const response = await fetch('/api/controllers', {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(controller),
        });

        if (response.ok) {
            const data = await response.json() as ControllerType;
            console.log(data);
            setControllers([...controllers, data]);
            return data;
        }

        return null;
    }

    const readControllersConfigs = async () => {
        const response = await fetch("/api/controllers/configs");
        const data = await response.json() as any[];
        return data;
    }

    const updateController = async (id: string, controller: CreateControllerDTO) => {
        const response = await fetch(`/api/controllers/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'PUT',
            body: JSON.stringify(controller),
        });

        if (response.ok) {
            const data = await response.json();
            const controllerTemp = data.controller;
            setControllers(controllers.map((controller) => controller.id === controllerTemp.id ? controllerTemp : controller));
            return controllerTemp;
        }

        return null;
    }

    const deleteController = async (id: string) => {
        const response = await fetch(`/api/controllers/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setControllers(controllers.filter((controller) => controller.id !== id));
            return true;
        }

        console.log(response);

        return false;
    }

    return { controllers, setControllers, loadControllers, createController, readControllersConfigs, updateController, deleteController, isControllersLoaded };
}