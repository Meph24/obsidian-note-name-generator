import { App, PluginSettingTab, Setting } from 'obsidian';
import type GuidNotePlugin from './main';

export class GuidNoteSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: GuidNotePlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Name generator command')
			.setDesc('Shell command whose first stdout line becomes the note name. Leave empty for a random GUID. '
				+ 'Placeholders: {{file}} (absolute path), {{vaultPath}}. Also exported as env GUIDNOTE_FILE / GUIDNOTE_VAULT_PATH.')
			.addText(t => t
				.setPlaceholder('e.g. python C:\\tools\\namer.py {{file}}')
				.setValue(this.plugin.settings.generatorCommand)
				.onChange(async v => {
					this.plugin.settings.generatorCommand = v;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Pipe note content to stdin')
			.setDesc('Send the current note text to the generator on stdin.')
			.addToggle(t => t
				.setValue(this.plugin.settings.pipeContentToStdin)
				.onChange(async v => {
					this.plugin.settings.pipeContentToStdin = v;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Random GUID when note is empty')
			.setDesc('Skip the generator for empty notes. New notes are always empty, so they always get a GUID when this is on.')
			.addToggle(t => t
				.setValue(this.plugin.settings.randomWhenEmpty)
				.onChange(async v => {
					this.plugin.settings.randomWhenEmpty = v;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Generator timeout (ms)')
			.addText(t => t
				.setValue(String(this.plugin.settings.timeoutMs))
				.onChange(async v => {
					const n = parseInt(v, 10);
					if (!isNaN(n) && n > 0) {
						this.plugin.settings.timeoutMs = n;
						await this.plugin.saveSettings();
					}
				}));

		new Setting(containerEl).setName('GUID format').setHeading();

		new Setting(containerEl)
			.setName('Upper case')
			.addToggle(t => t
				.setValue(this.plugin.settings.upperCase)
				.onChange(async v => {
					this.plugin.settings.upperCase = v;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('No hyphens')
			.addToggle(t => t
				.setValue(this.plugin.settings.noHyphens)
				.onChange(async v => {
					this.plugin.settings.noHyphens = v;
					await this.plugin.saveSettings();
				}));
	}
}
