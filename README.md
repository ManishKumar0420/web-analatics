# SessionLens

SessionLens is a lightweight full-stack web analytics and heatmap platform built with Next.js, MongoDB, and TypeScript.

The application tracks user interactions such as page views and clicks, stores session analytics in MongoDB, and visualizes user behavior through interactive dashboards and click heatmaps.

This project was developed as part of the Full Stack Engineer assignment for CausalFunnel.

---

# Features

## Event Tracking

Tracks:

- Page Views
- Click Events

Captured metadata:

- Session ID
- Page URL
- Timestamp
- Click Coordinates
- Viewport Dimensions

---

## Session Analytics

- Session listing dashboard
- Session duration tracking
- Event counts per session
- Ordered user journey timeline
- Page visit analysis

---

## Heatmap Visualization

- Dynamic click heatmaps
- Intensity-based rendering
- Responsive coordinate normalization
- Multi-page support

---

## Dashboard

- Modern analytics UI
- Real-time data fetching
- Optimized loading states
- Responsive layout
- Interactive session exploration

---

# Tech Stack

| Layer            | Technology             |
| ---------------- | ---------------------- |
| Frontend         | Next.js 15             |
| Backend APIs     | Next.js Route Handlers |
| Database         | MongoDB Atlas          |
| ODM              | Mongoose               |
| Language         | TypeScript             |
| Styling          | TailwindCSS            |
| UI Components    | shadcn/ui              |
| State Management | React Query            |
| Analytics SDK    | Custom Tracker Script  |

---

# Why Next.js For Both Frontend & Backend?

This project intentionally uses Next.js for both the frontend and backend APIs instead of introducing a separate Express.js server.

## Reasons

### 1. Unified Full-Stack Architecture

Using a single framework reduces:

- project complexity
- deployment overhead
- duplicated configuration
- separate server management

Frontend pages and backend APIs live inside the same application.

---

### 2. Faster Development

Next.js Route Handlers provide:

- built-in API support
- native TypeScript integration
- filesystem-based routing
- simplified request handling

This significantly speeds up development for analytics-style applications.

---

### 3. Simpler Deployment

The application can be deployed as a single service on platforms like:

- Vercel
- Railway
- Render

Without needing:

- separate frontend deployment
- separate backend server
- reverse proxy configuration

---

### 4. Better Developer Experience

Using only Next.js avoids maintaining:

- separate Express middleware
- CORS configuration between services
- independent build pipelines
- multiple package ecosystems

---

## Why Not Express.js?

Express.js is extremely powerful and flexible, but for this project it would introduce additional complexity without significant architectural benefit.

Using Express would require:

- separate backend server
- additional deployment setup
- separate routing layer
- API/frontend integration management

For a medium-sized analytics platform, Next.js APIs are sufficient and simpler to maintain.

---

## Trade-off

Using Next.js APIs instead of Express does reduce flexibility for:

- highly customized middleware pipelines
- websocket-heavy architectures
- large-scale microservice systems
- advanced backend-only scaling patterns

However, for this assignment and project scope, the simplified architecture provides better development speed and maintainability.

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

# Setup

## 1. Clone Repository

```bash
git clone https://github.com/ManishKumar0420/web-analatics.git
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

Create:

```bash
.env.local
```

Example:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/sessionlens
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 4. Run Development Server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

# Test Page

The application includes a dedicated test route:

```bash
http://localhost:3000/test
```

This page is used to simulate user interactions and generate analytics events.

You can:

- click buttons
- navigate pages
- trigger events
- test heatmap tracking

Generated events are automatically stored in MongoDB and become visible in the dashboard.

---

# Dashboard

Dashboard route:

```bash
http://localhost:3000/dashboard
```

Features:

- session analytics
- user journey visualization
- heatmaps
- event insights

---

# Analytics Flow

```text
Client Browser
      ↓
scout.js Tracker
      ↓
Next.js API Routes
      ↓
MongoDB Atlas
      ↓
Dashboard Visualization
```

---

# API Endpoints

## POST `/api/analytics`

Stores analytics events.

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

Returns tracked sessions.

---

## GET `/api/sessions/[id]`

Returns ordered session events.

---

## GET `/api/heatmap?page=/test`

Returns heatmap coordinates for a page.

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

- raw click coordinates
- viewport dimensions

Coordinates are normalized dynamically relative to the rendered browser preview container to ensure:

- responsive heatmaps
- cross-device consistency
- accurate rendering across screen sizes

---

# Performance Optimizations

- React Query caching
- MongoDB indexing
- Dynamic heatmap rendering
- Optimized loading states
- Responsive coordinate scaling
- Cached MongoDB connection pooling

---

# Assumptions

- Users are identified through browser-generated session IDs
- Analytics tracking is client-side only
- MongoDB is available and writable
- Modern browsers are used
- Heatmap rendering is viewport-relative

---

# Trade-offs

## 1. No Authentication Layer

The dashboard is publicly accessible to keep the project focused on analytics functionality.

---

## 2. No Queue/Event Streaming System

Events are written directly to MongoDB instead of using systems like:

- Kafka
- RabbitMQ
- Redis Streams

This simplifies architecture but limits scalability for extremely high event throughput.

---

## 3. Simplified Heatmap Rendering

Heatmaps are rendered using positioned DOM elements instead of:

- Canvas
- WebGL

This improves implementation simplicity but may become less efficient with massive datasets.

---

## 4. No Full Session Replay

The platform tracks event timelines only and does not implement DOM recording/replay systems similar to:

- Hotjar
- FullStory

---

## 5. Basic Session Tracking

Session management relies on browser storage rather than:

- authenticated users
- advanced fingerprinting
- cross-device identity systems

---

## 6. Monolithic Architecture

Frontend and backend are combined into a single Next.js application.

Advantages:

- simpler deployment
- faster development
- easier maintenance

Trade-off:

- less independently scalable than dedicated microservices

---

# Deployment

The application can be deployed on:

- Vercel
- Railway
- Render
- Fly.io

Set the same environment variables in the deployment platform.

---

# Troubleshooting

## MongoDB Connection Issues

Check:

- `MONGODB_URI`
- Atlas IP allowlist
- database credentials
- internet/DNS configuration

---

## Analytics Events Not Saving

Check:

- browser network requests
- API logs
- MongoDB connection
- tracker initialization

---

## Heatmap Rendering Issues

Ensure:

- viewport dimensions are stored
- coordinate normalization is enabled

---

# Future Improvements

Potential future enhancements:

- authentication & RBAC
- websocket-based live analytics
- event batching
- Redis caching
- session replay
- scroll tracking
- rage click detection
- conversion funnels
- distributed event processing

---

# Author

Manish Kumar

Full Stack Developer