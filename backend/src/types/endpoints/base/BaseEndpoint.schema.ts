import { z } from "zod";

export const baseEndpointSchema = z.object({
  type: z.literal("endpoint"),
  connection: z.enum(["modbus", "tcp", "udp", "http", "bacnet"]),
  name: z.string()
});

export const modbusEndpointSchema = baseEndpointSchema.extend({
  type: z.literal("modbus"),
  endpointType: z.enum(["read", "write", "discrete", "pulse"]),
  functionCode: z.enum(["coil", "register"]),
  address: z.number(),
});

export const tcpEndpointSchema = baseEndpointSchema.extend({
  type: z.literal("tcp"),
  host: z.string(),
  port: z.number(),
  command: z.string()
});

export const udpEndpointSchema = baseEndpointSchema.extend({
  type: z.literal("udp"),
  host: z.string(),
  port: z.number(),
  command: z.string()
});

export const httpEndpointSchema = baseEndpointSchema.extend({
  type: z.literal("http"),
  url: z.string(),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  headers: z.record(z.string()).optional(),
  body: z.string().optional()
});

export const bacnetEndpointSchema = baseEndpointSchema.extend({
  type: z.literal("bacnet"),
  host: z.string(),
  port: z.number(),
  command: z.string()
});

// Schema discriminado para todos os tipos de endpoint
export const endpointSchema = z.discriminatedUnion("type", [
  modbusEndpointSchema,
  tcpEndpointSchema,
  udpEndpointSchema,
  httpEndpointSchema,
  bacnetEndpointSchema
]);


