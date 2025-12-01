/**
 * Endpoint Types
 *
 * Define os tipos de endpoints que um driver pode exportar
 * Cada endpoint representa um ponto físico de I/O do dispositivo
 */

/**
 * ===============================================
 * DIGITAL ENDPOINTS
 * ===============================================
 */

/**
 * DigitalOutput (DO)
 * Saída digital ON/OFF
 * Uso: relés, switches, válvulas solenoides, contactores
 */
export interface DigitalOutput {
  id: string | number;
  address: number;

  // Comandos
  setOn(): Promise<void>;
  setOff(): Promise<void>;
  toggle(): Promise<void>;
  read(): Promise<boolean>;

  // Estado
  state: {
    value: boolean;  // true = ON, false = OFF
    lastChanged?: Date;
  };
}

/**
 * DigitalInput (DI)
 * Entrada digital ON/OFF
 * Uso: botões, sensores de presença, chaves fim-de-curso, contactos
 */
export interface DigitalInput {
  id: string | number;
  address: number;

  // Comandos
  read(): Promise<boolean>;

  // Estado
  state: {
    value: boolean;  // true = HIGH, false = LOW
    lastChanged?: Date;
  };
}

/**
 * ===============================================
 * ANALOG ENDPOINTS
 * ===============================================
 */

/**
 * AnalogOutput (AO)
 * Saída analógica com range
 * Uso: 0-10V, 4-20mA, controle de velocidade, posicionamento
 */
export interface AnalogOutput {
  id: string | number;
  address: number;

  // Configuração de range
  config: {
    min: number;      // Valor mínimo (ex: 0, 4mA)
    max: number;      // Valor máximo (ex: 10V, 20mA)
    unit?: string;    // Unidade (V, mA, %, etc)
  };

  // Comandos
  setValue(value: number): Promise<void>;
  setPercent(percent: number): Promise<void>;  // 0-100%
  read(): Promise<number>;

  // Estado
  state: {
    value: number;
    percent: number;  // Valor em porcentagem
    lastChanged?: Date;
  };
}

/**
 * AnalogInput (AI)
 * Entrada analógica com range
 * Uso: sensores de temperatura, pressão, umidade, nível
 */
export interface AnalogInput {
  id: string | number;
  address: number;

  // Configuração de range
  config: {
    min: number;         // Valor mínimo do sensor
    max: number;         // Valor máximo do sensor
    unit?: string;       // Unidade (°C, bar, %, etc)
    decimals?: number;   // Casas decimais
  };

  // Comandos
  read(): Promise<number>;

  // Estado
  state: {
    value: number;
    rawValue?: number;   // Valor bruto (sem conversão)
    lastRead?: Date;
  };
}

/**
 * Counter
 * Contador de pulsos
 * Uso: medidores de água, energia, encoder
 */
export interface Counter {
  id: string | number;
  address: number;

  // Configuração
  config: {
    multiplier?: number;  // Multiplicador (ex: pulsos -> litros)
    unit?: string;        // Unidade (L, kWh, pulsos)
  };

  // Comandos
  read(): Promise<number>;
  reset(): Promise<void>;

  // Estado
  state: {
    count: number;
    converted?: number;  // Valor convertido com multiplier
    lastReset?: Date;
  };
}

/**
 * Register
 * Registrador genérico (Modbus Holding Register)
 * Uso: qualquer valor numérico, configurações
 */
export interface Register {
  id: string | number;
  address: number;

  // Configuração
  config: {
    type: 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32';
    readOnly?: boolean;
  };

  // Comandos
  read(): Promise<number>;
  write(value: number): Promise<void>;

  // Estado
  state: {
    value: number;
    lastUpdated?: Date;
  };
}

/**
 * ===============================================
 * DECORATORS PARA EXPORTAR ENDPOINTS
 * ===============================================
 */

export interface EndpointConfig {
  id: string;           // Template: "relay_{{address}}"
  count: number;        // Quantidade
  addressStart: number; // Endereço inicial
}

/**
 * @ExportDigitalOutput
 * Exporta saídas digitais (relés, switches)
 */
export function ExportDigitalOutput(config: EndpointConfig): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__exports) target.__exports = [];
    target.__exports.push({
      type: 'DigitalOutput',
      method: propertyKey,
      config,
    });
  };
}

/**
 * @ExportDigitalInput
 * Exporta entradas digitais (sensores, botões)
 */
export function ExportDigitalInput(config: EndpointConfig): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__exports) target.__exports = [];
    target.__exports.push({
      type: 'DigitalInput',
      method: propertyKey,
      config,
    });
  };
}

/**
 * @ExportAnalogOutput
 * Exporta saídas analógicas (0-10V, 4-20mA)
 */
export function ExportAnalogOutput(
  config: EndpointConfig & { min: number; max: number; unit?: string }
): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__exports) target.__exports = [];
    target.__exports.push({
      type: 'AnalogOutput',
      method: propertyKey,
      config,
    });
  };
}

/**
 * @ExportAnalogInput
 * Exporta entradas analógicas (sensores)
 */
export function ExportAnalogInput(
  config: EndpointConfig & { min: number; max: number; unit?: string; decimals?: number }
): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__exports) target.__exports = [];
    target.__exports.push({
      type: 'AnalogInput',
      method: propertyKey,
      config,
    });
  };
}

/**
 * @ExportDimmer
 * Exporta dimmers (luzes dimerizáveis)
 */
export function ExportDimmer(config: EndpointConfig): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__exports) target.__exports = [];
    target.__exports.push({
      type: 'Dimmer',
      method: propertyKey,
      config,
    });
  };
}

/**
 * @ExportCounter
 * Exporta contadores (medidores)
 */
export function ExportCounter(
  config: EndpointConfig & { multiplier?: number; unit?: string }
): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__exports) target.__exports = [];
    target.__exports.push({
      type: 'Counter',
      method: propertyKey,
      config,
    });
  };
}

/**
 * @ExportRegister
 * Exporta registradores genéricos
 */
export function ExportRegister(
  config: EndpointConfig & { type: 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32'; readOnly?: boolean }
): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__exports) target.__exports = [];
    target.__exports.push({
      type: 'Register',
      method: propertyKey,
      config,
    });
  };
}

/**
 * ===============================================
 * DRIVER BASE DECORATORS
 * ===============================================
 */

export function Driver(metadata: {
  name: string;
  version: string;
  description?: string;
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

export function Command(metadata: {
  name: string;
  description?: string;
  params?: Record<string, any>;
}): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__commands) target.__commands = [];
    target.__commands.push({
      name: metadata.name,
      method: propertyKey,
      description: metadata.description,
      params: metadata.params,
    });
  };
}