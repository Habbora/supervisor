/**
 * Binding Architecture
 *
 * Arquitetura plug-and-play onde:
 * - Driver = Provedor de bindings (protocolo de comunicação)
 * - Endpoint = Consumidor de bindings (lógica de dispositivo)
 * - Binding = Interface de comunicação entre driver e endpoint
 */

/**
 * ===============================================
 * BINDING INTERFACES
 * ===============================================
 */

/**
 * Binding para valores booleanos (coils, relays)
 * Usado por: DigitalOutput, DigitalInput
 */
export interface BooleanBinding {
  name: string;
  type: 'boolean';

  read(address: number): Promise<boolean>;
  write?(address: number, value: boolean): Promise<void>;
}

/**
 * Binding para valores numéricos (registers, analog)
 * Usado por: AnalogOutput, AnalogInput, Register
 */
export interface NumberBinding {
  name: string;
  type: 'number';
  dataType: 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32';

  read(address: number): Promise<number>;
  write?(address: number, value: number): Promise<void>;
}

/**
 * Binding para dimmers (com fade)
 * Usado por: Dimmer
 */
export interface DimmerBinding {
  name: string;
  type: 'dimmer';

  read(address: number): Promise<number>;
  write(address: number, level: number): Promise<void>;
  fade?(address: number, level: number, fadeTime: number): Promise<void>;
}

/**
 * Binding para contadores
 * Usado por: Counter
 */
export interface CounterBinding {
  name: string;
  type: 'counter';

  read(address: number): Promise<number>;
  reset?(address: number): Promise<void>;
}

/**
 * União de todos os bindings
 */
export type Binding = BooleanBinding | NumberBinding | DimmerBinding | CounterBinding;

/**
 * ===============================================
 * DRIVER DECORATORS
 * ===============================================
 */

export interface BindingMetadata {
  name: string;           // Nome único do binding (ex: "modbus_coil")
  description?: string;   // Descrição
  capabilities: string[]; // ["read", "write"]
}

/**
 * @ExportBooleanBinding
 * Driver exporta binding para valores booleanos
 */
export function ExportBooleanBinding(metadata: BindingMetadata): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__bindings) target.__bindings = [];
    target.__bindings.push({
      type: 'boolean',
      method: propertyKey,
      metadata,
    });
  };
}

/**
 * @ExportNumberBinding
 * Driver exporta binding para valores numéricos
 */
export function ExportNumberBinding(
  metadata: BindingMetadata & { dataType: 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32' }
): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__bindings) target.__bindings = [];
    target.__bindings.push({
      type: 'number',
      method: propertyKey,
      metadata,
    });
  };
}

/**
 * @ExportDimmerBinding
 * Driver exporta binding para dimmers
 */
export function ExportDimmerBinding(metadata: BindingMetadata): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__bindings) target.__bindings = [];
    target.__bindings.push({
      type: 'dimmer',
      method: propertyKey,
      metadata,
    });
  };
}

/**
 * @ExportCounterBinding
 * Driver exporta binding para contadores
 */
export function ExportCounterBinding(metadata: BindingMetadata): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__bindings) target.__bindings = [];
    target.__bindings.push({
      type: 'counter',
      method: propertyKey,
      metadata,
    });
  };
}

/**
 * ===============================================
 * ENDPOINT DECORATORS
 * ===============================================
 */

export interface EndpointMetadata {
  name: string;
  type: 'DigitalOutput' | 'DigitalInput' | 'AnalogOutput' | 'AnalogInput' | 'Dimmer' | 'Counter' | 'Register';
  description?: string;
}

/**
 * @Endpoint
 * Define um endpoint
 */
export function Endpoint(metadata: EndpointMetadata): ClassDecorator {
  return (target: any) => {
    target.__endpoint_metadata = metadata;
  };
}

/**
 * @RequireBinding
 * Endpoint requer um binding compatível
 */
export function RequireBinding(config: {
  compatible: string[];  // Lista de bindings compatíveis (ex: ["modbus_coil", "mqtt_relay"])
}): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__required_bindings) target.__required_bindings = [];
    target.__required_bindings.push({
      property: propertyKey,
      compatible: config.compatible,
    });
  };
}

/**
 * @Config
 * Define propriedade de configuração do endpoint
 */
export function Config(metadata: {
  name: string;
  description?: string;
  type: 'number' | 'string' | 'boolean';
  default?: any;
  required?: boolean;
}): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__config_properties) target.__config_properties = [];
    target.__config_properties.push({
      property: propertyKey,
      metadata,
    });
  };
}

/**
 * ===============================================
 * DRIVER BASE
 * ===============================================
 */

export function Driver(metadata: {
  name: string;
  version: string;
  description?: string;
  protocol?: string;
}): ClassDecorator {
  return (target: any) => {
    target.__driver_metadata = metadata;
  };
}

export function OnInit(): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    target.__onInit = propertyKey;
  };
}

export function OnClose(): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    target.__onClose = propertyKey;
  };
}

export function Poll(config: { interval: number }): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__polls) target.__polls = [];
    target.__polls.push({
      method: propertyKey,
      interval: config.interval,
    });
  };
}