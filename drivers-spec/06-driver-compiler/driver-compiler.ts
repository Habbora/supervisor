/**
 * Driver Compiler
 *
 * Compila drivers TypeScript para JavaScript validado e seguro
 */

import { Transpiler } from 'bun';
import { CryptoHasher } from 'bun';

export interface CompilationResult {
  success: boolean;
  code?: string;
  metadata?: DriverMetadata;
  errors?: CompilationError[];
  warnings?: string[];
  hash?: string;
}

export interface CompilationError {
  type: 'syntax' | 'validation' | 'security' | 'type';
  message: string;
  line?: number;
  column?: number;
}

export interface DriverMetadata {
  // Metadados do @Driver decorator
  name: string;
  version: string;
  description?: string;
  protocol?: string;
  author?: string;

  // Dependências do system usadas
  dependencies: {
    systemAPIs: string[];      // Ex: ['tcp', 'log', 'createBindingMaster']
    allowedImports: string[];  // Ex: ['buffer']
  };

  // Lifecycle hooks
  lifecycle: {
    onInit: boolean;
    onClose: boolean;
    polls: Array<{ interval: number; methodName: string }>;
  };

  // Exports
  exports: {
    className: string;
    bindings: Array<{ id: string; type: string }>;
    events: string[];
  };

  // Segurança
  security: {
    usesNetwork: boolean;
    usesFileSystem: boolean;
    usesProcess: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export class DriverCompiler {
  private transpiler: Transpiler;

  constructor() {
    this.transpiler = new Transpiler({
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
          esModuleInterop: true,
          skipLibCheck: true,
        },
      },
    });
  }

  /**
   * Compila driver TypeScript completo
   */
  async compile(sourceCode: string): Promise<CompilationResult> {
    const errors: CompilationError[] = [];
    const warnings: string[] = [];

    try {
      // 1. Validação de sintaxe básica
      const syntaxCheck = this.validateSyntax(sourceCode);
      if (!syntaxCheck.valid) {
        return {
          success: false,
          errors: syntaxCheck.errors,
        };
      }

      // 2. Análise de segurança (AST)
      const securityCheck = await this.analyzeSecurityRisks(sourceCode);
      if (securityCheck.errors.length > 0) {
        return {
          success: false,
          errors: securityCheck.errors,
        };
      }
      warnings.push(...securityCheck.warnings);

      // 3. Extração de metadados
      const metadata = await this.extractMetadata(sourceCode);
      if (!metadata.name || !metadata.version) {
        return {
          success: false,
          errors: [{
            type: 'validation',
            message: '@Driver decorator must specify name and version',
          }],
        };
      }

      // 4. Transpilação TypeScript → JavaScript
      const jsCode = this.transpiler.transformSync(sourceCode);

      // 5. Minificação
      const minified = await this.minify(jsCode);

      // 6. Hash de integridade
      const hash = this.generateHash(minified);

      return {
        success: true,
        code: minified,
        metadata,
        warnings: warnings.length > 0 ? warnings : undefined,
        hash,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [{
          type: 'syntax',
          message: error.message,
        }],
      };
    }
  }

  /**
   * Valida sintaxe básica do TypeScript
   */
  private validateSyntax(code: string): { valid: boolean; errors: CompilationError[] } {
    const errors: CompilationError[] = [];

    try {
      // Tenta transpilar - se falhar, sintaxe inválida
      this.transpiler.scanImports(code);
      return { valid: true, errors: [] };
    } catch (error: any) {
      errors.push({
        type: 'syntax',
        message: error.message,
      });
      return { valid: false, errors };
    }
  }

