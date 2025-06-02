import type { WorkerMessageRequestTemplate, WorkerMessageResponseTemplate } from "../../../worker/types";

declare var self: Worker;

console.log("✅ Modbus Demo Driver Iniciado Corretamente");

let lastState: Map<number, number> = new Map();

self.onmessage = async (event: MessageEvent<WorkerMessageRequestTemplate<any>>) => {
  console.log("[ModbusDemo] Mensagem recebida:", event.data.type);

  if (event.data.type === "init") {
    console.log("[ModbusDemo] Inicializando...");
    self.postMessage({
      type: "success",
      payload: { message: "Modbus Demo inicializado" }
    } as WorkerMessageResponseTemplate);
    return;
  }

  if (event.data.type === "command") {
    const { address, value } = event.data.payload.payload;
    console.log(`[ModbusDemo] Comando recebido: address=${address}, value=${value}`);
    
    lastState.set(address, value);
    
    self.postMessage({
      type: "update",
      payload: [{
        address,
        value
      }]
    } as WorkerMessageResponseTemplate);
    return;
  }

  self.postMessage({
    type: "error",
    error: new Error("Invalid message type")
  } as WorkerMessageResponseTemplate);
};
