import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, GuidNoteSettings } from './settings';
import { GuidNoteSettingTab } from './settingsTab';
import { createNamedNote, renameActiveNote } from './commands';

export default class GuidNotePlugin extends Plugin {
	settings: GuidNoteSettings = DEFAULT_SETTINGS;

	async onload() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.addSettingTab(new GuidNoteSettingTab(this.app, this));

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
