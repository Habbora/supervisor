# Driver Compiler - Sistema de Criação e Validação de Drivers

## Problema

Preciso de um sistema que permita:

1. **Desenvolver drivers em TypeScript** com decorators e type safety
2. **Compilar e validar** o código antes de salvar no banco
3. **Injetar dependências** (system, config) no runtime
4. **Executar em sandbox isolado** sem acesso ao sistema host
5. **Armazenar no banco** como código compilado e minificado

## Arquitetura do Compilador

```
┌────────────────────────────────────────────────────────┐
│  1. DESENVOLVIMENTO                                    │
│                                                        │
│  Driver escrito em TypeScript:                         │
│  ┌──────────────────────────────────────────────┐     │
│  │ @Driver({ name: 'Modbus TCP' })              │     │
│  │ export class ModbusTCPDriver {               │     │
│  │   @OnInit()                                  │     │
│  │   async initialize() {                       │     │
│  │     const master = system.createBinding...   │     │
│  │   }                                          │     │
│  │ }                                            │     │
│  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────┐
│  2. COMPILAÇÃO E VALIDAÇÃO                             │
│                                                        │
│  Bun Compiler:                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │ 1. Parse TypeScript                          │     │
│  │ 2. Validar tipos                             │     │
│  │ 3. Extrair metadados dos decorators          │     │
│  │ 4. Verificar dependências permitidas         │     │
│  │ 5. Compilar para JavaScript                  │     │
│  │ 6. Minificar código                          │     │
│  │ 7. Gerar hash de validação                   │     │
│  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────┐
│  3. ARMAZENAMENTO                                      │
│                                                        │
│  Database (PostgreSQL):                                │
│  ┌──────────────────────────────────────────────┐     │
│  │ drivers {                                    │     │
│  │   id: uuid                                   │     │
│  │   name: "Modbus TCP Client"                  │     │
│  │   version: "1.0.0"                           │     │
│  │   code: "compiledCode"  // JS minificado     │     │
│  │   metadata: { ... }     // Extraído          │     │
│  │   hash: "sha256..."                          │     │
│  │   created_at: timestamp                      │     │
│  │ }                                            │     │
│  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────┐
│  4. RUNTIME EXECUTION                                  │
│                                                        │
│  Sandbox Isolado:                                      │
│  ┌──────────────────────────────────────────────┐     │
│  │ const driver = loadDriver(driverId);         │     │
│  │                                              │     │
│  │ // Injeta dependências                       │     │
│  │ const context = {                            │     │
│  │   system: systemAPI,                         │     │
│  │   config: driverConfig                       │     │
│  │ };                                           │     │
│  │                                              │     │
│  │ // Executa em sandbox                        │     │
│  │ const instance = executeInSandbox(           │     │
│  │   driver.code,                               │     │
│  │   context                                    │     │
│  │ );                                           │     │
│  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
```

## Fluxo Completo

### 1. Desenvolvimento do Driver

```typescript
// modbus_tcp_driver.ts
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
      await this.initialize();
    }
  }

  private setupBindingListeners() {
    this.bindingMaster.on('write:coil', async (data: any) => {
      await this.modbusWriteCoil(data.address, data.value);
    });

    this.bindingMaster.on('read:coil', async (data: any) => {
      return await this.modbusReadCoil(data.address);
    });
  }

  private async modbusWriteCoil(address: number, value: boolean) {
    // Implementação Modbus FC05
    const packet = this.buildModbusPacket(0x05, address, value);
    await this.socket.send(packet);
  }

  private async modbusReadCoil(address: number): Promise<boolean> {
    // Implementação Modbus FC01
    const packet = this.buildModbusPacket(0x01, address);
    await this.socket.send(packet);
    const response = await this.socket.receive();
    return (response[9] & 0x01) === 0x01;
  }

  private buildModbusPacket(fc: number, address: number, value?: any): Buffer {
    // Lógica de construção do pacote Modbus
    return Buffer.from([...]);
  }
}

export default ModbusTCPDriver;
```

### 2. Validação e Compilação

