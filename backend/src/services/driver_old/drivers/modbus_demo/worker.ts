import type { WorkerMessageRequestTemplate, WorkerMessageResponseTemplate } from "../../../worker/types";

declare var self: Worker;

let lastState: Map<number, number> = new Map();

self.onmessage = async (event: MessageEvent<WorkerMessageRequestTemplate<any>>) => {

  if (event.data.type === "init") {
    console.log("✅ Modbus Demo Driver Iniciado Corretamente");
    
    const { inputs, outputs } = event.data.payload.endpoints ?? { inputs: [], outputs: [] };

    inputs.forEach((input) => {
      lastState.set(input.address, 0);
    });

    inputs.forEach((input) => {
      lastState.set(input.address, 0);
    });

    outputs.forEach((output) => {
      lastState.set(output.address, 0);
    });

    const response = {
      type: "update",
      payload: Array.from(lastState.entries()).map(([address, value]) => ({
        address,
        value
      })),
    };

    self.postMessage(response as WorkerMessageResponseTemplate);

    return;
  }

  if (event.data.type === "command") {
    const data = event.data.payload;
    if (data.type === "write") {
      const { type, address, value } = data.payload;

      lastState.set(address, value > 0 ? 0 : 1);

      self.postMessage({
        type: "update",
        payload: [{
          address,
          value,
        }]
      } as WorkerMessageResponseTemplate);
    }

    return;
  }

  self.postMessage({
    type: "error",
    error: new Error("Invalid message type")
  } as WorkerMessageResponseTemplate);
};
