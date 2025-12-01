# ✅ REFACTORING CHECKLIST

## 🎯 Objetivo
Migrar de **organização por tipo técnico** para **organização por feature/domínio**.

---

## ✅ Fase 1: Lights Feature (COMPLETO)

### Estrutura de Arquivos
- [x] Criar `apps/backend/src/features/lights/`
- [x] Criar `apps/backend/src/shared/event-bus/`
- [x] Mover EventBus para `shared/event-bus/index.ts`
- [x] Criar `light.types.ts` (autocontido, sem deps)
- [x] Criar `Light.ts` (LightDevice class)
- [x] Criar `LightService.ts` (Singleton)
- [x] Criar `light.routes.ts` (HTTP API)
- [x] Criar `index.ts` (barrel export)

### Documentação
- [x] `features/README.md` - Guia completo + template
- [x] `features/lights/ARCHITECTURE.md` - Arquitetura detalhada
- [x] `REFACTORING_SUMMARY.md` - Resumo da refatoração
- [x] `REFACTORING_CHECKLIST.md` - Este arquivo

### Integração
- [x] Atualizar `server.ts` com novo import
- [x] Testar imports funcionando
- [x] Verificar build (sem erros relacionados a lights)

### Tipos de Lâmpadas Implementados
- [x] LightSwitch (1 endpoint digital)
- [x] LightDimmer (1 endpoint analógico 0-100%)
- [x] LightRGB (3 endpoints analógicos 0-255)
- [x] LightRGBW (4 endpoints analógicos 0-255)

### API Endpoints Implementados
- [x] `GET /api/v1/lights`
- [x] `GET /api/v1/lights/:id`
- [x] `GET /api/v1/lights/type/:type`
- [x] `GET /api/v1/lights/status`
- [x] `POST /api/v1/lights/switch`
- [x] `POST /api/v1/lights/dimmer`
- [x] `POST /api/v1/lights/rgb`
- [x] `POST /api/v1/lights/rgbw`
- [x] `PATCH /api/v1/lights/:id`
- [x] `DELETE /api/v1/lights/:id`
- [x] `POST /api/v1/lights/:id/command`

### EventBus Integration
- [x] Escuta `endpoint_event` (atualizações do controller)
- [x] Escuta `light_cmd` (comandos via EventBus)
- [x] Publica `force_read_endpoint` (solicita valores)
- [x] Publica `light_value_changed` (notifica mudanças)
- [x] Publica `controller_action` (envia comandos)
- [x] Publica `light_created`, `light_updated`, `light_deleted`

---

## ⏳ Fase 2: Migrar Features Existentes

### Schedules
- [ ] Criar `features/schedules/`
- [ ] Mover de `src/features/schedules/` → `features/schedules/`
- [ ] Criar `schedule.types.ts` (consolidar tipos)
- [ ] Criar `schedule.routes.ts` (se não existe)
- [ ] Criar `index.ts` (barrel export)
- [ ] Atualizar imports em `server.ts`
- [ ] Atualizar imports em outros arquivos que usam Schedule
- [ ] Testar funcionamento

### Controllers
- [ ] Criar `features/controllers/`
- [ ] Mover de `src/services/controllers/` → `features/controllers/`
- [ ] Criar `controller.types.ts`
- [ ] Criar `Controller.ts` (domain model)
- [ ] Criar `ControllerService.ts`
- [ ] Criar `controller.routes.ts`
- [ ] Criar `index.ts` (barrel export)
- [ ] Atualizar imports
- [ ] Testar Modbus connection

### Devices (Genérico)
- [ ] Criar `features/devices/`
- [ ] Mover de `src/services/devices/` → `features/devices/`
- [ ] Consolidar `device.types.ts`
- [ ] Refatorar `Device.ts` (se necessário)
- [ ] Refatorar `DeviceService.ts`
- [ ] Criar `device.routes.ts`
- [ ] Criar `index.ts` (barrel export)
- [ ] Atualizar imports
- [ ] Testar CRUD

