'use client';

import { useUrlState } from '@/hooks/useUrlState';
import { useState, useEffect } from 'react';

/**
 * Exemplo de como usar URL State no React
 * Este componente demonstra como sincronizar estado com a URL
 */
export default function UrlStateExample() {
    const { getValue, setValue, setValues, removeValue, clearAll, hasValue } = useUrlState();
    
    // Estados locais sincronizados com a URL
    const [filtro, setFiltro] = useState(getValue('filtro', 'todos'));
    const [ordenacao, setOrdenacao] = useState(getValue('ordenacao', 'nome'));
    const [pagina, setPagina] = useState(parseInt(getValue('pagina', '1')));

    // Sincronizar estado local com URL quando a URL mudar
    useEffect(() => {
        setFiltro(getValue('filtro', 'todos'));
        setOrdenacao(getValue('ordenacao', 'nome'));
        setPagina(parseInt(getValue('pagina', '1')));
    }, [getValue]);

    // Função para atualizar filtro
    const handleFiltroChange = (novoFiltro: string) => {
        setFiltro(novoFiltro);
        setValue('filtro', novoFiltro);
        // Resetar página quando mudar filtro
        setValue('pagina', '1');
    };

    // Função para atualizar ordenação
    const handleOrdenacaoChange = (novaOrdenacao: string) => {
        setOrdenacao(novaOrdenacao);
        setValue('ordenacao', novaOrdenacao);
    };

    // Função para mudar página
    const handlePaginaChange = (novaPagina: number) => {
        setPagina(novaPagina);
        setValue('pagina', novaPagina.toString());
    };

    // Função para aplicar múltiplos filtros de uma vez
    const aplicarFiltrosAvancados = () => {
        setValues({
            filtro: 'ativos',
            ordenacao: 'data',
            pagina: '1'
        });
    };

    // Função para limpar todos os filtros
    const limparFiltros = () => {
        clearAll();
        setFiltro('todos');
        setOrdenacao('nome');
        setPagina(1);
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Exemplo de URL State</h2>
            
            {/* Status atual da URL */}
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Estado atual da URL:</h3>
                <p className="text-sm text-gray-600">
                    Filtro: {filtro} | Ordenação: {ordenacao} | Página: {pagina}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    URL atual: {typeof window !== 'undefined' ? window.location.href : ''}
                </p>
            </div>

            {/* Controles de filtro */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Filtro:</label>
                    <select 
                        value={filtro} 
                        onChange={(e) => handleFiltroChange(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="todos">Todos</option>
                        <option value="ativos">Ativos</option>
                        <option value="inativos">Inativos</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Ordenação:</label>
                    <select 
                        value={ordenacao} 
                        onChange={(e) => handleOrdenacaoChange(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="nome">Por Nome</option>
                        <option value="data">Por Data</option>
                        <option value="status">Por Status</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Página:</label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handlePaginaChange(Math.max(1, pagina - 1))}
                            disabled={pagina <= 1}
                            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            Anterior
                        </button>
                        <span className="px-3 py-1 bg-gray-200 rounded">
                            {pagina}
                        </span>
                        <button 
                            onClick={() => handlePaginaChange(pagina + 1)}
                            className="px-3 py-1 bg-blue-500 text-white rounded"
                        >
                            Próxima
                        </button>
                    </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 pt-4">
                    <button 
                        onClick={aplicarFiltrosAvancados}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        Aplicar Filtros Avançados
                    </button>
                    
                    <button 
                        onClick={limparFiltros}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                        Limpar Filtros
                    </button>
                </div>

                {/* Verificações de estado */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Verificações:</h4>
                    <ul className="text-sm space-y-1">
                        <li>• Tem filtro: {hasValue('filtro') ? 'Sim' : 'Não'}</li>
                        <li>• Tem ordenação: {hasValue('ordenacao') ? 'Sim' : 'Não'}</li>
                        <li>• Tem página: {hasValue('pagina') ? 'Sim' : 'Não'}</li>
                    </ul>
                </div>
            </div>

            {/* Explicação */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Como funciona:</h3>
                <ul className="text-sm space-y-1">
                    <li>• O estado é sincronizado automaticamente com a URL</li>
                    <li>• Você pode compartilhar a URL com os filtros aplicados</li>
                    <li>• O botão voltar/avançar do navegador funciona</li>
                    <li>• A página recarrega mantendo o estado</li>
                </ul>
            </div>
        </div>
    );
} 