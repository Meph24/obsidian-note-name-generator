/**
 * When to replace the name Obsidian (or another plugin) asked for.
 * - off:      never; only this plugin's own commands generate names
 * - untitled: only when no name was given or it matches `untitledPattern`
 * - all:      always (also replaces e.g. Tray's dated quick-note names)
 */
export type TakeoverMode = 'off' | 'untitled' | 'all';

export interface NoteNameGeneratorSettings {
	/** Shell command producing the new name on stdout. Empty = built-in random GUID. */
	generatorCommand: string;
	/** Pass the note content to the generator via stdin. */
	pipeContentToStdin: boolean;
	/** Skip the generator and use a random GUID when the note is empty. */
	randomWhenEmpty: boolean;
	/** Render GUIDs in upper case. */
	upperCase: boolean;
	/** Render GUIDs without hyphens. */
	noHyphens: boolean;
	/** Timeout for the generator process in ms. */
	timeoutMs: number;
	/** Hook Obsidian's own new-note creation. */
	takeover: TakeoverMode;
	/** Regex for names that count as "untitled" (Obsidian's default, localized variants). */
	untitledPattern: string;
	/** Show a ribbon (left sidebar) icon for creating a note. */
	ribbonIcon: boolean;
}

export const DEFAULT_SETTINGS: NoteNameGeneratorSettings = {
	generatorCommand: '',
	pipeContentToStdin: true,
	randomWhenEmpty: true,
	upperCase: false,
	noHyphens: false,
	timeoutMs: 10000,
	takeover: 'off',
	untitledPattern: '^(Untitled|Unbenannt|Sans titre|Sin título)( \\d+)?$',
	ribbonIcon: true,
};
