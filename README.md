# VedaAI — AI Assessment Creator

A full-stack AI-powered assessment creation platform for teachers.

## Architecture Overview

```
vedaai/
├── frontend/          # Next.js 15 + TypeScript + Zustand
├── backend/           # Node.js + Express + TypeScript
└── shared/            # Shared TypeScript types
```

### System Flow

```
Teacher fills form
      ↓
POST /api/assignments  (Express API)
      ↓
BullMQ Job queued  (Redis)
      ↓
Worker picks job
      ↓
Groq API call  (llama-3.3-70b-versatile)
      ↓
Parse structured JSON
      ↓
Store in MongoDB
      ↓
WebSocket emit → Frontend
      ↓
Output page renders
```

### Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 15, TypeScript, Zustand, Socket.io-client, TailwindCSS |
| Backend    | Express, TypeScript, BullMQ, Socket.io |
| Database   | MongoDB (Mongoose)                  |
| Cache/Queue| Redis                               |
| AI         | Groq API (llama-3.3-70b-versatile)  |
| PDF Export | @react-pdf/renderer                 |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas URI
- Redis running locally or Redis Cloud URI
- Groq API key from [console.groq.com](https://console.groq.com)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in your .env values

# Frontend
cd ../frontend
npm install
cp .env.example .env.local
# Fill in your .env.local values
```

### 2. Environment Variables

**backend/.env**
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_HOST=localhost
REDIS_PORT=6379
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Visit `http://localhost:3000`

---

## Approach

### AI Prompt Strategy
Rather than asking the LLM to "generate questions", we send a highly structured prompt specifying:
- Exact section breakdown (one section per question type)
- Per-section question count and marks
- Difficulty distribution rules
- Strict JSON-only output schema

The response is validated against a Zod schema before storing — we never render raw LLM output.

### Queue Architecture
BullMQ handles all AI generation as background jobs so the HTTP request returns immediately with a job ID. The frontend connects via WebSocket and listens for `job:progress` and `job:complete` events keyed by `assignmentId`.

### Caching
- Generated papers are cached in Redis for 1 hour keyed by a hash of the assignment params
- Repeated identical requests are served from cache instantly

### PDF Export
Server-side PDF generation using `pdfkit` — clean formatted output, not an HTML print capture.
