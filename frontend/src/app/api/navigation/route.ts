import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const mock = [
        {
            id: 0,
            name: 'Navegação',
            href: '/',
            items: [
                {
                    id: 0,
                    name: '🏠 Início',
                    href: '/',
                    items: [
                    ]
                },
                {
                    id: 1,
                    name: '💡 Iluminação',
                    href: '/light',
                    items: []
                },
                {
                    id: 2,
                    name: '🚿 Hidráulica',
                    href: '/water',
                    items: []
                },
                {
                    id: 3,
                    name: '🔌 Energia',
                    href: '/energy',
                    items: []
                },
                {
                    id: 4,
                    name: '⚙️ Configurações',
                    href: '/settings',
                    items: [
                        {
                            id: 0,
                            name: 'Geral',
                            href: '/',
                        },
                        {
                            id: 1,
                            name: 'Controladores',
                            href: '/controllers',
                        },
                        {
                            id: 1,
                            name: 'Dispositivos',
                            href: '/devices',
                        },
                        {
                            id: 3,
                            name: 'Usuários',
                            href: '/users',
                        },
                    ]
                }
            ]
        },
    ]

    return NextResponse.json(mock);
}