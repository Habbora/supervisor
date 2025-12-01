import '@/styles/scrollbar.css'
import { DashboardProvider } from '@/features/dashboard/provider/dashboardProvider';
import { getServerAuth } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import DashboardSideBar from '@/components/DashboardSideBar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, token } = await getServerAuth();

    if (!user || !token) {
        redirect("/login");
    }

    return (
        <DashboardProvider>
            <main className="flex flex-row h-dvh w-dvw bg-gray-50">
                <DashboardSideBar />
                <div className="flex-1 h-full overflow-y-auto">
                    {children}
                </div>
            </main>
        </DashboardProvider>
    )
}