'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSchedules } from "@/features/schedules/hooks/useSchedules";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddCard } from "@/components/AddCard"

export default function SchedulesPage() {
    const router = useRouter();
    const { schedules, isSchedulesLoaded } = useSchedules();

    useEffect(() => {
        if (!isSchedulesLoaded) return;
        console.log(schedules);
    }, [schedules, isSchedulesLoaded]);

    const handleAddSchedule = () => {
        router.push("/schedules/new");
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lista de Agendamentos ( {schedules.length} )</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="flex flex-wrap gap-4">
                    {schedules.map((schedule) => (
                        <div
                        className={`w-[200px] h-[200px] p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 bg-gray-100 hover:bg-gray-200 flex items-center justify-center`}
                        onClick={() => router.push(`/schedules/${schedule.id}`)}
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-center">
                                <svg
                                    className="w-12 h-12 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </div>
                            <div className="text-center">
                                <span className="text-sm font-medium text-gray-600">{schedule.name}</span>
                            </div>
                        </div>
                    </div>
                    ))}
                    <AddCard title="Adicionar Dispositivo" onClick={handleAddSchedule} />
                </div>
            </CardContent>
        </Card>
    )
}