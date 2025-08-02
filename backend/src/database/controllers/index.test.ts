import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { DatabaseController } from "./index";
import { Database } from "..";
import type { ControllerSchema } from "./schema";
import fs from "fs";
import path from "path";

describe("DatabaseController", () => {
    let databaseController: DatabaseController;
    let originalDatabase: any;
    let testDatabasePath: string;

    beforeEach(() => {
        // Backup do banco original
        const databasePath = path.join(process.cwd(), "database", "database.json");
        if (fs.existsSync(databasePath)) {
            originalDatabase = JSON.parse(fs.readFileSync(databasePath, "utf8"));
        }

        // Criar banco de teste temporário
        testDatabasePath = path.join(process.cwd(), "database", "test-database.json");
        fs.writeFileSync(testDatabasePath, JSON.stringify({ controllers: [] }));

        // Mock do Database para usar o arquivo de teste
        const originalReadDatabase = Database.getInstance().readDatabase;
        const originalWriteDatabase = Database.getInstance().writeDatabase;

        // Mock temporário para usar o arquivo de teste
        Database.getInstance().readDatabase = () => {
            return JSON.parse(fs.readFileSync(testDatabasePath, "utf8"));
        };

        Database.getInstance().writeDatabase = (data: any) => {
            fs.writeFileSync(testDatabasePath, JSON.stringify(data, null, 2));
            return true;
        };

        databaseController = DatabaseController.getInstance();
    });

    afterEach(() => {
        // Restaurar banco original
        const databasePath = path.join(process.cwd(), "database", "database.json");
        if (originalDatabase) {
            fs.writeFileSync(databasePath, JSON.stringify(originalDatabase, null, 2));
        }

        // Limpar arquivo de teste
        if (fs.existsSync(testDatabasePath)) {
            fs.unlinkSync(testDatabasePath);
        }

        // Restaurar métodos originais do Database
        // Como não podemos acessar propriedades privadas, vamos recriar a instância
        // Resetando o singleton para forçar nova instância
        (Database as any).instance = undefined;
    });

    describe("Singleton Pattern", () => {
        test("deve retornar a mesma instância", () => {
            const instance1 = DatabaseController.getInstance();
            const instance2 = DatabaseController.getInstance();

            expect(instance1).toBe(instance2);
        });
    });

    describe("initControllers", () => {
        test("deve inicializar controllers quando não existem", () => {
            // Limpar controllers
            fs.writeFileSync(testDatabasePath, JSON.stringify({}));

            const result = databaseController.initDatabase();

            expect(result).toBe(true);

            const database = Database.getInstance().readDatabase();
            expect(database.controllers).toBeDefined();
            expect(Array.isArray(database.controllers)).toBe(true);
        });

        test("deve manter controllers existentes", () => {
            const existingControllers = [
                { name: "test1", driverName: "driver1", startConfig: {} }
            ];
            fs.writeFileSync(testDatabasePath, JSON.stringify({ controllers: existingControllers }));

            const result = databaseController.initDatabase();

            expect(result).toBe(true);

            const database = Database.getInstance().readDatabase();
            expect(database.controllers).toEqual(existingControllers);
        });
    });

    describe("readControllers", () => {
        test("deve retornar lista vazia quando não há controllers", () => {
            const controllers = databaseController.findAll();

            expect(controllers).toEqual([]);
        });

        test("deve retornar todos os controllers", () => {
            const testControllers: ControllerSchema[] = [
                { name: "controller1", driverName: "driver1", startConfig: { port: 502 } },
                { name: "controller2", driverName: "driver2", startConfig: { ip: "192.168.1.100" } }
            ];

            fs.writeFileSync(testDatabasePath, JSON.stringify({ controllers: testControllers }));

            const controllers = databaseController.findAll();

            expect(controllers).toEqual(testControllers);
        });
    });

    describe("addController", () => {
        test("deve adicionar um novo controller", () => {
            const newController: ControllerSchema = {
                name: "testController",
                driverName: "modbus",
                startConfig: { port: 502, ip: "192.168.1.100" }
            };

            const result = databaseController.addController(newController);

            expect(result).toBe(true);

            const controllers = databaseController.findAll();
            expect(controllers).toHaveLength(1);
            expect(controllers[0]).toEqual(newController);
        });

        test("não deve adicionar controller com nome duplicado", () => {
            const controller: ControllerSchema = {
                name: "duplicate",
                driverName: "modbus",
                startConfig: {}
            };

            // Adicionar primeiro controller
            const result1 = databaseController.addController(controller);
            expect(result1).toBe(true);

            // Tentar adicionar controller com mesmo nome
            const result2 = databaseController.addController(controller);
            expect(result2).toBe(false);

            const controllers = databaseController.findAll();
            expect(controllers).toHaveLength(1);
        });

        test("deve adicionar múltiplos controllers diferentes", () => {
            const controller1: ControllerSchema = {
                name: "controller1",
                driverName: "modbus",
                startConfig: { port: 502 }
            };

            const controller2: ControllerSchema = {
                name: "controller2",
                driverName: "ethernet",
                startConfig: { ip: "192.168.1.100" }
            };

            const result1 = databaseController.addController(controller1);
            const result2 = databaseController.addController(controller2);

            expect(result1).toBe(true);
            expect(result2).toBe(true);

            const controllers = databaseController.findAll();
            expect(controllers).toHaveLength(2);
            expect(controllers).toContainEqual(controller1);
            expect(controllers).toContainEqual(controller2);
        });
    });

    describe("readControllerByName", () => {
        test("deve retornar controller pelo nome", () => {
            const testController: ControllerSchema = {
                name: "testController",
                driverName: "modbus",
                startConfig: { port: 502 }
            };

            databaseController.addController(testController);

            const found = databaseController.readControllerByName("testController");

            expect(found).toEqual(testController);
        });

        test("deve retornar undefined para controller inexistente", () => {
            const found = databaseController.readControllerByName("inexistente");

            expect(found).toBeUndefined();
        });
    });

    describe("removeControllers", () => {
        test("deve remover todos os controllers", () => {
            // Adicionar alguns controllers
            const controller1: ControllerSchema = {
                name: "controller1",
                driverName: "modbus",
                startConfig: {}
            };

            const controller2: ControllerSchema = {
                name: "controller2",
                driverName: "ethernet",
                startConfig: {}
            };

            databaseController.addController(controller1);
            databaseController.addController(controller2);

            // Verificar que foram adicionados
            expect(databaseController.findAll()).toHaveLength(2);

            // Remover todos
            const result = databaseController.removeControllers();

            expect(result).toBe(true);
            expect(databaseController.findAll()).toEqual([]);
        });

        test("deve funcionar quando não há controllers", () => {
            const result = databaseController.removeControllers();

            expect(result).toBe(true);
            expect(databaseController.findAll()).toEqual([]);
        });
    });

    describe("removeControllerByName", () => {
        test("deve remover controller específico pelo nome", () => {
            const controller1: ControllerSchema = {
                name: "controller1",
                driverName: "modbus",
                startConfig: {}
            };

            const controller2: ControllerSchema = {
                name: "controller2",
                driverName: "ethernet",
                startConfig: {}
            };

            databaseController.addController(controller1);
            databaseController.addController(controller2);

            // Remover apenas controller1
            const result = databaseController.removeControllerByName("controller1");

            expect(result).toBe(true);

            const controllers = databaseController.findAll();
            expect(controllers).toHaveLength(1);
            expect(controllers[0]).toEqual(controller2);
        });

        test("deve retornar true mesmo para controller inexistente", () => {
            const result = databaseController.removeControllerByName("inexistente");

            expect(result).toBe(true);
        });

        test("deve remover controller quando é o único", () => {
            const controller: ControllerSchema = {
                name: "single",
                driverName: "modbus",
                startConfig: {}
            };

            databaseController.addController(controller);

            const result = databaseController.removeControllerByName("single");

            expect(result).toBe(true);
            expect(databaseController.findAll()).toEqual([]);
        });
    });

    describe("Integração - Fluxo Completo", () => {
        test("deve gerenciar ciclo completo de CRUD", () => {
            // 1. Inicializar
            databaseController.initDatabase();
            expect(databaseController.findAll()).toEqual([]);

            // 2. Adicionar controllers
            const controller1: ControllerSchema = {
                name: "modbus1",
                driverName: "modbus",
                startConfig: { port: 502, ip: "192.168.1.100" }
            };

            const controller2: ControllerSchema = {
                name: "ethernet1",
                driverName: "ethernet",
                startConfig: { ip: "192.168.1.101" }
            };

            expect(databaseController.addController(controller1)).toBe(true);
            expect(databaseController.addController(controller2)).toBe(true);

            // 3. Verificar se foram adicionados
            const controllers = databaseController.findAll();
            expect(controllers).toHaveLength(2);

            // 4. Buscar controller específico
            const found = databaseController.readControllerByName("modbus1");
            expect(found).toEqual(controller1);

            // 5. Remover controller específico
            expect(databaseController.removeControllerByName("modbus1")).toBe(true);

            // 6. Verificar que foi removido
            const remainingControllers = databaseController.findAll();
            expect(remainingControllers).toHaveLength(1);
            expect(remainingControllers[0]).toEqual(controller2);

            // 7. Remover todos
            expect(databaseController.removeControllers()).toBe(true);
            expect(databaseController.findAll()).toEqual([]);
        });
    });
});
