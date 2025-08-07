import ModernSidebar from '@/components/modern/modern-sidebar';
import '../../styles/scrollbar.css'

// Função para buscar dados no server-side
async function fetchNavigationData() {
    try {
        const response = await fetch('http://localhost:3000/api/navigation', {
            // Cache por 60 segundos
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar dados');
        }

        console.log(response);

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        // Retorna dados mock em caso de erro
        return [];
    }
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    // Buscar dados no server-side
    const navigationData = await fetchNavigationData();

    return (
        <div className="h-dvh w-dvw p-2 flex flex-row">
            <ModernSidebar navMain={navigationData} />
            <main className="flex-1 ml-4">
                {children}
            </main>
        </div>
    )
}