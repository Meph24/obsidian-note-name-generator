import { randomUUID } from 'crypto';
import { execFile } from 'child_process';
import { GuidNoteSettings } from './settings';

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

export function randomGuid(settings: GuidNoteSettings): string {
	let id: string = randomUUID();
	if (settings.noHyphens) id = id.replace(/-/g, '');
	if (settings.upperCase) id = id.toUpperCase();
	return id;
}

/**
 * Produce a new base name (without extension). Uses the external generator
 * when configured and applicable, otherwise a random GUID.
 */
export async function generateName(settings: GuidNoteSettings, input: GeneratorInput): Promise<string> {
	const empty = input.content.trim().length === 0;
	const cmd = settings.generatorCommand.trim();

	if (!cmd || (empty && settings.randomWhenEmpty)) {
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
function runGenerator(cmd: string, settings: GuidNoteSettings, input: GeneratorInput): Promise<string> {
	const resolved = cmd
		.replace(/\{\{file\}\}/g, quote(input.absolutePath ?? ''))
		.replace(/\{\{vaultPath\}\}/g, quote(input.vaultPath ?? ''));

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
				GUIDNOTE_FILE: input.absolutePath ?? '',
				GUIDNOTE_VAULT_PATH: input.vaultPath ?? '',
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
