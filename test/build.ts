#!/usr/bin/env bun

// --- Build Script: Compila todos os arquivos TypeScript ---

import { compile } from './compiler';
import { readdirSync } from 'fs';
import { join } from 'path';

const log = {
  info: (msg: string) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  error: (msg: string) => console.error(`\x1b[31m✗\x1b[0m ${msg}`),
};

async function buildAll() {
  console.log('='.repeat(70));
  console.log('🔨 BUILD: Compilando projeto');
  console.log('='.repeat(70));
  console.log('');

  const startTime = performance.now();

  // Lista todos arquivos .ts (exceto testes e build scripts)
  const files = readdirSync('.')
    .filter((f) => f.endsWith('.ts'))
    .filter((f) => !f.startsWith('test-'))
    .filter((f) => !f.includes('build'))
    .filter((f) => !f.includes('compiler'));

  log.info(`Encontrados ${files.length} arquivos TypeScript\n`);

  // Compila cada arquivo
  const results = [];
  for (const file of files) {
    const result = await compile({
      input: file,
      minify: false,
      sourcemap: 'none',
    });

    results.push({ file, result });
  }

  // Resumo
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMO');
  console.log('='.repeat(70));
  console.log('');

  const successful = results.filter((r) => r.result.success).length;
  const failed = results.filter((r) => !r.result.success).length;

  log.info(`Total: ${files.length} arquivos`);
  log.success(`Sucesso: ${successful}`);
  if (failed > 0) {
    log.error(`Falhou: ${failed}`);
  }

  const totalDuration = performance.now() - startTime;
  log.info(`Tempo total: ${totalDuration.toFixed(2)}ms\n`);

  // Mostra erros se houver
  if (failed > 0) {
    console.log('='.repeat(70));
    console.log('❌ ERROS');
    console.log('='.repeat(70));
    console.log('');

    for (const { file, result } of results) {
      if (!result.success) {
        log.error(`${file}:`);
        for (const error of result.errors) {
          console.log(`  ${error}`);
        }
      }
    }
  }

  return failed === 0;
}

// Executa
const success = await buildAll();
process.exit(success ? 0 : 1);
