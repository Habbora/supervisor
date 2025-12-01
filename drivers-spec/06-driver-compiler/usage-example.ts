/**
 * Exemplo de Uso Completo
 * Compilação e Execução de Driver
 */

import { driverCompiler } from './driver-compiler';
import { driverRuntime } from './driver-runtime';
import { readFileSync } from 'fs';

/**
 * ===============================================
 * EXEMPLO 1: Compilar driver de arquivo
 * ===============================================
 */

async function compileDriverFromFile() {
  console.log('\n=== COMPILANDO DRIVER ===\n');

  // 1. Ler código fonte TypeScript
  const sourceCode = `
    import { Driver, OnInit, OnClose, Poll } from '@system/decorators';

    @Driver({
      name: 'Modbus TCP Client',
      version: '1.0.0',
      description: 'Cliente Modbus TCP/IP',
      protocol: 'modbus-tcp',
      author: 'Alisson',
    })
    export class ModbusTCPDriver {
      private socket: any;
      private bindingMaster: any;
      private connected = false;

      @OnInit()
      async initialize() {
        system.log.info('[Modbus] Initializing...');

        // Conecta via TCP
        this.socket = system.tcp.createSocket();
        await this.socket.connect(config.host, config.port || 502);
        this.connected = true;

        // Cria binding master
        this.bindingMaster = system.createBindingMaster('modbus', {
          id: config.bindingId || 'modbus_0',
          unitId: config.unitId || 1,
        });

        // Setup handlers
        this.setupBindingListeners();

        system.log.info(\`[Modbus] Binding master '\${this.bindingMaster.id}' ready\`);
      }

      @OnClose()
      async cleanup() {
        system.log.info('[Modbus] Closing...');
        if (this.bindingMaster) await this.bindingMaster.close();
        if (this.socket) await this.socket.close();
      }

      @Poll({ interval: 5000 })
      async healthCheck() {
        if (!this.connected) {
          system.log.warn('[Modbus] Reconnecting...');
          try {
            await this.initialize();
          } catch (error) {
            system.log.error('[Modbus] Reconnect failed:', error);
          }
        }
      }

      private setupBindingListeners() {
        this.bindingMaster.on('write:coil', async (data: any) => {
          const { address, value } = data;
          system.log.debug(\`[Modbus] Write coil \${address} = \${value}\`);
          await this.modbusWriteCoil(address, value);
        });

        this.bindingMaster.on('read:coil', async (data: any) => {
          const { address } = data;
          const value = await this.modbusReadCoil(address);
          return value;
        });
      }

      private async modbusWriteCoil(address: number, value: boolean) {
        // FC05 - Write Single Coil
        const packet = this.buildModbusPacket(0x05, address, value ? 0xFF00 : 0x0000);
        await this.socket.send(packet);
        await this.socket.receive();
      }

      private async modbusReadCoil(address: number): Promise<boolean> {
        // FC01 - Read Coils
        const packet = this.buildModbusPacket(0x01, address, 1);
        await this.socket.send(packet);
        const response = await this.socket.receive();
        return (response[9] & 0x01) === 0x01;
      }

      private buildModbusPacket(fc: number, address: number, value: number): Buffer {
        const unitId = config.unitId || 0x01;
        return Buffer.from([
          0x00, 0x00,           // Transaction ID
          0x00, 0x00,           // Protocol ID
          0x00, 0x06,           // Length
          unitId,               // Unit ID
          fc,                   // Function Code
          address >> 8,         // Address Hi
          address & 0xFF,       // Address Lo
          value >> 8,           // Value Hi
          value & 0xFF,         // Value Lo
        ]);
      }
    }

    export default ModbusTCPDriver;
  `;

  // 2. Compilar
  const result = await driverCompiler.compile(sourceCode);

  if (!result.success) {
    console.error('❌ Compilation failed:');
    result.errors?.forEach(err => {
      console.error(`  - [${err.type}] ${err.message}`);
    });
    return null;
  }

  console.log('✅ Compilation successful!');
  console.log('\nMetadata:');
  console.log(JSON.stringify(result.metadata, null, 2));
  console.log('\nCode size:', result.code!.length, 'bytes');
  console.log('Hash:', result.hash);

  if (result.warnings && result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(w => console.log(`  - ${w}`));
  }

  return result;
}

/**
 * ===============================================
 * EXEMPLO 2: Salvar no banco e executar
 * ===============================================
 */

async function saveAndExecuteDriver() {
  console.log('\n=== SALVANDO E EXECUTANDO DRIVER ===\n');

  // 1. Compilar
  const compiled = await compileDriverFromFile();
  if (!compiled) return;

  // 2. Simular salvamento no banco
  const driverRecord = {
    id: crypto.randomUUID(),
    name: compiled.metadata!.name,
    version: compiled.metadata!.version,
    code: compiled.code!,
    metadata: compiled.metadata!,
    hash: compiled.hash!,
    created_at: new Date(),
  };

  console.log('\n💾 Saved to database:');
  console.log(`  ID: ${driverRecord.id}`);
  console.log(`  Name: ${driverRecord.name}`);
  console.log(`  Version: ${driverRecord.version}`);

  // 3. Carregar e executar
  const config = {
    host: '192.168.1.100',
    port: 502,
    bindingId: 'modbus_factory',
    unitId: 1,
  };

  console.log('\n🚀 Loading driver...');

  const instance = await driverRuntime.loadDriver(
    driverRecord.id,
    driverRecord.code,
    config,
    driverRecord.metadata
  );

  console.log('\n✅ Driver loaded:');
  console.log(`  Instance ID: ${instance.id}`);
  console.log(`  Status: ${instance.status}`);
  console.log(`  Binding Master ID: ${instance.bindingMasterId}`);

  return instance;
}

