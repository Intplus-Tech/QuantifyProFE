/**
 * seed-library-categories.mjs
 * Run: node scripts/seed-library-categories.mjs
 *
 * Reads the encrypted token from the browser's localStorage via a quick
 * Puppeteer/CDP-free approach: we decrypt it the same way tokenManager does,
 * then POST the 3 categories to the API.
 *
 * Prerequisites: the user must be logged in so the token is in localStorage.
 * We read it from the browser's LevelDB profile via node-localstorage is complex,
 * so instead we accept the raw (non-encrypted) token via TOKEN env var OR
 * we decrypt it from the encrypted value printed to stdout by the browser.
 *
 * USAGE:
 *   TOKEN=<your_bearer_token> node scripts/seed-library-categories.mjs
 *
 * If you don't have the raw token, log into the app, open DevTools Console and run:
 *   (()=>{ const k='quantify-pro-secure-secret-key-2026'; const e=localStorage.getItem('qp_access_token'); const b=CryptoJS.AES.decrypt(e,k); console.log(b.toString(CryptoJS.enc.Utf8)); })()
 * Then paste the result as TOKEN=...
 */

import CryptoJS from "crypto-js";
import { createRequire } from "module";
import https from "https";

// ─── Config ──────────────────────────────────────────────────────────────────

const SECRET_KEY = "quantify-pro-secure-secret-key-2026";
const TOKEN_KEY = "qp_access_token";
const BASE_URL = "https://quantifyprobe.onrender.com/api/v1";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function decryptToken(encrypted) {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8) || null;
  } catch {
    return null;
  }
}

async function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Get token — from env var (easiest) or try to decrypt from a passed encrypted value
  let token = process.env.TOKEN;

  if (!token && process.env.ENCRYPTED_TOKEN) {
    token = decryptToken(process.env.ENCRYPTED_TOKEN);
    if (!token) {
      console.error("❌ Failed to decrypt ENCRYPTED_TOKEN");
      process.exit(1);
    }
    console.log("✅ Token decrypted successfully");
  }

  if (!token) {
    console.error(`
❌ No token provided.

Option A — Easiest: provide the raw token:
  TOKEN=<your_jwt> node scripts/seed-library-categories.mjs

Option B — From the app localStorage: open DevTools on http://localhost:3000, go to Console and run:
  console.log(localStorage.getItem('qp_access_token'))
  
Then run:
  ENCRYPTED_TOKEN=<paste_value> node scripts/seed-library-categories.mjs
`);
    process.exit(1);
  }

  const categories = [
    {
      name: "Earthworks",
      icon: "Mountain",
      description: "Excavation, soil disposal and earthmoving works",
      isGlobal: false,
      sortOrder: 1,
    },
    {
      name: "Concrete Works",
      icon: "Box",
      description: "Ready-mix concrete, formwork and reinforcement",
      isGlobal: false,
      sortOrder: 2,
    },
    {
      name: "MEP",
      icon: "Zap",
      description: "Mechanical, electrical and plumbing installations",
      isGlobal: false,
      sortOrder: 3,
    },
  ];

  console.log(`\n🚀 Creating ${categories.length} library categories...\n`);

  for (const cat of categories) {
    try {
      const result = await post("/library/categories", cat, token);
      if (result.status === 200 || result.status === 201) {
        console.log(`✅ Created: "${cat.name}" → ID: ${result.body?.data?._id || "unknown"}`);
      } else {
        console.log(`⚠️  Failed: "${cat.name}" → Status ${result.status}: ${result.body?.message || JSON.stringify(result.body)}`);
      }
    } catch (err) {
      console.error(`❌ Error creating "${cat.name}":`, err.message);
    }
  }

  console.log("\n✅ Done!\n");
}

main();
