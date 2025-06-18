import { HydraulicLevelContext } from "../hydraulic/HydraulicType";
import { LightContext } from "./Light.type";

export interface GroupContext {
  id: number;
  name: string;
  lights: LightContext[];
  levels: HydraulicLevelContext[];
}
