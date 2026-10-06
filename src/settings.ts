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
}

export const DEFAULT_SETTINGS: NoteNameGeneratorSettings = {
	generatorCommand: '',
	pipeContentToStdin: true,
	randomWhenEmpty: true,
	upperCase: false,
	noHyphens: false,
	timeoutMs: 10000,
};
