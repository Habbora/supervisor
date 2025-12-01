/**
 * Exemplo: Endpoint DigitalOutput
 *
 * Endpoint genérico que pode se conectar a qualquer binding compatível
 * Ex: modbus_coil, mqtt_relay, http_switch
 */

import {
  Endpoint,
  RequireBinding,
  Config,
  BooleanBinding,
} from './binding-architecture';

import { DigitalOutput } from './endpoint-types';

@Endpoint({
  name: 'Digital Output Generic',
  type: 'DigitalOutput',
  description: 'Saída digital genérica (ON/OFF)',
})
export class DigitalOutputEndpoint implements DigitalOutput {
  id!: string | number;
  address!: number;

  /**
   * Requer binding compatível
   * Pode ser: modbus_coil, mqtt_relay, http_switch, etc
   */
  @RequireBinding({
    compatible: ['modbus_coil', 'mqtt_relay', 'http_switch', 'opcua_boolean'],
  })
  private binding!: BooleanBinding;

  /**
   * Configurações do endpoint
   */
  @Config({
    name: 'Address',
    description: 'Endereço do ponto de I/O no protocolo',
    type: 'number',
    required: true,
  })
  private _address!: number;

  @Config({
    name: 'Invert Logic',
    description: 'Inverter lógica (true = normalmente fechado)',
    type: 'boolean',
    default: false,
  })
  private invertLogic = false;

  @Config({
    name: 'Name',
    description: 'Nome descritivo do endpoint',
    type: 'string',
    default: 'Digital Output',
  })
  private name!: string;

  // Estado interno
  state = {
    value: false,
    lastChanged: undefined as Date | undefined,
  };

  /**
   * ===============================================
   * COMANDOS
   * ===============================================
   */

  async setOn(): Promise<void> {
    system.log.info(`[${this.name}] Setting ON`);

    const value = this.invertLogic ? false : true;
    await this.binding.write(this._address, value);

    this.state.value = true;
    this.state.lastChanged = new Date();

    // Emite evento
    system.events.emit(`endpoint:${this.id}:changed`, {
      value: true,
      timestamp: this.state.lastChanged,
    });
  }

  async setOff(): Promise<void> {
    system.log.info(`[${this.name}] Setting OFF`);

    const value = this.invertLogic ? true : false;
    await this.binding.write(this._address, value);

    this.state.value = false;
    this.state.lastChanged = new Date();

    // Emite evento
    system.events.emit(`endpoint:${this.id}:changed`, {
      value: false,
      timestamp: this.state.lastChanged,
    });
  }

  async toggle(): Promise<void> {
    if (this.state.value) {
      await this.setOff();
    } else {
      await this.setOn();
    }
  }

  async read(): Promise<boolean> {
    system.log.debug(`[${this.name}] Reading state`);

    let value = await this.binding.read(this._address);

    // Aplica inversão de lógica
    if (this.invertLogic) {
      value = !value;
    }

    this.state.value = value;
    this.state.lastChanged = new Date();

    return value;
  }

  /**
   * ===============================================
   * MÉTODOS AUXILIARES
   * ===============================================
   */

  /**
   * Pulso (liga por X ms e depois desliga)
   */
  async pulse(duration = 250): Promise<void> {
    system.log.info(`[${this.name}] Pulse ${duration}ms`);

    await this.setOn();
    await system.time.setTimeout(async () => {
      await this.setOff();
    }, duration);
  }

  /**
   * Piscar (blink)
   */
  async blink(times = 3, interval = 500): Promise<void> {
    system.log.info(`[${this.name}] Blinking ${times} times`);

    for (let i = 0; i < times; i++) {
      await this.setOn();
      await system.time.setTimeout(() => {}, interval);
      await this.setOff();
      await system.time.setTimeout(() => {}, interval);
    }
  }
}

export default DigitalOutputEndpoint;