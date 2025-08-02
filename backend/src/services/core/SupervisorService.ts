import { Database } from "../../database";
import { ControllerManager } from "../controller";
import { Dashboard } from "../dashboard";
import { DeviceManager } from "../devices/DeviceManager";
import { EventBus } from "../EventBus";
import { HistoryManager } from "../history";

export class Supervisor {
  private static __instance: Supervisor;
  public database = Database.getInstance();
  public eventBus = EventBus.getInstance();
  public historyManager = HistoryManager.getInstance();
  public controllerManager = new ControllerManager();
  public deviceManager = DeviceManager.getInstance();
  public dashboard = new Dashboard(this.eventBus, this.deviceManager);

  private constructor() { }

  public static getInstance(): Supervisor {
    if (!Supervisor.__instance) Supervisor.__instance = new Supervisor();
    return Supervisor.__instance;
  }
}
