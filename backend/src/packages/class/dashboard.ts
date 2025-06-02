import { Light } from "./light";

export type DashboardStateType = {
  lights: Light[];
  activeScreen: string;
};

export class DashboardState implements DashboardStateType {
  lights: Light[];
  activeScreen: string;
  
  constructor() {
    this.lights = [];
    this.activeScreen = "home";
  }
}
