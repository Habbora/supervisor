import { ControllerEndpoint } from '@/contexts/DashboardContext/types/controller/Controller.type';

interface ControllerEndpointsProps {
  endpoints: ControllerEndpoint[];
  className?: string;
}

export function ControllerEndpoints({ endpoints, className }: ControllerEndpointsProps) {
  const inputs = endpoints.filter(e => e.type === 'input');
  const outputs = endpoints.filter(e => e.type === 'output');

  return (
    <div className={className}>
      <div className="text-sm text-gray-900">
        {endpoints.length} endpoints
      </div>
      <div className="text-xs text-gray-500 mt-1">
        <span className="inline-flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          {inputs.length} entradas
        </span>
        <span className="mx-2">•</span>
        <span className="inline-flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          {outputs.length} saídas
        </span>
      </div>
      
      {endpoints.length > 0 && (
        <div className="mt-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            {inputs.length > 0 && (
              <div>
                <div className="font-medium text-blue-600 mb-1">Entradas:</div>
                {inputs.map((endpoint, index) => (
                  <div key={index} className="text-gray-600">
                    {endpoint.name} (addr: {endpoint.address})
                  </div>
                ))}
              </div>
            )}
            {outputs.length > 0 && (
              <div>
                <div className="font-medium text-green-600 mb-1">Saídas:</div>
                {outputs.map((endpoint, index) => (
                  <div key={index} className="text-gray-600">
                    {endpoint.name} (addr: {endpoint.address})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 