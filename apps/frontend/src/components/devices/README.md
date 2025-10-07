# DeviceInputTable Component

## Descrição
O componente `DeviceInputTable` é uma tabela de formulário dinâmica que renderiza diferentes tipos de inputs baseados nos tipos definidos (string, number, boolean) dos inputs do device.

## Como Funciona

### 1. Tipos de Input Suportados
- **string**: Renderiza um campo de texto
- **number**: Renderiza um campo numérico
- **boolean**: Renderiza uma checkbox

### 2. Estrutura dos Dados
```typescript
interface DeviceInput {
    name: string;           // Nome único do input
    description: string;    // Descrição que aparece no label
    type: "string" | "number" | "boolean";
    value: string | number | boolean;
}
```

### 3. Uso Básico
```tsx
import DeviceInputTable, { DeviceInput } from './DeviceInputTable';

const [inputs, setInputs] = useState<DeviceInput[]>([
    {
        name: "temperature",
        description: "Temperatura do Sensor",
        type: "number",
        value: 25.5
    },
    {
        name: "isEnabled",
        description: "Dispositivo Ativo",
        type: "boolean",
        value: true
    }
]);

const handleChange = (name: string, value: string | number | boolean) => {
    setInputs(prev => 
        prev.map(input => 
            input.name === name 
                ? { ...input, value } 
                : input
        )
    );
};

<DeviceInputTable
    inputs={inputs}
    onChange={handleChange}
    title="Configurações do Dispositivo"
/>
```

### 4. Props
- `inputs`: Array de DeviceInput[] - Lista dos inputs a serem renderizados
- `onChange`: Função callback chamada quando um input muda
- `title`: String opcional - Título da seção (padrão: "Configurações do Dispositivo")

### 5. Características
- **Responsivo**: Grid que se adapta ao tamanho da tela
- **Tipagem Forte**: TypeScript para garantir tipos corretos
- **Validação**: Campos numéricos convertem automaticamente
- **Acessibilidade**: Labels associados corretamente aos inputs
- **Estilização**: Usa classes Tailwind CSS para aparência moderna

### 6. Integração com DeviceForm
O componente já está integrado no `DeviceForm` e será automaticamente renderizado quando o device tiver inputs definidos.

### 7. Exemplo Completo
Veja o arquivo `DeviceInputTable.example.tsx` para um exemplo completo de uso.
