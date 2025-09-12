# Testes Automatizados - DatabaseController

Este diretório contém testes automatizados para o `DatabaseController`, que gerencia controllers no banco de dados.

## 📋 O que são Testes Automatizados?

Testes automatizados são códigos que verificam se seu programa funciona corretamente sem você precisar testar manualmente. Eles são como "robôs" que testam seu código automaticamente!

## 🚀 Como Executar os Testes

### Executar todos os testes:
```bash
bun test
```

### Executar apenas os testes do DatabaseController:
```bash
bun test src/database/controllers/index.test.ts
```

### Executar testes em modo watch (recomendado durante desenvolvimento):
```bash
bun test --watch
```

## 📝 Estrutura dos Testes

### 1. **Singleton Pattern**
- Testa se o padrão Singleton funciona corretamente
- Verifica se sempre retorna a mesma instância

### 2. **initControllers**
- Testa a inicialização dos controllers
- Verifica se cria array vazio quando não existem controllers
- Verifica se mantém controllers existentes

### 3. **readControllers**
- Testa a leitura de todos os controllers
- Verifica se retorna lista vazia quando não há controllers
- Verifica se retorna todos os controllers corretamente

### 4. **addController**
- Testa a adição de novos controllers
- Verifica se não permite controllers com nomes duplicados
- Verifica se adiciona múltiplos controllers diferentes

### 5. **readControllerByName**
- Testa a busca de controller por nome
- Verifica se retorna `undefined` para controller inexistente

### 6. **removeControllers**
- Testa a remoção de todos os controllers
- Verifica se funciona quando não há controllers

### 7. **removeControllerByName**
- Testa a remoção de controller específico por nome
- Verifica se retorna `true` mesmo para controller inexistente
- Verifica se remove controller quando é o único

### 8. **Integração - Fluxo Completo**
- Testa todo o ciclo CRUD (Create, Read, Update, Delete)
- Simula um cenário real de uso

## 🔧 Como Funcionam os Testes

### Setup e Teardown
- **beforeEach**: Executa antes de cada teste
  - Faz backup do banco original
  - Cria banco de teste temporário
  - Configura mocks para não afetar dados reais

- **afterEach**: Executa depois de cada teste
  - Restaura banco original
  - Remove arquivos de teste
  - Limpa mocks

### Mocks
Os testes usam **mocks** (simulações) para:
- Não afetar o banco de dados real
- Controlar o comportamento do Database
- Garantir isolamento entre testes

### Assertions (Verificações)
- `expect(result).toBe(true)` - Verifica se valor é exatamente `true`
- `expect(controllers).toEqual([])` - Verifica se arrays são iguais
- `expect(controllers).toHaveLength(2)` - Verifica tamanho do array
- `expect(found).toBeUndefined()` - Verifica se valor é `undefined`

## 📊 Interpretando Resultados

### ✅ Teste Passou
```
✓ DatabaseController > addController > deve adicionar um novo controller
```
- O teste funcionou corretamente
- A funcionalidade está funcionando como esperado

### ❌ Teste Falhou
```
✗ DatabaseController > addController > deve adicionar um novo controller
  Expected: true
  Received: false
```
- O teste falhou
- Há um bug no código que precisa ser corrigido

## 🛠️ Como Criar Novos Testes

### 1. Estrutura Básica
```typescript
describe("Nome da Funcionalidade", () => {
    test("deve fazer algo específico", () => {
        // Arrange (Preparar)
        const controller = { name: "test", driverName: "modbus", startConfig: {} };
        
        // Act (Executar)
        const result = databaseController.addController(controller);
        
        // Assert (Verificar)
        expect(result).toBe(true);
    });
});
```

### 2. Padrão AAA
- **Arrange**: Preparar dados e configurações
- **Act**: Executar a ação que queremos testar
- **Assert**: Verificar se o resultado é o esperado

### 3. Nomes Descritivos
- Use nomes que descrevem o comportamento esperado
- Exemplo: "deve retornar erro quando nome está vazio"

## 🎯 Benefícios dos Testes

1. **Detectar Bugs**: Encontra problemas antes de chegar ao usuário
2. **Refatoração Segura**: Permite mudar código sem quebrar funcionalidades
3. **Documentação Viva**: Os testes mostram como usar o código
4. **Confiança**: Garante que o código funciona como esperado
5. **Desenvolvimento Mais Rápido**: Evita testes manuais repetitivos

## 🔍 Dicas para Testes Eficazes

1. **Teste um comportamento por vez**
2. **Use dados de teste simples e claros**
3. **Teste casos de borda (valores extremos)**
4. **Teste casos de erro**
5. **Mantenha testes independentes**
6. **Use nomes descritivos**

## 📚 Próximos Passos

1. Execute os testes: `bun test`
2. Experimente modificar um teste e veja como falha
3. Adicione novos testes para outras funcionalidades
4. Use `bun test --watch` durante desenvolvimento

---

**Lembre-se**: Testes são seu amigo! Eles te ajudam a escrever código melhor e mais confiável. 🚀 