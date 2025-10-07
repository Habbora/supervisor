'use server';

import ModernHeader from "@/components/modern/modern-header";

export default async function SchedulesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <ModernHeader title="⏰ Agendamentos" />
            {children}
        </>
    )
}