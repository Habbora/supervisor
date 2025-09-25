import ValidateAuth from '@/components/auth/ValidateAuth';

import ModernSidebar from '@/components/modern/modern-sidebar';
import '../../styles/scrollbar.css'
import { DashboardProvider } from '@/features/dashboard/provider/dashboardProvider';

const mock = [
    {
        id: 0,
        name: 'Navegação',
        href: '/',
        items: [
            {
                id: 0,
                name: '🏠 Início',
                href: '/',
                items: [
                ]
            },
            {
                id: 1,
                name: '⏰ Agendamentos',
                href: '/schedules',
                items: [
                ]
            },
            {
                id: 4,
                name: '⚙️ Configurações',
                href: '/settings',
                items: [
                    {
                        id: 0,
                        name: 'Geral',
                        href: '/',
                    },
                    {
                        id: 1,
                        name: 'Controladores',
                        href: '/controllers',
                    },
                    {
                        id: 2,
                        name: 'Dispositivos',
                        href: '/devices',
                    },
                    {
                        id: 3,
                        name: 'Usuários',
                        href: '/users',
                    },
                ]
            }
        ]
    },
]

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    // Buscar dados no server-side
    const navigationData = mock;

    return (
        <ValidateAuth>
            <DashboardProvider>
                <div className="h-dvh w-dvw p-2 flex flex-row">
                    <aside className="w-max-60 h-full">
                        <ModernSidebar navMain={navigationData} />
                    </aside>
                    <main className="w-full h-full ml-4 flex flex-col gap-2">
                        {children}
                    </main>
                </div>
            </DashboardProvider>
        </ValidateAuth>
    )
}