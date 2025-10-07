import fs from "fs";
import path from "path";

/**
 * Procura recursivamente por todos os arquivos "worker.ts" em um diretório e suas subpastas.
 * @param directory Diretório base para começar a busca
 * @returns Array com os nomes das pastas e caminhos dos arquivos encontrados
 */
export function findAllWorkerPaths(directory: string): { folder: string, path: string }[] {
  const baseDir = process.cwd();
  const fullDir = path.join(baseDir, directory);
  let results: { folder: string, path: string }[] = [];

  if (!fs.existsSync(fullDir)) {
    return results;
  }

  const filesAndDirs = fs.readdirSync(fullDir);

  for (const name of filesAndDirs) {
    const fullPath = path.join(fullDir, name);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Se for pasta, chama a função de novo (recursivo)
      results = results.concat(findAllWorkerPaths(path.join(directory, name)));
    } else if (name === 'worker.ts') {
      // Pega o nome da pasta onde está o arquivo
      const folderName = path.basename(path.dirname(fullPath));
      results.push({ folder: folderName, path: fullPath });
    }
  }

  return results;
}

export function loadWorker(workerPath: string): Worker | undefined {
  const finded = findAllWorkerPaths("workers");
  const found = finded.find(worker => worker.folder === workerPath);

  if (!found) {
    return undefined;
  }

  return new Worker(found.path);
}
