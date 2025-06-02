import { readDevicesConfig } from "./readDeviceConfig";

const devicesConfig = readDevicesConfig();
console.log(devicesConfig[0].endpoints_boolean);