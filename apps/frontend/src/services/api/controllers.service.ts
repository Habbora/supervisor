import { getBackendUrl } from "@/lib/config";
import { ControllerType } from "@/features/controllers/types";

class ControllersService {

    /**
     * Busca todos os controladores (Server-Side)
     * @returns Array de controllers ou null se não encontrado
     */
    async getAll(): Promise<ControllerType[] | null> {
        try {
            const url = getBackendUrl(`/api/v1/controllers`);

            const response = await fetch(url, {
                cache: 'no-store',
                next: { revalidate: 0 }
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`Failed to fetch controllers: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error in ControllersService.getAll:', error);
            return null;
        }
    }

    /**
     * Busca um controlador pelo ID (Server-Side)
     * @param id ID do controlador
     * @returns Controller ou null se não encontrado
     */
    async getById(id: string): Promise<ControllerType | null> {
        try {
            // Usa a função de config para montar a URL correta
            // A rota no backend é /api/v1/controllers/:id
            // O getBackendUrl já deve tratar o prefixo se configurado, ou montamos manualmente
            // Olhando o config.ts, ele tem TRANSFORM para /api/controllers -> /api/v1/controllers
            // Vamos usar a URL completa

            const url = getBackendUrl(`/api/v1/controllers/${id}`);

            const response = await fetch(url, {
                cache: 'no-store',
                next: { revalidate: 0 }
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`Failed to fetch controller: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error in ControllersService.getById:', error);
            return null;
        }
    }

    /**
     * Busca o schema de um controlador pelo ID (Server-Side)
     * @param id ID do controlador
     * @returns Schema do controlador ou null se não encontrado
     */
    async getSchemaById(id: string): Promise<any | null> {
        try {
            const url = getBackendUrl(`/api/v1/controllers/${id}/schema`);

            const response = await fetch(url, {
                cache: 'no-store',
                next: { revalidate: 0 }
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`Failed to fetch controller schema: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error in ControllersService.getSchemaById:', error);
            return null;
        }
    }
}

export const controllersService = new ControllersService();
