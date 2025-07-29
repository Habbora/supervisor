'use client'

import { useState } from 'react'

interface NetworkConfig {
    ipAddress: string
    subnetMask: string
    gateway: string
    primaryDNS: string
    secondaryDNS: string
    hostname: string
    dhcpEnabled: boolean
}

export default function SystemSettingsPage() {
    const [networkConfig, setNetworkConfig] = useState<NetworkConfig>({
        ipAddress: '192.168.1.100',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        primaryDNS: '8.8.8.8',
        secondaryDNS: '8.8.4.4',
        hostname: 'supervisor-system',
        dhcpEnabled: false
    })

    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [systemActionLoading, setSystemActionLoading] = useState<string | null>(null)

    const handleInputChange = (field: keyof NetworkConfig, value: string | boolean) => {
        setNetworkConfig(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const validateIP = (ip: string): boolean => {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        return ipRegex.test(ip)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage('')

        // Validação básica
        if (!validateIP(networkConfig.ipAddress)) {
            setMessage('Endereço IP inválido')
            setIsLoading(false)
            return
        }

        if (!validateIP(networkConfig.gateway)) {
            setMessage('Gateway inválido')
            setIsLoading(false)
            return
        }

        if (!validateIP(networkConfig.primaryDNS)) {
            setMessage('DNS primário inválido')
            setIsLoading(false)
            return
        }

        try {
            // Aqui você faria a chamada para a API do backend
            // const response = await fetch('/api/system/network', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(networkConfig)
            // })

            // Simulando uma resposta da API
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            setMessage('Configurações de rede atualizadas com sucesso!')
        } catch (error) {
            setMessage('Erro ao atualizar configurações de rede')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSystemAction = async (action: string) => {
        setSystemActionLoading(action)
        setMessage('')

        try {
            // Simulando chamada da API
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            setMessage(`Ação "${action}" executada com sucesso!`)
        } catch (error) {
            setMessage(`Erro ao executar ação "${action}"`)
        } finally {
            setSystemActionLoading(null)
        }
    }

    const systemActions = [
        {
            id: 'restart',
            label: 'Reiniciar Sistema',
            description: 'Reinicia o sistema completamente',
            icon: '🔄',
            color: 'bg-blue-600 hover:bg-blue-700',
            confirmMessage: 'Tem certeza que deseja reiniciar o sistema?'
        },
        {
            id: 'shutdown',
            label: 'Desligar Sistema',
            description: 'Desliga o sistema completamente',
            icon: '⏹️',
            color: 'bg-red-600 hover:bg-red-700',
            confirmMessage: 'Tem certeza que deseja desligar o sistema?'
        },
        {
            id: 'backup',
            label: 'Fazer Backup',
            description: 'Cria backup dos dados do sistema',
            icon: '💾',
            color: 'bg-green-600 hover:bg-green-700',
            confirmMessage: 'Deseja criar um backup agora?'
        },
        {
            id: 'update',
            label: 'Verificar Atualizações',
            description: 'Verifica se há atualizações disponíveis',
            icon: '🔄',
            color: 'bg-purple-600 hover:bg-purple-700',
            confirmMessage: 'Deseja verificar atualizações?'
        },
        {
            id: 'logs',
            label: 'Baixar Logs',
            description: 'Baixa os logs do sistema',
            icon: '📄',
            color: 'bg-gray-600 hover:bg-gray-700',
            confirmMessage: 'Deseja baixar os logs do sistema?'
        },
        {
            id: 'factory-reset',
            label: 'Reset de Fábrica',
            description: 'Restaura configurações padrão (CUIDADO!)',
            icon: '⚠️',
            color: 'bg-orange-600 hover:bg-orange-700',
            confirmMessage: 'ATENÇÃO: Isso apagará todas as configurações. Tem certeza?'
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
                <p className="text-gray-600 mt-2">Configure as configurações de rede e execute ações do sistema</p>
            </div>

            {/* Configurações de Rede */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Rede</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Configurações de IP */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                            Configurações de Rede
                        </h3>

                        {/* DHCP Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    DHCP Automático
                                </label>
                                <p className="text-xs text-gray-500">
                                    Ativar para obter IP automaticamente
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleInputChange('dhcpEnabled', !networkConfig.dhcpEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${networkConfig.dhcpEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${networkConfig.dhcpEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Campos de IP (desabilitados se DHCP estiver ativo) */}
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${networkConfig.dhcpEnabled ? 'opacity-50' : ''}`}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Endereço IP
                                </label>
                                <input
                                    type="text"
                                    value={networkConfig.ipAddress}
                                    onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                                    disabled={networkConfig.dhcpEnabled}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                    placeholder="192.168.1.100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Máscara de Sub-rede
                                </label>
                                <input
                                    type="text"
                                    value={networkConfig.subnetMask}
                                    onChange={(e) => handleInputChange('subnetMask', e.target.value)}
                                    disabled={networkConfig.dhcpEnabled}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                    placeholder="255.255.255.0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gateway
                                </label>
                                <input
                                    type="text"
                                    value={networkConfig.gateway}
                                    onChange={(e) => handleInputChange('gateway', e.target.value)}
                                    disabled={networkConfig.dhcpEnabled}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                    placeholder="192.168.1.1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome do Host
                                </label>
                                <input
                                    type="text"
                                    value={networkConfig.hostname}
                                    onChange={(e) => handleInputChange('hostname', e.target.value)}
                                    disabled={networkConfig.dhcpEnabled}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                    placeholder="supervisor-system"
                                />
                            </div>
                        </div>

                        {/* Configurações de DNS */}
                        <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900">Servidores DNS</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        DNS Primário
                                    </label>
                                    <input
                                        type="text"
                                        value={networkConfig.primaryDNS}
                                        onChange={(e) => handleInputChange('primaryDNS', e.target.value)}
                                        disabled={networkConfig.dhcpEnabled}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                        placeholder="8.8.8.8"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        DNS Secundário
                                    </label>
                                    <input
                                        type="text"
                                        value={networkConfig.secondaryDNS}
                                        onChange={(e) => handleInputChange('secondaryDNS', e.target.value)}
                                        disabled={networkConfig.dhcpEnabled}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                        placeholder="8.8.4.4"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mensagem de status */}
                    {message && (
                        <div className={`p-3 rounded-md ${message.includes('sucesso')
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                            {message}
                        </div>
                    )}

                    {/* Botões */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setNetworkConfig({
                                    ipAddress: '192.168.1.100',
                                    subnetMask: '255.255.255.0',
                                    gateway: '192.168.1.1',
                                    primaryDNS: '8.8.8.8',
                                    secondaryDNS: '8.8.4.4',
                                    hostname: 'supervisor-system',
                                    dhcpEnabled: false
                                })
                                setMessage('')
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Restaurar Padrão
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Ações do Sistema */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações do Sistema</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {systemActions.map((action) => (
                        <div key={action.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{action.icon}</span>
                                <button
                                    onClick={() => {
                                        if (confirm(action.confirmMessage)) {
                                            handleSystemAction(action.label)
                                        }
                                    }}
                                    disabled={systemActionLoading === action.id}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${action.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {systemActionLoading === action.id ? 'Executando...' : action.label}
                                </button>
                            </div>
                            <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
} 