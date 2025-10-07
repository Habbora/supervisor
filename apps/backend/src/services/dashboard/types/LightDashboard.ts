import type { LightEndpoint } from "../../light";

export type LightDashboard = {
  id: string;
  name: string;
  value: number;
  isValueValid: boolean;
  endpoint?: LightEndpoint;
};