import type { NextConfig } from "next";
import { existsSync, copyFileSync } from "fs";
import { join } from "path";

// Copy viewer assets to public/ at dev/build start
const assets: [string, string][] = [
  ["node_modules/web-ifc/web-ifc.wasm", "public/web-ifc.wasm"],
  ["node_modules/@thatopen/fragments/dist/Worker/worker.min.mjs", "public/fragments-worker.mjs"],
];
for (const [src, dest] of assets) {
  const srcPath = join(process.cwd(), src);
  const destPath = join(process.cwd(), dest);
  if (existsSync(srcPath) && !existsSync(destPath)) {
    copyFileSync(srcPath, destPath);
  }
}

const nextConfig: NextConfig = {};

export default nextConfig;
