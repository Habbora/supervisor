export type DeviceEndpoint = {
    name: string;
    type: "boolean" | "number" | "string";
    value?: any;
    controllerId?: string;
    endpointName?: string;
}

interface DeviceEndpointTableProps {
    endpoints: DeviceEndpoint[];
    controllers: any[];
    onChange: (name: string, controllerId: string, endpointName: string) => void;
    title?: string;
}

export default function DeviceEndpointTable({
    endpoints,
    controllers,
    onChange,
    title = "Configurações dos Endpoints"
}: DeviceEndpointTableProps) {

    const handleControllerChange = (endpointName: string, controllerId: string) => {
        const endpoint = endpoints.find(endpoint => endpoint.name === endpointName);
        if (!endpoint) return;

        if (controllerId === '') {
            onChange(endpointName, '', '');
            return;
        }
        
        onChange(endpointName, controllerId, endpoint.endpointName || '');
    };

    const handleEndpointChange = (endpointName: string, endpointNameValue: string) => {
        const endpoint = endpoints.find(endpoint => endpoint.name === endpointName);
        if (!endpoint) return;
        onChange(endpointName, endpoint.controllerId || '', endpointNameValue);
    };

    const renderInput = (endpoint: DeviceEndpoint) => {
        const { name } = endpoint;
        const currentValues = { controllerId: endpoint.controllerId || '', endpointName: endpoint.endpointName || '' };
        const selectedController = controllers.find(controller => controller.id === endpoint.controllerId);

        return (
            <div key={name} className="flex flex-col space-y-1">
                <h5 className="text-sm font-medium text-gray-700">{name.toUpperCase()}</h5>
                <div className="flex flex-row gap-4 w-full mb-4">
                    <div className="flex-1">
                        <label htmlFor={`${name}-controller`} className="block text-sm font-medium text-gray-700">
                            Controlador
                        </label>
                        <select
                            id={`${name}-controller`}
                            value={currentValues.controllerId}
                            onChange={(e) => handleControllerChange(name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecione um controlador</option>
                            {controllers.map((controller) => (
                                <option key={controller.id} value={controller.id}>
                                    {controller.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label htmlFor={`${name}-endpoint`} className="block text-sm font-medium text-gray-700">
                            Endpoint
                        </label>
                        <select
                            id={`${name}-endpoint`}
                            value={currentValues.endpointName}
                            onChange={(e) => handleEndpointChange(name, e.target.value)}
                            disabled={!currentValues.controllerId}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Selecione um endpoint</option>
                            {selectedController?.endpoints?.map((endpoint: any) => (
                                <option key={endpoint.id} value={endpoint.id}>
                                    {endpoint.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        );
    };

    if (!endpoints || endpoints.length === 0) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Nenhuma configuração disponível para este dispositivo.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                {endpoints.map(renderInput)}
            </div>
        </div>
    );
}
