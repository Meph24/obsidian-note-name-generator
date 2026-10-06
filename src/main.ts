import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, NoteNameGeneratorSettings } from './settings';
import { NoteNameGeneratorSettingTab } from './settingsTab';
import { createNamedNote, renameActiveNote } from './commands';
import { Takeover } from './takeover';

export default class NoteNameGeneratorPlugin extends Plugin {
	settings: NoteNameGeneratorSettings = DEFAULT_SETTINGS;
	takeover = new Takeover(this);
	private ribbonEl: HTMLElement | null = null;

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

		this.applyRibbon();
		this.takeover.apply();
	}

	onunload() {
		this.takeover.remove();
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.applyRibbon();
		this.takeover.apply();
	}

	private applyRibbon() {
		const want = this.settings.ribbonIcon;
		if (want && !this.ribbonEl) {
			this.ribbonEl = this.addRibbonIcon('file-plus-2', 'Create new note with generated name', () => {
				void createNamedNote(this);
			});
		} else if (!want && this.ribbonEl) {
			this.ribbonEl.detach();
			this.ribbonEl = null;
		}
	}
}
