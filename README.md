# Skript-Umfrage

Live-Umfrage-Website: Owner legt im Admin-Panel Umfragen mit "Skript"-Vorschlägen
(Titel, Bild, Link) an. Anonyme User bewerten jedes Skript per Checkbox
(Priorität / kann später / brauch ich nicht) und können am Ende eigene
Skript-Vorschläge einreichen.

## Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions)
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Vercel Blob](https://vercel.com/storage/blob) für Bild-Uploads
- Deploy: [Vercel](https://vercel.com)

## Docs

- [Funktionale Spezifikation](docs/spec.md)
- [Architektur](docs/architecture.md)
- [Datenmodell](docs/data-model.md)
- [Admin-Panel](docs/admin-panel.md)
- [Deployment](docs/deployment.md)
- [Roadmap](docs/roadmap.md)

## Lokales Setup

```bash
npm install
cp .env.example .env.local   # Werte eintragen, siehe docs/deployment.md
npm run dev
```

### Env-Variablen (`.env.local`)

| Variable | Zweck |
|---|---|
| `ADMIN_PASSWORD` | Passwort fürs Admin-Panel-Login |
| `POSTGRES_URL` | Verbindung zu Vercel Postgres |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Storage Zugriff |

## Deploy

Siehe [docs/deployment.md](docs/deployment.md) — Deploy läuft über Vercel
(GitHub-Integration, Push auf `main` deployt automatisch).
