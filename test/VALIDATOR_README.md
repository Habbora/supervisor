# Validador de Schema e Config

Validador robusto para `configSchema` e configurações de usuário com estrutura exata e validação de tipos.

## 🎯 Características

✅ **Estrutura Exata** - Schema deve ter estrutura precisa
✅ **Validação de Tipos** - string, number, boolean, object, array
✅ **Campos Opcionais** - `required: true/false`
✅ **Valores Padrão** - Aplica `default` automaticamente
✅ **Validação de Range** - min/max para números
✅ **Validação de Tamanho** - minLength/maxLength para strings/arrays
✅ **Enum** - Valores permitidos
✅ **Pattern** - Regex para strings
✅ **Warnings** - Detecta campos extras no config
✅ **Erros Descritivos** - Mensagens claras

---

## 📋 Estrutura do ConfigSchema

Cada campo do schema **DEVE** ter esta estrutura exata:

```javascript
{
  fieldName: {
    name: string,        // ✅ OBRIGATÓRIO
    type: string,        // ✅ OBRIGATÓRIO ('string'|'number'|'boolean'|'object'|'array')
    required: boolean,   // ❌ OPCIONAL (default: false)
    default: any,        // ❌ OPCIONAL
    description: string, // ❌ OPCIONAL
    enum: array,         // ❌ OPCIONAL (valores permitidos)
    min: number,         // ❌ OPCIONAL (para type: 'number')
    max: number,         // ❌ OPCIONAL (para type: 'number')
    minLength: number,   // ❌ OPCIONAL (para type: 'string'|'array')
    maxLength: number,   // ❌ OPCIONAL (para type: 'string'|'array')
    pattern: string,     // ❌ OPCIONAL (regex para type: 'string')
  }
}
```

**Campos NÃO permitidos:**
- Qualquer campo fora da estrutura acima será **rejeitado**
- Exemplo: `customField`, `validation`, etc

---

## 🚀 Uso Básico

### 1. Importar

```javascript
const validator = require('./validator');
```

### 2. Validar Schema

```javascript
const schema = {
  host: {
    name: 'Host',
    type: 'string',
    required: true,
    default: '127.0.0.1',
  },
  port: {
    name: 'Port',
    type: 'number',
    required: true,
    min: 1,
    max: 65535,
  },
};

const result = validator.validateConfigSchema(schema);
// { valid: true, errors: [] }
```

### 3. Validar Config do Usuário

```javascript
const config = {
  host: '192.168.1.100',
  port: 502,
};

const result = validator.validateConfig(config, schema);
// { valid: true, errors: [], warnings: [] }
```

### 4. Validação Completa com Defaults

```javascript
const config = {
  port: 8080,
  // host vai usar default '127.0.0.1'
};

const result = validator.validate(schema, config);
console.log(result.config);
// { port: 8080, host: '127.0.0.1' }
```

---

## 📚 API

### `validateConfigSchema(schema)`

Valida a estrutura do configSchema.

**Retorna:**
```javascript
{
  valid: boolean,
  errors: string[]
}
```

**Exemplo:**
```javascript
const result = validator.validateConfigSchema({
  host: {
    type: 'string', // ❌ Falta 'name' (obrigatório)
  }
});
// { valid: false, errors: ['Campo "host.name" é obrigatório'] }
```

---

### `validateConfig(config, schema)`

Valida config do usuário contra o schema.

**Retorna:**
```javascript
{
  valid: boolean,
  errors: string[],
  warnings: string[]
}
```

**Exemplo:**
```javascript
const result = validator.validateConfig(
  { port: '502' }, // ❌ String ao invés de number
  { port: { name: 'Port', type: 'number', required: true } }
);
// { valid: false, errors: ['Campo "port" deve ser do tipo "number"...'] }
```

---

### `applyDefaults(config, schema)`

Aplica valores default do schema ao config.

**Retorna:** `object` (config com defaults)

**Exemplo:**
```javascript
const result = validator.applyDefaults(
  { port: 8080 },
  {
    host: { name: 'Host', type: 'string', default: '127.0.0.1' },
    port: { name: 'Port', type: 'number', required: true },
  }
);
// { port: 8080, host: '127.0.0.1' }
```

---

### `validate(schema, config)`

Validação completa: valida schema + aplica defaults + valida config.

**Retorna:**
```javascript
{
  valid: boolean,
  errors: string[],
  warnings: string[],
  config: object | null
}
```

**Exemplo:**
```javascript
const result = validator.validate(schema, config);
if (result.valid) {
  console.log('Config válido:', result.config);
} else {
  console.error('Erros:', result.errors);
}
```

