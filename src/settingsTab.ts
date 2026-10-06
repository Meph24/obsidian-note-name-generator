import { App, PluginSettingTab, Setting } from 'obsidian';
import type NoteNameGeneratorPlugin from './main';
import { TakeoverMode } from './settings';

export class NoteNameGeneratorSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: NoteNameGeneratorPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		const { settings } = this.plugin;
		containerEl.empty();

		new Setting(containerEl).setName('Generator').setHeading();

		new Setting(containerEl)
			.setName('Name generator command')
			.setDesc('Shell command whose first stdout line becomes the note name. Leave empty for a random GUID. '
				+ 'Placeholders: {{file}} (absolute path), {{vaultPath}}. Also exported as env NNG_FILE / NNG_VAULT_PATH.')
			.addText(t => t
				.setPlaceholder('e.g. python C:\\tools\\namer.py {{file}}')
				.setValue(settings.generatorCommand)
				.onChange(async v => {
					settings.generatorCommand = v;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Pipe note content to stdin')
			.setDesc('Send the current note text to the generator on stdin.')
			.addToggle(t => t
				.setValue(settings.pipeContentToStdin)
				.onChange(async v => {
					settings.pipeContentToStdin = v;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Random GUID when note is empty')
			.setDesc('Skip the generator for empty notes. New notes are always empty, so they always get a GUID when this is on.')
			.addToggle(t => t
				.setValue(settings.randomWhenEmpty)
				.onChange(async v => {
					settings.randomWhenEmpty = v;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Generator timeout (ms)')
			.addText(t => t
				.setValue(String(settings.timeoutMs))
				.onChange(async v => {
					const n = parseInt(v, 10);
					if (!isNaN(n) && n > 0) {
						settings.timeoutMs = n;
						await this.plugin.saveSettings();
					}
				}));

		new Setting(containerEl).setName('GUID format').setHeading();

		new Setting(containerEl)
			.setName('Upper case')
			.addToggle(t => t
				.setValue(settings.upperCase)
				.onChange(async v => {
					settings.upperCase = v;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('No hyphens')
			.addToggle(t => t
				.setValue(settings.noHyphens)
				.onChange(async v => {
					settings.noHyphens = v;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl).setName('Integration').setHeading();

		new Setting(containerEl)
			.setName('Ribbon icon')
			.setDesc('Show a "new note" icon in the left sidebar that uses the generator.')
			.addToggle(t => t
				.setValue(settings.ribbonIcon)
				.onChange(async v => {
					settings.ribbonIcon = v;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Take over new-note creation')
			.setDesc('Hook Obsidian\'s own "New note" (file explorer button, Ctrl+N) and plugins that use it, such as Tray\'s quick note. '
				+ '"Untitled only" replaces default names; "All" also replaces names other plugins chose (e.g. Tray\'s date).')
			.addDropdown(d => d
				.addOptions({ off: 'Off', untitled: 'Untitled only', all: 'All' })
				.setValue(settings.takeover)
				.onChange(async v => {
					settings.takeover = v as TakeoverMode;
					await this.plugin.saveSettings();
					this.display();
				}));

		if (settings.takeover !== 'off') {
			new Setting(containerEl)
				.setName('Leave daily notes alone')
				.setDesc('Never rename notes created by the core Daily Notes plugin (detected via its folder and date format).')
				.addToggle(t => t
					.setValue(settings.protectDailyNotes)
					.onChange(async v => {
						settings.protectDailyNotes = v;
						await this.plugin.saveSettings();
					}));
		}

		if (settings.takeover === 'untitled') {
			new Setting(containerEl)
				.setName('Untitled pattern')
				.setDesc('Regular expression matching names that should be replaced (Obsidian\'s default name in your language).')
				.addText(t => t
					.setValue(settings.untitledPattern)
					.onChange(async v => {
						settings.untitledPattern = v;
						await this.plugin.saveSettings();
					}));
		}
	}
}
