# Configuração de Controladores

Esta página permite gerenciar controladores TCP/CLP (Controladores Lógicos Programáveis) no sistema de supervisão.

## O que são Controladores?

Controladores são dispositivos industriais que gerenciam equipamentos físicos através de comunicação TCP/IP. Eles possuem:

- **Endereço IP**: Localização na rede
- **Porta**: Geralmente 502 (Modbus TCP)
- **Driver**: Software específico para comunicação
- **Status**: Online/Offline em tempo real

## Interface Simplificada

### 📊 Tabela de Controladores

A tabela mostra as informações essenciais:

| Coluna | Descrição |
|--------|-----------|
| **Nome** | Identificação do controlador (ex: CLP1) |
| **Driver** | Tipo de driver (ex: mcp46a, mcp17) |
| **Endereço** | IP:Porta (ex: 192.168.0.240:502) |
| **Status** | Indicador visual centralizado |
| **Ações** | Botões Editar/Excluir (à direita) |

### 🎯 Indicador de Status

- **🟢 Verde pulsante**: Controlador online
- **🔴 Vermelho estático**: Controlador offline
- **Posição**: Centralizado na coluna
- **Tamanho**: Pequeno e discreto

## Funcionalidades

### 1. Visualizar Controladores
- Tabela limpa e organizada
- Status visual intuitivo
- Informações essenciais em foco

### 2. Adicionar Controlador
- Clique em "+ Adicionar Controlador"
- Preencha:
  - **Nome**: Identificação do controlador
  - **Driver**: Tipo de driver
  - **Endereço IP**: IP do controlador
  - **Porta**: Porta TCP (padrão: 502)

### 3. Editar Controlador
- Clique em "Editar" na linha do controlador
- Modifique as informações necessárias
- Salve as alterações

### 4. Excluir Controlador
- Clique em "Excluir" na linha do controlador
- Confirme a exclusão

## Exemplos de Configuração

### CLP1 (Online)
- **Nome**: CLP1
- **Driver**: mcp46a
- **IP**: 192.168.0.240
- **Porta**: 502
- **Status**: 🟢 Online

### CLP2 (Offline)
- **Nome**: CLP2
- **Driver**: mcp17
- **IP**: 192.168.1.100
- **Porta**: 502
- **Status**: 🔴 Offline

## Drivers Disponíveis

- **mcp46a**: Driver para controlador específico
- **mcp17**: Driver para outro tipo de controlador
- Outros drivers podem ser adicionados conforme necessário

## Design Responsivo

- ✅ Interface limpa e minimalista
- ✅ Indicadores visuais intuitivos
- ✅ Botões alinhados à direita
- ✅ Status centralizado
- ✅ Funciona em diferentes tamanhos de tela

## Dicas de Uso

1. **Monitore o status** regularmente para detectar problemas
2. **Use nomes descritivos** para facilitar identificação
3. **Verifique a conectividade** antes de adicionar um controlador
4. **Teste a comunicação** após configurar um novo controlador
5. **Mantenha os drivers atualizados** para melhor compatibilidade 