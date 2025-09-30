# SteganoWeb Architecture Overview

## High-Level Design
SteganoWeb ships as a production-ready web application composed of a React frontend and a Node.js/Express backend running TypeScript. A PostgreSQL database stores user accounts, credit balances, and transaction history. The steganography engine is implemented server-side using `sharp` for image decoding/encoding and a custom Least Significant Bit (LSB) algorithm. All user-facing experiences are delivered via the frontend, which communicates with the backend through a RESTful API secured by HTTP-only JWT cookies.

```
frontend (Vite + React)
       |
       v
 backend (Express + TypeScript) --> PostgreSQL (via Prisma)
       |
       v
 steganography service (LSB encoder/decoder using sharp)
```

## Key Components
- **Frontend** (`apps/frontend`): SPA serving landing page, auth flows, dashboard, steganography workflows. Uses TanStack Query for data fetching, React Hook Form + Zod for validation, and TailwindCSS for styling with a neon-inspired theme.
- **Backend** (`apps/backend`): Express server exposing authentication, usage tracking, steganography, and payment endpoints. Employs Prisma ORM for data persistence, JWT-based session cookies, Zod validation, and structured logging via Pino.
- **Database**: PostgreSQL 15 instance orchestrated via Docker Compose. Prisma manages schema migrations.
- **Background processing**: Steganography operations execute synchronously inside an isolated service layer. Uploaded images are streamed to disk temporarily (encrypted temp dir) and never persisted after processing.
- **Payments**: Stripe Checkout integration scaffolded yet feature-flagged off by default (`ENABLE_PAYMENTS=false`) per MVP requirement.
- **External Integrations**: Google OAuth via Passport, "Nano Banana" AI enhancer (Gemini 2.5 via the official SDK) behind `ENABLE_NANO_BANANA`; we send the original image + hidden message instructions to Gemini, receive an enhanced PNG, then run our deterministic LSB encoder. If clients upload third-party stego imagery, we attempt LSB extraction first, and fall back to Gemini to describe any hidden payload it can infer.
- **Public API**: API keys (bcrypt-hashed, prefix indexed) unlock JSON encode/decode endpoints for external automation.

## Security & Compliance Highlights
- HTTPS termination expected at load balancer; backend enforces secure cookies and CSRF tokens for state-changing requests.
- Rate limiting through `express-rate-limit`, request validation, and upload size constraints (5MB).
- Virustotal-compatible antivirus hook placeholder for future integration.
- GDPR-conscious: image files processed in-memory/ephemeral, deletion immediately after response.

## Deployment
- Docker Compose orchestrates three services (`frontend`, `backend`, `db`). Default exposed port `5678` per PRD.
- CI ready via GitHub Actions workflow template (tests, lint, build) provided.

## Future Enhancements
- Queue-based processing for large workloads (BullMQ + Redis).
- WebSockets for progress updates during heavy AI-assisted operations.
- Expanded analytics/monitoring via OpenTelemetry and SaaS dashboards.
