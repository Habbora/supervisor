import ModernHeader from "@/components/modern/modern-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function EnvironmentsPage() {
    return (
        <div>
            <ModernHeader title="⚙️ Configurações" subtitle="Ambientes" />
            <Card>
                <CardHeader>
                    <CardTitle>Ambientes</CardTitle>
                </CardHeader>
            </Card>
        </div>
    )
}