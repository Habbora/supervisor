import { logger } from '../services/Logger';
import { ControllerManager } from './controller.manager';
import { prisma } from '../lib/prisma';
import type { Controller } from '@prisma/client';

export class ControllerBootstrap {

  /**
   * Carrega todos os controladores do banco de dados e cria instâncias no ControllerManager
   *
   * @returns Promise<void>
   */
  static async loadFromDatabase(): Promise<void> {
    try {
      // Inicia o ControllerManager
      const controllerManager = ControllerManager.getInstance();

      // Buscar todos os controladores diretamente do Prisma
      const dbControllers = await prisma.controller.findMany();

      if (dbControllers.length === 0) {
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      // Carregar cada controlador
      for (const dbController of dbControllers) {
        try {
          // Parsear configs se existir (Prisma retorna string)
          const configs = dbController.configs
          // Criar instância no ControllerManager
          controllerManager.create({
            id: dbController.id,
            name: dbController.name,
            driver: dbController.driver,
            config: configs,
            tags: dbController.tags,
          });

          successCount++;
        } catch (error) {
          failureCount++;
          // Continua carregando os outros controladores
          continue;
        }
      }

    } catch (error) {
      throw new Error(
        `Falha no bootstrap de controladores: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Recarrega um controlador específico do banco de dados
   * Útil para atualizar configurações sem reiniciar a aplicação
   *
   * @param controllerId - ID do controlador a ser recarregado
   */
  static async reloadController(controllerId: string, dbController: Controller): Promise<void> {
    try {
      const existingController = ControllerManager.getInstance().findById(controllerId);
      if (existingController) {
        await ControllerManager.getInstance().remove(controllerId);
      }

      await ControllerManager.getInstance().create({
        id: dbController.id,
        name: dbController.name,
        driver: dbController.driver,
        config: dbController.configs,
        tags: dbController.tags
      });

    } catch (error) {
      throw error;
    }
  }
}
