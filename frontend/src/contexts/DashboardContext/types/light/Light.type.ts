export interface LightContext {
  id: number;
  name: string;
  type: "dimmer" | "switch" | "pulse";
  status: number;
}
