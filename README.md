# AI Chat

Full-stack AI chat app: Next.js UI, NestJS API, conversations stored in MongoDB, streaming replies via Google Gemini (SSE).

## Tech stack

| Layer    | Technology                                                   |
| -------- | ------------------------------------------------------------ |
| Frontend | Next.js 15 (App Router), React 19, Panda CSS, TanStack Query |
| Backend  | NestJS 10, Mongoose                                          |
| Database | MongoDB                                                      |
| AI       | Google Generative AI (Gemini)                                |
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
- [Google AI Studio](https://aistudio.google.com/) API key (Gemini)
- (Optional) Cloudinary account for file attachments

## Environment variables

Create `backend/.env`:

```env
# Server
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/ai-chat

# Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash

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
| `chat/`    | `ChatController` (SSE), `ChatService` (orchestration), `AiService` (Gemini stream) |
| `session/` | Session/message schemas, services, pagination                                      |
| `upload/`  | Multer + Cloudinary                                                                |
| `common/`  | HTTP logger, `AllExceptionsFilter`                                                 |

## Operations notes

- **Gemini quota (free tier):** When quota is exceeded, the user message is still saved; the UI shows _"Quota exceeded. Try again later."_
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
