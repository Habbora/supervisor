import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_CONFIG, getBackendUrl } from './config';

/**
 * Função genérica para fazer proxy de requisições para o backend
 * @param request - Requisição recebida do frontend
 * @param backendPath - Caminho específico no backend (opcional)
 * @returns Resposta do backend
 */
export async function proxyToBackend( 
  request: NextRequest,
  backendPath?: string
) {
  try {
    // Verificar se a rota deve ser excluída
    if (BACKEND_CONFIG.SPECIAL_ROUTES.EXCLUDE.includes(request.nextUrl.pathname)) {
      return NextResponse.json(
        { error: 'Rota não suportada' },
        { status: 404 }
      );
    }
    // Pegar o corpo da requisição
    const body = request.headers.get('content-type') === 'application/json' ? await request.json() : undefined;

    // Construir URL do backend
    const path = backendPath || request.nextUrl.pathname;
    const backendUrl = getBackendUrl(path) + request.nextUrl.search;

    // Fazer requisição para o backend com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_CONFIG.TIMEOUT);

    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers: {
        ...BACKEND_CONFIG.DEFAULT_HEADERS,
        // Copiar headers importantes da requisição original
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        }),
        ...(request.headers.get('x-api-key') && {
          'x-api-key': request.headers.get('x-api-key')!
        })
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Pegar resposta do backend
    const backendData = await backendResponse.json();

    // Retornar resposta do backend com mesmo status
    return NextResponse.json(backendData, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Erro no proxy para backend:', error);

    // Verificar se foi timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        {
          error: 'Timeout - Backend não respondeu a tempo',
          path: request.nextUrl.pathname
        },
        { status: 504 }
      );
    }

    console.log(error);

    return NextResponse.json(
      {
        error: 'Erro de conexão com o backend',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        path: request.nextUrl.pathname
      },
      { status: 503 }
    );
  }
}

/**
 * Função específica para rotas de controllers
 */
export async function proxyControllers(request: NextRequest) {
  return proxyToBackend(request);
}

/**
 * Função para qualquer rota genérica
 */
export async function proxyGeneric(request: NextRequest) {
  return proxyToBackend(request);
}
