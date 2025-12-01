# Form Components

Componentes de formulários reutilizáveis para o sistema.

## FormAddController

Formulário para criar/editar controllers com suporte a drivers dinâmicos.

### Props

```typescript
interface FormAddControllerProps {
    onServiceSubmit: (service: CreateControllerDTO) => void;
    initialData?: Controller;  // Para edição
    availableDrivers?: { name: string; driver: string }[];  // Drivers dinâmicos
}
```

### Uso Básico

```tsx
import { FormAddController } from '@/components/forms/form-create-controller';
import { useControllers } from '@/features/controllers/hooks/useControllers';
import { useDrivers } from '@/features/drivers/hooks';

function CreateControllerPage() {
    const { createController } = useControllers();
    const { drivers, isLoaded } = useDrivers();

    const handleSubmit = async (data: CreateControllerDTO) => {
        const controller = await createController(data);
        if (controller) {
            console.log('Controller criado:', controller);
        }
    };

    if (!isLoaded) {
        return <div>Carregando drivers...</div>;
    }

    return (
        <FormAddController
            onServiceSubmit={handleSubmit}
            availableDrivers={drivers}
        />
    );
}
```

### Edição

```tsx
function EditControllerPage({ controllerId }: { controllerId: string }) {
    const { getController, updateController } = useControllers();
    const { drivers } = useDrivers();
    const [controller, setController] = useState<Controller | null>(null);

    useEffect(() => {
        getController(controllerId).then(setController);
    }, [controllerId]);

    const handleSubmit = async (data: CreateControllerDTO) => {
        if (controller) {
            await updateController(controller.id, data);
        }
    };

    if (!controller) return <div>Carregando...</div>;

    return (
        <FormAddController
            onServiceSubmit={handleSubmit}
            initialData={controller}
            availableDrivers={drivers}
        />
    );
}
```

### Feedback ao Usuário

O formulário automaticamente:
- ✅ Mostra alerta se não houver drivers disponíveis
- ✅ Desabilita o botão submit quando não há drivers
- ✅ Seleciona o primeiro driver como padrão
- ✅ Valida campos obrigatórios
- ✅ Mostra dicas de uso

### Estados do Formulário

#### Sem Drivers
```tsx
// Nenhum driver disponível - mostra aviso
<FormAddController
    onServiceSubmit={handleSubmit}
    availableDrivers={[]}
/>
```

#### Com Drivers
```tsx
// Lista dinâmica de drivers instalados
<FormAddController
    onServiceSubmit={handleSubmit}
    availableDrivers={[
        { name: 'Modbus TCP', driver: 'modbus' },
        { name: 'MQTT', driver: 'mqtt' },
        { name: 'Custom Driver', driver: 'custom-v1' }
    ]}
/>
```

## Drivers Dinâmicos

Os drivers são carregados dinamicamente através do hook `useDrivers`:

```typescript
const { drivers, isLoaded, loading, error } = useDrivers();

// drivers: DriverInfo[] - Lista de drivers disponíveis
// isLoaded: boolean - Se já terminou de carregar
// loading: boolean - Se está carregando no momento
// error: string | null - Mensagem de erro se houver
```

### Estrutura de Driver

```typescript
interface DriverInfo {
    name: string;      // Nome amigável: "Modbus TCP"
    driver: string;    // ID do driver: "modbus"
    description?: string;  // Descrição opcional
    version?: string;  // Versão opcional
}
```

## Integração com Backend

Quando o DriverManager estiver implementado, os drivers serão carregados de:

```
GET /api/v1/drivers
Response: [
    {
        "name": "Modbus TCP",
        "driver": "modbus",
        "description": "Protocolo industrial Modbus TCP/IP",
        "version": "1.0.0"
    }
]
```

Até lá, o hook `useDrivers` retorna drivers mockados.
