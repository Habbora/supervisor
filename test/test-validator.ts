const validator = require('./validator');

console.log('='.repeat(70));
console.log('🧪 TESTE: Validador de Schema e Config');
console.log('='.repeat(70));

// === TESTE 1: Schema Válido ===
console.log('\n=== TESTE 1: Schema Válido ===\n');

const validSchema = {
  host: {
    name: 'Host',
    type: 'string',
    required: true,
    default: '127.0.0.1',
    description: 'Endereço IP',
  },
  port: {
    name: 'Port',
    type: 'number',
    required: true,
    default: 502,
    min: 1,
    max: 65535,
  },
  timeout: {
    name: 'Timeout',
    type: 'number',
    default: 5000,
    min: 0,
  },
  mode: {
    name: 'Mode',
    type: 'string',
    enum: ['master', 'slave'],
    default: 'master',
  },
};

const schemaResult = validator.validateConfigSchema(validSchema);
console.log('Resultado:', schemaResult);

// === TESTE 2: Schema Inválido (campo sem 'name') ===
console.log('\n=== TESTE 2: Schema Inválido (falta campo obrigatório) ===\n');

const invalidSchema1 = {
  host: {
    // Falta 'name' (obrigatório)
    type: 'string',
    required: true,
  },
};

const schemaResult2 = validator.validateConfigSchema(invalidSchema1);
console.log('Resultado:', schemaResult2);

// === TESTE 3: Schema Inválido (tipo inválido) ===
console.log('\n=== TESTE 3: Schema Inválido (tipo inválido) ===\n');

const invalidSchema2 = {
  port: {
    name: 'Port',
    type: 'integer', // ❌ Tipo inválido! Deveria ser 'number'
    required: true,
  },
};

const schemaResult3 = validator.validateConfigSchema(invalidSchema2);
console.log('Resultado:', schemaResult3);

// === TESTE 4: Schema Inválido (campo extra não permitido) ===
console.log('\n=== TESTE 4: Schema Inválido (campo extra não permitido) ===\n');

const invalidSchema3 = {
  host: {
    name: 'Host',
    type: 'string',
    required: true,
    customField: 'invalid', // ❌ Campo não permitido
  },
};

const schemaResult4 = validator.validateConfigSchema(invalidSchema3);
console.log('Resultado:', schemaResult4);

// === TESTE 5: Config Válido ===
console.log('\n=== TESTE 5: Config Válido ===\n');

const validConfig = {
  host: '192.168.1.100',
  port: 502,
  timeout: 10000,
  mode: 'master',
};

const configResult = validator.validateConfig(validConfig, validSchema);
console.log('Resultado:', configResult);

// === TESTE 6: Config com valores default ===
console.log('\n=== TESTE 6: Config com valores default ===\n');

const partialConfig = {
  // host vai usar default '127.0.0.1'
  port: 8080,
  // timeout vai usar default 5000
  // mode vai usar default 'master'
};

const fullValidation = validator.validate(validSchema, partialConfig);
console.log('Resultado:', fullValidation);
console.log('Config final:', fullValidation.config);

// === TESTE 7: Config Inválido (tipo errado) ===
console.log('\n=== TESTE 7: Config Inválido (tipo errado) ===\n');

const invalidConfig1 = {
  host: '192.168.1.100',
  port: '502', // ❌ String ao invés de number
  timeout: 5000,
};

const configResult2 = validator.validateConfig(invalidConfig1, validSchema);
console.log('Resultado:', configResult2);

// === TESTE 8: Config Inválido (campo obrigatório faltando) ===
console.log('\n=== TESTE 8: Config Inválido (campo obrigatório faltando) ===\n');

const invalidConfig2 = {
  // host é obrigatório mas não foi fornecido
  port: 502,
};

const configResult3 = validator.validateConfig(invalidConfig2, validSchema);
console.log('Resultado:', configResult3);

// === TESTE 9: Config Inválido (valor fora do range) ===
console.log('\n=== TESTE 9: Config Inválido (valor fora do range) ===\n');

