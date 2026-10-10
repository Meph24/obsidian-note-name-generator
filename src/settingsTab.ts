import { App, PluginSettingTab, SettingDefinitionItem } from 'obsidian';
import type NoteNameGeneratorPlugin from './main';
import { NoteNameGeneratorSettings } from './settings';
import { canRunGenerator } from './generator';

type Key = keyof NoteNameGeneratorSettings;

export class NoteNameGeneratorSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: NoteNameGeneratorPlugin) {
		super(app, plugin);
	}

	getSettingDefinitions(): SettingDefinitionItem<Key>[] {
		const { settings } = this.plugin;
		const takeoverOn = () => settings.takeover !== 'off';

		return [
			{
				type: 'group',
				heading: 'Generator',
				items: [
					{
						name: 'Name generator command',
						desc: 'Shell command whose first stdout line becomes the note name. Leave empty for a random GUID. '
							+ 'Placeholders: {{file}} (absolute path), {{vaultPath}}. Also exported as env NNG_FILE / NNG_VAULT_PATH.',
						visible: canRunGenerator,
						control: { type: 'text', key: 'generatorCommand', placeholder: 'e.g. python C:\\tools\\namer.py {{file}}' },
					},
					{
						name: 'Pipe note content to stdin',
						desc: 'Send the current note text to the generator on stdin.',
						visible: canRunGenerator,
						control: { type: 'toggle', key: 'pipeContentToStdin' },
					},
					{
						name: 'Random GUID when note is empty',
						desc: 'Skip the generator for empty notes. New notes are always empty, so they always get a GUID when this is on.',
						visible: canRunGenerator,
						control: { type: 'toggle', key: 'randomWhenEmpty' },
					},
					{
						name: 'Generator timeout (ms)',
						visible: canRunGenerator,
						control: { type: 'number', key: 'timeoutMs', min: 1, step: 1 },
					},
					{
						name: 'External generator unavailable',
						desc: 'External name generator commands only run in the desktop app. On this device every generated name is a random GUID.',
						visible: () => !canRunGenerator(),
					},
				],
			},
			{
				type: 'group',
				heading: 'GUID format',
				items: [
					{ name: 'Upper case', control: { type: 'toggle', key: 'upperCase' } },
					{ name: 'No hyphens', control: { type: 'toggle', key: 'noHyphens' } },
				],
			},
			{
				type: 'group',
				heading: 'Integration',
				items: [
					{
						name: 'Ribbon icon',
						desc: 'Show a "new note" icon in the left sidebar that uses the generator.',
						control: { type: 'toggle', key: 'ribbonIcon' },
					},
					{
						name: 'Take over new-note creation',
						desc: 'Hook Obsidian\'s own "New note" (file explorer button, Ctrl+N) and plugins that use it, such as Tray\'s quick note. '
							+ '"Untitled only" replaces default names; "All" also replaces names other plugins chose (e.g. Tray\'s date).',
						control: { type: 'dropdown', key: 'takeover', options: { off: 'Off', untitled: 'Untitled only', all: 'All' } },
					},
					{
						name: 'Leave daily notes alone',
						desc: 'Never rename notes created by the core daily notes plugin (detected via its folder and date format).',
						visible: takeoverOn,
						control: { type: 'toggle', key: 'protectDailyNotes' },
					},
					{
						name: 'Untitled pattern',
						desc: 'Regular expression matching names that should be replaced (Obsidian\'s default name in your language).',
						visible: () => settings.takeover === 'untitled',
						control: { type: 'text', key: 'untitledPattern', validate: validateRegex },
					},
				],
			},
		];
	}

	/** Persists through the plugin so the ribbon icon and the takeover hook follow the new value. */
	async setControlValue(key: string, value: unknown): Promise<void> {
		Object.assign(this.plugin.settings, { [key]: value });
		await this.plugin.saveSettings();
		// The takeover mode decides which of the settings below it are shown.
		this.refreshDomState();
	}
}

function validateRegex(value: string): string | void {
	try {
		new RegExp(value);
	} catch (e) {
		return (e as Error).message;
	}
}