  /**
   * Análise de segurança e APIs proibidas
   */
  private async analyzeSecurityRisks(code: string): Promise<{
    errors: CompilationError[];
    warnings: string[];
  }> {
    const errors: CompilationError[] = [];
    const warnings: string[] = [];

    // APIs proibidas (não pode usar diretamente)
    const forbiddenAPIs = [
      { pattern: /\beval\s*\(/, message: 'eval() is forbidden' },
      { pattern: /\bnew\s+Function\s*\(/, message: 'new Function() is forbidden' },
      { pattern: /\brequire\s*\(/, message: 'require() is forbidden - use imports' },
      { pattern: /\bprocess\.exit\s*\(/, message: 'process.exit() is forbidden' },
      { pattern: /\bprocess\.kill\s*\(/, message: 'process.kill() is forbidden' },
      { pattern: /\b__dirname\b/, message: '__dirname is not available in sandbox' },
      { pattern: /\b__filename\b/, message: '__filename is not available in sandbox' },
    ];

    for (const forbidden of forbiddenAPIs) {
      if (forbidden.pattern.test(code)) {
        errors.push({
          type: 'security',
          message: forbidden.message,
        });
      }
    }

    // Imports proibidos
    const forbiddenImports = [
      'fs',
      'fs/promises',
      'child_process',
      'vm',
      'cluster',
      'worker_threads',
    ];

    for (const imp of forbiddenImports) {
      const importRegex = new RegExp(`from\\s+['"]${imp}['"]`, 'g');
      if (importRegex.test(code)) {
        errors.push({
          type: 'security',
          message: `Import '${imp}' is forbidden`,
        });
      }
    }

    // Imports permitidos mas com warning
    const riskyImports = [
      { name: 'net', message: 'Use system.tcp instead of net directly' },
      { name: 'http', message: 'Use system.http instead of http directly' },
      { name: 'https', message: 'Use system.http instead of https directly' },
    ];

    for (const imp of riskyImports) {
      const importRegex = new RegExp(`from\\s+['"]${imp.name}['"]`, 'g');
      if (importRegex.test(code)) {
        warnings.push(imp.message);
      }
    }

    return { errors, warnings };
  }

  /**
   * Extrai metadados do código
   */
  private async extractMetadata(code: string): Promise<DriverMetadata> {
    const metadata: DriverMetadata = {
      name: '',
      version: '',
      dependencies: {
        systemAPIs: [],
        allowedImports: [],
      },
      lifecycle: {
        onInit: false,
        onClose: false,
        polls: [],
      },
      exports: {
        className: '',
        bindings: [],
        events: [],
      },
      security: {
        usesNetwork: false,
        usesFileSystem: false,
        usesProcess: false,
        riskLevel: 'low',
      },
    };

    // 1. Extrair @Driver metadata
    const driverMatch = code.match(/@Driver\s*\(\s*\{([^}]+)\}\s*\)/s);
    if (driverMatch) {
      const driverConfig = driverMatch[1];

      const nameMatch = driverConfig.match(/name\s*:\s*['"]([^'"]+)['"]/);
      if (nameMatch) metadata.name = nameMatch[1];

      const versionMatch = driverConfig.match(/version\s*:\s*['"]([^'"]+)['"]/);
      if (versionMatch) metadata.version = versionMatch[1];

      const descMatch = driverConfig.match(/description\s*:\s*['"]([^'"]+)['"]/);
      if (descMatch) metadata.description = descMatch[1];

      const protocolMatch = driverConfig.match(/protocol\s*:\s*['"]([^'"]+)['"]/);
      if (protocolMatch) metadata.protocol = protocolMatch[1];

      const authorMatch = driverConfig.match(/author\s*:\s*['"]([^'"]+)['"]/);
      if (authorMatch) metadata.author = authorMatch[1];
    }

    // 2. Extrair nome da classe
    const classMatch = code.match(/export\s+class\s+(\w+)/);
    if (classMatch) {
      metadata.exports.className = classMatch[1];
    }

    // 3. Detectar lifecycle hooks
    metadata.lifecycle.onInit = /@OnInit\s*\(\s*\)/.test(code);
    metadata.lifecycle.onClose = /@OnClose\s*\(\s*\)/.test(code);

    // Extrair @Poll
    const pollMatches = code.matchAll(/@Poll\s*\(\s*\{\s*interval\s*:\s*(\d+)\s*\}\s*\)\s*\w+\s+(\w+)\s*\(/g);
    for (const match of pollMatches) {
      metadata.lifecycle.polls.push({
        interval: parseInt(match[1]),
        methodName: match[2],
      });
    }

    // 4. Detectar system APIs usadas
    const systemAPIs = new Set<string>();

    // system.tcp
    if (/system\.tcp/.test(code)) {
      systemAPIs.add('tcp');
      metadata.security.usesNetwork = true;
    }

    // system.log
    if (/system\.log/.test(code)) {
      systemAPIs.add('log');
    }

    // system.createBindingMaster
    if (/system\.createBindingMaster/.test(code)) {
      systemAPIs.add('createBindingMaster');
    }

    // system.createBindingSlave
    if (/system\.createBindingSlave/.test(code)) {
      systemAPIs.add('createBindingSlave');
    }

    // system.events
    if (/system\.events/.test(code)) {
      systemAPIs.add('events');
    }

    metadata.dependencies.systemAPIs = Array.from(systemAPIs);

    // 5. Extrair bindings criados
    const bindingMatches = code.matchAll(/createBindingMaster\s*\(\s*['"](\w+)['"]\s*,\s*\{[^}]*id\s*:\s*(?:config\.bindingId\s*\|\|\s*)?['"]([^'"]+)['"]/g);
    for (const match of bindingMatches) {
      metadata.exports.bindings.push({
        type: match[1],
        id: match[2],
      });
    }

    // 6. Calcular risk level
    if (metadata.security.usesNetwork) {
      metadata.security.riskLevel = 'medium';
    }
    if (metadata.security.usesFileSystem || metadata.security.usesProcess) {
      metadata.security.riskLevel = 'high';
    }

    return metadata;
  }

  /**
   * Minifica código JavaScript
   */
  private async minify(code: string): Promise<string> {
    const result = await Bun.build({
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
      format: 'esm',
    });

    if (!result.success) {
      throw new Error('Minification failed');
    }

    const output = await result.outputs[0].text();
    return output;
  }

  /**
   * Gera hash SHA256 do código
   */
  private generateHash(code: string): string {
    const hasher = new CryptoHasher('sha256');
    hasher.update(code);
    return hasher.digest('hex');
  }

  /**
   * Valida integridade do código compilado
   */
  validateIntegrity(code: string, expectedHash: string): boolean {
    const actualHash = this.generateHash(code);
    return actualHash === expectedHash;
  }

  /**
   * Recompila código (para atualizações)
   */
  async recompile(existingCode: string, sourceCode: string): Promise<CompilationResult> {
    // Mesmo processo de compilação
    // Mas preserva configurações específicas se necessário
    return this.compile(sourceCode);
  }
}

/**
 * Singleton compiler
 */
export const driverCompiler = new DriverCompiler();
