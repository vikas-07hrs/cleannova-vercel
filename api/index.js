/**
 * Cleannova API – Vercel serverless entry
 */
const path = require("path");
const express = require("express");

let cors, helmet, rateLimit, createClient;
try {
  require("dotenv").config();
} catch (_) {}
try {
  cors = require("cors");
} catch (_) {}
try {
  helmet = require("helmet");
} catch (_) {}
try {
  rateLimit = require("express-rate-limit");
} catch (_) {}
try {
  createClient = require("@supabase/supabase-js").createClient;
} catch (_) {}

const app = express();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase =
  createClient && supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

const demoQuotes = [];

if (helmet) app.use(helmet({ contentSecurityPolicy: false }));
if (cors) app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "32kb" }));

const quoteLimiter = rateLimit
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: { error: "Too many requests." },
    })
  : (_req, _res, next) => next();

// ---------- Health ----------
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "cleannova-api",
    db: supabase ? "supabase" : "demo-memory",
    time: new Date().toISOString(),
  });
});

// ---------- Quotes ----------
app.post("/api/quotes", quoteLimiter, async (req, res) => {
  try {
    const result = await handleQuote(req.body);
    if (result.error)
      return res.status(result.status).json({ error: result.error });
    res.status(201).json(result.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/quotes", async (req, res) => {
  const secret = req.headers["x-admin-secret"] || req.query.secret;
  if (process.env.ADMIN_SECRET && secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (supabase) {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ quotes: data });
  }
  res.json({ quotes: demoQuotes.slice().reverse(), mode: "demo" });
});

// ---------- Static assets + 404 ----------
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));
app.use((_req, res) => {
  res.status(404).type("text/plain").send("Not Found");
});

// ---------- Shared logic ----------
async function handleQuote(body) {
  const { name, email, phone, service, message, lang } = body || {};

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return { status: 400, error: "Name is required (min 2 characters)." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, error: "Valid email is required." };
  }
  const allowed = ["dry", "home", "maint", "elec", "plumb", "deco"];
  if (!service || !allowed.includes(service)) {
    return { status: 400, error: "Valid service is required." };
  }

  const payload = {
    name: name.trim().slice(0, 120),
    email: email.trim().toLowerCase().slice(0, 200),
    phone: phone ? String(phone).trim().slice(0, 40) : null,
    service,
    message: message ? String(message).trim().slice(0, 2000) : null,
    lang: lang === "nl" ? "nl" : "en",
    status: "new",
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("quotes")
      .insert([payload])
      .select("id, created_at")
      .single();
    if (error) {
      console.error("Supabase error:", error);
      return { status: 500, error: "Database error. Please try again." };
    }
    return {
      data: { success: true, id: data.id, created_at: data.created_at },
    };
  }

  const id = "demo-" + Date.now();
  demoQuotes.push({ id, ...payload });
  console.log("[DEMO] Quote saved:", {
    id,
    name: payload.name,
    service: payload.service,
  });
  return {
    data: { success: true, id, created_at: payload.created_at, mode: "demo" },
  };
}

// Vercel serverless export
module.exports = app;

// Local development: start server when run with "npm start"
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log("\n🚀 Cleannova running at http://localhost:" + PORT);
    console.log(
      "   DB mode: " + (supabase ? "Supabase" : "Demo (in-memory)") + "\n",
    );
  });
}
