# 🌊 PortSense – AI-Powered Maritime Container Tracking SaaS

**PortSense** is a developer-first SaaS platform for real-time container tracking across maritime routes. Built with a modern TypeScript/React/Supabase stack and OpenAI integration, it delivers predictive insights, ESG-aware routing, and intelligent alerts—all with speed, clarity, and elegance.

---

## 🚀 Why PortSense Wins

- 🔍 **Track any container, anywhere, in real-time**
- 🔮 **Get delay predictions, AI-based summaries, and optimized routes**
- 📣 **Receive smart alerts by email or SMS**
- 🌱 **Estimate carbon impact and suggest greener alternatives**
- 🔐 **Invite your team and control who sees what**
- 🧑‍💻 **Built for developers, with scalable code and real APIs**

---

## 🛠️ Tech Stack

| Layer          | Tech                                         |
|----------------|----------------------------------------------|
| Frontend       | Next.js 14 App Router, Tailwind CSS, ShadCN UI |
| State & Forms  | Zustand, React Hook Form, Zod                |
| Backend        | Supabase (PostgreSQL, Auth, RLS)             |
| ORM            | Prisma                                       |
| AI Integration | OpenAI (GPT-4) via `/api/ai` route           |
| Maps           | Leaflet.js                                   |
| Animations     | Framer Motion                                |
| Notifications  | Resend (email), Twilio (SMS)                 |
| Tooling        | Bun, ESLint, Prettier, Supabase CLI, Jest    |

---

## 📦 Key Features

### 1. Real-Time Multi-Carrier Container Tracking
- Unified tracking from major shipping lines (MSC, Maersk, CMA CGM…)
- Live location updates and status events
- Interactive map with Leaflet
- Timeline per container: origin, current port, ETA, delay state

### 2. AI-Powered Insights (via GPT-4)
- Predict ETAs and routing delays using OpenAI
- Summarize container logs and suggest alternative routes
- Detect anomalies or stalled containers
- Future: Agent-style AI assistant for logistics queries

### 3. Intelligent Alert System
- Trigger-based alerts: stuck, delayed, offline containers
- Notifications via Resend (email) and Twilio (SMS)
- Fully customizable thresholds (per user or org)

### 4. Carbon Estimation & ESG
- Calculate estimated CO₂ footprint per route
- Suggest more sustainable modes or ports
- Future: Exportable ESG reports (CSV, PDF)

### 5. Team Access & Role Control
- Supabase Auth with organization support
- Row-Level Security (RLS) for strict data access
- Admin / Operator / Viewer roles
- Invite teammates securely via dashboard

---

## 🧠 AI Prompt Architecture

Using `lib/ai/prompt.ts`, the app dynamically builds prompts like: