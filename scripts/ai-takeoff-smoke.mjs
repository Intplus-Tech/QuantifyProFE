#!/usr/bin/env node
/**
 * AI Takeoff smoke test.
 *
 * Walks the documented flow against a real server and prints every raw payload,
 * so the three things the OpenAPI document leaves undefined can be settled:
 *
 *   1. whether the AI paths need the /api/v1 prefix doubled
 *   2. where the session id actually lives in the create-session response
 *   3. what keys the detections carry in `attributes` (width / depth / grid …)
 *
 * No dependencies — Node 18+ only (global fetch, FormData, Blob).
 *
 * This writes real records: it uploads files and opens a takeoff session, and
 * will create a project unless you pass one. Run it against staging.
 *
 *   node scripts/ai-takeoff-smoke.mjs --help
 */

import { readFileSync } from "node:fs";
import { basename } from "node:path";

// ── args ────────────────────────────────────────────────────────────────────

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (!arg.startsWith("--")) continue;
  const [key, inline] = arg.slice(2).split("=");
  if (inline !== undefined) {
    args[key] = inline;
    continue;
  }
  const next = process.argv[i + 1];
  // A flag with no value, or followed by another flag, is a boolean.
  args[key] = next === undefined || next.startsWith("--") ? "true" : process.argv[++i];
}

if (args.help) {
  console.log(`
AI Takeoff smoke test

Required (one of):
  --token <jwt>              Bearer token
  --email <e> --password <p> Log in and use the returned token

Required:
  --file <path>              Drawing page image to analyse (PNG recommended)

Optional:
  --base <url>       default https://quantifyprobe.onrender.com/api/v1
  --project <id>     reuse an existing project instead of creating one
  --page <n>         page number, default 1
  --scale <n>        real-world units per pixel, default 1
  --unit <u>         mm|cm|m|ft|in|px, default mm
  --types <a,b>      element types, default pile_cap,ground_beam
  --width <n>        page pixel width  (auto-read for PNG)
  --height <n>       page pixel height (auto-read for PNG)
  --commit           pass commit:true to /finish (builds the BOQ). Off by default.
  --skip-finish      stop before /finish

Other endpoint groups (run independently of the takeoff flow):
  --credits          exercise all 6 AI Credits endpoints, then exit
  --pdf-boq <path>   exercise all 6 AI PDF BOQ endpoints with that PDF, then exit

Example:
  node scripts/ai-takeoff-smoke.mjs --email you@co.com --password secret \\
    --file ./page1.png --types pile_cap,ground_beam --scale 2.5
`);
  process.exit(0);
}

const BASE = (args.base ?? "https://quantifyprobe.onrender.com/api/v1").replace(/\/$/, "");
const PAGE = Number(args.page ?? 1);
const SCALE = Number(args.scale ?? 1);
const UNIT = args.unit ?? "mm";
const TYPES = (args.types ?? "pile_cap,ground_beam").split(",").map((t) => t.trim());

// ── output helpers ──────────────────────────────────────────────────────────

const C = { dim: "\x1b[2m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m", bold: "\x1b[1m", off: "\x1b[0m" };
const step = (n, t) => console.log(`\n${C.bold}${C.cyan}── ${n}. ${t} ${"─".repeat(Math.max(0, 58 - t.length))}${C.off}`);
const ok = (m) => console.log(`${C.green}  ✓${C.off} ${m}`);
const bad = (m) => console.log(`${C.red}  ✗${C.off} ${m}`);
const note = (m) => console.log(`${C.yellow}  !${C.off} ${m}`);
const dump = (label, value) =>
  console.log(`${C.dim}  ${label}:${C.off}\n${JSON.stringify(value, null, 2).split("\n").map((l) => "    " + l).join("\n")}`);

const findings = [];

async function call(method, path, { body, headers = {}, token, raw } = {}) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(raw ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: raw ? body : body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, ok: res.ok, data, url };
}

