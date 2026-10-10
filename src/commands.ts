import { normalizePath, Notice, TFile, FileSystemAdapter } from 'obsidian';
import type NoteNameGeneratorPlugin from './main';
import { generateName } from './generator';

/** Create a new empty note with a generated name and open it. */
export async function createNamedNote(plugin: NoteNameGeneratorPlugin): Promise<void> {
	const { app, settings } = plugin;
	const active = app.workspace.getActiveFile();
	const folder = app.fileManager.getNewFileParent(active?.path ?? '');

	try {
		const name = await generateName(settings, { content: '' });
		const path = await uniquePath(plugin, folder.path, name);
		const file = await app.vault.create(path, '');
		await app.workspace.getLeaf(false).openFile(file);
	} catch (e) {
		new Notice(`Note Name Generator: ${(e as Error).message}`, 8000);
	}
}

/** Rename the active note using the generator (which may read the note). */
export async function renameActiveNote(plugin: NoteNameGeneratorPlugin): Promise<void> {
	const { app, settings } = plugin;
	const file = app.workspace.getActiveFile();
	if (!(file instanceof TFile)) {
		new Notice('No active file');
		return;
	}

	try {
		const content = await app.vault.read(file);
		const name = await generateName(settings, {
			content,
			vaultPath: file.path,
			absolutePath: absolutePath(plugin, file),
		});
		if (name === file.basename) return;

		const folder = file.parent?.path ?? '';
		const path = await uniquePath(plugin, folder, name, file.extension);
		await app.fileManager.renameFile(file, path);
		new Notice(`Renamed to ${name}`);
	} catch (e) {
		new Notice(`Note Name Generator: ${(e as Error).message}`, 8000);
	}
}

function absolutePath(plugin: NoteNameGeneratorPlugin, file: TFile): string | undefined {
	const adapter = plugin.app.vault.adapter;
	return adapter instanceof FileSystemAdapter ? adapter.getFullPath(file.path) : undefined;
}

/** Returns `<folder>/<name>.<ext>`, appending " 1", " 2", ... if taken. */
async function uniquePath(plugin: NoteNameGeneratorPlugin, folder: string, name: string, ext = 'md'): Promise<string> {
	const base = folder && folder !== '/' ? `${folder}/` : '';
	let candidate = normalizePath(`${base}${name}.${ext}`);
	for (let i = 1; await plugin.app.vault.adapter.exists(candidate); i++) {
		candidate = normalizePath(`${base}${name} ${i}.${ext}`);
	}
	return candidate;
}
