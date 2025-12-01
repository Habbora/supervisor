/**
 * Service Types
 *
 * Define os contratos que cada tipo de serviço deve implementar
 */

/**
 * SwitchService - Controle de saída digital (ON/OFF)
 *
 * Usado para: relés, luzes, bombas, válvulas, etc.
 */
export interface SwitchService {
  /**
   * Liga o switch
   */
  setOn(address: number): Promise<void>;

  /**
   * Desliga o switch
   */
  setOff(address: number): Promise<void>;

  /**
   * Estado atual
   */
  state: {
    on: boolean;
  };
}

/**
 * InputService - Leitura de entrada digital
 *
 * Usado para: sensores, botões, chaves fim-de-curso, etc.
 */
export interface InputService {
  /**
   * Lê o valor da entrada
   */
  read(address: number): Promise<boolean>;

  /**
   * Estado atual
   */
  state: {
    value: boolean;
  };
}

/**
 * Decorators disponíveis
 */

/**
 * @Driver - Define metadados do driver
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

/**
 * @UseNetwork - Declara que o driver usa comunicação de rede
 */
export function UseNetwork(config: {
  type: 'tcp' | 'udp';
  defaultPort?: number;
}): ClassDecorator {
  return (target: any) => {
    target.__network_config = config;
  };
}

/**
 * @SwitchService - Exporta serviço de switch
 */
export function SwitchService(config: {
  id: string; // Template: "switch_{{address}}"
  count: number; // Quantidade de switches
  addressStart: number; // Endereço inicial
}): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__exports) target.__exports = [];
    target.__exports.push({
      type: 'switch',
      method: propertyKey,
      config,
    });
  };
}

/**
 * @InputService - Exporta serviço de input
 */
export function InputService(config: {
  id: string; // Template: "input_{{address}}"
  count: number; // Quantidade de inputs
  addressStart: number; // Endereço inicial
}): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__exports) target.__exports = [];
    target.__exports.push({
      type: 'input',
      method: propertyKey,
      config,
    });
  };
}

/**
 * Lifecycle Hooks
 */

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

export function OnConnect(): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    target.__onConnect = propertyKey;
  };
}

export function OnDisconnect(): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    target.__onDisconnect = propertyKey;
  };
}

export function OnError(): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    target.__onError = propertyKey;
  };
}

/**
 * @Poll - Executa método periodicamente
 */
export function Poll(config: { interval: number }): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!target.__polls) target.__polls = [];
    target.__polls.push({
      method: propertyKey,
      interval: config.interval,
    });
  };
}
