// Função simples para armazenar arquivos no backend
// Esta função salva um arquivo enviado para um diretório local
// Você pode adaptar para salvar em outros lugares (ex: S3, Google Cloud, etc)

import fs from 'fs';
import path from 'path';

/**
 * Salva um arquivo no diretório de uploads
 * @param filename Nome do arquivo
 * @param data Buffer ou string com o conteúdo do arquivo
 * @returns Caminho completo do arquivo salvo
 */
export function saveFile(directory: string, filename: string, data: Buffer | string): string {
  // Obtém o diretório base do processo
  const baseDir = process.cwd();
  // Combina o diretório base com o diretório específico informado
  const fullDir = path.join(baseDir, directory);
  // Garante que o diretório existe antes de salvar
  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }
  const filePath = path.join(directory, filename);
  fs.writeFileSync(filePath, data);
  return filePath;
}

/**
 * Obtém um arquivo do diretório de uploads
 * @param filename Nome do arquivo
 * @returns Buffer com o conteúdo do arquivo ou null se não encontrado
 */
export function loadFile(directory: string, filename: string): Buffer | null {
  // Obtém o diretório base do processo
  const baseDir = process.cwd();
  // Combina o diretório base com o diretório específico informado
  const fullDir = path.join(baseDir, directory);
  // Garante que o diretório existe antes de salvar
  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }
  const filePath = path.join(directory, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath);
}

export function findInDirectory(directory: string, filename: string): string | null {
  const baseDir = process.cwd();
  const fullDir = path.join(baseDir, directory);
  if (!fs.existsSync(fullDir)) {
    return null;
  }
  const files = fs.readdirSync(fullDir);
  return files.find(file => file === filename) || null;
}

/**
 * Procura recursivamente por todos os arquivos "worker.ts" em um diretório e suas subpastas.
 * @param directory Diretório base para começar a busca
 * @returns Array com os nomes das pastas e caminhos dos arquivos encontrados
 */
export function findAllWorkers(directory: string): {folder: string, path: string}[] {
  const baseDir = process.cwd();
  const fullDir = path.join(baseDir, directory);
  let results: {folder: string, path: string}[] = [];

  if (!fs.existsSync(fullDir)) {
    return results;
  }

  const filesAndDirs = fs.readdirSync(fullDir);

  for (const name of filesAndDirs) {
    const fullPath = path.join(fullDir, name);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Se for pasta, chama a função de novo (recursivo)
      results = results.concat(findAllWorkers(path.join(directory, name)));
    } else if (name === 'worker.ts') {
      // Pega o nome da pasta onde está o arquivo
      const folderName = path.basename(path.dirname(fullPath));
      results.push({folder: folderName, path: fullPath});
    }
  }

  return results;
}