import { ModbusWorker } from "../../../modbus";
import type { WorkerMessageRequestTemplate, WorkerMessageResponseTemplate } from "../../../worker/types";
import type { ModbusMessageRequest } from "../../../modbus/types";

declare var self: Worker;

let client: ModbusWorker | null = null;

self.onmessage = async (event: MessageEvent<WorkerMessageRequestTemplate<ModbusMessageRequest>>) => {
  console.log("[ModbusWorker] Mensagem recebida:", event.data.type);
  
  if (event.data.type === "init") {
    console.log("[ModbusWorker] Inicializando...");
    
    if (client) {
      console.log("[ModbusWorker] Cliente já inicializado");
      self.postMessage({
        type: "error",
        error: new Error("Client already initialized"),
      } as WorkerMessageResponseTemplate);
      return;
    }

    const init = event.data.payload;
    console.log("[ModbusWorker] Config:", init);

    client = new ModbusWorker({
      host: init.network.host,
      port: init.network.port,
      postMessage: (message: any) => {
        console.log("[ModbusWorker] Enviando mensagem:", message.type);
        self.postMessage(message);
      },
    });

    await client.initialize();
    console.log("[ModbusWorker] Inicializado com sucesso");
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
