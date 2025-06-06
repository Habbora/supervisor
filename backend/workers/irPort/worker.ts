import net from "net";

import type {
  WorkerMessageRequestTemplate,
  WorkerMessageResponseTemplate,
} from "../../../worker/types";

declare var self: Worker;

type Payload = {
  command: string;
};

let socket: net.Socket | null = null;

self.onmessage = async (
  event: MessageEvent<WorkerMessageRequestTemplate<Payload>>
) => {
  switch (event.data.type) {
    case "init": {
      socket = new net.Socket();

      socket.connect(
        event.data.payload.network.port,
        event.data.payload.network.host
      );

      socket.on("connect", () => {
        console.log("connected");
      });

      socket.on("error", (error) => {
        console.error("error", error);
      });

      return;
    }

    case "command": {
      socket!.write(event.data.payload.command);
      return;
    }

    default: {
      self.postMessage({
        type: "error",
        error: new Error("Invalid message type"),
      } as WorkerMessageResponseTemplate);
    }
  }
};
