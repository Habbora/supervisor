// --- Schema & Config Validator (TypeScript) ---

/**
 * Tipos válidos para campos do schema
 */
type ValidType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';

const VALID_TYPES: ValidType[] = ['string', 'number', 'boolean', 'object', 'array', 'any'];

/**
 * Definição de um campo do schema
 */
export interface SchemaFieldDefinition {
  name: string;
  type: ValidType;
  required?: boolean;
  default?: any;
  description?: string;
  enum?: any[];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

/**
 * ConfigSchema completo
 */
export interface ConfigSchema {
  [fieldName: string]: SchemaFieldDefinition;
}

/**
 * Resultado de validação
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Resultado de validação de config
 */
export interface ConfigValidationResult extends ValidationResult {
  warnings: string[];
}

/**
 * Resultado de validação completa
 */
export interface FullValidationResult extends ConfigValidationResult {
  config: any | null;
}

/**
 * Estrutura exata esperada para cada campo do configSchema
 */
interface SchemaFieldStructure {
  type: ValidType;
  required: boolean;
  enum?: any[];
}

const SCHEMA_FIELD_STRUCTURE: Record<string, SchemaFieldStructure> = {
  name: { type: 'string', required: true },
  type: { type: 'string', required: true, enum: VALID_TYPES },
  required: { type: 'boolean', required: false },
  default: { type: 'any', required: false },
  description: { type: 'string', required: false },
  enum: { type: 'array', required: false },
  min: { type: 'number', required: false },
  max: { type: 'number', required: false },
  minLength: { type: 'number', required: false },
  maxLength: { type: 'number', required: false },
  pattern: { type: 'string', required: false },
};

/**
 * Valida se um valor corresponde a um tipo
 */
const validateType = (value: any, type: ValidType): boolean => {
  if (type === 'any') return true;

  const actualType = Array.isArray(value) ? 'array' : typeof value;

  if (type === 'array') {
    return Array.isArray(value);
  }

  return actualType === type;
};

/**
 * Valida a estrutura de um campo do configSchema
 */
export const validateSchemaField = (
  fieldName: string,
  fieldDef: any
): ValidationResult => {
  const errors: string[] = [];

  // 1. Verifica se é um objeto
  if (typeof fieldDef !== 'object' || fieldDef === null || Array.isArray(fieldDef)) {
    return {
      valid: false,
      errors: [`Campo "${fieldName}" deve ser um objeto`],
    };
  }

  // 2. Verifica campos obrigatórios
  for (const [key, rules] of Object.entries(SCHEMA_FIELD_STRUCTURE)) {
    if (rules.required && !(key in fieldDef)) {
      errors.push(`Campo "${fieldName}.${key}" é obrigatório`);
    }
  }

  // 3. Verifica campos não permitidos
  for (const key of Object.keys(fieldDef)) {
    if (!(key in SCHEMA_FIELD_STRUCTURE)) {
      errors.push(`Campo "${fieldName}.${key}" não é permitido na estrutura do schema`);
    }
  }

  // 4. Valida tipos dos campos presentes
  for (const [key, value] of Object.entries(fieldDef)) {
    const rules = SCHEMA_FIELD_STRUCTURE[key];
    if (!rules) continue;

    if (!validateType(value, rules.type)) {
      errors.push(
        `Campo "${fieldName}.${key}" deve ser do tipo "${rules.type}", mas recebeu "${typeof value}"`
      );
    }

    // Valida enum se presente
    if (key === 'type' && rules.enum && !rules.enum.includes(value)) {
      errors.push(
        `Campo "${fieldName}.type" deve ser um de [${rules.enum.join(', ')}], mas recebeu "${value}"`
      );
    }
  }

  // 5. Validações específicas
  if (fieldDef.enum && !Array.isArray(fieldDef.enum)) {
    errors.push(`Campo "${fieldName}.enum" deve ser um array`);
  }

  if (fieldDef.min !== undefined && fieldDef.max !== undefined) {
    if (fieldDef.min > fieldDef.max) {
      errors.push(
        `Campo "${fieldName}.min" (${fieldDef.min}) não pode ser maior que max (${fieldDef.max})`
      );
    }
  }

  if (fieldDef.minLength !== undefined && fieldDef.maxLength !== undefined) {
    if (fieldDef.minLength > fieldDef.maxLength) {
      errors.push(
        `Campo "${fieldName}.minLength" (${fieldDef.minLength}) não pode ser maior que maxLength (${fieldDef.maxLength})`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida um configSchema completo
 */
export const validateConfigSchema = (schema: any): ValidationResult => {
  const errors: string[] = [];

  // 1. Verifica se é um objeto
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) {
    return {
      valid: false,
      errors: ['configSchema deve ser um objeto'],
    };
  }

  // 2. Verifica se está vazio
  if (Object.keys(schema).length === 0) {
    return {
      valid: false,
      errors: ['configSchema não pode estar vazio'],
    };
  }

  // 3. Valida cada campo
  for (const [fieldName, fieldDef] of Object.entries(schema)) {
    const result = validateSchemaField(fieldName, fieldDef);
    if (!result.valid) {
      errors.push(...result.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida um valor individual contra as regras do schema
 */
export const validateFieldValue = (
  fieldName: string,
  value: any,
  fieldDef: SchemaFieldDefinition
): ValidationResult => {
  const errors: string[] = [];

  // 1. Campo obrigatório
  if (fieldDef.required && (value === undefined || value === null)) {
    errors.push(`Campo "${fieldName}" é obrigatório`);
    return { valid: false, errors };
  }

  // Se não é obrigatório e está undefined, é válido
  if (value === undefined || value === null) {
    return { valid: true, errors: [] };
  }

  // 2. Tipo
  if (!validateType(value, fieldDef.type)) {
    errors.push(
      `Campo "${fieldName}" deve ser do tipo "${fieldDef.type}", mas recebeu "${
        Array.isArray(value) ? 'array' : typeof value
      }"`
    );
    return { valid: false, errors };
  }

  // 3. Enum
  if (fieldDef.enum && !fieldDef.enum.includes(value)) {
    errors.push(
      `Campo "${fieldName}" deve ser um de [${fieldDef.enum.join(', ')}], mas recebeu "${value}"`
    );
  }

  // 4. Min/Max (números)
  if (fieldDef.type === 'number') {
    if (fieldDef.min !== undefined && value < fieldDef.min) {
      errors.push(`Campo "${fieldName}" deve ser >= ${fieldDef.min}, mas recebeu ${value}`);
    }
    if (fieldDef.max !== undefined && value > fieldDef.max) {
      errors.push(`Campo "${fieldName}" deve ser <= ${fieldDef.max}, mas recebeu ${value}`);
    }
  }

  // 5. MinLength/MaxLength (strings e arrays)
  if (fieldDef.type === 'string' || fieldDef.type === 'array') {
    const length = value.length;
    if (fieldDef.minLength !== undefined && length < fieldDef.minLength) {
      errors.push(
        `Campo "${fieldName}" deve ter comprimento >= ${fieldDef.minLength}, mas tem ${length}`
      );
    }
    if (fieldDef.maxLength !== undefined && length > fieldDef.maxLength) {
      errors.push(
        `Campo "${fieldName}" deve ter comprimento <= ${fieldDef.maxLength}, mas tem ${length}`
      );
    }
  }

  // 6. Pattern (strings)
  if (fieldDef.type === 'string' && fieldDef.pattern) {
    const regex = new RegExp(fieldDef.pattern);
    if (!regex.test(value)) {
      errors.push(`Campo "${fieldName}" não corresponde ao padrão /${fieldDef.pattern}/`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida um config do usuário contra um configSchema
 */
export const validateConfig = (
  config: any,
  schema: ConfigSchema
): ConfigValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Verifica se config é um objeto
  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    return {
      valid: false,
      errors: ['config deve ser um objeto'],
      warnings: [],
    };
  }

  // 2. Valida campos do config
  for (const [fieldName, fieldDef] of Object.entries(schema)) {
    const value = config[fieldName];
    const result = validateFieldValue(fieldName, value, fieldDef);

    if (!result.valid) {
      errors.push(...result.errors);
    }
  }

  // 3. Detecta campos extras no config (não definidos no schema)
  for (const fieldName of Object.keys(config)) {
    if (!(fieldName in schema)) {
      warnings.push(`Campo "${fieldName}" não está definido no schema e será ignorado`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Aplica valores padrão do schema ao config
 */
export const applyDefaults = (config: any, schema: ConfigSchema): any => {
  const result = { ...config };

  for (const [fieldName, fieldDef] of Object.entries(schema)) {
    if (!(fieldName in result) && 'default' in fieldDef) {
      result[fieldName] = fieldDef.default;
    }
  }

  return result;
};

/**
 * Validação completa: schema + config com defaults
 */
export const validate = (schema: ConfigSchema, config: any): FullValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Valida o schema
  const schemaValidation = validateConfigSchema(schema);
  if (!schemaValidation.valid) {
    return {
      valid: false,
      errors: ['Schema inválido:', ...schemaValidation.errors],
      warnings: [],
      config: null,
    };
  }

  // 2. Aplica defaults
  const configWithDefaults = applyDefaults(config, schema);

  // 3. Valida o config
  const configValidation = validateConfig(configWithDefaults, schema);

  return {
    valid: configValidation.valid,
    errors: configValidation.errors,
    warnings: configValidation.warnings,
    config: configWithDefaults,
  };
};

// Export default
export default {
  validateConfigSchema,
  validateSchemaField,
  validateFieldValue,
  validateConfig,
  applyDefaults,
  validate,
};
