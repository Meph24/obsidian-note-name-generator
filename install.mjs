// Copies the built plugin into a vault: npm run install:vault -- <vault-path>
// or set OBSIDIAN_PLUGINS_DIR=<vault>/.obsidian/plugins
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import process from "process";

const vault = process.argv[2];
const pluginsDir = vault ? join(vault, ".obsidian", "plugins") : process.env.OBSIDIAN_PLUGINS_DIR;

if (!pluginsDir) {
	console.error("Usage: npm run install:vault -- <vault-path>   (or set OBSIDIAN_PLUGINS_DIR)");
	process.exit(1);
}
if (!existsSync("main.js")) {
	console.error("main.js not found. Run `npm run build` first.");
	process.exit(1);
}

const target = join(pluginsDir, "note-name-generator");
mkdirSync(target, { recursive: true });
for (const f of ["main.js", "manifest.json"]) copyFileSync(f, join(target, f));
console.log(`Installed to ${target}. Reload plugins in Obsidian.`);
