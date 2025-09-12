import { proxyToBackend } from "@/lib/apiProxy";
import { NextRequest, NextResponse } from "next/server";

const USER_API_URL = "/api/v1/users";

export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    return proxyToBackend(req, USER_API_URL);
}

export const PUT = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    return proxyToBackend(req, USER_API_URL);
}

export const DELETE = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return proxyToBackend(req, `${USER_API_URL}/${id}`);
}

export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    return proxyToBackend(req, USER_API_URL);
}