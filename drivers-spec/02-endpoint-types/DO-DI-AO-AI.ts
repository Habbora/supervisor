/**
 * Endpoint Types
 *
 * Define os tipos de endpoints que um driver pode exportar
 * Nomenclatura: DO, DI, AO, AI, Dimmer, Counter, Register
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
export type DigitalOutput = {
  id: string | number;
  address: number;

  // Comandos
  setOn(): Promise<void>;
  setOff(): Promise<void>;
  toggle(): Promise<void>;
  read(): Promise<boolean>;

  // Estado
  state: {
    value: boolean;
    lastChanged?: Date;
  };
}

/**
 * DigitalInput (DI)
 * Entrada digital ON/OFF
 * Uso: botões, sensores de presença, chaves fim-de-curso, contactos
 */
export type DigitalInput = {
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
export type AnalogOutput = {
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
export type AnalogInput = {
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
 * ===============================================
 * SPECIAL ENDPOINTS
 * ===============================================
 */

/**
 * Dimmer
 * Controle de intensidade 0-100%
 * Uso: luzes dimerizáveis, velocidade de motores
 */
export type Dimmer = {
  id: string | number;
  address: number;

  // Comandos
  setOn(): Promise<void>;
  setOff(): Promise<void>;
  setLevel(level: number): Promise<void>;  // 0-100
  fadeToLevel(level: number, fadeTime: number): Promise<void>;

  // Estado
  state: {
    on: boolean;
    level: number;  // 0-100
  };
}

/**
 * Counter
 * Contador de pulsos
 * Uso: medidores de água, energia, encoder
 */
export type Counter = {
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
export type Register = {
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
 * RESUMO DOS TIPOS
 * ===============================================
 */

export type EndpointType = DigitalOutput | DigitalInput | AnalogOutput | AnalogInput | Dimmer | Counter | Register;

// Aliases para facilitar uso
export type DO = DigitalOutput;
export type DI = DigitalInput;
export type AO = AnalogOutput;
export type AI = AnalogInput;

export const ENDPOINT_TYPES = {
  DIGITAL_OUTPUT: 'DigitalOutput',
  DIGITAL_INPUT: 'DigitalInput',
  ANALOG_OUTPUT: 'AnalogOutput',
  ANALOG_INPUT: 'AnalogInput',
  DIMMER: 'Dimmer',
  COUNTER: 'Counter',
  REGISTER: 'Register'
} as const;

// Aliases abreviados
export const ENDPOINT_TYPES_SHORT = {
  DO: 'DigitalOutput',
  DI: 'DigitalInput',
  AO: 'AnalogOutput',
  AI: 'AnalogInput',
} as const;