const invalidConfig3 = {
  host: '192.168.1.100',
  port: 99999, // ❌ Maior que max (65535)
  timeout: -100, // ❌ Menor que min (0)
};

const configResult4 = validator.validateConfig(invalidConfig3, validSchema);
console.log('Resultado:', configResult4);

// === TESTE 10: Config Inválido (enum) ===
console.log('\n=== TESTE 10: Config Inválido (valor não está no enum) ===\n');

const invalidConfig4 = {
  host: '192.168.1.100',
  port: 502,
  mode: 'client', // ❌ Não é 'master' nem 'slave'
};

const configResult5 = validator.validateConfig(invalidConfig4, validSchema);
console.log('Resultado:', configResult5);

// === TESTE 11: Config com campos extras (warning) ===
console.log('\n=== TESTE 11: Config com campos extras (warning) ===\n');

const configWithExtras = {
  host: '192.168.1.100',
  port: 502,
  extraField: 'isso vai gerar warning', // ⚠️ Campo não definido no schema
  anotherExtra: 123,
};

const configResult6 = validator.validateConfig(configWithExtras, validSchema);
console.log('Resultado:', configResult6);

// === TESTE 12: Schema com pattern (regex) ===
console.log('\n=== TESTE 12: Validação com Pattern (regex) ===\n');

const schemaWithPattern = {
  email: {
    name: 'Email',
    type: 'string',
    required: true,
    pattern: '^[^@]+@[^@]+\\.[^@]+$',
    description: 'Email válido',
  },
  ipAddress: {
    name: 'IP Address',
    type: 'string',
    pattern: '^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$',
  },
};

const configPattern1 = {
  email: 'user@example.com', // ✅ Válido
  ipAddress: '192.168.1.100', // ✅ Válido
};

const configPattern2 = {
  email: 'invalid-email', // ❌ Inválido
  ipAddress: '999.999.999.999', // ⚠️ Tecnicamente válido no regex, mas IP inválido
};

console.log('Config 1 (válido):', validator.validateConfig(configPattern1, schemaWithPattern));
console.log('\nConfig 2 (inválido):', validator.validateConfig(configPattern2, schemaWithPattern));

// === TESTE 13: Schema com minLength/maxLength ===
console.log('\n=== TESTE 13: Validação com minLength/maxLength ===\n');

const schemaWithLength = {
  username: {
    name: 'Username',
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 20,
  },
  tags: {
    name: 'Tags',
    type: 'array',
    minLength: 1,
    maxLength: 5,
  },
};

const configLength1 = {
  username: 'ab', // ❌ Muito curto (< 3)
  tags: ['a', 'b', 'c', 'd', 'e', 'f'], // ❌ Muito longo (> 5)
};

const configLength2 = {
  username: 'validuser', // ✅ OK
  tags: ['javascript', 'nodejs'], // ✅ OK
};

console.log('Config 1 (inválido):', validator.validateConfig(configLength1, schemaWithLength));
console.log('\nConfig 2 (válido):', validator.validateConfig(configLength2, schemaWithLength));

// === TESTE 14: Teste com Driver Real ===
console.log('\n=== TESTE 14: Validação com Schema de Driver Real ===\n');

const modbusDriver = require('./modbus-tcp-client-v2');

const driverConfig1 = {
  host: '192.168.1.100',
  port: 502,
  unitId: 1,
};

const driverConfig2 = {
  host: 123, // ❌ Deveria ser string
  port: '502', // ❌ Deveria ser number
};

console.log('Driver config 1 (válido):');
const driverValidation1 = validator.validate(modbusDriver.configSchema, driverConfig1);
console.log(driverValidation1);

console.log('\nDriver config 2 (inválido):');
const driverValidation2 = validator.validate(modbusDriver.configSchema, driverConfig2);
console.log(driverValidation2);

console.log('\n' + '='.repeat(70));
console.log('✅ Testes Concluídos!');
console.log('='.repeat(70));
