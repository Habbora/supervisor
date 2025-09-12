import { Database } from "./services/database";
import { ControllerManager } from "./services/controllers/manager";
import { Dashboard } from "./services/dashboard";
import { DeviceService } from "./services/devices/DeviceService";
import { EventBus } from "./services/event-bus/index.ts";
import { HistoryManager } from "./services/history";
import { ScheduleManager } from "./features/schedules/schedule-manager.ts";
import { Schedule } from "./features/schedules/schedule.ts";
import { ScheduleDatabase } from "./services/database/schedules/index.ts";

console.clear();
console.log("Starting Supervisor...");

console.log("Database...");
Database.getInstance();

console.log("EventBus...");
EventBus.getInstance();

console.log("HistoryManager...");
HistoryManager.getInstance();

console.log("ControllerManager...");
ControllerManager.getInstance();

console.log("DeviceManager...");
DeviceService.getInstance();

console.log("ScheduleManager...");
ScheduleManager.getInstance();

console.log("Dashboard...");
new Dashboard();
