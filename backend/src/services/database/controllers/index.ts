import { Database } from "..";
import type { ControllerSchema, CreateControllerSchema } from "./schema";

export class DatabaseController {
    private static instance: DatabaseController;

    private constructor() {
        this.initDatabase();
    }

    public static getInstance(): DatabaseController {
        if (!DatabaseController.instance) {
            DatabaseController.instance = new DatabaseController();
        }
        return DatabaseController.instance;
    }

    // TODO: Função para init controllers
    public initDatabase(): boolean {
        const database = Database.getInstance().readDatabase();
        if (!database.controllers) database.controllers = [];
        Database.getInstance().writeDatabase(database);
        return true;
    }

    // TODO: Função para ler todos os controllers
    public findAll(): ControllerSchema[] {
        const database = Database.getInstance().readDatabase();
        return database.controllers;
    }

    public findById(id: string): ControllerSchema | undefined {
        const database = Database.getInstance().readDatabase();
        return database.controllers.find((c: ControllerSchema) => c.id === id) || null;
    }

    // TODO: Função para adicionar um novo controller
    public addController(controller: CreateControllerSchema): ControllerSchema | undefined {
        const database = Database.getInstance().readDatabase();

        const newController: ControllerSchema = {
            id: crypto.randomUUID(),
            ...controller,
        };

        database.controllers.push(newController);

        Database.getInstance().writeDatabase(database);
        return newController;
    }

    // TODO: Função para ler um controller pelo id
    public readControllerByName(name: string): any {
        const database = Database.getInstance().readDatabase();
        return database.controllers.find((c: any) => c.name === name);
    }

    // TODO: Função para remover todos os controllers
    public removeControllers(): boolean {
        const database = Database.getInstance().readDatabase();
        database.controllers = [];
        Database.getInstance().writeDatabase(database);
        return true;
    }

    public removeControllerById(id: string): boolean {
        const database = Database.getInstance().readDatabase();
        database.controllers = database.controllers.filter((c: any) => c.id !== id);
        Database.getInstance().writeDatabase(database);
        return true;
    }

    public updateController(id: string, controller: CreateControllerSchema): ControllerSchema | undefined {
        const database = Database.getInstance().readDatabase();
        const oldController = database.controllers.find((c: any) => c.id === id);
        if (!oldController) return undefined;
        oldController.name = controller.name;
        oldController.type = controller.type;
        oldController.configs = controller.configs;
        Database.getInstance().writeDatabase(database);
        return oldController;
    }
}