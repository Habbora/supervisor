"use client";

import { createContext, useContext, useState, useEffect } from "react";

const DashboardContext = createContext<any>(null);

export const useDashboard = () => {
    return useContext(DashboardContext);
}

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
    const [sync, setSync] = useState<string>("0");
    const [dashboard, setDashboard] = useState<any>({
        devices: [],
        controllers: [],
        sync: "",
    });

    useEffect(() => {
        let active = true;

        async function fetchLoop(currentSync: string) {
            if (!active) return;

            try {
                const response = await fetch("/api/dashboard?sync=" + currentSync, {
                    cache: "no-cache",
                });

                const data = await response.json();
                setDashboard(data);
                setSync(data.sync);

                fetchLoop(data.sync); // chama de novo já com sync atualizado
            } catch {
                setTimeout(() => fetchLoop(currentSync), 1000);
            }
        }

        fetchLoop(sync);

        return () => {
            active = false;
        };
    }, []);

    return (
        <DashboardContext.Provider value={{ dashboard, devices: dashboard.devices, controllers: dashboard.controllers, sync: sync }}>
            {children}
        </DashboardContext.Provider>
    );
}