import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, NoteNameGeneratorSettings } from './settings';
import { NoteNameGeneratorSettingTab } from './settingsTab';
import { createNamedNote, renameActiveNote } from './commands';

export default class NoteNameGeneratorPlugin extends Plugin {
	settings: NoteNameGeneratorSettings = DEFAULT_SETTINGS;

	async onload() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.addSettingTab(new NoteNameGeneratorSettingTab(this.app, this));

		this.addCommand({
			id: 'create-note',
			name: 'Create new note with generated name',
			callback: () => createNamedNote(this),
		});

		this.addCommand({
			id: 'rename-active-note',
			name: 'Rename current note with generated name',
			checkCallback: (checking) => {
				if (!this.app.workspace.getActiveFile()) return false;
				if (!checking) void renameActiveNote(this);
				return true;
			},
		});
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
