export interface DeviceEndpoint {
  name: string;
  address: number;
  value: number;
  type: "input" | "output";
}