/** Read pixel dimensions straight out of a PNG IHDR chunk. */
function pngSize(buffer) {
  const isPng = buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (!isPng) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

// ── run ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`${C.bold}AI Takeoff smoke test${C.off}`);
  console.log(`${C.dim}base: ${BASE}${C.off}`);

  // 1. auth ------------------------------------------------------------------
  step(1, "Authenticate");
  let token = args.token;

  if (!token) {
    if (!args.email || !args.password) {
      bad("Pass --token, or --email and --password. See --help.");
      process.exit(1);
    }
    const login = await call("POST", "/auth/login", {
      body: { email: args.email, password: args.password },
    });
    if (!login.ok) {
      bad(`Login failed (${login.status})`);
      dump("response", login.data);
      process.exit(1);
    }
    const d = login.data?.data ?? login.data;
    token = d?.token ?? d?.accessToken ?? d?.access_token ?? d?.tokens?.accessToken;
    if (!token) {
      bad("Logged in but could not find a token in the response.");
      dump("response", login.data);
      process.exit(1);
    }
    ok("Logged in");
  } else {
    ok("Using supplied token");
  }

  // Optional standalone groups ------------------------------------------------
  if (args.credits) {
    await runCredits(token);
    return summary();
  }
  if (args["pdf-boq"] && args["pdf-boq"] !== "true") {
    await runPdfBoq(token, args["pdf-boq"]);
    return summary();
  }

  // 2. prefix probe ----------------------------------------------------------
  step(2, "Resolve the /api/v1 prefix question");
  const fakeId = "000000000000000000000000";
  const relative = await call("GET", `/ai-takeoff/jobs/${fakeId}`, { token });
  const doubled = await call("GET", `/api/v1/ai-takeoff/jobs/${fakeId}`, { token });

  console.log(`  relative  ${BASE}/ai-takeoff/jobs/… → ${relative.status} ${JSON.stringify(relative.data?.message ?? relative.data)}`);
  console.log(`  doubled   ${BASE}/api/v1/ai-takeoff/jobs/… → ${doubled.status} ${JSON.stringify(doubled.data?.message ?? doubled.data)}`);

  const relMsg = String(relative.data?.message ?? "");
  const looksRouted = (m) => /job/i.test(m) || /not found/i.test(m) === false;
  if (relative.status !== 404 || looksRouted(relMsg)) {
    ok("Relative paths reach the AI router — current frontend config is correct.");
    findings.push("Prefix: relative (current config correct)");
  } else {
    note("Compare the two messages above. A route-level 'not found' on the relative call");
    note("and a job-level one on the doubled call would mean the prefix must be doubled.");
    findings.push(`Prefix: INCONCLUSIVE — relative="${relMsg}" doubled="${doubled.data?.message ?? ""}"`);
  }

  // 3. project ---------------------------------------------------------------
  step(3, "Project");
  let projectId = args.project;
  if (projectId) {
    ok(`Reusing project ${projectId}`);
  } else {
    const created = await call("POST", "/projects", {
      token,
      body: {
        name: `AI smoke ${new Date().toISOString().slice(0, 19)}`,
        description: "Created by ai-takeoff-smoke.mjs",
        // name + source + processingMode are the API's required trio.
        source: "manual-drawn",
        processingMode: "ai",
        projectType: "residential",
      },
    });
    dump(`POST /projects → ${created.status}`, created.data);
    // POST answers with the bare Project; GET wraps it in { success, data }.
    projectId = created.data?.data?._id ?? created.data?._id;
    if (projectId) {
      findings.push(
        `Create project response: id at ${created.data?.data?._id ? "data._id" : "root _id"}`,
      );
    }
    if (!projectId) {
      bad("No project id came back. Pass --project <id> to reuse an existing one.");
      process.exit(1);
    }
    ok(`Created project ${projectId}`);
  }

  // 4. upload ----------------------------------------------------------------
  step(4, "POST /uploads");
  if (!args.file) {
    bad("Pass --file <path> to a drawing page image.");
    process.exit(1);
  }
  const buffer = readFileSync(args.file);
  const name = basename(args.file);

  const form = new FormData();
  form.append("file", new Blob([buffer]), name);
  form.append("folder", "ai-takeoff-smoke");

  const upload = await call("POST", "/uploads", { token, body: form, raw: true });
  dump(`POST /uploads → ${upload.status}`, upload.data);
  const uploadedFileId = upload.data?.data?._id;
  if (!uploadedFileId) {
    bad("No upload id came back — cannot continue.");
    process.exit(1);
  }
  ok(`uploadedFileId = ${uploadedFileId}`);

  const size = pngSize(buffer);
  const width = Number(args.width ?? size?.width ?? 0);
  const height = Number(args.height ?? size?.height ?? 0);
  if (!width || !height) {
    bad("Could not determine page pixel size. Pass --width and --height.");
    process.exit(1);
  }
  ok(`page size = ${width} × ${height} px`);

  // 5. create session --------------------------------------------------------
  step(5, "POST /projects/:id/ai-takeoff/sessions  (UNKNOWN #1 — response shape)");
  const session = await call("POST", `/projects/${projectId}/ai-takeoff/sessions`, {
    token,
    body: { uploadedFileId, title: "AI smoke session", resume: true },
  });
  dump(`→ ${session.status}`, session.data);

  const d = session.data?.data;
  const sessionId = d?.session?._id ?? d?._id ?? session.data?._id;
  if (!sessionId) {
    bad("Could not locate a session id. The frontend reads data.session._id, then data._id.");
    findings.push("Session id: NOT FOUND at data.session._id or data._id — mapper needs updating");
    process.exit(1);
  }
  const where = d?.session?._id ? "data.session._id" : d?._id ? "data._id" : "data (root)";
  ok(`sessionId = ${sessionId}  (found at ${where})`);
  findings.push(`Session id path: ${where}`);

  // 6. analyse ---------------------------------------------------------------
  step(6, "POST /ai-takeoff/sessions/:id/pages");
  const analyse = await call("POST", `/ai-takeoff/sessions/${sessionId}/pages`, {
    token,
    body: {
      pageNumber: PAGE,
      uploadedFileId,
      width,
      height,
      unit: UNIT,
      scale: SCALE,
      elementTypes: TYPES,
      replaceExisting: true,
    },
  });
  dump(`→ ${analyse.status}`, analyse.data);

  if (analyse.status === 402) {
    note("402 — the account is out of AI credits. Top up and re-run.");
    findings.push("Analyse: blocked on AI credits (402)");
  }
  if (analyse.status === 400) {
    note("400 — usually a missing/invalid scale.");
    findings.push("Analyse: 400, check scale");
  }
  if (analyse.status === 403 || /project type/i.test(JSON.stringify(analyse.data))) {
    note("Looks like the QS project type does not allow these element types.");
    findings.push("Analyse: element types rejected by QS project type — qs-config likely needed");
  }

  const jobId = analyse.data?.data?.job?._id;
  if (!jobId) {
    bad("No job id — stopping before the poll.");
    findings.push(`Analyse: no job returned (status ${analyse.status})`);
    return summary();
  }
  ok(`jobId = ${jobId}`);

  // 7. poll ------------------------------------------------------------------
  step(7, "GET /ai-takeoff/jobs/:jobId  (polling)");
  let job = null;
  for (let attempt = 1; attempt <= 40; attempt++) {
    const res = await call("GET", `/ai-takeoff/jobs/${jobId}`, { token });
    job = res.data?.data;
    process.stdout.write(`\r  attempt ${attempt}: ${job?.status ?? res.status}        `);
    if (job?.status === "completed" || job?.status === "failed") break;
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.log();
  dump("final job", job);
  if (job?.status === "failed") {
    bad(`Job failed: ${job.errorMessage}`);
    findings.push(`Job: failed — ${job.errorMessage}`);
  } else {
    ok(`Job ${job?.status}, detected ${job?.detectedCount ?? 0}, discarded ${job?.discardedCount ?? 0}`);
    findings.push(`Job: ${job?.status}, detected ${job?.detectedCount ?? 0}`);
  }

  // 8. hydrate ---------------------------------------------------------------
  step(8, "GET /ai-takeoff/sessions/:id  (UNKNOWN #2 — attribute keys)");
  const hydrate = await call("GET", `/ai-takeoff/sessions/${sessionId}`, { token });
  const elements = hydrate.data?.data?.elements ?? [];
  ok(`${elements.length} element(s) returned`);

  if (elements.length > 0) {
    dump("first element (verbatim)", elements[0]);

    const attrs = elements[0].attributes;
    const sample = Array.isArray(attrs) ? attrs[0] : attrs;
    const keys = sample ? Object.keys(sample) : [];
    console.log(`\n${C.bold}  attribute keys seen: ${keys.length ? keys.join(", ") : "(none)"}${C.off}`);
    findings.push(`Attribute keys: ${keys.length ? keys.join(", ") : "none returned"}`);

    const expected = ["width", "depth", "thickness", "diameter", "grid", "tag"];
    const matched = expected.filter((k) => keys.includes(k));
    const missing = expected.filter((k) => !keys.includes(k));
    if (matched.length) ok(`frontend reads these correctly: ${matched.join(", ")}`);
    if (missing.length) note(`frontend looks for but did not see: ${missing.join(", ")}`);

    console.log(`  mapsToElementType = ${JSON.stringify(elements[0].mapsToElementType)}`);
    console.log(`  clientId          = ${JSON.stringify(elements[0].clientId)}`);
    console.log(`  reviewStatus      = ${JSON.stringify(elements[0].reviewStatus)}`);
    console.log(`  confidence        = ${JSON.stringify(elements[0].confidence)}`);
    console.log(`  computed          = ${JSON.stringify(elements[0].computed)}`);
    findings.push(`mapsToElementType sample: ${elements[0].mapsToElementType}`);
  } else {
    note("No elements — nothing to check the attribute keys against.");
  }

  // 9. review ----------------------------------------------------------------
  step(9, "PATCH /ai-takeoff/sessions/:id/elements/review  (UNKNOWN #3)");
  if (elements.length === 0) {
    note("Skipped — no elements to review.");
  } else {
    const clientIds = [elements[0].clientId].filter(Boolean);
    if (clientIds.length === 0) {
      bad("First element has no clientId — the review call keys on clientId.");
      findings.push("Review: element carried no clientId");
    } else {
      const review = await call("PATCH", `/ai-takeoff/sessions/${sessionId}/elements/review`, {
        token,
        body: { clientIds, status: "accepted" },
      });
      dump(`→ ${review.status}`, review.data);
      review.ok ? ok("Review accepted") : bad(`Review failed (${review.status})`);
      findings.push(`Review: ${review.status}`);
    }
  }

  // 10. finish ---------------------------------------------------------------
  step(10, "POST /ai-takeoff/sessions/:id/finish");
  if (args["skip-finish"]) {
    note("Skipped (--skip-finish).");
  } else {
    const commit = !!args.commit;
    note(`commit: ${commit}${commit ? " — this builds the BOQ" : " (pass --commit to build the BOQ)"}`);
    const finish = await call("POST", `/ai-takeoff/sessions/${sessionId}/finish`, {
      token,
      body: { commit },
    });
    dump(`→ ${finish.status}`, finish.data);
    finish.ok ? ok("Session finalized") : bad(`Finish failed (${finish.status})`);
    findings.push(`Finish: ${finish.status}`);
  }

  console.log(`\n${C.dim}  projectId ${projectId}\n  sessionId ${sessionId}${C.off}`);
  summary();
}

// ── AI Credits (6 endpoints) ────────────────────────────────────────────────

async function runCredits(token) {
  step(1, "AI Credits — all 6 endpoints");

  const checks = [
    ["GET  /credits/balance", "GET", "/credits/balance"],
    ["GET  /credits/pricing", "GET", "/credits/pricing"],
    ["GET  /credits/history", "GET", "/credits/history"],
    ["GET  /credits/usage", "GET", "/credits/usage"],
    ["GET  /credits/usage/providers", "GET", "/credits/usage/providers"],
  ];

  for (const [label, method, path] of checks) {
    const res = await call(method, path, { token });
    if (res.ok) {
      ok(`${label} → ${res.status}`);
      dump("data", res.data?.data ?? res.data);
    } else {
      bad(`${label} → ${res.status} ${JSON.stringify(res.data?.message ?? "")}`);
    }
    findings.push(`${label}: ${res.status}`);
  }

  // Admin allocation — also what provisions a missing credit account.
  const userId = args.userid ?? args.userId;
  if (!userId) {
    note("POST /credits/add skipped — pass --userid <id> to exercise it.");
    findings.push("POST /credits/add: skipped (no --userid)");
    return;
  }

  const add = await call("POST", "/credits/add", {
    token,
    body: {
      userId,
      amount: Number(args.amount ?? 100),
      type: "allocation",
      description: "smoke test",
    },
  });
  dump(`POST /credits/add → ${add.status}`, add.data);
  if (add.status === 403) note("403 — this account is not an admin.");
  findings.push(`POST /credits/add: ${add.status}`);
}

// ── AI PDF BOQ (6 endpoints) ────────────────────────────────────────────────

async function runPdfBoq(token, filePath) {
  step(1, "AI PDF BOQ — all 6 endpoints");

  const buffer = readFileSync(filePath);
  const form = new FormData();
  form.append("file", new Blob([buffer]), basename(filePath));
  form.append("documentHint", args.hint ?? "Structural drawings, smoke test");

  const generate = await call("POST", "/pdf-boq/generate", {
    token,
    body: form,
    raw: true,
  });
  dump(`POST /pdf-boq/generate → ${generate.status}`, generate.data);
  findings.push(`POST /pdf-boq/generate: ${generate.status}`);

  const jobId = generate.data?.data?.jobId ?? generate.data?.data?._id;
  if (!jobId) {
    bad("No jobId returned — stopping.");
    return;
  }
  ok(`jobId = ${jobId}`);

  const list = await call("GET", "/pdf-boq/jobs", { token });
  ok(`GET /pdf-boq/jobs → ${list.status} (${(list.data?.data ?? []).length} job(s))`);
  findings.push(`GET /pdf-boq/jobs: ${list.status}`);

  step(2, "Polling the BOQ job (this takes a while — vision over every page)");
  let job = null;
  for (let attempt = 1; attempt <= 60; attempt++) {
    const res = await call("GET", `/pdf-boq/jobs/${jobId}`, { token });
    job = res.data?.data;
    process.stdout.write(`\r  attempt ${attempt}: ${job?.status ?? res.status}        `);
    if (!["pending", "processing"].includes(job?.status)) break;
    await new Promise((r) => setTimeout(r, 5000));
  }
  console.log();
  findings.push(`GET /pdf-boq/jobs/:id: ${job?.status}`);

  if (job?.status !== "completed") {
    bad(`Job ended as ${job?.status}: ${job?.errorMessage ?? "no message"}`);
    return;
  }

  const result = job.result ?? {};
  ok(`BOQ ready — projectTitle: ${result.projectTitle ?? "(none)"}`);
  console.log(`  sections: ${(result.sections ?? []).length}`);
  dump("result (first section)", (result.sections ?? [])[0]);

  const patch = await call("PATCH", `/pdf-boq/jobs/${jobId}`, {
    token,
    body: { ...result, projectTitle: `${result.projectTitle ?? "BOQ"} (edited)` },
  });
  ok(`PATCH /pdf-boq/jobs/:id → ${patch.status}`);
  findings.push(`PATCH /pdf-boq/jobs/:id: ${patch.status}`);

  const pdf = await call("GET", `/pdf-boq/jobs/${jobId}/pdf`, { token });
  ok(`GET /pdf-boq/jobs/:id/pdf → ${pdf.status}`);
  findings.push(`GET /pdf-boq/jobs/:id/pdf: ${pdf.status}`);

  if (args["skip-create-project"]) {
    note("POST /create-project skipped (--skip-create-project).");
    return;
  }
  const created = await call("POST", `/pdf-boq/jobs/${jobId}/create-project`, {
    token,
    body: { name: `PDF BOQ smoke ${jobId.slice(-6)}` },
  });
  dump(`POST /pdf-boq/jobs/:id/create-project → ${created.status}`, created.data);
  findings.push(`POST /pdf-boq create-project: ${created.status}`);
}

function summary() {
  console.log(`\n${C.bold}${C.cyan}${"═".repeat(64)}${C.off}`);
  console.log(`${C.bold}  FINDINGS${C.off}\n`);
  findings.forEach((f) => console.log(`  • ${f}`));
  console.log(`\n${C.dim}  Paste this block back to compare against the frontend mappers.${C.off}\n`);
}

main().catch((error) => {
  console.error(`\n${C.red}Unhandled failure:${C.off}`, error);
  process.exit(1);
});
