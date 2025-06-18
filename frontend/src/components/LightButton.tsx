import { useDashboard } from '../contexts/DashboardContext';

interface LightButtonProps {
  lightId: number;
  name: string;
}

export function LightButton({ lightId, name }: LightButtonProps) {
  const { setToggleLight, lightGroups } = useDashboard();
  
  // Encontra o status atual da lâmpada
  const lightStatus = lightGroups
    .flatMap(group => group.lights)
    .find(light => light.id === lightId)?.status ?? 0;

  return (
    <button 
      onClick={() => setToggleLight(lightId)}
      style={{
        padding: '10px 20px',
        backgroundColor: lightStatus > 0 ? 'yellow' : 'gray',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      {name} - {lightStatus > 0 ? 'Ligada' : 'Desligada'}
    </button>
  );
} 