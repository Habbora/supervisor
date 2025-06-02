
export type LightEndpointEntityDto = {
  type: "discrete" | "pulse";
  deviceName: string;
  endpointName: string;
  feedbackName: string;
  feedbackIsInverted: boolean;
};

export type LightEntityDto = {
  name: string;
  endpoint?: LightEndpointEntityDto;
};
