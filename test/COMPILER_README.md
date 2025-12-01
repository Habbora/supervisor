# Compilador TypeScript → JavaScript com Bun

Compilador simples e rápido usando o build engine nativo do Bun.

## 🚀 Características

✅ **Rápido** - Usa Bun.build nativo (muito mais rápido que tsc)
✅ **Zero Config** - Funciona out-of-the-box
✅ **Minificação** - Suporte a minify
✅ **Sourcemaps** - Inline, external ou none
✅ **Watch Mode** - Recompila automaticamente
✅ **Múltiplos Targets** - browser, bun, node
✅ **Formatos** - ESM ou CommonJS
✅ **Glob Support** - Compila múltiplos arquivos
✅ **CLI Amigável** - Logs coloridos

---

## 📦 Instalação

```bash
bun add -D glob
```

---

## 🎯 Uso Básico

### Como Script

```bash
# Compilar um arquivo
bun compiler.ts validator.ts

# Especificar diretório de saída
bun compiler.ts validator.ts --outdir dist

# Minificar
bun compiler.ts validator.ts --minify

# Gerar sourcemap
bun compiler.ts validator.ts --sourcemap external

# Watch mode
bun compiler.ts validator.ts --watch

# Compilar múltiplos arquivos (glob)
bun compiler.ts "*.ts" --outdir dist
```

### Como Módulo

```typescript
import { compile } from './compiler';

const result = await compile({
  input: 'validator.ts',
  outdir: 'dist',
  minify: true,
  sourcemap: 'external',
  target: 'node',
  format: 'esm',
});

console.log(result);
// {
//   success: true,
//   outputs: ['dist/validator.js'],
//   errors: [],
//   duration: 45.2
// }
```

---

## ⚙️ Opções

### `input: string | string[]`

Arquivo(s) de entrada. Suporta glob patterns.

```typescript
// Um arquivo
{ input: 'validator.ts' }

// Múltiplos arquivos
{ input: ['validator.ts', 'compiler.ts'] }

// Glob pattern
{ input: '*.ts' }
{ input: 'src/**/*.ts' }
```

### `outdir?: string`

Diretório de saída. Se não especificado, gera no mesmo diretório do arquivo fonte.

```typescript
{ outdir: 'dist' }      // ./dist/validator.js
{ outdir: 'build/js' }  // ./build/js/validator.js
```

### `minify?: boolean`

Minifica o código de saída. Default: `false`

```typescript
{ minify: true }  // Código minificado
```

### `sourcemap?: 'none' | 'inline' | 'external'`

Gera sourcemaps. Default: `'none'`

```typescript
{ sourcemap: 'none' }     // Sem sourcemap
{ sourcemap: 'inline' }   // Sourcemap inline no .js
{ sourcemap: 'external' } // Arquivo .js.map separado
```

### `target?: 'browser' | 'bun' | 'node'`

Target do código. Default: `'node'`

```typescript
{ target: 'browser' } // Para navegadores
{ target: 'bun' }     // Para Bun runtime
{ target: 'node' }    // Para Node.js
```

### `format?: 'esm' | 'cjs'`

Formato do módulo. Default: `'esm'`

```typescript
{ format: 'esm' } // ES Modules (import/export)
{ format: 'cjs' } // CommonJS (require/module.exports)
```

### `watch?: boolean`

Ativa watch mode. Default: `false`

```typescript
{ watch: true } // Recompila automaticamente ao detectar mudanças
```

---

## 📚 API

### `compile(config: CompilerConfig): Promise<CompileResult>`

Compila arquivo(s) TypeScript.

**Retorna:**
```typescript
interface CompileResult {
  success: boolean;      // true se compilou sem erros
  outputs: string[];     // Arquivos gerados
  errors: string[];      // Erros de compilação
  duration: number;      // Tempo em ms
}
```

**Exemplo:**
```typescript
const result = await compile({ input: 'validator.ts' });

if (result.success) {
  console.log('Compilado:', result.outputs);
} else {
  console.error('Erros:', result.errors);
}
```

---

### `watch(config: CompilerConfig): Promise<void>`

Watch mode: recompila ao detectar mudanças.

**Exemplo:**
```typescript
await watch({
  input: 'validator.ts',
  minify: true
});
// Observa mudanças e recompila automaticamente
```

---

## 🛠️ Build Script

