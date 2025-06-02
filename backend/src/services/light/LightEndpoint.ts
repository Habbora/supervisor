import type { CreateLightEndpointDto } from "./types/CreateLightEndpoint.dto";

export class LightEndpoint {
  type: "discrete" | "pulse";
  deviceName: string;
  endpointName: string;
  feedbackName: string;
  feedbackIsInverted: boolean;

  constructor(props: CreateLightEndpointDto) {
    this.type = props.type;
    this.deviceName = props.deviceName;
    this.endpointName = props.endpointName;
    this.feedbackName = props.feedbackName;
    this.feedbackIsInverted = props.feedbackIsInverted;
  }
}