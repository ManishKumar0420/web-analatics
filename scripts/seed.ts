/**
 * Seed script — populates MongoDB with realistic test data
 *
 * Run with:
 *   npx tsx scripts/seed.ts
 *
 * Requires MONGODB_URI in .env (loaded via dotenv below).
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// ─── Inline model (avoids import path issues when running as a script) ────────

const EventSchema = new mongoose.Schema({
  session_id: { type: String, required: true },
  event_type: { type: String, required: true },
  page_url:   { type: String, required: true },
  timestamp:  { type: Date,   default: Date.now },
  x:          Number,
  y:          Number,
});
const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return "s_" + Math.random().toString(36).slice(2, 9);
}

function jitter(base: number, range: number) {
  return base + (Math.random() - 0.5) * range;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

// ─── Page definitions ─────────────────────────────────────────────────────────
// Each page defines realistic click zones (x%, y%) for heatmap density

const PAGE_CLICK_ZONES: Record<string, { x: number; y: number; weight: number }[]> = {
  "/": [
    // Nav links
    { x: 15, y: 8,  weight: 3 },
    { x: 48, y: 8,  weight: 4 },
    { x: 72, y: 8,  weight: 3 },
    { x: 88, y: 8,  weight: 5 }, // CTA in nav
    // Hero
    { x: 50, y: 35, weight: 8 }, // Hero CTA button
    { x: 50, y: 55, weight: 3 }, // Secondary link
    // Features section
    { x: 25, y: 68, weight: 2 },
    { x: 50, y: 68, weight: 2 },
    { x: 75, y: 68, weight: 2 },
    // Footer
    { x: 30, y: 92, weight: 1 },
    { x: 70, y: 92, weight: 1 },
  ],
  "/pricing": [
    { x: 15, y: 8,  weight: 2 }, // nav
    { x: 50, y: 8,  weight: 2 },
    // Toggle monthly/annual
    { x: 50, y: 22, weight: 5 },
    // Plan cards
    { x: 22, y: 50, weight: 4 }, // Starter
    { x: 50, y: 50, weight: 9 }, // Pro (most popular)
    { x: 78, y: 50, weight: 3 }, // Enterprise
    // FAQ accordion
    { x: 50, y: 68, weight: 4 },
    { x: 50, y: 74, weight: 3 },
    { x: 50, y: 80, weight: 2 },
    // Bottom CTA
    { x: 50, y: 90, weight: 5 },
  ],
  "/docs": [
    { x: 12, y: 15, weight: 5 }, // sidebar nav items
    { x: 12, y: 22, weight: 4 },
    { x: 12, y: 29, weight: 3 },
    { x: 12, y: 36, weight: 3 },
    { x: 12, y: 43, weight: 2 },
    // Copy code button
    { x: 88, y: 30, weight: 7 },
    { x: 88, y: 55, weight: 5 },
    // In-page links
    { x: 55, y: 40, weight: 3 },
    { x: 55, y: 60, weight: 2 },
    // Search
    { x: 50, y: 5,  weight: 6 },
  ],
  "/blog": [
    { x: 50, y: 12, weight: 3 }, // featured post
    { x: 50, y: 28, weight: 5 },
    { x: 25, y: 45, weight: 4 }, // post cards
    { x: 75, y: 45, weight: 4 },
    { x: 25, y: 62, weight: 3 },
    { x: 75, y: 62, weight: 3 },
    // Tags / category filter
    { x: 20, y: 8,  weight: 4 },
    { x: 32, y: 8,  weight: 3 },
    { x: 44, y: 8,  weight: 2 },
    // Newsletter signup
    { x: 50, y: 85, weight: 5 },
  ],
  "/blog/intro-to-ai": [
    { x: 50, y: 5,  weight: 2 },
    // Share buttons
    { x: 8,  y: 30, weight: 4 },
    { x: 8,  y: 38, weight: 3 },
    { x: 8,  y: 46, weight: 2 },
    // Table of contents
    { x: 88, y: 25, weight: 5 },
    { x: 88, y: 32, weight: 4 },
    { x: 88, y: 39, weight: 3 },
    // In-article CTA
    { x: 50, y: 60, weight: 6 },
    // Related posts
    { x: 25, y: 88, weight: 3 },
    { x: 75, y: 88, weight: 3 },
  ],
  "/checkout": [
    { x: 50, y: 18, weight: 3 }, // email field
    { x: 50, y: 30, weight: 3 }, // card number
    { x: 35, y: 40, weight: 3 }, // expiry
    { x: 65, y: 40, weight: 3 }, // cvv
    { x: 50, y: 55, weight: 7 }, // pay button — high intent
    { x: 50, y: 65, weight: 2 }, // terms link
    { x: 15, y: 5,  weight: 3 }, // back button
  ],
  "/signup": [
    { x: 50, y: 25, weight: 3 }, // name
    { x: 50, y: 35, weight: 4 }, // email
    { x: 50, y: 45, weight: 3 }, // password
    { x: 50, y: 58, weight: 8 }, // submit button
    { x: 50, y: 70, weight: 2 }, // already have account
    { x: 50, y: 80, weight: 4 }, // Google OAuth
  ],
  "/login": [
    { x: 50, y: 35, weight: 5 }, // email
    { x: 50, y: 45, weight: 4 }, // password
    { x: 50, y: 58, weight: 9 }, // login button — highest intent
    { x: 50, y: 68, weight: 3 }, // forgot password
    { x: 50, y: 80, weight: 3 }, // Google OAuth
    { x: 50, y: 90, weight: 1 }, // signup link
  ],
  "/contact": [
    { x: 50, y: 28, weight: 3 }, // name
    { x: 50, y: 38, weight: 4 }, // email
    { x: 50, y: 52, weight: 2 }, // message textarea
    { x: 50, y: 68, weight: 7 }, // send button
    { x: 20, y: 85, weight: 2 }, // social links
    { x: 35, y: 85, weight: 2 },
  ],
  "/about": [
    { x: 50, y: 20, weight: 2 }, // hero
    { x: 25, y: 50, weight: 3 }, // team cards
    { x: 50, y: 50, weight: 3 },
    { x: 75, y: 50, weight: 3 },
    { x: 50, y: 72, weight: 4 }, // join us / careers CTA
    { x: 50, y: 88, weight: 2 }, // contact link
  ],
};

const ALL_PAGES = Object.keys(PAGE_CLICK_ZONES);

// ─── Session templates ────────────────────────────────────────────────────────
// Each template describes a realistic user journey archetype

type EventDef = {
  type: "pageview" | "click" | "scroll" | "input";
  page: string;
  delay: number;          // seconds after session start
  x?: number; y?: number; // for click events
};

interface SessionTemplate {
  name: string;
  events: EventDef[];
}

function clickOn(page: string, delay: number): EventDef {
  const zones = PAGE_CLICK_ZONES[page] ?? [{ x: 50, y: 50, weight: 1 }];
  // Weighted random zone pick
  const totalWeight = zones.reduce((s, z) => s + z.weight, 0);
  let r = Math.random() * totalWeight;
  let zone = zones[zones.length - 1];
  for (const z of zones) { r -= z.weight; if (r <= 0) { zone = z; break; } }
  return {
    type: "click", page,
    x: Math.round(jitter(zone.x, 6)),
    y: Math.round(jitter(zone.y, 4)),
    delay,
  };
}

function view(page: string, delay: number): EventDef {
  return { type: "pageview", page, delay };
}

function scroll(page: string, delay: number): EventDef {
  return { type: "scroll", page, x: 0, y: Math.round(Math.random() * 80 + 10), delay };
}

function input(page: string, delay: number): EventDef {
  return { type: "input", page, x: 50, y: Math.round(Math.random() * 30 + 25), delay };
}

// ─── 10 distinct session archetypes ──────────────────────────────────────────

const SESSION_TEMPLATES: SessionTemplate[] = [
  // 1. Quick bounce — just the homepage
  {
    name: "bounce",
    events: [
      view("/", 0), scroll("/", 8), scroll("/", 18),
    ],
  },

  // 2. Window shopper — browses pricing, doesn't convert
  {
    name: "window_shopper",
    events: [
      view("/", 0), clickOn("/", 12),
      view("/pricing", 14), scroll("/pricing", 20),
      clickOn("/pricing", 35), clickOn("/pricing", 50),
      scroll("/pricing", 65),
    ],
  },

  // 3. Converter — goes straight to checkout
  {
    name: "converter",
    events: [
      view("/", 0), clickOn("/", 10),
      view("/pricing", 12), scroll("/pricing", 20),
      clickOn("/pricing", 30), clickOn("/pricing", 45),
      view("/checkout", 47), input("/checkout", 55),
      input("/checkout", 62), input("/checkout", 70),
      clickOn("/checkout", 80),
    ],
  },

  // 4. Developer — digs deep into docs
  {
    name: "developer",
    events: [
      view("/docs", 0), clickOn("/docs", 8),
      scroll("/docs", 15), clickOn("/docs", 22),
      scroll("/docs", 35), clickOn("/docs", 42),
      clickOn("/docs", 48), scroll("/docs", 60),
      clickOn("/docs", 70),
    ],
  },

  // 5. Blog reader — reads a post, shares it
  {
    name: "blog_reader",
    events: [
      view("/blog", 0), scroll("/blog", 10),
      clickOn("/blog", 18),
      view("/blog/intro-to-ai", 20), scroll("/blog/intro-to-ai", 35),
      scroll("/blog/intro-to-ai", 55), scroll("/blog/intro-to-ai", 80),
      clickOn("/blog/intro-to-ai", 90), // share
    ],
  },

  // 6. Researcher — compares features, reads FAQ, checks about
  {
    name: "researcher",
    events: [
      view("/", 0), scroll("/", 15), clickOn("/", 25),
      view("/pricing", 27), scroll("/pricing", 40),
      clickOn("/pricing", 55), clickOn("/pricing", 70),
      view("/about", 75), scroll("/about", 90),
      clickOn("/about", 110),
      view("/contact", 115), input("/contact", 130),
      input("/contact", 140), clickOn("/contact", 155),
    ],
  },

  // 7. Returning user — goes straight to login
  {
    name: "returning_user",
    events: [
      view("/login", 0), clickOn("/login", 5),
      input("/login", 10), input("/login", 16),
      clickOn("/login", 22),
    ],
  },

  // 8. Sign-up flow — organic new user
  {
    name: "signup_flow",
    events: [
      view("/", 0), scroll("/", 20), clickOn("/", 35),
      view("/pricing", 37), clickOn("/pricing", 55),
      view("/signup", 57), input("/signup", 65),
      input("/signup", 72), input("/signup", 80),
      clickOn("/signup", 90),
    ],
  },

  // 9. Support seeker — contact form submitter
  {
    name: "support_seeker",
    events: [
      view("/", 0), clickOn("/", 10),
      view("/docs", 12), scroll("/docs", 25),
      clickOn("/docs", 38),
      view("/contact", 45), scroll("/contact", 55),
      input("/contact", 65), input("/contact", 78),
      input("/contact", 90), clickOn("/contact", 105),
    ],
  },

  // 10. Power user — visits many sections in one go
  {
    name: "power_user",
    events: [
      view("/", 0), clickOn("/", 8),
      view("/docs", 10), clickOn("/docs", 18), clickOn("/docs", 28),
      view("/blog", 35), clickOn("/blog", 42),
      view("/blog/intro-to-ai", 44), scroll("/blog/intro-to-ai", 55),
      view("/pricing", 65), clickOn("/pricing", 78),
      view("/signup", 80), input("/signup", 88),
      input("/signup", 95), clickOn("/signup", 103),
    ],
  },
];

// ─── Build events for one session ─────────────────────────────────────────────

function buildSession(template: SessionTemplate, baseTime: Date) {
  const sessionId = uid();
  return template.events.map((def) => ({
    session_id: sessionId,
    event_type: def.type,
    page_url:   def.page,
    timestamp:  addSeconds(baseTime, def.delay),
    x: def.x != null ? Math.round(jitter(def.x, 3)) : undefined,
    y: def.y != null ? Math.round(jitter(def.y, 3)) : undefined,
  }));
}

// ─── Extra standalone click clusters (heatmap density) ───────────────────────
// Generates many isolated click events per page so heatmap is dense

function buildClickCluster(page: string, count: number, baseTime: Date) {
  const zones = PAGE_CLICK_ZONES[page] ?? [{ x: 50, y: 50, weight: 1 }];
  const totalWeight = zones.reduce((s, z) => s + z.weight, 0);
  const events = [];

  for (let i = 0; i < count; i++) {
    let r = Math.random() * totalWeight;
    let zone = zones[zones.length - 1];
    for (const z of zones) { r -= z.weight; if (r <= 0) { zone = z; break; } }

    events.push({
      session_id: uid(),
      event_type: "click",
      page_url:   page,
      timestamp:  addSeconds(baseTime, Math.floor(Math.random() * 86400)),
      x: Math.round(jitter(zone.x, 5)),
      y: Math.round(jitter(zone.y, 4)),
    });
  }
  return events;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in .env");

  console.log("🔌 Connecting to MongoDB…");
  await mongoose.connect(uri);
  console.log("✅ Connected\n");

  // Clear existing data
  const deleted = await Event.deleteMany({});
  console.log(`🗑  Cleared ${deleted.deletedCount} existing events\n`);

  const allEvents: object[] = [];
  const now = new Date();

  // ── 1. Session archetypes (50 sessions, distributed across last 7 days) ──

  const SESSIONS_PER_TEMPLATE = 5;
  console.log(`📦 Generating ${SESSION_TEMPLATES.length * SESSIONS_PER_TEMPLATE} sessions…`);

  for (const template of SESSION_TEMPLATES) {
    for (let i = 0; i < SESSIONS_PER_TEMPLATE; i++) {
      // Spread sessions across the last 7 days
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const base = new Date(now);
      base.setDate(base.getDate() - daysAgo);
      base.setHours(base.getHours() - hoursAgo);
      base.setMinutes(Math.floor(Math.random() * 60));

      const events = buildSession(template, base);
      allEvents.push(...events);
    }
    console.log(`   ✓ ${template.name} (×${SESSIONS_PER_TEMPLATE})`);
  }

  // ── 2. Dense click clusters per page (for rich heatmaps) ─────────────────

  const CLICK_COUNTS: Record<string, number> = {
    "/":               120,
    "/pricing":        95,
    "/docs":           80,
    "/blog":           60,
    "/blog/intro-to-ai": 45,
    "/checkout":       55,
    "/signup":         70,
    "/login":          85,
    "/contact":        35,
    "/about":          30,
  };

  console.log("\n🔥 Generating heatmap click clusters…");
  for (const [page, count] of Object.entries(CLICK_COUNTS)) {
    const clicks = buildClickCluster(page, count, now);
    allEvents.push(...clicks);
    console.log(`   ✓ ${page.padEnd(22)} ${count} clicks`);
  }

  // ── 3. Insert all events ──────────────────────────────────────────────────

  console.log(`\n💾 Inserting ${allEvents.length} events…`);
  await Event.insertMany(allEvents, { ordered: false });

  // ── 4. Summary ────────────────────────────────────────────────────────────

  const totalEvents  = await Event.countDocuments();
  const totalClicks  = await Event.countDocuments({ event_type: "click" });
  const totalViews   = await Event.countDocuments({ event_type: "pageview" });
  const uniquePages  = (await Event.distinct("page_url")).length;
  const uniqueSess   = (await Event.distinct("session_id")).length;

  console.log("\n─────────────────────────────────────────");
  console.log("✅ Seed complete!\n");
  console.log(`   Total events   : ${totalEvents}`);
  console.log(`   Pageviews      : ${totalViews}`);
  console.log(`   Clicks         : ${totalClicks}`);
  console.log(`   Unique pages   : ${uniquePages}`);
  console.log(`   Unique sessions: ${uniqueSess}`);
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("🔌 Disconnected. Done!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