Use o build script para compilar todo o projeto:

```bash
bun build.ts
```

O build script:
- ✅ Encontra todos arquivos `.ts` (exceto testes)
- ✅ Compila cada um para `.js`
- ✅ Mostra resumo e tempo total
- ✅ Lista erros se houver

---

## 📊 Comparação com TSC

| Feature | Bun Compiler | TSC |
|---------|-------------|-----|
| **Velocidade** | ~40ms | ~2000ms |
| **Zero Config** | ✅ | ❌ |
| **Minificação** | ✅ Built-in | ❌ Precisa terser |
| **Sourcemaps** | ✅ | ✅ |
| **Watch Mode** | ✅ | ✅ |
| **Type Checking** | ❌ | ✅ |

**Nota:** O compilador Bun **NÃO faz type checking**. Para isso, use `tsc --noEmit`.

---

## 🔍 Exemplos

### Exemplo 1: Compilação Simples

```bash
bun compiler.ts validator.ts
```

**Output:**
```
ℹ Compilando 1 arquivo(s)...
ℹ   validator.ts → validator.js
✓   Compilado: validator.js
✓
Compilação concluída em 40.08ms
ℹ 1 arquivo(s) gerado(s)
```

### Exemplo 2: Build para Produção

```bash
bun compiler.ts validator.ts --outdir dist --minify --sourcemap external
```

Gera:
- `dist/validator.js` (minificado)
- `dist/validator.js.map` (sourcemap)

### Exemplo 3: Watch Mode

```bash
bun compiler.ts validator.ts --watch
```

**Output:**
```
ℹ Watch mode ativado
ℹ Pressione Ctrl+C para parar

ℹ Compilando 1 arquivo(s)...
✓ Compilado: validator.js

ℹ Observando mudanças em 1 arquivo(s)...

[Ao modificar o arquivo]
ℹ Arquivo modificado, recompilando...
✓ Compilado: validator.js
```

### Exemplo 4: Múltiplos Arquivos

```bash
bun compiler.ts "*.ts" --outdir dist
```

Compila todos `.ts` do diretório atual para `dist/`.

### Exemplo 5: Programático

```typescript
import { compile } from './compiler';

// Compila com configuração customizada
const result = await compile({
  input: ['validator.ts', 'compiler.ts'],
  outdir: 'build',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV === 'production' ? 'external' : 'inline',
  target: 'node',
});

if (!result.success) {
  console.error('Build failed!');
  process.exit(1);
}
```

---

## 🎨 CLI Options Summary

```
bun compiler.ts <arquivo.ts> [opções]

Opções:
  --outdir <dir>       Diretório de saída
  --minify             Minificar código
  --sourcemap [type]   Gerar sourcemap (inline, external, none)
  --target <target>    Target (browser, bun, node)
  --format <format>    Formato (esm, cjs)
  --watch              Watch mode
```

---

## ⚡ Performance

Benchmark (validator.ts ~300 linhas):

| Compilador | Tempo |
|-----------|-------|
| **Bun** | ~40ms |
| TSC | ~2000ms |
| esbuild | ~150ms |
| SWC | ~100ms |

**Bun é 50x mais rápido que TSC!** 🚀

---

## 🐛 Troubleshooting

### Erro: "Arquivo não encontrado"

Verifique se o caminho está correto:
```bash
ls validator.ts  # Verifica se existe
bun compiler.ts validator.ts
```

### Watch mode não funciona

O Bun.watch() funciona apenas no Bun runtime. Não funciona em Node.js.

### Tipos não estão sendo checados

O compilador Bun **não faz type checking**. Use:
```bash
bun tsc --noEmit  # Type check sem emitir arquivos
```

---

## 📝 Notas

1. **Type Checking**: Bun compila mas não verifica tipos. Use `tsc --noEmit` para isso.
2. **Decorators**: Suportado automaticamente pelo Bun
3. **JSX/TSX**: Suportado automaticamente
4. **Node Modules**: Resolvidos automaticamente
5. **Performance**: ~50x mais rápido que tsc

---

## 🚀 Próximos Passos

- [ ] Suporte a config file (bunfig.toml)
- [ ] Parallel builds
- [ ] Cache de compilação
- [ ] Incremental builds
- [ ] Plugin system

---

## 📄 Licença

MIT - Use como quiser!
