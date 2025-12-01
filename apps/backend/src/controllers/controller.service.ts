import { prisma } from '@/lib/prisma';
import type { Controller } from '@prisma/client';
import { ControllerNotFoundError, ControllerAlreadyExistsError } from '../services/controllers-service/errors';
import type {
    CreateControllerDTO,
    UpdateControllerDTO,
} from '../services/controllers-service/types';
import { ControllerManager } from '.';
import { ControllerBootstrap } from './controller.bootstrap';

export type ControllerServiceResponse = {
    id: string;
    name: string;
    driver: string;
    configs: any;
}

export class ControllerService {
    private static _instance: ControllerService;

    private constructor() { }

    public static getInstance(): ControllerService {
        if (!ControllerService._instance) {
            ControllerService._instance = new ControllerService();
        }
        return ControllerService._instance;
    }

    async create(data: CreateControllerDTO): Promise<Controller> {
        // Criar controller no Banco de dados
        const controller = await prisma.controller.create({
            data: {
                name: data.name,
                driver: data.driver,
            },
        })

        // Criar controller no ControllerManager
        await ControllerManager.getInstance().create({
            id: controller.id,
            name: controller.name,
            driver: controller.driver,
        })

        return controller
    }

    async findAll(): Promise<ControllerServiceResponse[]> {
        const controllers = ControllerManager
            .getInstance()
            .findAll()
            .map(controller => controller.toJSON())
        return controllers
    }

    async findById(id: string): Promise<any | null> {
        const controller = ControllerManager.getInstance().findById(id)

        if (!controller) return null

        return controller.toJSON()
    }

    async findByName(name: string): Promise<Controller | null> {
        const controller = await prisma.controller.findFirst({
            where: { name },
        });

        if (!controller) return null;

        return controller
    }

    async update(id: string, data: UpdateControllerDTO): Promise<Controller> {
        const updatedController = await prisma.controller.update({
            where: { id },
            data,
        })

        ControllerBootstrap.reloadController(id, updatedController)

        return updatedController
    }

    async delete(id: string): Promise<Controller> {
        const existingController = await prisma.controller.findUnique({
            where: { id },
        });

        if (!existingController) {
            throw new ControllerNotFoundError(id);
        }

        // Remover da memória PRIMEIRO (para parar driver)
        ControllerManager.getInstance().remove(id);

        // Deletar controller do banco (endpoints serão deletados em cascata)
        const deletedController = await prisma.controller.delete({
            where: { id },
        });

        return deletedController
    }

}
