import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/apiProxy';

const AUTH_API_URL = "/api/v1/auth";

export async function POST(request: NextRequest) {
  return proxyToBackend(request, AUTH_API_URL);
} 