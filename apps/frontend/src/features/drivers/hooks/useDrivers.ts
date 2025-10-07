import { useEffect, useState } from "react";

export const useDrivers = () => {
    const [drivers, setDrivers] = useState<any[]>([]);

    useEffect(() => {
        readDriversList();
    }, []);

    const readDriversList = async () => {
        const response = await fetch("/api/drivers");
        const data = await response.json();
        setDrivers(data);
    }

    return { drivers };
};
