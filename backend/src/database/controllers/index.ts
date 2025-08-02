import { Database } from "..";
import type { ControllerSchema } from "./schema";

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
    public addController(controller: ControllerSchema): boolean {
        const database = Database.getInstance().readDatabase();
        if (database.controllers.find((c: ControllerSchema) => c.name === controller.name)) return false;

        database.controllers.push({
            name: controller.name,
            driverName: controller.driverName,
            startConfig: controller.startConfig
        });

        Database.getInstance().writeDatabase(database);
        return true;
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

    // TODO: Função para remover um controller pelo nome
    public removeControllerByName(name: string): boolean {
        const database = Database.getInstance().readDatabase();
        database.controllers = database.controllers.filter((c: any) => c.name !== name);
        Database.getInstance().writeDatabase(database);
        return true;
    }
}