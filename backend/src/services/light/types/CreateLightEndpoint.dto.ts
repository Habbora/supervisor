export type CreateLightEndpointDto = {
  type: "discrete" | "pulse";
  deviceName: string;
  endpointName: string;
  feedbackName: string;
  feedbackIsInverted: boolean;
}