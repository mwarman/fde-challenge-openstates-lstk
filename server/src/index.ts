import "./env.ts";
import express from "express";
import type { StatusResponse } from "../../shared/types.ts";
import { readCache } from "./cache.ts";
import { getProgress, startSync } from "./sync.ts";

const app = express();

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/legislators", async (_req, res) => {
  res.json((await readCache()).legislators);
});

app.get("/api/status", async (_req, res) => {
  const cache = await readCache();
  const body: StatusResponse = {
    lastSyncedAt: cache.lastSyncedAt,
    jurisdictions: cache.jurisdictions,
    totalLegislators: cache.legislators.length,
    sync: getProgress(),
  };
  res.json(body);
});

app.post("/api/refresh", (_req, res) => {
  const started = startSync();
  res.status(started ? 202 : 409).json({ started, sync: getProgress() });
});

// JSON errors only; never echo secrets.
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  },
);

app.listen(3001, () => console.log("API on http://localhost:3001"));
