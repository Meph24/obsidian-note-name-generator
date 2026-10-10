import { Platform } from 'obsidian';
import { NoteNameGeneratorSettings } from './settings';

export interface GeneratorInput {
	/** Absolute path of the note on disk, if it exists yet. */
	absolutePath?: string;
	/** Vault-relative path of the note, if it exists yet. */
	vaultPath?: string;
	/** Current note content (empty string for a new note). */
	content: string;
}

/** Characters not allowed in Obsidian file names. */
const ILLEGAL = /[\\/:*?"<>|#^[\]]/g;

export function randomGuid(settings: NoteNameGeneratorSettings): string {
	let id: string = uuidV4();
	if (settings.noHyphens) id = id.replace(/-/g, '');
	if (settings.upperCase) id = id.toUpperCase();
	return id;
}

/**
 * Random v4 UUID from the Web Crypto API, which exists on desktop and mobile
 * alike (Node's `crypto` module is not available in the mobile app).
 */
function uuidV4(): string {
	if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();

	// Older Android WebViews lack randomUUID but do have getRandomValues.
	const b = crypto.getRandomValues(new Uint8Array(16));
	b[6] = (b[6] & 0x0f) | 0x40;
	b[8] = (b[8] & 0x3f) | 0x80;
	const hex = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** External generators need a shell, which only the desktop app has. */
export function canRunGenerator(): boolean {
	return Platform.isDesktopApp;
}

/**
 * Produce a new base name (without extension). Uses the external generator
 * when configured and applicable, otherwise a random GUID. On mobile the
 * external generator is unavailable, so a random GUID is always used.
 */
export async function generateName(settings: NoteNameGeneratorSettings, input: GeneratorInput): Promise<string> {
	const empty = input.content.trim().length === 0;
	const cmd = settings.generatorCommand.trim();

	if (!cmd || !canRunGenerator() || (empty && settings.randomWhenEmpty)) {
		return randomGuid(settings);
	}

	const out = await runGenerator(cmd, settings, input);
	const name = sanitize(out);
	if (!name) throw new Error('Generator returned an empty name');
	return name;
}

function sanitize(raw: string): string {
	const firstLine = raw.split(/\r?\n/).find(l => l.trim().length > 0) ?? '';
	return firstLine.trim().replace(ILLEGAL, '').replace(/\.md$/i, '');
}

/**
 * Runs the configured command through the platform shell.
 * Placeholders: {{file}} absolute path, {{vaultPath}} vault-relative path.
 * Unresolved placeholders (new note) become empty strings.
 */
function runGenerator(cmd: string, settings: NoteNameGeneratorSettings, input: GeneratorInput): Promise<string> {
	const resolved = cmd
		.replace(/\{\{file\}\}/g, quote(input.absolutePath ?? ''))
		.replace(/\{\{vaultPath\}\}/g, quote(input.vaultPath ?? ''));

	// Loaded lazily: a top-level import would make the plugin fail to load on mobile.
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { execFile } = require('child_process') as typeof import('child_process');

	const isWin = process.platform === 'win32';
	const shell = isWin ? 'cmd.exe' : '/bin/sh';
	const args = isWin ? ['/d', '/s', '/c', `"${resolved}"`] : ['-c', resolved];

	return new Promise((resolve, reject) => {
		const child = execFile(shell, args, {
			timeout: settings.timeoutMs,
			windowsHide: true,
			windowsVerbatimArguments: isWin,
			maxBuffer: 1024 * 1024,
			env: {
				...process.env,
				NNG_FILE: input.absolutePath ?? '',
				NNG_VAULT_PATH: input.vaultPath ?? '',
			},
		}, (err, stdout, stderr) => {
			if (err) {
				const detail = stderr ? `\n${stderr}` : '';
				reject(new Error(`Generator failed: ${err.message}${detail}`));
				return;
			}
			resolve(String(stdout));
		});

		if (child.stdin) {
			// The generator may close stdin without reading it; ignore EPIPE.
			child.stdin.on('error', () => undefined);
			if (settings.pipeContentToStdin) child.stdin.write(input.content);
			child.stdin.end();
		}
	});
}

function quote(s: string): string {
	return `"${s.replace(/"/g, '\\"')}"`;
}
