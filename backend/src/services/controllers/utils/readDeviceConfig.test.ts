import { readControllerConfig } from "./readDeviceConfig";

const devicesConfig = readControllerConfig();
console.log(devicesConfig[0].endpoints_register);