```typescript
// compiler/driver-compiler.ts

import { parse } from '@typescript-eslint/parser';
import * as Bun from 'bun';

interface CompilationResult {
  success: boolean;
  code?: string;           // Código JS compilado e minificado
  metadata?: DriverMetadata;
  errors?: string[];
  hash?: string;
}

interface DriverMetadata {
  name: string;
  version: string;
  description?: string;
  protocol?: string;
  author?: string;
  dependencies: string[];  // system APIs usadas
  lifecycle: {
    onInit?: boolean;
    onClose?: boolean;
    polls?: { interval: number }[];
  };
  exports: {
    bindings: string[];    // IDs dos bindings exportados
    events: string[];      // Eventos emitidos
  };
}

export class DriverCompiler {
  /**
   * Compila driver TypeScript para JavaScript
   */
  async compile(sourceCode: string): Promise<CompilationResult> {
    try {
      // 1. Parse TypeScript
      const ast = this.parseTypeScript(sourceCode);

      // 2. Validar código
      const validation = this.validate(ast);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      // 3. Extrair metadados
      const metadata = this.extractMetadata(ast);

      // 4. Compilar com Bun
      const compiled = await this.bunCompile(sourceCode);

      // 5. Minificar
      const minified = await this.minify(compiled);

      // 6. Gerar hash de validação
      const hash = this.generateHash(minified);

      return {
        success: true,
        code: minified,
        metadata,
        hash,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
      };
    }
  }

  /**
   * Parse TypeScript AST
   */
  private parseTypeScript(code: string) {
    return parse(code, {
      sourceType: 'module',
      ecmaVersion: 2022,
      loc: true,
      range: true,
    });
  }

  /**
   * Valida código do driver
   */
  private validate(ast: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Verificar que tem decorator @Driver
    const hasDriverDecorator = this.hasDecorator(ast, 'Driver');
    if (!hasDriverDecorator) {
      errors.push('Driver must have @Driver decorator');
    }

    // 2. Verificar export default
    const hasDefaultExport = this.hasDefaultExport(ast);
    if (!hasDefaultExport) {
      errors.push('Driver must have default export');
    }

    // 3. Verificar dependências permitidas
    const dependencies = this.extractDependencies(ast);
    const invalidDeps = dependencies.filter(dep => !this.isAllowedDependency(dep));
    if (invalidDeps.length > 0) {
      errors.push(`Invalid dependencies: ${invalidDeps.join(', ')}`);
    }

    // 4. Verificar uso de APIs não permitidas
    const forbiddenAPIs = this.checkForbiddenAPIs(ast);
    if (forbiddenAPIs.length > 0) {
      errors.push(`Forbidden APIs used: ${forbiddenAPIs.join(', ')}`);
    }

    // 5. Verificar type safety (TypeScript)
    const typeErrors = this.checkTypeErrors(ast);
    if (typeErrors.length > 0) {
      errors.push(...typeErrors);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Verifica se dependência é permitida
   */
  private isAllowedDependency(dep: string): boolean {
    const allowed = [
      '@system/decorators',  // Decorators oficiais
      'buffer',              // Buffer nativo
      // Não pode importar:
      // - fs, child_process, net (exceto via system API)
      // - Módulos externos não auditados
    ];

    return allowed.includes(dep);
  }

  /**
   * Verifica uso de APIs proibidas
   */
  private checkForbiddenAPIs(ast: any): string[] {
    const forbidden = [
      'eval',
      'Function',
      'require',
      'process.exit',
      'process.kill',
      '__dirname',
      '__filename',
      'import.meta.url',
    ];

    const found: string[] = [];

    // Percorre AST procurando uso dessas APIs
    // ... implementação

    return found;
  }

  /**
   * Extrai metadados dos decorators
   */
  private extractMetadata(ast: any): DriverMetadata {
    const metadata: DriverMetadata = {
      name: '',
      version: '',
      dependencies: [],
      lifecycle: {},
      exports: {
        bindings: [],
        events: [],
      },
    };

    // 1. Extrair @Driver metadata
    const driverDecorator = this.findDecorator(ast, 'Driver');
    if (driverDecorator) {
      metadata.name = driverDecorator.args.name;
      metadata.version = driverDecorator.args.version;
      metadata.description = driverDecorator.args.description;
      metadata.protocol = driverDecorator.args.protocol;
      metadata.author = driverDecorator.args.author;
    }

    // 2. Extrair lifecycle hooks
    metadata.lifecycle.onInit = this.hasDecorator(ast, 'OnInit');
    metadata.lifecycle.onClose = this.hasDecorator(ast, 'OnClose');

    const polls = this.findDecorators(ast, 'Poll');
    metadata.lifecycle.polls = polls.map(p => ({ interval: p.args.interval }));

    // 3. Extrair system APIs usadas
    metadata.dependencies = this.extractSystemAPIs(ast);

    // 4. Extrair bindings exportados
    metadata.exports.bindings = this.extractBindingIds(ast);

    return metadata;
  }

  /**
   * Extrai IDs de bindings criados
   */
  private extractBindingIds(ast: any): string[] {
    const bindings: string[] = [];

    // Procura por chamadas a system.createBindingMaster
    // e extrai o ID do config
    // ... implementação

    return bindings;
  }

  /**
   * Extrai APIs do system usadas
   */
  private extractSystemAPIs(ast: any): string[] {
    const apis = new Set<string>();

    // Procura por system.xxx
    // Exemplo: system.tcp, system.log, system.createBindingMaster
    // ... implementação

    return Array.from(apis);
  }

  /**
   * Compila TypeScript para JavaScript usando Bun
   */
  private async bunCompile(code: string): Promise<string> {
    const transpiler = new Bun.Transpiler({
      loader: 'ts',
      target: 'bun',
      tsconfig: {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        },
      },
    });

    const result = transpiler.transformSync(code);
    return result;
  }

  /**
   * Minifica código
   */
  private async minify(code: string): Promise<string> {
    const built = await Bun.build({
      entrypoints: ['<stdin>'],
      stdin: {
        contents: code,
        loader: 'js',
      },
      minify: {
        whitespace: true,
        identifiers: true,
        syntax: true,
      },
      target: 'bun',
    });

    const output = await built.outputs[0].text();
    return output;
  }

  /**
   * Gera hash SHA256 do código
   */
  private generateHash(code: string): string {
    const hasher = new Bun.CryptoHasher('sha256');
    hasher.update(code);
    return hasher.digest('hex');
  }

  /**
   * Valida se código compilado é válido
   */
  async validateCompiled(code: string, hash: string): Promise<boolean> {
    const computedHash = this.generateHash(code);
    return computedHash === hash;
  }
}
```

