import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const exportRoot = resolve(siteRoot, "out");
const workerRoot = resolve(siteRoot, ".open-next");
const assetRoot = resolve(workerRoot, "assets");

rmSync(workerRoot, { recursive: true, force: true });
mkdirSync(assetRoot, { recursive: true });
cpSync(exportRoot, assetRoot, { recursive: true });

writeFileSync(
  resolve(workerRoot, "worker.js"),
  [
    "export default {",
    "  async fetch(request, env) {",
    "    return env.ASSETS.fetch(request);",
    "  }",
    "};",
    ""
  ].join("\n")
);

console.log("Packaged static documentation worker");
