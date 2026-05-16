# SessionLens — Web Analytics & Heatmap Platform

A lightweight full-stack analytics platform built with Next.js, MongoDB, and React Query that tracks user behavior, session journeys, and click heatmaps in real time.

This project was built as part of the Full Stack Engineer assignment for CausalFunnel.

---

# Features

## Event Tracking

* Tracks:

  * Page Views
  * Click Events
* Stores:

  * Session ID
  * Page URL
  * Timestamp
  * Click Coordinates
  * Viewport Dimensions

## Session Analytics

* Session listing dashboard
* Total events per session
* Session duration
* Page visit count
* Ordered user journey timeline

## Heatmap Visualization

* Dynamic click heatmaps
* Intensity-based rendering
* Responsive coordinate normalization
* Multi-page analytics support

## Dashboard

* Modern analytics UI
* Real-time data fetching
* React Query integration
* Optimized loading states
* Responsive layout

---

# Tech Stack

| Layer            | Technology             |
| ---------------- | ---------------------- |
| Frontend         | Next.js 15             |
| Backend          | Next.js Route Handlers |
| Database         | MongoDB                |
| ODM              | Mongoose               |
| State Management | React Query            |
| Styling          | TailwindCSS            |
| UI Components    | shadcn/ui              |
| Language         | TypeScript             |
| Analytics SDK    | Custom Tracker Script  |

---

# Project Structure

```bash
.
├── app/
│   ├── api/
│   │   ├── analytics/
│   │   ├── sessions/
│   │   └── heatmap/
│   │
│   ├── dashboard/
│   ├── test/
│   └── page.tsx
│
├── components/
│   ├── dashboard/
│   └── ui/
│
├── hooks/
│
├── lib/
│   ├── mongodb.ts
│   └── utils.ts
│
├── models/
│   └── Event.ts
│
├── public/
│   └── js/
│       └── scout.js
│
└── README.md
```

---

# Setup Steps

## 1. Clone Repository

```bash
git clone <your-repo-url>
cd sessionlens
```

---

## 2. Install Dependencies

### npm

```bash
npm install
```

### yarn

```bash
yarn
```

### pnpm

```bash
pnpm install
```

---

## 3. Configure Environment Variables

Create a `.env.local` file in the project root.

```env
MONGODB_URI="mongodb://127.0.0.1:27017/sessionlens"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

For MongoDB Atlas:

```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/sessionlens"
```

---

## 4. Run Development Server

```bash
npm run dev
```

Application:

```bash
http://localhost:3000
```

---

## 5. Generate Analytics Events

Open:

```bash
http://localhost:3000/test
```

Interact with the page:

* Click buttons
* Navigate pages
* Trigger events

Analytics events will automatically be stored in MongoDB.

---

## 6. Open Dashboard

```bash
http://localhost:3000/dashboard
```

Dashboard includes:

* Sessions analytics
* User journey timeline
* Click heatmaps
* Event statistics

---

# Analytics Flow

```text
Client Browser
      ↓
scout.js Tracker
      ↓
Next.js API Routes
      ↓
MongoDB
      ↓
Dashboard Visualization
```

---

# API Endpoints

## POST `/api/analytics`

Receives analytics events.

### Example Payload

```json
{
  "session_id": "abc123",
  "event_type": "click",
  "page_url": "/test",
  "timestamp": "2026-05-13T12:00:00Z",
  "x": 320,
  "y": 540,
  "viewportWidth": 1920,
  "viewportHeight": 1080
}
```

---

## GET `/api/sessions`

Returns all tracked sessions.

---

## GET `/api/sessions/[id]`

Returns ordered events for a session.

---

## GET `/api/heatmap?page=/test`

Returns heatmap click coordinates for a page.

---

# MongoDB Schema

```ts
{
  session_id: string
  event_type: string
  page_url: string

  x?: number
  y?: number

  viewportWidth?: number
  viewportHeight?: number

  timestamp: Date
}
```

---

# Heatmap Coordinate System

The tracker stores:

* Raw click coordinates
* Viewport dimensions

The dashboard dynamically normalizes coordinates relative to the rendered browser replica container, ensuring:

* Responsive heatmaps
* Mobile compatibility
* Cross-device rendering consistency

---

# Performance Optimizations

* React Query caching
* MongoDB indexing
* Dynamic heatmap rendering
* Prefetched session events
* Optimized loading states
* Responsive coordinate scaling

---

# Assumptions & Trade-offs

## Assumptions

* Users are identified using browser-based session IDs
* Analytics tracking is client-side only
* Heatmap coordinates are normalized relative to viewport size
* MongoDB is available and writable
* Tracker script runs in modern browsers

---

## Trade-offs

### 1. No Authentication Layer

The dashboard is publicly accessible for simplicity and assignment scope.

### 2. No Event Queue/Batching

Events are sent directly to the backend instead of using a queue system like Kafka or RabbitMQ.

### 3. Simplified Heatmap Engine

Heatmaps are rendered using positioned DOM elements instead of canvas/WebGL rendering.

### 4. No Real Session Replay

Only event timelines are implemented instead of full DOM recording/replay systems.

### 5. Basic Session Tracking

Session management uses browser storage instead of advanced fingerprinting/authenticated user tracking.

### 6. Limited Analytics Types

The platform currently tracks:

* Page views
* Click events

Additional analytics such as scroll depth, rage clicks, or conversions are not implemented.

### 7. Single-Service Architecture

Frontend and backend are implemented within a single Next.js application for faster development and deployment simplicity.

---

# Deployment

The application can be deployed on:

* Vercel
* Railway
* Render
* Fly.io

Set the same environment variables in the deployment platform.

---

# Troubleshooting

## MongoDB Connection Error

Check:

* `MONGODB_URI`
* MongoDB service status
* Atlas IP allowlist

---

## Heatmap Points Incorrect

Ensure:

* Viewport dimensions are stored
* Coordinate normalization is enabled

---

## Analytics Events Not Saving

Check:

* Browser network tab
* API route logs
* MongoDB connection
* CORS configuration

---

# Author

Manish Kumar

Full Stack Developer
