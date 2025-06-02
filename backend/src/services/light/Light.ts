import EventEmitter from "events";

import type { CreateLightDto } from "./types/CreateLight.dto";
import type { CreateLightEndpointDto } from "./types/CreateLightEndpoint.dto";

import { LightEndpoint } from "./LightEndpoint";
import type { LightEntityDto } from "../database/types";

export class Light extends EventEmitter {
  private _name: string;
  private _value?: number;
  private _endpoint?: LightEndpoint;

  constructor(dto: CreateLightDto) {
    super();
    this._name = dto.name;
  }

  public get name(): string {
    return this._name;
  }

  public get value(): number | undefined {
    if (this._value === undefined) return -1;
    if (typeof this._value === "boolean") return this._value ? 1 : 0;
    return this._value;
  }

  public set value(value: number | boolean | undefined) {
    if (typeof value === "boolean") value = value ? 1 : 0;
    this._value = value;
  }

  public get lightEndpoint(): LightEndpoint | undefined {
    return this._endpoint;
  }

  public set lightEndpoint(lightEndpoint: CreateLightEndpointDto) {
    this._endpoint = new LightEndpoint(lightEndpoint);
  }

  public toEntityDto(): LightEntityDto {
    return {
      name: this._name,
      endpoint: this._endpoint,
    };
  }

  public static fromLightEntityDto(dto: LightEntityDto): Light {
    const light = new Light({ name: dto.name });
    if (dto.endpoint) light.lightEndpoint = dto.endpoint;
    return light;
  }
} 
