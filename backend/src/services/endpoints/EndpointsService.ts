import { BaseService } from "../abstracts/BaseService";
import type { Device } from "../devices/Device";

type EndpointType = "digital_input" | "digital_output" | "analog_input" | "analog_output" | "pwm_output";

type Endpoint = {
  id: string;
  device: Device
  name: string;
  type: EndpointType;
  commands: Function[];
  lastValue: any;
}

type EnpointDigitalInput = Endpoint & {
  type: "digital_input";
  commands: {
    read: Function;
  }
  lastValue: boolean;
}

type EnpointDigitalOutput = Endpoint & {
  type: "digital_output";
  commands: {
    read: Function;
    write: Function;
  }
  lastValue: boolean;
}

type EnpointAnalogInput = Endpoint & {
  type: "analog_input";
  commands: {
    read: Function;
  }
  lastValue: number;
}

type EnpointAnalogOutput = Endpoint & {
  type: "analog_output";
  commands: {
    read: Function;
    write: Function;
  }
  lastValue: number;
}

type EnpointPwmOutput = Endpoint & {
  type: "pwm_output";
  commands: {
    read: Function;
  }
}

type EnpointStringOutput = Endpoint & {
  type: "string_output";
  commands: {
    write: Function;
  }
}

type EndpointTypes = EnpointDigitalInput | EnpointDigitalOutput | EnpointAnalogInput | EnpointAnalogOutput | EnpointPwmOutput | EnpointStringOutput;


export class EndpointsService extends BaseService {
  
  endpoints: EndpointTypes[] = [];

  async initialize(): Promise<void> {
    await this.__loadEndpoints();
    return Promise.resolve();
  }

  private async __loadEndpoints() {
    this.endpoints = [];
  }

  addEndpoint(endpoint: EndpointTypes) {
    this.endpoints.push(endpoint);
  }



}
