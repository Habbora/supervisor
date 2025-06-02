export const endpointFormStructure = {
  base: [
    {
      name: "name",
      label: "Nome",
      type: "text",
      required: true
    },
    {
      name: "type",
      label: "Tipo",
      type: "select",
      options: ["modbus", "tcp", "udp", "http", "bacnet"],
      required: true
    }
  ],
  modbus: [
    {
      name: "address",
      label: "Endereço",
      type: "number",
      required: true
    },
    {
      name: "value",
      label: "Valor",
      type: "number",
      required: true
    }
  ],
  tcp: [
    {
      name: "host",
      label: "Host",
      type: "text",
      required: true
    },
    {
      name: "port",
      label: "Porta",
      type: "number",
      required: true
    },
    {
      name: "command",
      label: "Comando",
      type: "text",
      required: true
    }
  ],
  udp: [
    {
      name: "host",
      label: "Host",
      type: "text",
      required: true
    },
    {
      name: "port",
      label: "Porta",
      type: "number",
      required: true
    },
    {
      name: "command",
      label: "Comando",
      type: "text",
      required: true
    }
  ],
  http: [
    {
      name: "url",
      label: "URL",
      type: "text",
      required: true
    },
    {
      name: "method",
      label: "Método",
      type: "select",
      options: ["GET", "POST", "PUT", "DELETE"],
      required: true
    },
    {
      name: "headers",
      label: "Headers",
      type: "json",
      required: false
    },
    {
      name: "body",
      label: "Body",
      type: "textarea",
      required: false
    }
  ],
  bacnet: [
    {
      name: "host",
      label: "Host",
      type: "text",
      required: true
    },
    {
      name: "port",
      label: "Porta",
      type: "number",
      required: true
    },
    {
      name: "command",
      label: "Comando",
      type: "text",
      required: true
    }
  ]
}; 