### Auth
- [ ] Criar `features/auth/`
- [ ] Mover arquivos de auth
- [ ] Criar `auth.types.ts`
- [ ] Criar `AuthService.ts` (se não existe)
- [ ] Consolidar `auth.routes.ts`
- [ ] Criar `index.ts` (barrel export)
- [ ] Atualizar imports
- [ ] Testar login/logout

### Dashboard
- [ ] Criar `features/dashboard/`
- [ ] Mover de `src/services/dashboard/` → `features/dashboard/`
- [ ] Criar `dashboard.types.ts`
- [ ] Criar `DashboardService.ts`
- [ ] Consolidar `dashboard.routes.ts`
- [ ] Criar `index.ts` (barrel export)
- [ ] Atualizar imports
- [ ] Testar endpoints

### Users
- [ ] Criar `features/users/`
- [ ] Mover lógica de users
- [ ] Criar `user.types.ts`
- [ ] Criar `User.ts` (domain model)
- [ ] Criar `UserService.ts`
- [ ] Consolidar `user.routes.ts`
- [ ] Criar `index.ts` (barrel export)
- [ ] Atualizar imports
- [ ] Testar CRUD

---

## ⏳ Fase 3: Criar Novas Features

### Pumps (Bombas)
- [ ] Criar `features/pumps/`
- [ ] Criar `pump.types.ts`
  - [ ] PumpMotor (1 endpoint digital output)
  - [ ] PumpWithSensors (motor + flow + pressure)
- [ ] Criar `Pump.ts` (domain model)
- [ ] Criar `PumpService.ts` (singleton)
- [ ] Criar `pump.routes.ts`
- [ ] Criar `index.ts` (barrel export)
- [ ] Integrar com EventBus
- [ ] Registrar em `server.ts`
- [ ] Documentar

### Sensors
- [ ] Criar `features/sensors/`
- [ ] Criar `sensor.types.ts`
  - [ ] TemperatureSensor
  - [ ] LevelSensor
  - [ ] FlowSensor
  - [ ] PressureSensor
  - [ ] GenericSensor
- [ ] Criar `Sensor.ts` (domain model)
- [ ] Criar `SensorService.ts`
- [ ] Criar `sensor.routes.ts`
- [ ] Criar `index.ts`
- [ ] Integrar com EventBus
- [ ] Registrar em `server.ts`
- [ ] Documentar

### Valves (Válvulas)
- [ ] Criar `features/valves/`
- [ ] Criar `valve.types.ts`
  - [ ] OnOffValve
  - [ ] ProportionalValve
- [ ] Criar `Valve.ts`
- [ ] Criar `ValveService.ts`
- [ ] Criar `valve.routes.ts`
- [ ] Criar `index.ts`
- [ ] Integrar com EventBus
- [ ] Registrar em `server.ts`
- [ ] Documentar

### Tanks (Tanques de Água)
- [ ] Criar `features/tanks/`
- [ ] Criar `tank.types.ts`
  - [ ] WaterTank (level sensor + valves)
- [ ] Criar `Tank.ts`
- [ ] Criar `TankService.ts`
- [ ] Criar `tank.routes.ts`
- [ ] Criar `index.ts`
- [ ] Integrar com EventBus
- [ ] Registrar em `server.ts`
- [ ] Documentar

---

## ⏳ Fase 4: Features Futuras (Protocolos)

### OCPP (Carregadores EV)
- [ ] Criar `features/ocpp/`
- [ ] Implementar client OCPP 1.6/2.0.1
- [ ] Criar `ocpp.types.ts`
- [ ] Criar `ChargePoint.ts`
- [ ] Criar `OCPPService.ts`
- [ ] Criar `ocpp.routes.ts`
- [ ] Integrar com EventBus
- [ ] Documentar

### BACnet (HVAC)
- [ ] Criar `features/bacnet/`
- [ ] Implementar client BACnet
- [ ] Criar types
- [ ] Implementar domain models
- [ ] Criar service e routes
- [ ] Documentar

### Elevators (CAN Bus)
- [ ] Criar `features/elevators/`
- [ ] Implementar CAN Bus client
- [ ] Criar types
- [ ] Implementar domain models
- [ ] Criar service e routes
- [ ] Documentar

### Access Control
- [ ] Criar `features/access-control/`
- [ ] Implementar integração (HTTP/TCP)
- [ ] Criar types
- [ ] Implementar domain models
- [ ] Criar service e routes
- [ ] Documentar

