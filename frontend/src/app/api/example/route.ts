import { NextRequest, NextResponse } from 'next/server';

// Função para buscar dados de uma API externa
async function fetchExternalData() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar dados externos');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar dados externos:', error);
        return null;
    }
}

// Função para buscar dados do seu backend
async function fetchBackendData() {
    try {
        const response = await fetch('http://localhost:3001/api/devices', {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar dados do backend');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar dados do backend:', error);
        return null;
    }
}

// GET - Buscar dados
export async function GET(request: NextRequest) {
    try {
        // Buscar dados em paralelo
        const [externalData, backendData] = await Promise.all([
            fetchExternalData(),
            fetchBackendData()
        ]);

        // Combinar os dados
        const combinedData = {
            external: externalData,
            backend: backendData,
            timestamp: new Date().toISOString()
        };

        return NextResponse.json(combinedData, { status: 200 });
    } catch (error) {
        console.error('Erro na API:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// POST - Criar dados
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Fazer fetch para criar dados no backend
        const response = await fetch('http://localhost:3001/api/devices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error('Falha ao criar dados no backend');
        }

        const result = await response.json();

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar dados:', error);
        return NextResponse.json(
            { error: 'Erro ao criar dados' },
            { status: 500 }
        );
    }
} 