import { useEffect, useState } from "react";

export const useSchedules = () => {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [isSchedulesLoaded, setIsSchedulesLoaded] = useState<boolean>(false);

    useEffect(() => {
        getSchedules();
    }, []);

    const getSchedules = async () => {
        const response = await fetch('/api/schedules');
        const data = await response.json();
        setSchedules(data);
        setIsSchedulesLoaded(true);
        console.log(data);
    }

    return { schedules, isSchedulesLoaded };
}   