import { NextResponse } from "next/server";

const DRIVERS_API_URL = "http://localhost:4001/api/drivers";

const mockDrivers = [
    {
        name: "Driver 1",
        description: "Driver 1 description",
    },
    {
        name: "Driver 2",
        description: "Driver 2 description",
    },
    {
        name: "Driver 3",
        description: "Driver 3 description",
    },
    {
        name: "Driver 4",
        description: "Driver 4 description",
    },
    
    {
        name: "Driver 5",
        description: "Driver 5 description",
    },
];

export async function GET() {
    const data = mockDrivers;
    return NextResponse.json(data);
}