---

## ⏳ Fase 5: Infraestrutura Shared

### Database
- [ ] Criar `shared/database/`
- [ ] Implementar Repository base class
- [ ] Criar migrations system
- [ ] Implementar connection pool
- [ ] Documentar

### Utilities
- [ ] Criar `shared/utils/`
- [ ] Criar helpers comuns
- [ ] Criar validators
- [ ] Criar formatters
- [ ] Documentar

### Middlewares
- [ ] Criar `shared/middlewares/`
- [ ] Implementar authMiddleware
- [ ] Implementar corsMiddleware
- [ ] Implementar loggingMiddleware
- [ ] Implementar errorHandlerMiddleware
- [ ] Documentar

### Types Globais
- [ ] Criar `shared/types/`
- [ ] Types comuns (Timestamp, UUID, etc)
- [ ] Documentar

---

## ⏳ Fase 6: Testes

### Unit Tests
- [ ] Configurar framework de testes (Bun test)
- [ ] Testes para Lights
  - [ ] LightDevice
  - [ ] LightService
- [ ] Testes para outras features
- [ ] Meta: 80%+ coverage

### Integration Tests
- [ ] Testes de integração EventBus
- [ ] Testes de integração Database
- [ ] Testes de integração entre features

### E2E Tests
- [ ] Testes de routes
- [ ] Testes de fluxo completo
- [ ] Testes de performance

---

## ⏳ Fase 7: Cleanup

### Remover Código Antigo
- [ ] Deletar `src/routes/elysia/lights.ts` (movido para features/)
- [ ] Deletar `src/services/devices/Light.ts` (movido)
- [ ] Deletar `src/services/devices/LightService.ts` (movido)
- [ ] Deletar `src/services/devices/types/light.types.ts` (movido)
- [ ] Deletar `src/services/event-bus/` (movido para shared/)
- [ ] Limpar imports não utilizados

### Atualizar Dependências
- [ ] Atualizar package.json se necessário
- [ ] Atualizar tsconfig.json (path aliases?)
- [ ] Atualizar build scripts

---

## ⏳ Fase 8: DevOps & CI/CD

### Docker
- [ ] Atualizar Dockerfile
- [ ] Atualizar docker-compose.yml
- [ ] Testar build Docker

### CI/CD
- [ ] Configurar GitHub Actions / GitLab CI
- [ ] Rodar testes automaticamente
- [ ] Build automático
- [ ] Deploy automático

---

## 📊 Progresso Total

### Features Completas
- ✅ Lights (100%)

### Features em Progresso
- ⏳ Schedules (0%)
- ⏳ Controllers (0%)
- ⏳ Devices (0%)
- ⏳ Auth (0%)
- ⏳ Dashboard (0%)
- ⏳ Users (0%)

### Features Planejadas
- ⏳ Pumps (0%)
- ⏳ Sensors (0%)
- ⏳ Valves (0%)
- ⏳ Tanks (0%)

### Infraestrutura
- ✅ EventBus movido para shared/ (100%)
- ⏳ Database (0%)
- ⏳ Utils (0%)
- ⏳ Middlewares (0%)

### Testes
- ⏳ Unit tests (0%)
- ⏳ Integration tests (0%)
- ⏳ E2E tests (0%)

---

## 🎯 Próximo Passo

**Recomendação:** Começar pela migração de **Schedules**, pois:
1. Já existe em `src/features/schedules/`
2. É feature completa e funcional
3. Integra com Lights (bom teste de integração)
4. Será necessário para testar o sistema completo

**Comando:**
```bash
# Depois de migrar schedules
git add .
git commit -m "feat: migrate schedules to feature-based architecture"
```

---

## 📝 Notas

- Sempre testar após cada migração
- Sempre documentar cada feature
- Seguir template em `features/README.md`
- Manter barrel exports consistentes
- Atualizar este checklist conforme progresso

---

**Refatoração em andamento! 🚀**

**Última atualização:** 2025-01-15
**Status:** Fase 1 completa (Lights feature)
**Próximo:** Fase 2 (Migrar features existentes)
