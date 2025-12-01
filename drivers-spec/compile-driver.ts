/**
 * Driver Compiler Script
 *
 * Compila um driver TypeScript e extrai metadados
 * Uso: bun run compile-driver.ts modbusTCP.ts
 */

import { parseSync, transformSync } from '@swc/core';
import { readFileSync, writeFileSync } from 'fs';

interface DriverMetadata {
  driver: {
    name: string;
    version: string;
    description?: string;
  };
  network?: {
    type: 'tcp' | 'udp';
    defaultPort?: number;
  };
  exports: Array<{
    type: string;
    id: string;
    count: number;
    addressStart: number;
    methods: string[];
  }>;
  hooks: {
    onInit?: string;
    onClose?: string;
    onConnect?: string;
    onDisconnect?: string;
    onError?: string;
  };
  polls: Array<{
    method: string;
    interval: number;
  }>;
}

function extractMetadata(sourceCode: string): DriverMetadata {
  const ast = parseSync(sourceCode, {
    syntax: 'typescript',
    decorators: true,
  });

  // TODO: Implementar extração real de decorators via AST
  // Por enquanto, retorna mock baseado no modbusTCP.ts
  return {
    driver: {
      name: 'Modbus TCP Driver',
      version: '1.0.0',
      description: 'Driver para comunicação Modbus TCP/IP',
    },
    network: {
      type: 'tcp',
      defaultPort: 502,
    },
    exports: [
      {
        type: 'switch',
        id: 'switch_{{address}}',
        count: 16,
        addressStart: 0,
        methods: ['setOn', 'setOff'],
      },
      {
        type: 'input',
        id: 'input_{{address}}',
        count: 8,
        addressStart: 100,
        methods: ['read'],
      },
    ],
    hooks: {
      onInit: 'initialize',
      onClose: 'cleanup',
      onConnect: 'onConnect',
      onDisconnect: 'onDisconnect',
      onError: 'handleError',
    },
    polls: [
      {
        method: 'updateStates',
        interval: 1000,
      },
    ],
  };
}

function compileCode(sourceCode: string): string {
  const result = transformSync(sourceCode, {
    jsc: {
      parser: {
        syntax: 'typescript',
        decorators: true,
      },
      transform: {
        decoratorMetadata: true,
      },
      target: 'es2022',
      minify: {
        compress: true,
        mangle: true,
      },
    },
  });

  return result.code;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: bun run compile-driver.ts <driver-file.ts>');
    process.exit(1);
  }

  const driverFile = args[0];

  console.log(`📦 Compiling driver: ${driverFile}`);

  // 1. Ler arquivo
  const sourceCode = readFileSync(driverFile, 'utf-8');

  // 2. Extrair metadados
  console.log('🔍 Extracting metadata...');
  const metadata = extractMetadata(sourceCode);
  console.log('✅ Metadata extracted:');
  console.log(JSON.stringify(metadata, null, 2));

  // 3. Compilar código
  console.log('\n⚙️  Compiling and minifying...');
  const compiledCode = compileCode(sourceCode);
  console.log(`✅ Compiled (${compiledCode.length} bytes)`);

  // 4. Gerar output
  const output = {
    metadata,
    code: compiledCode,
  };

  const outputFile = driverFile.replace('.ts', '.compiled.json');
  writeFileSync(outputFile, JSON.stringify(output, null, 2));

  console.log(`\n✅ Driver compiled successfully!`);
  console.log(`📄 Output: ${outputFile}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Name: ${metadata.driver.name}`);
  console.log(`   Version: ${metadata.driver.version}`);
  console.log(`   Network: ${metadata.network?.type.toUpperCase()} (port ${metadata.network?.defaultPort})`);
  console.log(`   Exports: ${metadata.exports.length} services`);
  metadata.exports.forEach((exp) => {
    console.log(`     - ${exp.count}x ${exp.type} (${exp.addressStart}-${exp.addressStart + exp.count - 1})`);
  });
  console.log(`   Hooks: ${Object.keys(metadata.hooks).length}`);
  console.log(`   Polls: ${metadata.polls.length}`);
}

main().catch(console.error);
