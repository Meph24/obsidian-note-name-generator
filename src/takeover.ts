import { TFolder, TFile, FileManager } from 'obsidian';
import type NoteNameGeneratorPlugin from './main';
import { generateName } from './generator';

/**
 * Obsidian's internal method behind "New note", Ctrl+N and plugins such as Tray.
 * Not part of the public typings.
 */
type CreateNewMarkdownFile = (folder: TFolder, filename?: string, contents?: string) => Promise<TFile>;
type PatchedFileManager = FileManager & {
	createNewMarkdownFile: CreateNewMarkdownFile;
};

/**
 * Wraps `fileManager.createNewMarkdownFile` so the requested name is replaced
 * by a generated one according to the takeover setting. Fully reversible.
 */
export class Takeover {
	private original: CreateNewMarkdownFile | null = null;

	constructor(private plugin: NoteNameGeneratorPlugin) {}

	/** (Re)apply according to current settings. */
	apply(): void {
		this.remove();
		if (this.plugin.settings.takeover === 'off') return;

		const fm = this.plugin.app.fileManager as PatchedFileManager;
		if (typeof fm.createNewMarkdownFile !== 'function') {
			console.warn('Note Name Generator: fileManager.createNewMarkdownFile not found; takeover disabled');
			return;
		}

		const original = fm.createNewMarkdownFile;
		this.original = original;
		const plugin = this.plugin;

		fm.createNewMarkdownFile = async function (this: FileManager, folder, filename, contents) {
			const name = await plugin.takeover.replaceName(filename, contents ?? '');
			return original.call(this, folder, name, contents);
		};
	}

	/** Restore the original method. */
	remove(): void {
		if (!this.original) return;
		(this.plugin.app.fileManager as PatchedFileManager).createNewMarkdownFile = this.original;
		this.original = null;
	}

	/**
	 * Returns the filename to use. Keeps any folder segment of the requested
	 * name (Tray passes "<folder>/<date>") and replaces only the base name.
	 */
	async replaceName(requested: string | undefined, contents: string): Promise<string | undefined> {
		if (!this.shouldReplace(requested)) return requested;

		const req = requested ?? '';
		const slash = req.lastIndexOf('/');
		const dir = slash >= 0 ? req.slice(0, slash + 1) : '';

		try {
			const generated = await generateName(this.plugin.settings, { content: contents });
			return dir + generated;
		} catch (e) {
			console.error('Note Name Generator: generator failed, keeping requested name', e);
			return requested;
		}
	}

	private shouldReplace(requested: string | undefined): boolean {
		const { takeover, untitledPattern } = this.plugin.settings;
		if (takeover === 'all') return true;
		if (takeover !== 'untitled') return false;

		const base = (requested ?? '').split('/').pop() ?? '';
		if (base.trim() === '') return true;
		try {
			return new RegExp(untitledPattern).test(base);
		} catch {
			return false;
		}
	}
}
