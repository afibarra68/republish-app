# Contribuir a Publish

Gracias por tu interés en contribuir.

## Setup local

```bash
git clone https://github.com/afibarra68/republish-app.git
cd publish
docker compose up -d
npm install
cd apps/api && cp .env.example .env && npm run dev
```

## Convenciones

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add fan-out worker for feed timelines
fix: prevent duplicate likes on concurrent requests
docs: update MCP tools table in README
refactor: extract EdgeRank to packages/feed-ranking
```

### Branches

- `main` — estable
- `feature/nombre` — nuevas features
- `fix/nombre` — bug fixes

### Código

- TypeScript estricto
- NestJS modules por dominio (social-graph, content, feed...)
- Tests para lógica crítica (fan-out, EdgeRank, draft confirm)
- No commitear `.env` ni secrets

## Pull Requests

1. Describe qué cambia y por qué
2. Linkea issues relacionados
3. Verifica que la API arranca en local
4. Actualiza README si cambia setup o API pública
