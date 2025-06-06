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

