# SteganoWeb

Production-grade web application for hiding and revealing text inside images using steganography. Built to ship the MVP outlined in the PRD with hardened security, authentication, usage tracking, and future-ready payment wiring (disabled for launch).

## Highlights
- ⚡️ **LSB steganography engine** implemented with `sharp` and thoroughly unit-tested.
- 🔐 **Authentication stack** supporting email/password, Google OAuth (configurable), verification tokens, and secure HTTP-only cookies.
- 📊 **Usage governance** enforcing a free daily edit and credit consumption, backed by PostgreSQL via Prisma.
- 💳 **Stripe Checkout integration scaffolded** yet feature-flagged off (`ENABLE_PAYMENTS=false`) per MVP requirement.
- 🖥️ **Neon-charged React SPA** delivering landing page, onboarding, dashboard, and full embed/verify flows.
- 🛡️ **Security guardrails**: input validation, rate limiting, file-type enforcement, CSRF-resistant cookie strategy, and Dockerized deployment.
- 🛠️ **Public API** for encode/decode with dashboard-managed API keys and developer documentation.
- 🤖 **Gemini 2.5 integration** (aka Nano Banana) now always optimises images before embedding and provides an AI-based decode fallback when our deterministic LSB reader can’t find a payload. This means any image (even third-party stego) gets a best-effort analysis.

## Project Structure
```
.
├── apps
│   ├── backend        # Express + TypeScript API
│   └── frontend       # Vite + React client
├── docs
│   └── architecture.md
├── docker-compose.yml
└── README.md
```

## One-Command Deploy
1. Generate your `.env` from the template (prompts will guide you):
   ```bash
   ./scripts/setup.sh
   ```
2. Build and launch everything in production mode:
   ```bash
   docker compose up --build -d
   ```

The compose stack provisions PostgreSQL, runs Prisma migrations inside the backend container, and serves:
- Backend API → `http://localhost:4000`
- Frontend UI → `http://localhost:5678`

Tail logs any time:
```bash
docker compose logs -f backend frontend
```

Redeploy by rerunning `docker compose up --build -d` after code changes. Containers rebuild and roll forward with zero manual steps.

### Programmatic Access
- Generate API keys from the dashboard and call the JSON-based encode/decode endpoints.
- Docs live at `/api` in the frontend or in [`docs/api.md`](docs/api.md).

## Testing
- **Backend unit tests** (Vitest): `npm run test --workspace steganoweb-backend`
- **Frontend tests** (Vitest + RTL): `npm run test --workspace steganoweb-frontend`

### Email Verification in Non-Prod
The backend logs verification tokens to stdout when running locally. Grab the token from the logs and POST to `/api/auth/verify-email` or append `?token=...` to `/verify-email` in the SPA to finish onboarding.

## Environment Flags
Update values in `.env` (generated via `./scripts/setup.sh`). Most deployments only tweak secrets and feature flags; everything else ships production-ready.
| Variable | Purpose |
| --- | --- |
| `ENABLE_PAYMENTS` | Controls Stripe checkout exposure. Default `false` for MVP. |
| `ENABLE_NANO_BANANA` | Toggles the optional AI enhancer integration (stubbed until API key provided). |
| `SESSION_COOKIE_SECURE` | Enforce secure cookies in production deployments. |

## Security Notes
- Image uploads capped at 5MB, JPEG/PNG only, processed server-side without persistence.
- Zod-powered validation and rate limiting protect endpoints.
- Authentication uses HTTP-only, same-site cookies with rotating JWT payloads.
- Stripe interactions are fully wired but gated until the feature flag flips for production payments.

## Deployment Checklist
1. Generate `.env` via `./scripts/setup.sh` (or craft one manually) with production URLs, secrets, and feature flags.
2. Place the stack behind HTTPS (set `SESSION_COOKIE_SECURE=true` and terminate TLS at the edge).
3. Run `docker compose up --build -d` to build images, run migrations, and start services.
4. Feed logs from `docker compose logs -f` into your monitoring/alerting stack.

## Roadmap Hooks
- Drop-in antivirus scanning service where indicated in the steganography pipeline.
- Redis/BullMQ worker offloading for heavy AI-assisted processing.
- CI/CD template ready to extend (`.github/workflows`).
- Public API ready; future enhancements include endpoint-specific rate limits and service accounts for high-volume integrations.