### 3. Upload e Armazenamento

```typescript
// api/routes/drivers.ts

import { DriverCompiler } from '../compiler/driver-compiler';
import { db } from '../database';

/**
 * POST /api/drivers/upload
 * Upload de novo driver
 */
export async function uploadDriver(req: Request) {
  const { sourceCode } = await req.json();

  // 1. Compilar e validar
  const compiler = new DriverCompiler();
  const result = await compiler.compile(sourceCode);

  if (!result.success) {
    return Response.json({
      success: false,
      errors: result.errors,
    }, { status: 400 });
  }

  // 2. Salvar no banco
  const driver = await db.drivers.insert({
    name: result.metadata!.name,
    version: result.metadata!.version,
    description: result.metadata!.description,
    protocol: result.metadata!.protocol,
    code: result.code!,
    metadata: result.metadata!,
    hash: result.hash!,
    created_at: new Date(),
  });

  return Response.json({
    success: true,
    driver: {
      id: driver.id,
      name: driver.name,
      version: driver.version,
    },
  });
}

/**
 * POST /api/drivers/:id/instantiate
 * Cria instância de um driver
 */
export async function instantiateDriver(req: Request) {
  const { driverId } = req.params;
  const { config } = await req.json();

  // 1. Carregar driver do banco
  const driver = await db.drivers.findById(driverId);
  if (!driver) {
    return Response.json({ error: 'Driver not found' }, { status: 404 });
  }

  // 2. Validar hash
  const compiler = new DriverCompiler();
  const isValid = await compiler.validateCompiled(driver.code, driver.hash);
  if (!isValid) {
    return Response.json({ error: 'Driver code tampered' }, { status: 400 });
  }

  // 3. Executar em runtime
  const instance = await runtime.loadDriver(driver.code, config);

  return Response.json({
    success: true,
    instance: {
      id: instance.id,
      bindingMasterId: instance.bindingMasterId,
      status: 'running',
    },
  });
}
```

