# Publish

**Red social de comercio** donde cada publicación vende, promociona o alquila algo.

Publica desde **Cursor** con un prompt y fotos. La IA genera el anuncio. Tú confirmas. Queda live en el feed.

> Instagram + MercadoLibre + Yelp + Cursor como consola de publicación.

---

## Tabla de contenidos

- [Qué es Publish](#qué-es-publish)
- [Características](#características)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Inicio rápido (local)](#inicio-rápido-local)
- [Publicar desde Cursor](#publicar-desde-cursor)
- [Categorías soportadas](#categorías-soportadas)
- [API](#api)
- [Roadmap](#roadmap)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## Qué es Publish

Publish no es un marketplace tradicional ni una red social genérica. Es una **plataforma social-commerce** donde:

- Cada post tiene **intención comercial** (venta, alquiler, promo o servicio).
- El feed funciona como **Instagram/TikTok**, pero orientado a comprar y vender.
- Las empresas tienen **perfil con ratings** estilo Yelp.
- La publicación principal ocurre desde **Cursor MCP**: escribes un prompt, adjuntas fotos, la IA estructura el anuncio y tú confirmas antes de publicar.

**Regla de oro:** no hay posts vacíos. Todo contenido lleva un CTA comercial.

---

## Características

| Feature | Descripción |
|---------|-------------|
| **Feed social** | Para ti · Siguiendo · Cerca — con ranking EdgeRank |
| **Publicación con IA** | Prompt + fotos/videos → borrador estructurado → confirmar → live |
| **Cursor MCP Tools** | Publica sin formularios, directo desde el IDE |
| **Social Graph** | Follow, like, comment, save — patrón Facebook TAO |
| **News Feed fan-out** | Timelines pre-computados por usuario |
| **Multi-categoría** | Electrónicos, comida, servicios, vehículos, equipos |
| **Perfiles empresa** | Ratings, reviews, stories de promos 24h |
| **100% local dev** | MongoDB + Redis via Docker Compose |

### Próximamente

- Realidad aumentada (electrónicos, vehículos)
- WhatsApp bot para publicar promos
- Mensajes directos comprador-vendedor
- Pagos in-app

---

## Arquitectura

Inspirada en **Facebook**: Social Graph, News Feed con fan-out híbrido, Activity Log, Media Pipeline async y modular monolith en NestJS.

```
┌─────────────────────────────────────────────────────────────┐
│  Clientes: Cursor MCP · App Expo · WhatsApp Bot             │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  API Gateway + Gatekeeper (JWT + API Keys)                  │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌──────────────┬───────────────┬──────────────┬───────────────┐
│ Social Graph │ Content       │ News Feed    │ Notifications │
│ Media        │ AI Generator  │ Commerce     │ Activity Log  │
└──────────────┴───────────────┴──────────────┴───────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  BullMQ Event Bus (fan-out · notificaciones · media)        │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌──────────────────────┬──────────────────────────────────────┐
│  MongoDB (NoSQL)     │  Redis (cache + colas)               │
└──────────────────────┴──────────────────────────────────────┘
```

### Flujo de publicación

```
Prompt + fotos (Cursor)
    → Media Pipeline (upload)
    → AI Service (generate draft)
    → Preview al usuario
    → ¿Confirmar? ──No──→ Editar / cancelar
         │
        Sí
         ▼
    Post activo → Fan-out a feed_timelines → Notificar seguidores
```

### Patrones clave

| Patrón Facebook | Implementación |
|-----------------|----------------|
| Social Graph (TAO) | Nodos + edges: follow, like, save, comment |
| News Feed fan-out | `feed_timelines` pre-computado (< 5K seguidores) |
| EdgeRank | `afinidad × peso × time_decay` |
| Activity Log (Scribe) | `activity_log` append-only |
| Media Pipeline | Upload async → resize → CDN |
| Gatekeeper | Auth guards en cada request |

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| API | NestJS + TypeScript |
| Base de datos | MongoDB + Mongoose |
| Cache / colas | Redis + BullMQ |
| App móvil | React Native + Expo |
| IA | OpenAI / Anthropic API |
| Publicación IDE | Cursor MCP Server |
| Storage | Local (dev) · Cloudflare R2 (prod) |
| Infra local | Docker Compose |

---

## Estructura del proyecto

```
publish/
├── apps/
│   ├── api/                 # NestJS modular monolith
│   │   └── src/
│   │       ├── gateway/     # API Gateway + Gatekeeper
│   │       ├── modules/     # social-graph, content, feed, ai, media...
│   │       ├── workers/     # BullMQ consumers
│   │       └── schemas/     # Mongoose schemas
│   ├── mcp-server/          # MCP Tools para Cursor
│   └── mobile/              # React Native Expo
├── packages/
│   ├── shared/              # DTOs, enums, event types
│   ├── feed-ranking/        # EdgeRank algorithm
│   └── ai-prompts/          # Prompts IA
├── .cursor/
│   ├── mcp.json             # Registro MCP server
│   └── skills/publish/      # Skill flujo conversacional
├── docker-compose.yml       # MongoDB + Redis
└── README.md
```

---

## Inicio rápido (local)

### Requisitos

- **Node.js** 20 LTS
- **Docker Desktop**
- **Cursor** (para MCP Tools)

### 1. Clonar e instalar

```bash
git clone https://github.com/afibarra68/republish-app.git
cd publish
npm install
```

### 2. Levantar infraestructura

```bash
docker compose up -d
```

### 3. Configurar entorno

```bash
cp apps/api/.env.example apps/api/.env
```

```env
MONGODB_URI=mongodb://localhost:27017/publish
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-local
MEDIA_STORAGE=local
MEDIA_BASE_URL=http://localhost:3000/uploads
OPENAI_API_KEY=                    # opcional — mock en dev si vacío
PORT=3000
```

### 4. Arrancar API

```bash
cd apps/api && npm run dev
# → http://localhost:3000
```

### 5. App móvil (opcional)

```bash
cd apps/mobile && npx expo start
# Configurar EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:3000
```

### Verificar

```bash
curl http://localhost:3000/health
```

---

## Publicar desde Cursor

### Configuración MCP

El proyecto incluye `.cursor/mcp.json` y un skill en `.cursor/skills/publish/`. Cursor detecta las tools automáticamente.

### Tools disponibles

| Tool | Descripción |
|------|-------------|
| `publish_connect` | Conectar con API Key |
| `publish_upload_media` | Subir fotos/videos |
| `publish_generate_draft` | Prompt → borrador IA |
| `publish_preview_draft` | Ver preview |
| `publish_update_draft` | Editar borrador |
| `publish_confirm` | Publicar (solo tras confirmación) |
| `publish_cancel_draft` | Descartar borrador |

### Ejemplo

```
Tú:    Quiero publicar fotos de venta de MacBook Pro M2, 16GB, $1200
       [adjuntas fotos]

Agente: Generé tu anuncio:
        MacBook Pro M2 16GB — $1,200 · Electrónicos
        ¿Quieres publicarlo?

Tú:    Sí

Agente: Publicado → https://publish.app/p/x7k2m9
```

> El agente **nunca publica sin tu confirmación explícita**.

---

## Categorías soportadas

| Categoría | Tipos | Ejemplo |
|-----------|-------|---------|
| **Electrónicos** | Venta | iPhone, laptop, TV |
| **Comida** | Promo | 2x1 pizza, combo del día |
| **Servicios** | Servicio | Plomería, diseño, clases |
| **Vehículos** | Venta / Alquiler | Auto, moto |
| **Equipos** | Venta | Herramientas, muebles |

Metadata flexible por categoría en MongoDB (`commerce.metadata`).

---

## API

### Auth

```
POST /auth/register
POST /auth/login
POST /auth/refresh
```

### Feed

```
GET  /feed/following?cursor=
GET  /feed/for-you?cursor=
GET  /feed/nearby?lat=&lng=&radius=
```

### Publicación (MCP)

```
POST   /media/upload
POST   /ai/generate-draft
GET    /drafts/:id
PATCH  /drafts/:id
POST   /drafts/:id/publish
DELETE /drafts/:id
```

### Social

```
POST /users/:id/follow
POST /posts/:id/like
POST /posts/:id/comments
POST /posts/:id/save
```

Autenticación MCP: header `X-Publish-Api-Key`.

Documentación OpenAPI completa — próximamente en `/docs`.

---

## Roadmap

### Fase 1 — Social Graph + Gateway
- [ ] Auth Gatekeeper + Activity Log
- [ ] Social Graph (follow, like, save)
- [ ] Event Bus BullMQ

### Fase 2 — Content + MCP Cursor
- [ ] Posts + post_drafts + Media Pipeline
- [ ] AI generate-draft
- [ ] MCP Server + Skill Cursor

### Fase 3 — News Feed
- [ ] feed_timelines + fan-out on write
- [ ] EdgeRank ranking
- [ ] Redis cache layer

### Fase 4 — Notifications + Engagement
- [ ] Push FCM + inbox
- [ ] Comments + shares

### Fase 5 — App móvil
- [ ] Feed vertical + perfiles + detalle

### Fase 6 — Empresas + Stories
- [ ] Ratings + promos 24h + Explore

### Fase 7 — Futuro
- [ ] AR · Video IA · WhatsApp bot · Pagos

---

## Contribuir

1. Fork del repositorio
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Commit: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/mi-feature`
5. Abre un Pull Request

Consulta [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) para convenciones de código y commits.

---

## Licencia

MIT — ver [LICENSE](LICENSE).

---

<p align="center">
  <strong>Publish</strong> — Publica. Vende. Conecta.
</p>
