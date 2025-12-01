import { Elysia, t } from 'elysia';

// Interface do reservatório de água
interface WaterTank {
    id: string;
    name: string;
    capacity: number; // em litros (calculado: área × altura × 1000)
    area: number; // área do reservatório em m²
    maxWaterHeight: number; // altura máxima de água em metros
    minLevel: number; // nível mínimo de alerta (%)
    maxLevel: number; // nível máximo (%)
    location: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

// Storage em memória (substituir por banco de dados posteriormente)
let waterTanks: WaterTank[] = [
    {
        id: '1',
        name: 'Caixa Principal',
        capacity: 50000,
        area: 20,
        maxWaterHeight: 2.5,
        minLevel: 20,
        maxLevel: 95,
        location: 'Subsolo',
        description: 'Caixa d\'água principal do edifício',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Reservatório Superior',
        capacity: 30000,
        area: 15,
        maxWaterHeight: 2.0,
        minLevel: 15,
        maxLevel: 95,
        location: 'Cobertura',
        description: 'Reservatório elevado',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Função para calcular capacidade
function calculateCapacity(area: number, height: number): number {
    return Math.round(area * height * 1000); // m² * m * 1000 = litros
}

export const waterTankRoutes = new Elysia({ prefix: '/api/v1/water-tanks' })
    // GET /api/v1/water-tanks - Listar todos os reservatórios
    .get('/', () => {
        return waterTanks;
    })
    // GET /api/v1/water-tanks/:id - Buscar reservatório por ID
    .get('/:id', ({ params, set }) => {
        const tank = waterTanks.find(t => t.id === params.id);

        if (!tank) {
            set.status = 404;
            return {
                error: 'Water tank not found',
                message: 'Reservatório com este ID não existe'
            };
        }

        return tank;
    })
    // POST /api/v1/water-tanks - Criar novo reservatório
    .post('/', ({ body, set }) => {
        const { name, area, maxWaterHeight, minLevel, maxLevel, location, description } = body as any;

        if (!name || !area || !maxWaterHeight || !location) {
            set.status = 400;
            return {
                error: 'Missing required fields',
                message: 'name, area, maxWaterHeight and location are required'
            };
        }

        const newTank: WaterTank = {
            id: Date.now().toString(),
            name,
            capacity: calculateCapacity(area, maxWaterHeight),
            area,
            maxWaterHeight,
            minLevel: minLevel || 20,
            maxLevel: maxLevel || 95,
            location,
            description: description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        waterTanks.push(newTank);

        set.status = 201;
        return newTank;
    }, {
        body: t.Object({
            name: t.String(),
            area: t.Number(),
            maxWaterHeight: t.Number(),
            minLevel: t.Optional(t.Number()),
            maxLevel: t.Optional(t.Number()),
            location: t.String(),
            description: t.Optional(t.String())
        })
    })
    // PUT /api/v1/water-tanks/:id - Atualizar reservatório
    .put('/:id', ({ params, body, set }) => {
        const tankIndex = waterTanks.findIndex(t => t.id === params.id);

        if (tankIndex === -1) {
            set.status = 404;
            return {
                error: 'Water tank not found',
                message: 'Reservatório com este ID não existe'
            };
        }

        const { name, area, maxWaterHeight, minLevel, maxLevel, location, description } = body as any;

        // Atualiza apenas os campos fornecidos
        const updatedTank: WaterTank = {
            ...waterTanks[tankIndex],
            name: name !== undefined ? name : waterTanks[tankIndex].name,
            area: area !== undefined ? area : waterTanks[tankIndex].area,
            maxWaterHeight: maxWaterHeight !== undefined ? maxWaterHeight : waterTanks[tankIndex].maxWaterHeight,
            minLevel: minLevel !== undefined ? minLevel : waterTanks[tankIndex].minLevel,
            maxLevel: maxLevel !== undefined ? maxLevel : waterTanks[tankIndex].maxLevel,
            location: location !== undefined ? location : waterTanks[tankIndex].location,
            description: description !== undefined ? description : waterTanks[tankIndex].description,
            updatedAt: new Date().toISOString()
        };

        // Recalcula a capacidade se área ou altura foram alteradas
        if (area !== undefined || maxWaterHeight !== undefined) {
            updatedTank.capacity = calculateCapacity(updatedTank.area, updatedTank.maxWaterHeight);
        }

        waterTanks[tankIndex] = updatedTank;

        return updatedTank;
    }, {
        body: t.Object({
            name: t.Optional(t.String()),
            area: t.Optional(t.Number()),
            maxWaterHeight: t.Optional(t.Number()),
            minLevel: t.Optional(t.Number()),
            maxLevel: t.Optional(t.Number()),
            location: t.Optional(t.String()),
            description: t.Optional(t.String())
        })
    })
    // PATCH /api/v1/water-tanks/:id - Atualizar parcialmente reservatório
    .patch('/:id', ({ params, body, set }) => {
        const tankIndex = waterTanks.findIndex(t => t.id === params.id);

        if (tankIndex === -1) {
            set.status = 404;
            return {
                error: 'Water tank not found',
                message: 'Reservatório com este ID não existe'
            };
        }

        const updates = body as Partial<WaterTank>;

        // Atualiza apenas os campos fornecidos
        waterTanks[tankIndex] = {
            ...waterTanks[tankIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Recalcula a capacidade se área ou altura foram alteradas
        if (updates.area !== undefined || updates.maxWaterHeight !== undefined) {
            waterTanks[tankIndex].capacity = calculateCapacity(
                waterTanks[tankIndex].area,
                waterTanks[tankIndex].maxWaterHeight
            );
        }

        return waterTanks[tankIndex];
    })
    // DELETE /api/v1/water-tanks/:id - Deletar reservatório
    .delete('/:id', ({ params, set }) => {
        const tankIndex = waterTanks.findIndex(t => t.id === params.id);

        if (tankIndex === -1) {
            set.status = 404;
            return {
                error: 'Water tank not found',
                message: 'Reservatório com este ID não existe'
            };
        }

        const deletedTank = waterTanks[tankIndex];
        waterTanks.splice(tankIndex, 1);

        return {
            success: true,
            message: 'Reservatório deletado com sucesso',
            tank: deletedTank
        };
    });
