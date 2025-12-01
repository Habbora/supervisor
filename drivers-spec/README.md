# Driver Specification

Especificações organizadas para o sistema de drivers e endpoints.

## 📁 Estrutura de Pastas

```
drivers-spec/
├── 01-basic-concept/          # Conceitos básicos e arquitetura
│   ├── ARCHITECTURE.md         # Arquitetura geral do sistema
│   ├── compiler.md             # Como funciona o compilador
│   └── example-usage.md        # Exemplos de uso da API
│
├── 02-endpoint-types/          # Tipos de endpoints (DO, DI, AO, AI)
│   ├── DO-DI-AO-AI.ts          # Definições dos tipos
│   └── README.md               # Documentação dos tipos
│
├── 03-binding-architecture/    # Arquitetura de bindings
│   ├── binding-architecture.ts # Tipos e decorators de bindings
│   └── README.md               # Conceito de bindings
│
└── 04-examples/                # Exemplos práticos
    ├── driver-modbus-example.ts        # Driver Modbus TCP
    ├── endpoint-digital-output-example.ts  # Endpoint DO
    └── usage-flow.md                   # Fluxo completo de uso
```

## 🎯 Conceito Principal

### Sistema de Bindings Plug-and-Play

**Driver** exporta **Bindings** (protocolo de comunicação)
**Endpoint** consome **Bindings** (lógica de dispositivo)

```
Driver Modbus TCP
  └─ Exporta: modbus_coil (BooleanBinding)
            ↓ conecta
Endpoint DO (Bomba Principal)
  └─ Config: address = 5
  └─ setOn() → binding.write(5, true) → Modbus TCP
```

## 📋 Tipos de Endpoints

### Digital
- **DO** - Digital Output (Saída digital: relés, switches)
- **DI** - Digital Input (Entrada digital: sensores, botões)

### Analog
- **AO** - Analog Output (Saída analógica: 0-10V, 4-20mA)
- **AI** - Analog Input (Entrada analógica: sensores)

### Especiais
- **Dimmer** - Controle de intensidade (0-100%)
- **Counter** - Contador de pulsos
- **Register** - Registrador genérico

## 🚀 Início Rápido

### 1. Entenda o Conceito
Leia: [01-basic-concept/ARCHITECTURE.md](./01-basic-concept/ARCHITECTURE.md)

### 2. Veja os Tipos
Leia: [02-endpoint-types/DO-DI-AO-AI.ts](./02-endpoint-types/DO-DI-AO-AI.ts)

### 3. Entenda Bindings
Leia: [03-binding-architecture/README.md](./03-binding-architecture/README.md)

### 4. Veja Exemplos
Leia: [04-examples/usage-flow.md](./04-examples/usage-flow.md)

## 📖 Documentação Detalhada

### Conceitos Básicos
- **[ARCHITECTURE.md](./01-basic-concept/ARCHITECTURE.md)** - Visão geral da arquitetura
- **[compiler.md](./01-basic-concept/compiler.md)** - Como compilar drivers
- **[example-usage.md](./01-basic-concept/example-usage.md)** - Exemplos de API

### Tipos e Interfaces
- **[DO-DI-AO-AI.ts](./02-endpoint-types/DO-DI-AO-AI.ts)** - Todos os tipos de endpoints

### Bindings
- **[binding-architecture.ts](./03-binding-architecture/binding-architecture.ts)** - Sistema de bindings

### Exemplos Práticos
- **[driver-modbus-example.ts](./04-examples/driver-modbus-example.ts)** - Driver Modbus completo
- **[endpoint-digital-output-example.ts](./04-examples/endpoint-digital-output-example.ts)** - Endpoint DO
- **[usage-flow.md](./04-examples/usage-flow.md)** - Fluxo de uso completo

## 💡 Exemplo Rápido

### Driver exporta binding:
```typescript
@Driver({ name: "Modbus TCP", version: "1.0.0" })
export class ModbusTCPDriver {

  @ExportBooleanBinding({ name: "modbus_coil" })
  async coilBinding() {
    return {
      read: (address) => { /* Modbus read */ },
      write: (address, value) => { /* Modbus write */ }
    };
  }
}
```

### Endpoint usa binding:
```typescript
@Endpoint({ name: "DO Generic", type: "DO" })
export class DOEndpoint implements DO {

  @RequireBinding({ compatible: ["modbus_coil"] })
  private binding!: BooleanBinding;

  @Config({ name: "Address", type: "number" })
  private address = 0;

  async setOn() {
    await this.binding.write(this.address, true);
  }

  async setOff() {
    await this.binding.write(this.address, false);
  }
}
```

## ✅ Vantagens

✅ **Plug-and-Play** - Endpoints compatíveis com qualquer driver
✅ **Type-Safe** - Contratos garantidos em TypeScript
✅ **Flexível** - Fácil adicionar novos protocolos
✅ **Reutilizável** - Mesma lógica para diferentes protocolos
✅ **Testável** - Mock bindings para testes

## 🎓 Próximos Passos

1. ✅ Definir tipos de endpoints (DO, DI, AO, AI)
2. ✅ Criar sistema de bindings
3. ✅ Documentar arquitetura
4. ⏳ Implementar compilador
5. ⏳ Implementar runtime
6. ⏳ Criar API backend
7. ⏳ Integrar com frontend