### 4. Runtime Execution com Sandbox

```typescript
// runtime/driver-runtime.ts

import vm from 'vm';

export class DriverRuntime {
  private instances = new Map<string, any>();

  /**
   * Carrega e executa driver em sandbox isolado
   */
  async loadDriver(code: string, config: any): Promise<any> {
    const instanceId = crypto.randomUUID();

    // 1. Criar context isolado
    const context = this.createSandboxContext(config);

    // 2. Executar código em sandbox
    const script = new vm.Script(code, {
      filename: `driver-${instanceId}.js`,
    });

    const exports = {};
    context.exports = exports;
    context.module = { exports };

    script.runInNewContext(context, {
      timeout: 10000,  // 10s timeout para carregamento
      breakOnSigint: true,
    });

    // 3. Instanciar driver class
    const DriverClass = context.module.exports.default;
    const instance = new DriverClass();

    // 4. Chamar lifecycle hook @OnInit
    if (instance.initialize) {
      await instance.initialize();
    }

    // 5. Registrar instância
    this.instances.set(instanceId, {
      id: instanceId,
      instance,
      config,
      metadata: instance.constructor.metadata,
    });

    return {
      id: instanceId,
      bindingMasterId: instance.bindingMaster?.id,
    };
  }

  /**
   * Cria context sandbox com injeção de dependências
   */
  private createSandboxContext(config: any) {
    const context = {
      // Global config do driver
      config,

      // System API (whitelist de funções permitidas)
      system: this.createSystemAPI(),

      // Globals seguros
      console: {
        log: (...args: any[]) => this.log('info', args),
        error: (...args: any[]) => this.log('error', args),
        warn: (...args: any[]) => this.log('warn', args),
      },
      Buffer,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Promise,
      Date,
      Math,
      JSON,

      // PROIBIDO:
      // - process
      // - require
      // - __dirname, __filename
      // - fs, net, child_process (exceto via system API)
    };

    return context;
  }

  /**
   * Cria System API injetado
   */
  private createSystemAPI() {
    return {
      // Logging
      log: {
        info: (...args: any[]) => this.log('info', args),
        warn: (...args: any[]) => this.log('warn', args),
        error: (...args: any[]) => this.log('error', args),
        debug: (...args: any[]) => this.log('debug', args),
      },

      // TCP Socket (wrapper seguro)
      tcp: {
        createSocket: () => this.createTCPSocket(),
      },

      // Bindings
      createBindingMaster: (type: string, config: any) => {
        return systemBindings.createBindingMaster(type, config);
      },

      createBindingSlave: (config: any) => {
        return systemBindings.createBindingSlave(config);
      },

      // Event Bus
      events: {
        on: (event: string, handler: Function) => eventBus.on(event, handler),
        emit: (event: string, data: any) => eventBus.emit(event, data),
        off: (event: string, handler: Function) => eventBus.off(event, handler),
      },

      // Time utilities
      time: {
        setTimeout: (fn: Function, ms: number) => setTimeout(fn, ms),
        setInterval: (fn: Function, ms: number) => setInterval(fn, ms),
      },
    };
  }

  /**
   * Cria TCP socket seguro (com rate limiting, etc.)
   */
  private createTCPSocket() {
    // Implementação de socket com:
    // - Rate limiting
    // - Whitelist de IPs/portas
    // - Timeout automático
    // - Logging de todas as conexões
    return new SafeTCPSocket();
  }

  /**
   * Logging centralizado
   */
  private log(level: string, args: any[]) {
    console.log(`[Driver] [${level}]`, ...args);
    // Também pode salvar em banco, enviar para monitoring, etc.
  }

  /**
   * Para e remove driver
   */
  async unloadDriver(instanceId: string) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    // Chamar lifecycle hook @OnClose
    if (instance.instance.cleanup) {
      await instance.instance.cleanup();
    }

    this.instances.delete(instanceId);
  }
}
```