---

## 🔍 Exemplos de Validação

### ✅ Tipo

```javascript
// ✅ Válido
{ host: '192.168.1.100' } // type: 'string'

// ❌ Inválido
{ host: 123 } // Esperado string, recebeu number
```

### ✅ Required

```javascript
// Schema
{ host: { name: 'Host', type: 'string', required: true } }

// ❌ Inválido
{} // Campo obrigatório ausente
```

### ✅ Enum

```javascript
// Schema
{ mode: { name: 'Mode', type: 'string', enum: ['master', 'slave'] } }

// ✅ Válido
{ mode: 'master' }

// ❌ Inválido
{ mode: 'client' } // Não está em [master, slave]
```

### ✅ Min/Max

```javascript
// Schema
{ port: { name: 'Port', type: 'number', min: 1, max: 65535 } }

// ✅ Válido
{ port: 502 }

// ❌ Inválido
{ port: 99999 } // Maior que max
{ port: -1 } // Menor que min
```

### ✅ MinLength/MaxLength

```javascript
// Schema
{ username: { name: 'User', type: 'string', minLength: 3, maxLength: 20 } }

// ✅ Válido
{ username: 'john' }

// ❌ Inválido
{ username: 'ab' } // Muito curto (< 3)
{ username: 'a'.repeat(30) } // Muito longo (> 20)
```

### ✅ Pattern (Regex)

```javascript
// Schema
{
  email: {
    name: 'Email',
    type: 'string',
    pattern: '^[^@]+@[^@]+\\.[^@]+$'
  }
}

// ✅ Válido
{ email: 'user@example.com' }

// ❌ Inválido
{ email: 'invalid-email' }
```

---

## ⚠️ Warnings vs Errors

### Errors
Impedem a validação (valid: false):
- Tipo errado
- Campo obrigatório ausente
- Valor fora do range
- Valor não está no enum
- Pattern não corresponde

### Warnings
Apenas alertam (valid: true):
- Campos extras no config (não definidos no schema)

```javascript
const result = validator.validateConfig(
  { host: '192.168.1.100', extraField: 'ops' },
  { host: { name: 'Host', type: 'string' } }
);

// result.valid === true
// result.warnings === ['Campo "extraField" não está definido no schema...']
```

---

## 🎯 Uso com Drivers

### Validar antes de onInit

```javascript
const driver = require('./modbus-tcp-client-v2');

const config = {
  host: '192.168.1.100',
  port: 502,
};

// Valida config
const validation = validator.validate(driver.configSchema, config);

if (!validation.valid) {
  console.error('Config inválido:', validation.errors);
  process.exit(1);
}

// Usa config validado com defaults
const instance = await driver.onInit(system, validation.config);
```

---

## 🔒 Segurança

O validador garante que:

1. **Schema tem estrutura exata** - Nenhum campo extra permitido
2. **Tipos são validados** - Sem conversão automática de tipos
3. **Ranges são respeitados** - min/max, minLength/maxLength
4. **Enums são enforced** - Apenas valores permitidos
5. **Patterns são checados** - Regex validation

---

## 📊 Tipos Suportados

| Tipo | Validações | Exemplo |
|------|-----------|---------|
| `string` | minLength, maxLength, pattern | `"texto"` |
| `number` | min, max | `123`, `45.67` |
| `boolean` | - | `true`, `false` |
| `object` | - | `{ key: 'value' }` |
| `array` | minLength, maxLength | `[1, 2, 3]` |

---

## 🧪 Testes

Execute os testes completos:

```bash
bun run test-validator.ts
```

Testes incluem:
- Schema válido/inválido
- Config válido/inválido
- Defaults
- Tipos
- Required
- Enum
- Min/Max
- MinLength/MaxLength
- Pattern
- Warnings
- Integração com driver real

---

## 💡 Dicas

1. **Sempre valide o schema primeiro** antes de validar configs
2. **Use `validate()` ao invés de `validateConfig()`** para aplicar defaults
3. **Trate warnings** - Podem indicar typos nos nomes dos campos
4. **Use pattern com cuidado** - Regex complexos podem ser lentos
5. **Defina min/max** - Evita valores absurdos

---

## 🔮 Próximos Passos

- [ ] Suporte a schemas aninhados (nested objects)
- [ ] Validação customizada (custom validators)
- [ ] Transformações (coerce types)
- [ ] Async validation
- [ ] Schema versioning
- [ ] JSON Schema compatibility

---

## 📝 Licença

MIT - Use como quiser!
