import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/apiProxy";

const USER_API_URL = "/api/v1/users";

export async function GET(request: NextRequest) {
    return proxyToBackend(request, USER_API_URL);
}

export async function POST(request: NextRequest) {
    return proxyToBackend(request, USER_API_URL);
}