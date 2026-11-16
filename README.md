# CafeGestión (MVP)

Sistema de gestión para fincas cafeteras de **Raíz Digital S.A.S.**: registra lotes, cosechas, inventario y ventas. Proyecto final de *Calidad de Software* (CORHUILA).

**Equipo:** David Santiago Salazar · Cesar Augusto Tamayo Urriago

## Flujo principal
Registrar finca → crear lote → registrar cosecha → **confirmar** (suma al inventario) → registrar venta (descuenta; se rechaza si supera el inventario).

## Estructura
| Carpeta | Contenido |
|---|---|
| `backend/` | API NestJS + Prisma + PostgreSQL (Supabase), JWT, logs en JSON |
| `frontend/` | Next.js 16 + Tailwind 4 + shadcn/ui (plantilla Studio Admin, MIT, adaptada a la marca) |
| `e2e/` | Pruebas de extremo a extremo con Playwright |
| `docs/calidad/` | Dossier de calidad: plan, matrices, pruebas, ISO 25010, defectos, Shift Right |
| `.github/workflows/` | CI con quality gate |

El navegador **nunca** habla con la base de datos: solo con la API (`NEXT_PUBLIC_API_URL`).

## Requisitos
Node.js 22 o superior y una base PostgreSQL (Supabase).

## Configuración
```bash
# Backend
cd backend
cp .env.example .env        # en Windows: copy .env.example .env
# edite .env con su DATABASE_URL y JWT_SECRET
npm install
npx prisma generate
npx prisma db push           # crea las tablas según prisma/schema.prisma

# Frontend
cd ../frontend
cp .env.example .env.local
npm install
```
Los archivos `.env` y `.env.local` están en `.gitignore`; nunca se suben credenciales.

## Ejecución
```bash
cd backend  && npm run start:dev   # http://localhost:4000
cd frontend && npm run dev         # http://localhost:3000
```
Si el puerto 4000 está ocupado (Windows): `Get-NetTCPConnection -LocalPort 4000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`

## Pruebas
| Nivel | Comando | Resultado (15-nov-2026) |
|---|---|---|
| Unitarias + cobertura (Jest) | `cd backend && npm run test:cov` | 17/17, cobertura 100 / 91,3 / 100 / 100 |
| Componentes (Vitest + RTL) | `cd frontend && npm test` | 13/13 |
| API (Postman / Newman) | `npx newman run docs/calidad/09_Postman/CafeGestion.postman_collection.json -e docs/calidad/09_Postman/CafeGestion_local.postman_environment.json` | 16 peticiones, 40 comprobaciones, 0 fallos |
| E2E (Playwright) | `cd e2e && npm install && npx playwright install chromium && npx playwright test` | 5/5 (con backend y frontend corriendo) |
| Lint | `npm run lint` en `backend/` y `frontend/` | 0 errores |

La integración continua (`.github/workflows/ci.yml`) ejecuta lint, tipos, compilación, pruebas y cobertura en cada Pull Request; el *quality gate* bloquea el merge si algo falla.

## Registros (logs)
El backend escribe un JSON por evento en consola y en `backend/logs/app.log` (ignorado por Git): arranque, login correcto/fallido (sin contraseñas ni tokens), operaciones críticas con duración, validaciones rechazadas y excepciones.

## Flujo de trabajo en Git
Ramas `feature/*`, `fix/*` y `docs/*`; todo cambio entra a `main` por Pull Request con «merge commit».

## Documentación de calidad
Ver `docs/calidad/`.