/**
 * ===============================================
 * EXEMPLO 3: Validar código com erros
 * ===============================================
 */

async function testValidationErrors() {
  console.log('\n=== TESTANDO VALIDAÇÃO DE ERROS ===\n');

  // Código com APIs proibidas
  const badCode = `
    import { Driver, OnInit } from '@system/decorators';
    import fs from 'fs';  // ❌ Proibido!

    @Driver({
      name: 'Bad Driver',
      version: '1.0.0',
    })
    export class BadDriver {
      @OnInit()
      async initialize() {
        eval('console.log("hack")');  // ❌ Proibido!

        const files = fs.readdirSync('/');  // ❌ Proibido!

        process.exit(0);  // ❌ Proibido!
      }
    }

    export default BadDriver;
  `;

  const result = await driverCompiler.compile(badCode);

  if (!result.success) {
    console.log('✅ Validation correctly detected errors:');
    result.errors?.forEach(err => {
      console.log(`  - [${err.type}] ${err.message}`);
    });
  } else {
    console.log('❌ Validation failed to detect errors!');
  }
}

/**
 * ===============================================
 * EXEMPLO 4: Gerenciar múltiplas instâncias
 * ===============================================
 */

async function manageMultipleInstances() {
  console.log('\n=== GERENCIANDO MÚLTIPLAS INSTÂNCIAS ===\n');

  // Compilar driver
  const compiled = await compileDriverFromFile();
  if (!compiled) return;

  // Criar 3 instâncias do mesmo driver com configs diferentes
  const configs = [
    { host: '192.168.1.100', port: 502, bindingId: 'modbus_clp1', unitId: 1 },
    { host: '192.168.1.200', port: 502, bindingId: 'modbus_clp2', unitId: 1 },
    { host: '192.168.1.150', port: 502, bindingId: 'modbus_backup', unitId: 1 },
  ];

  const instances = [];

  for (const config of configs) {
    const instance = await driverRuntime.loadDriver(
      `driver-${config.bindingId}`,
      compiled.code!,
      config,
      compiled.metadata!
    );

    instances.push(instance);
    console.log(`✅ Instance ${instance.id} loaded (${config.bindingId})`);
  }

  // Ver estatísticas
  console.log('\n📊 Runtime Stats:');
  const stats = driverRuntime.getStats();
  console.log(JSON.stringify(stats, null, 2));

  // Parar uma instância
  console.log('\n⏸️  Stopping instance 0...');
  await driverRuntime.unloadDriver(instances[0].id);

  console.log('\n📊 Updated Stats:');
  console.log(JSON.stringify(driverRuntime.getStats(), null, 2));
}

/**
 * ===============================================
 * EXEMPLO 5: API REST simulation
 * ===============================================
 */

// Simulação de endpoints REST
const apiExamples = {
  /**
   * POST /api/drivers/upload
   */
  async uploadDriver(sourceCode: string) {
    const result = await driverCompiler.compile(sourceCode);

    if (!result.success) {
      return {
        status: 400,
        body: {
          success: false,
          errors: result.errors,
        },
      };
    }

    // Salvar no banco (simulado)
    const driverId = crypto.randomUUID();
    const driver = {
      id: driverId,
      name: result.metadata!.name,
      version: result.metadata!.version,
      code: result.code!,
      metadata: result.metadata!,
      hash: result.hash!,
    };

    return {
      status: 200,
      body: {
        success: true,
        driver: {
          id: driver.id,
          name: driver.name,
          version: driver.version,
          hash: driver.hash,
        },
      },
    };
  },

  /**
   * POST /api/drivers/:id/instantiate
   */
  async instantiateDriver(driverId: string, config: any) {
    // Buscar driver do banco (simulado)
    const driver = {
      id: driverId,
      code: '/* compiled code */',
      metadata: {},
    };

    const instance = await driverRuntime.loadDriver(
      driver.id,
      driver.code,
      config,
      driver.metadata
    );

    return {
      status: 200,
      body: {
        success: true,
        instance: {
          id: instance.id,
          status: instance.status,
          bindingMasterId: instance.bindingMasterId,
        },
      },
    };
  },

  /**
   * GET /api/drivers/instances
   */
  async listInstances() {
    const stats = driverRuntime.getStats();

    return {
      status: 200,
      body: {
        totalInstances: stats.totalInstances,
        running: stats.running,
        error: stats.error,
        instances: stats.instances,
      },
    };
  },

  /**
   * DELETE /api/drivers/instances/:id
   */
  async stopInstance(instanceId: string) {
    await driverRuntime.unloadDriver(instanceId);

    return {
      status: 200,
      body: {
        success: true,
        message: `Instance ${instanceId} stopped`,
      },
    };
  },
};

/**
 * ===============================================
 * EXECUÇÃO DOS EXEMPLOS
 * ===============================================
 */

async function runExamples() {
  try {
    // 1. Compilar driver
    await compileDriverFromFile();

    // 2. Testar validação de erros
    await testValidationErrors();

    // 3. Salvar e executar
    // await saveAndExecuteDriver();

    // 4. Múltiplas instâncias
    // await manageMultipleInstances();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Executar exemplos
// runExamples();

export { apiExamples, runExamples };
