import { ScheduleManager } from "@/features/schedules/schedule-manager";

export const GET = async () => {
    const schedules = ScheduleManager.getInstance().findAll();
    return Response.json(schedules);
}

export const POST = async (req: Request) => {
    const { name, time, actions } = await req.json();
    const schedule = ScheduleManager.getInstance().create({ name, time, actions });
    return Response.json(schedule);
}