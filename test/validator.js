// validator.ts
var VALID_TYPES = ["string", "number", "boolean", "object", "array", "any"];
var SCHEMA_FIELD_STRUCTURE = {
  name: { type: "string", required: true },
  type: { type: "string", required: true, enum: VALID_TYPES },
  required: { type: "boolean", required: false },
  default: { type: "any", required: false },
  description: { type: "string", required: false },
  enum: { type: "array", required: false },
  min: { type: "number", required: false },
  max: { type: "number", required: false },
  minLength: { type: "number", required: false },
  maxLength: { type: "number", required: false },
  pattern: { type: "string", required: false }
};
var validateType = (value, type) => {
  if (type === "any")
    return true;
  const actualType = Array.isArray(value) ? "array" : typeof value;
  if (type === "array") {
    return Array.isArray(value);
  }
  return actualType === type;
};
var validateSchemaField = (fieldName, fieldDef) => {
  const errors = [];
  if (typeof fieldDef !== "object" || fieldDef === null || Array.isArray(fieldDef)) {
    return {
      valid: false,
      errors: [`Campo "${fieldName}" deve ser um objeto`]
    };
  }
  for (const [key, rules] of Object.entries(SCHEMA_FIELD_STRUCTURE)) {
    if (rules.required && !(key in fieldDef)) {
      errors.push(`Campo "${fieldName}.${key}" é obrigatório`);
    }
  }
  for (const key of Object.keys(fieldDef)) {
    if (!(key in SCHEMA_FIELD_STRUCTURE)) {
      errors.push(`Campo "${fieldName}.${key}" não é permitido na estrutura do schema`);
    }
  }
  for (const [key, value] of Object.entries(fieldDef)) {
    const rules = SCHEMA_FIELD_STRUCTURE[key];
    if (!rules)
      continue;
    if (!validateType(value, rules.type)) {
      errors.push(`Campo "${fieldName}.${key}" deve ser do tipo "${rules.type}", mas recebeu "${typeof value}"`);
    }
    if (key === "type" && rules.enum && !rules.enum.includes(value)) {
      errors.push(`Campo "${fieldName}.type" deve ser um de [${rules.enum.join(", ")}], mas recebeu "${value}"`);
    }
  }
  if (fieldDef.enum && !Array.isArray(fieldDef.enum)) {
    errors.push(`Campo "${fieldName}.enum" deve ser um array`);
  }
  if (fieldDef.min !== undefined && fieldDef.max !== undefined) {
    if (fieldDef.min > fieldDef.max) {
      errors.push(`Campo "${fieldName}.min" (${fieldDef.min}) não pode ser maior que max (${fieldDef.max})`);
    }
  }
  if (fieldDef.minLength !== undefined && fieldDef.maxLength !== undefined) {
    if (fieldDef.minLength > fieldDef.maxLength) {
      errors.push(`Campo "${fieldName}.minLength" (${fieldDef.minLength}) não pode ser maior que maxLength (${fieldDef.maxLength})`);
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
};
var validateConfigSchema = (schema) => {
  const errors = [];
  if (typeof schema !== "object" || schema === null || Array.isArray(schema)) {
    return {
      valid: false,
      errors: ["configSchema deve ser um objeto"]
    };
  }
  if (Object.keys(schema).length === 0) {
    return {
      valid: false,
      errors: ["configSchema não pode estar vazio"]
    };
  }
  for (const [fieldName, fieldDef] of Object.entries(schema)) {
    const result = validateSchemaField(fieldName, fieldDef);
    if (!result.valid) {
      errors.push(...result.errors);
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
};
var validateFieldValue = (fieldName, value, fieldDef) => {
  const errors = [];
  if (fieldDef.required && (value === undefined || value === null)) {
    errors.push(`Campo "${fieldName}" é obrigatório`);
    return { valid: false, errors };
  }
  if (value === undefined || value === null) {
    return { valid: true, errors: [] };
  }
  if (!validateType(value, fieldDef.type)) {
    errors.push(`Campo "${fieldName}" deve ser do tipo "${fieldDef.type}", mas recebeu "${Array.isArray(value) ? "array" : typeof value}"`);
    return { valid: false, errors };
  }
  if (fieldDef.enum && !fieldDef.enum.includes(value)) {
    errors.push(`Campo "${fieldName}" deve ser um de [${fieldDef.enum.join(", ")}], mas recebeu "${value}"`);
  }
  if (fieldDef.type === "number") {
    if (fieldDef.min !== undefined && value < fieldDef.min) {
      errors.push(`Campo "${fieldName}" deve ser >= ${fieldDef.min}, mas recebeu ${value}`);
    }
    if (fieldDef.max !== undefined && value > fieldDef.max) {
      errors.push(`Campo "${fieldName}" deve ser <= ${fieldDef.max}, mas recebeu ${value}`);
    }
  }
  if (fieldDef.type === "string" || fieldDef.type === "array") {
    const length = value.length;
    if (fieldDef.minLength !== undefined && length < fieldDef.minLength) {
      errors.push(`Campo "${fieldName}" deve ter comprimento >= ${fieldDef.minLength}, mas tem ${length}`);
    }
    if (fieldDef.maxLength !== undefined && length > fieldDef.maxLength) {
      errors.push(`Campo "${fieldName}" deve ter comprimento <= ${fieldDef.maxLength}, mas tem ${length}`);
    }
  }
  if (fieldDef.type === "string" && fieldDef.pattern) {
    const regex = new RegExp(fieldDef.pattern);
    if (!regex.test(value)) {
      errors.push(`Campo "${fieldName}" não corresponde ao padrão /${fieldDef.pattern}/`);
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
};
var validateConfig = (config, schema) => {
  const errors = [];
  const warnings = [];
  if (typeof config !== "object" || config === null || Array.isArray(config)) {
    return {
      valid: false,
      errors: ["config deve ser um objeto"],
      warnings: []
    };
  }
  for (const [fieldName, fieldDef] of Object.entries(schema)) {
    const value = config[fieldName];
    const result = validateFieldValue(fieldName, value, fieldDef);
    if (!result.valid) {
      errors.push(...result.errors);
    }
  }
  for (const fieldName of Object.keys(config)) {
    if (!(fieldName in schema)) {
      warnings.push(`Campo "${fieldName}" não está definido no schema e será ignorado`);
    }
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};
var applyDefaults = (config, schema) => {
  const result = { ...config };
  for (const [fieldName, fieldDef] of Object.entries(schema)) {
    if (!(fieldName in result) && "default" in fieldDef) {
      result[fieldName] = fieldDef.default;
    }
  }
  return result;
};
var validate = (schema, config) => {
  const errors = [];
  const warnings = [];
  const schemaValidation = validateConfigSchema(schema);
  if (!schemaValidation.valid) {
    return {
      valid: false,
      errors: ["Schema inválido:", ...schemaValidation.errors],
      warnings: [],
      config: null
    };
  }
  const configWithDefaults = applyDefaults(config, schema);
  const configValidation = validateConfig(configWithDefaults, schema);
  return {
    valid: configValidation.valid,
    errors: configValidation.errors,
    warnings: configValidation.warnings,
    config: configWithDefaults
  };
};
var validator_default = {
  validateConfigSchema,
  validateSchemaField,
  validateFieldValue,
  validateConfig,
  applyDefaults,
  validate
};
export {
  validateSchemaField,
  validateFieldValue,
  validateConfigSchema,
  validateConfig,
  validate,
  validator_default as default,
  applyDefaults
};
