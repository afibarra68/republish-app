---
name: publish
description: Publish social-commerce listings from Cursor using MCP tools. Use when the user wants to publish a sale, promo, rental, or service with photos/videos via natural language prompt.
---

# Publish — Cursor Publishing Skill

## When to use

Trigger when the user wants to:
- Publish a sale, promo, rental, or service
- Upload photos/videos for a listing
- Generate marketplace content from a prompt
- Confirm or edit a draft before going live

## Mandatory flow

1. **Connect** — if not configured, call `publish_connect` with API key
2. **Upload media** — if user attached photos/videos, call `publish_upload_media`
3. **Generate draft** — call `publish_generate_draft` with the user's prompt
4. **Show preview** — display title, price, category, caption, hashtags
5. **Wait for confirmation** — ask: "¿Quieres publicar este artículo?"
6. **Only if user says yes** — call `publish_confirm`

## Critical rules

- **NEVER** call `publish_confirm` without explicit user confirmation ("sí", "yes", "publicar", "confirm")
- If user wants changes, use `publish_update_draft` then show preview again
- If no photos provided, ask user to attach them before generating
- Every post must have commercial intent (sale, promo, rent, service)

## Example

```
User: Quiero publicar fotos de venta de MacBook Pro M2, $1200
→ publish_upload_media → publish_generate_draft
→ Show preview
→ Ask confirmation
User: Sí
→ publish_confirm
```

## Categories

electronics, food, vehicle, equipment, other — types: sale, rent, promo, service
