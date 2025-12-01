# Binding Architecture

Arquitetura de bindings plug-and-play.

## Conceito

**Driver** exporta **Bindings** (interfaces de protocolo)
**Endpoint** consome **Bindings** (lógica de dispositivo)

## Exemplo

```
Driver (Modbus TCP)
  └─ Exporta: modbus_coil (BooleanBinding)
            ↓
Endpoint (DO - "Bomba")
  └─ Usa: modbus_coil
  └─ Config: address = 5
  └─ Comando: setOn() → binding.write(5, true)
```

## Arquivos

- **[binding-types.ts](./binding-types.ts)** - Tipos de bindings
- **[decorators.ts](./decorators.ts)** - Decorators para drivers e endpoints
