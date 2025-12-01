#!/usr/bin/env bun

// --- Compilador TypeScript → JavaScript com Bun ---

import { existsSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { $ } from 'bun';

/**
 * Configuração do compilador
 */
interface CompilerConfig {
  input: string | string[];      // Arquivo(s) de entrada
  outdir?: string;                // Diretório de saída
  minify?: boolean;               // Minificar código
  sourcemap?: 'none' | 'inline' | 'external';
  target?: 'browser' | 'bun' | 'node';
  format?: 'esm' | 'cjs';
  watch?: boolean;                // Watch mode
}

/**
 * Resultado da compilação
 */
interface CompileResult {
  success: boolean;
  outputs: string[];
  errors: string[];
  duration: number;
}

/**
 * Logger colorido
 */
const log = {
  info: (msg: string) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  error: (msg: string) => console.error(`\x1b[31m✗\x1b[0m ${msg}`),
  warn: (msg: string) => console.warn(`\x1b[33m⚠\x1b[0m ${msg}`),
};

/**
 * Compila um ou mais arquivos TypeScript para JavaScript
 */
export async function compile(config: CompilerConfig): Promise<CompileResult> {
  const startTime = performance.now();
  const outputs: string[] = [];
  const errors: string[] = [];

  try {
    // Normaliza input para array
    const inputs = Array.isArray(config.input) ? config.input : [config.input];

    // Valida arquivos de entrada
    for (const input of inputs) {
      if (!existsSync(input)) {
        errors.push(`Arquivo não encontrado: ${input}`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        outputs: [],
        errors,
        duration: performance.now() - startTime,
      };
    }

    log.info(`Compilando ${inputs.length} arquivo(s)...`);

    // Cria diretório de saída se necessário
    if (config.outdir && !existsSync(config.outdir)) {
      mkdirSync(config.outdir, { recursive: true });
      log.info(`Diretório criado: ${config.outdir}`);
    }

    // Compila cada arquivo
    for (const input of inputs) {
      try {
        const outputPath = getOutputPath(input, config.outdir);

        log.info(`  ${basename(input)} → ${basename(outputPath)}`);

        // Build com Bun
        const result = await Bun.build({
          entrypoints: [input],
          outdir: config.outdir || dirname(input),
          target: config.target || 'node',
          format: config.format || 'esm',
          minify: config.minify || false,
          sourcemap: config.sourcemap || 'none',
          naming: '[dir]/[name].js', // Mantém nome original com .js
        });

        if (!result.success) {
          for (const message of result.logs) {
            errors.push(`${input}: ${message.message}`);
          }
        } else {
          outputs.push(outputPath);
          log.success(`  Compilado: ${outputPath}`);
        }
      } catch (err: any) {
        errors.push(`Erro ao compilar ${input}: ${err.message}`);
      }
    }

    const duration = performance.now() - startTime;

    if (errors.length === 0) {
      log.success(`\nCompilação concluída em ${duration.toFixed(2)}ms`);
      log.info(`${outputs.length} arquivo(s) gerado(s)`);
    } else {
      log.error(`\nCompilação falhou com ${errors.length} erro(s)`);
    }

    return {
      success: errors.length === 0,
      outputs,
      errors,
      duration,
    };
  } catch (err: any) {
    return {
      success: false,
      outputs: [],
      errors: [err.message],
      duration: performance.now() - startTime,
    };
  }
}

/**
 * Gera o caminho de saída
 */
function getOutputPath(input: string, outdir?: string): string {
  const inputBasename = basename(input, extname(input));
  const outputFilename = `${inputBasename}.js`;

  if (outdir) {
    return join(outdir, outputFilename);
  }

  return join(dirname(input), outputFilename);
}

/**
 * Watch mode: recompila ao detectar mudanças
 */
export async function watch(config: CompilerConfig): Promise<void> {
  log.info('Watch mode ativado');
  log.info('Pressione Ctrl+C para parar\n');

  // Compilação inicial
  await compile(config);

  const inputs = Array.isArray(config.input) ? config.input : [config.input];

  // Watch usando Bun.watch (nativo do Bun)
  const watcher = Bun.file(inputs[0]).watch();

  log.info(`\nObservando mudanças em ${inputs.length} arquivo(s)...\n`);

  for await (const event of watcher) {
    log.info('Arquivo modificado, recompilando...');
    await compile(config);
  }
}

/**
 * CLI: Executa se chamado diretamente
 */
if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Uso: bun compiler.ts <arquivo.ts> [opções]

Opções:
  --outdir <dir>       Diretório de saída
  --minify             Minificar código
  --sourcemap          Gerar sourcemap (inline, external)
  --target <target>    Target (browser, bun, node)
  --format <format>    Formato (esm, cjs)
  --watch              Watch mode

Exemplos:
  bun compiler.ts validator.ts
  bun compiler.ts validator.ts --outdir dist
  bun compiler.ts validator.ts --minify --sourcemap external
  bun compiler.ts validator.ts --watch
  bun compiler.ts "*.ts" --outdir dist
    `);
    process.exit(0);
  }

  // Parse argumentos
  const config: CompilerConfig = {
    input: args[0],
  };

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--outdir':
        config.outdir = args[++i];
        break;
      case '--minify':
        config.minify = true;
        break;
      case '--sourcemap':
        const sourcemapValue = args[i + 1];
        if (['inline', 'external', 'none'].includes(sourcemapValue)) {
          config.sourcemap = sourcemapValue as any;
          i++;
        } else {
          config.sourcemap = 'external';
        }
        break;
      case '--target':
        config.target = args[++i] as any;
        break;
      case '--format':
        config.format = args[++i] as any;
        break;
      case '--watch':
        config.watch = true;
        break;
    }
  }

  // Expande glob patterns
  if (config.input.includes('*')) {
    const { globSync } = await import('glob');
    config.input = globSync(config.input);
  }

  // Executa
  if (config.watch) {
    await watch(config);
  } else {
    const result = await compile(config);
    process.exit(result.success ? 0 : 1);
  }
}

export default { compile, watch };
