import { z } from 'zod'

export const CreateControllerDTO = z.object({
    id: z.string(),
    name: z.string(),
    driver: z.string(),
    driverId: z.string(),
})

export type CreateControllerDTO = z.infer<typeof CreateControllerDTO>