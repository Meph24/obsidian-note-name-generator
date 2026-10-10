import { defineConfig, globalIgnores } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

// Same rule set as the automated review of Obsidian's community directory.
export default defineConfig([
	globalIgnores(["main.js", "node_modules/", "*.mjs"]),
	...obsidianmd.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
	},
]);
