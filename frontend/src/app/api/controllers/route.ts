import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/apiProxy';

const CONTROLLER_API_URL = '/api/v1/controllers';

// GET - Listar controllers
export async function GET(request: NextRequest) {
  return proxyToBackend(request, CONTROLLER_API_URL);
}

// POST - Criar novo controller
export async function POST(request: NextRequest) {
  return proxyToBackend(request, CONTROLLER_API_URL);
}   