## Schema do Banco de Dados

```typescript
// database/schema/drivers.ts

import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const drivers = pgTable('drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  version: text('version').notNull(),
  description: text('description'),
  protocol: text('protocol'),
  author: text('author'),

  // Código compilado e minificado
  code: text('code').notNull(),

  // Metadados extraídos
  metadata: jsonb('metadata').notNull().$type<{
    dependencies: string[];
    lifecycle: {
      onInit?: boolean;
      onClose?: boolean;
      polls?: { interval: number }[];
    };
    exports: {
      bindings: string[];
      events: string[];
    };
  }>(),

  // Hash SHA256 do código (validação de integridade)
  hash: text('hash').notNull(),

  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Instâncias de drivers em execução
export const driver_instances = pgTable('driver_instances', {
  id: uuid('id').primaryKey().defaultRandom(),
  driver_id: uuid('driver_id').notNull().references(() => drivers.id),

  // Configuração específica desta instância
  config: jsonb('config').notNull().$type<{
    host?: string;
    port?: number;
    bindingId?: string;
    unitId?: number;
    [key: string]: any;
  }>(),

  // ID do binding master criado
  binding_master_id: text('binding_master_id'),

  // Status
  status: text('status').notNull().default('stopped'), // running, stopped, error

  created_at: timestamp('created_at').notNull().defaultNow(),
  started_at: timestamp('started_at'),
  stopped_at: timestamp('stopped_at'),
});
```

## Exemplo de Upload via API

```bash
# 1. Upload do driver
curl -X POST http://localhost:3000/api/drivers/upload \
  -H "Content-Type: application/json" \
  -d '{
    "sourceCode": "... código TypeScript completo ..."
  }'

# Response:
{
  "success": true,
  "driver": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Modbus TCP Client",
    "version": "1.0.0"
  }
}

# 2. Instanciar driver
curl -X POST http://localhost:3000/api/drivers/550e8400-e29b-41d4-a716-446655440000/instantiate \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "host": "192.168.1.100",
      "port": 502,
      "bindingId": "modbus_factory",
      "unitId": 1
    }
  }'

# Response:
{
  "success": true,
  "instance": {
    "id": "660e8400-e29b-41d4-a716-446655440111",
    "bindingMasterId": "modbus_factory",
    "status": "running"
  }
}
```

## Segurança

### Sandbox Restrictions

❌ **Proibido:**
- Acesso ao filesystem (`fs`)
- Execução de processos (`child_process`)
- Network direto (`net`, `http`) - só via system API
- `eval`, `Function`, `require`
- `process.exit`, `process.kill`
- Imports externos não auditados

✅ **Permitido:**
- `system.tcp.createSocket()` - socket seguro com rate limiting
- `system.log` - logging centralizado
- `system.createBindingMaster/Slave` - bindings
- `Buffer`, `Promise`, `setTimeout`, `JSON`, `Math`

### Validação de Integridade

1. **Hash SHA256** - código não pode ser modificado após upload
2. **Type checking** - TypeScript valida tipos em compile time
3. **AST analysis** - verifica APIs proibidas antes de executar
4. **Sandbox isolation** - código roda em VM isolado

## Vantagens

✅ **Type Safety** - TypeScript garante tipos corretos
✅ **Validação** - Erros detectados antes de salvar no banco
✅ **Segurança** - Sandbox impede acesso ao sistema host
✅ **Injeção de Dependências** - System API controlado
✅ **Hot Reload** - Atualizar drivers sem restart
✅ **Versionamento** - Múltiplas versões do mesmo driver
✅ **Auditoria** - Hash garante integridade do código

## Próximos Passos

1. ✅ Especificar arquitetura do compilador
2. ⏳ Implementar DriverCompiler com Bun
3. ⏳ Implementar DriverRuntime com VM sandbox
4. ⏳ Criar APIs de upload e instanciação
5. ⏳ Frontend para upload de drivers
6. ⏳ Sistema de versionamento
7. ⏳ Marketplace de drivers
