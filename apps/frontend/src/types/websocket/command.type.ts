type Command = {
    deviceId: string;
}

export type ToggleCommand = Command & {
    action: "toggle";
}

export type SwitchCommand = Command & {
    action: "switch";
    value?: boolean;
}

export type DimmerCommand = Command & {
    action: "dimmer";
    value?: number;
}

export type PulseCommand = Command & {      
    action: "pulse";
    value?: number | boolean;
}