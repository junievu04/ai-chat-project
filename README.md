# AI Chat

Full-stack AI chat app: Next.js UI, NestJS API, conversations stored in MongoDB, streaming replies via Groq (SSE).

## Tech stack

| Layer    | Technology                                                   |
| -------- | ------------------------------------------------------------ |
| Frontend | Next.js 15 (App Router), React 19, Panda CSS, TanStack Query |
| Backend  | NestJS 10, Mongoose                                          |
| Database | MongoDB                                                      |
| AI       | Groq (Llama)                                                 |
| Upload   | Cloudinary (images / PDF / files)                            |

## Repository structure

```
ai-chat-project/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── main.ts          # Bootstrap, CORS, global prefix /api
│   │   ├── app.module.ts
│   │   ├── chat/            # Send message + AI stream (SSE)
│   │   ├── session/         # Session CRUD + message pagination
│   │   ├── upload/          # File upload to Cloudinary
│   │   └── common/          # Logger, exception filter
│   └── scripts/
│       └── seed-demo.ts     # Demo data
│
└── frontend/                # Next.js app
    ├── src/
    │   ├── app/             # Routes (App Router)
    │   ├── modules/         # Feature UI (chat, layout)
    │   ├── components/      # Shared UI (Button, Text, …)
    │   ├── contexts/        # Chat + session state
    │   ├── hooks/           # useSendMessage, pagination, scroll
    │   ├── lib/             # API client, SSE parser, error formatting
    │   ├── store/           # chatReducer
    │   └── types/
    └── panda.config.ts      # Design tokens → vendors/styled-system
```

## Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- [Groq](https://console.groq.com/) API key
- (Optional) Cloudinary account for file attachments

## Environment variables

Create `backend/.env`:

```env
# Server
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/ai-chat

# Groq
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

# Cloudinary (upload)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Development

Run **two terminals** (backend and frontend are separate processes).

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

API base URL: `http://localhost:4000/api`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

After the first `npm install`, Panda CSS generates code under `src/vendors/styled-system` (gitignored). If that folder is missing:

```bash
npm run panda
```

App: `http://localhost:3000` → redirects to `/chat`.

### Demo data (optional)

```bash
cd backend
npm run seed:demo          # Add sample sessions + messages
npm run seed:demo:reset    # Clear and re-seed
```

## Production build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## Main API (prefix `/api`)

| Method   | Path                           | Description                        |
| -------- | ------------------------------ | ---------------------------------- |
| `GET`    | `/sessions`                    | List conversations                 |
| `POST`   | `/sessions`                    | Create empty session               |
| `GET`    | `/sessions/:id`                | Session details                    |
| `GET`    | `/sessions/:id/messages?next=` | Messages (cursor pagination)       |
| `DELETE` | `/sessions/:id`                | Delete session                     |
| `POST`   | `/chat`                        | Send message + stream AI (**SSE**) |
| `POST`   | `/upload`                      | Upload file (multipart)            |

### Send-message flow (`POST /api/chat`)

A single request handles everything — there is **no** separate POST endpoint per message.

1. Create a session (if `sessionId` is null).
2. Save the **user message** to MongoDB.
3. Stream SSE events:
   - `meta` — `sessionId`, `userMessage`
   - `chunk` — AI text fragments
   - `done` — `aiMessage` persisted in DB
   - `error` — failure (quota, rate limit, …) with a short user-facing message

The frontend reads the stream in `frontend/src/lib/api.ts` (`sendChatMessage`) and updates the UI via `useSendMessage`.

## Frontend layout

| Path                           | Role                                                   |
| ------------------------------ | ------------------------------------------------------ |
| `app/chat/`                    | `/chat` (new chat), `/chat/[sessionId]`                |
| `modules/chat/`                | `ChatViewClient`, `InputBar`, `MessageBubble`, …       |
| `modules/layout/`              | Sidebar, header                                        |
| `contexts/ChatContext`         | Messages + per-session errors (survives route changes) |
| `contexts/SessionContext`      | Sidebar session list                                   |
| `hooks/useSendMessage`         | Optimistic UI, SSE, new-chat navigation                |
| `hooks/use-message-pagination` | Infinite scroll for older messages (React Query)       |
| `lib/api.ts`                   | REST fetch + SSE chat                                  |

## Backend layout

| Module     | Role                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| `chat/`    | `ChatController` (SSE), `ChatService` (orchestration), `AiService` (Groq stream)     |
| `session/` | Session/message schemas, services, pagination                                      |
| `upload/`  | Multer + Cloudinary                                                                |
| `common/`  | HTTP logger, `AllExceptionsFilter`                                                 |

## Groq API — limits & warnings

> **Important:** This app calls the [Groq API](https://console.groq.com/) on every chat message. Groq enforces **request** and **token** limits per organization (not per end-user). Limits can change; always check your live quotas on the [Groq Limits page](https://console.groq.com/settings/limits).

### Default model (`llama-3.3-70b-versatile`)

Values below are from [Groq rate limits docs](https://console.groq.com/docs/rate-limits) (Developer / free-tier baseline, May 2026). Other models have different caps.

| Limit type | Abbrev. | Value | Meaning |
| ---------- | ------- | ----- | ------- |
| Requests per minute | **RPM** | **30** | Max ~30 chat API calls per minute |
| Requests per day | **RPD** | **1,000** | Max ~1,000 chat API calls per day |
| Tokens per minute | **TPM** | **12,000** | Max input + output tokens processed per minute |
| Tokens per day | **TPD** | **100,000** | Max tokens per day across all requests |

You can hit **RPM** before **TPM** (e.g. many short messages) or run out of **TPD** with fewer, longer conversations. Cached prompt tokens (if enabled on your account) do not count toward limits.

### App-level token cap

In `backend/src/chat/ai.service.ts`, each reply is capped at **`max_completion_tokens: 1500`** (Groq output only). That does **not** remove Groq’s TPM/TPD limits — long **chat history** still increases **input tokens** on every request.

### When limits are exceeded

- Groq returns HTTP **`429 Too Many Requests`**.
- This app still saves the **user message**; the SSE stream emits an **`error`** event and the UI shows a short message (rate limit / quota).
- Response headers may include `retry-after`, `x-ratelimit-remaining-requests`, `x-ratelimit-remaining-tokens`, etc. See [rate limit headers](https://console.groq.com/docs/rate-limits#rate-limit-headers).

### Practical tips

- Avoid rapid-fire sends during demos; stay under **30 RPM**.
- Prefer shorter threads or start a **new session** for long chats to reduce input tokens per call.
- For higher quotas, upgrade on Groq ([billing / plans](https://console.groq.com/settings/billing/plans)) or switch to a model with higher limits (e.g. `llama-3.1-8b-instant`: 14.4K RPD / 500K TPD — see docs table).
- Do not commit `GROQ_API_KEY` to git; rotate keys if exposed.

## Operations notes

- **CORS:** The backend only allows the origin set in `FRONTEND_URL` (default `http://localhost:3000`).
- **MongoDB:** Verify `MONGODB_URI` before running `npm run dev` in the backend.

## Scripts reference

| Location    | Command                       | Description                  |
| ----------- | ----------------------------- | ---------------------------- |
| `backend/`  | `npm run dev`                 | Dev with SWC (`src/main.ts`) |
| `backend/`  | `npm run build` / `npm start` | Production                   |
| `frontend/` | `npm run dev`                 | Next.js dev server           |
| `frontend/` | `npm run build`               | Panda codegen + `next build` |
| `frontend/` | `npm run lint`                | ESLint                       |
