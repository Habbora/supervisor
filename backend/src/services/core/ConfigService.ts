import fs from 'fs/promises';
import path from 'path';

export class ConfigService {
  private configPath = path.join(__dirname, '../config/config.json');

  async loadConfig() {
    const configFile = await fs.readFile(this.configPath, 'utf-8');
    return JSON.parse(configFile);
  }

  async saveConfig(config: any) {
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }
} 