import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/elysia/auth';
import { userRoutes } from './routes/elysia/users';
import { deviceRoutes } from './routes/elysia/devices';
import { lightRoutes } from './routes/elysia/lights';
import { controllerRoutes } from './controllers/controllers.route';
import { scheduleRoutes } from './routes/elysia/schedules';
import { dashboardRoutes } from './routes/elysia/dashboard';
import { waterTankRoutes } from './routes/elysia/water-tanks';

export function createServer() {
    return new Elysia()
        .use(cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }))
        .use(authRoutes)
        .use(userRoutes)
        .use(deviceRoutes)
        .use(lightRoutes)
        .use(controllerRoutes)
        .use(scheduleRoutes)
        .use(dashboardRoutes)
        .use(waterTankRoutes)
}
