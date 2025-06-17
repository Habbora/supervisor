import type { ModbusMessageRequest } from "../../src/services/modbus/types";
import { ModbusWorker } from "../../src/services/modbus/worker";
import type { WorkerMessageRequestTemplate, WorkerMessageResponseTemplate } from "../../src/services/worker/types";

declare var self: Worker;

let client: ModbusWorker | null = null;

console.log("😊 ModbusWorker iniciado com sucesso");

self.onmessage = async (event: MessageEvent<WorkerMessageRequestTemplate<ModbusMessageRequest>>) => {
  if (event.data.type === "init") {

    if (client) {
      self.postMessage({
        type: "error",
        error: new Error("Client already initialized"),
      } as WorkerMessageResponseTemplate);
      return;
    }

    const init = event.data.payload;

    client = new ModbusWorker({
      host: init.network.host,
      port: init.network.port,
      postMessage: (message: any) => {
        self.postMessage(message);
      },
    });

    await client.initialize();
    return;
  }

  if (!client) {
    self.postMessage({
      type: "error",
      error: new Error("Client not initialized"),
    } as WorkerMessageResponseTemplate);
    return;
  }

  if (event.data.type === "command") {
    await client.handleMessage(event.data.payload);
    return;
  }

  self.postMessage({
    type: "error",
    error: new Error("Invalid message type"),
  } as WorkerMessageResponseTemplate);
};
