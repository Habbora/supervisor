export type WorkerInit = {
  driver: string;
  network: WorkerNetworkConfig;
  endpoints?: WorkerEndpointsConfig;
};

export type WorkerNetworkConfig = {
  host: string;
  port: number;
};

export type WorkerEndpoint = {
  name: string;
  type: "discrete" | "analog";
  address: number;
};

export type WorkerEndpointsConfig = {
  outputs: WorkerEndpoint[];
  inputs: WorkerEndpoint[];
};


export type WorkerMessageRequestTemplate<Payload> =
  | { type: "init"; payload: WorkerInit }
  | { type: "command"; payload: Payload };

export type WorkerMessageResponseTemplate =
  | { type: "success"; payload: any }
  | { type: "update"; payload: ModbusPayloadUpdateResponse[] }
  | { type: "error"; error: Error };

export type ModbusPayloadUpdateResponse = {
  address: number;
  value: number;
};
