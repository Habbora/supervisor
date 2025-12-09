import { describe, it, expect } from "bun:test";
import EventEmitter from "events";
import { ControllerManager } from "./controller.manager";
import type { Driver } from "./drivers/driver.interface";
import { Elysia } from "elysia";
import { controllerRoutes } from "./controllers.route";

class MockDriver extends EventEmitter implements Driver<any> {
    name = "Mock";
    description = "Mock Driver";
    version = 1;
    configSchemaJSON = {};
    async start(): Promise<void> {
        queueMicrotask(() => this.emit("connected"));
    }
    async stop(): Promise<void> {
        this.emit("disconnected");
    }
    async setOn(): Promise<void> { }
    async setOff(): Promise<void> { }
    async setValue(): Promise<void> { }
}

describe("ControllerManager", () => {
    it("registra driver e cria controlador", async () => {
        ControllerManager.getInstance().registerDriver("mock", {
            name: "Mock",
            description: "Mock",
            factory: () => new MockDriver(),
        });

        const id = crypto.randomUUID();
        const controller = await ControllerManager.getInstance().create({
            id,
            name: "Teste",
            driver: "mock",
            config: { a: 1 },
        });

        const json = controller.toJSON();
        expect(json.id).toBe(id);
        expect(json.name).toBe("Teste");
        expect(json.driver).toBe("mock");
        expect(typeof json.status.isConnected).toBe("boolean");

        const found = ControllerManager.getInstance().findById(id);
        expect(found?.id).toBe(id);
    });

    it("remove controlador", async () => {
        const id = crypto.randomUUID();
        ControllerManager.getInstance().registerDriver("mock", {
            name: "Mock",
            description: "Mock",
            factory: () => new MockDriver(),
        });
        await ControllerManager.getInstance().create({ id, name: "X", driver: "mock" });
        await ControllerManager.getInstance().remove(id);
        expect(ControllerManager.getInstance().findById(id)).toBeUndefined();
    });
});

describe("Controller Routes", () => {
    it("GET /api/v1/controllers lista controladores", async () => {
        const id = crypto.randomUUID();
        ControllerManager.getInstance().registerDriver("mock", {
            name: "Mock",
            description: "Mock",
            factory: () => new MockDriver(),
        });
        await ControllerManager.getInstance().create({ id, name: "Z", driver: "mock" });

        const app = new Elysia().use(controllerRoutes);
        const res = await app.handle(new Request("http://localhost/api/v1/controllers"));
        expect(res.ok).toBe(true);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.some((c: any) => c.id === id)).toBe(true);
    });
});
