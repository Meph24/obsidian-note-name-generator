import { App, TFolder, moment, normalizePath } from 'obsidian';

/** Settings of the core Daily Notes plugin (not in the public typings). */
interface DailyNotesOptions {
	folder?: string;
	format?: string;
}

interface InternalPlugins {
	plugins?: Record<string, { enabled?: boolean; instance?: { options?: DailyNotesOptions } } | undefined>;
}

const DEFAULT_FORMAT = 'YYYY-MM-DD';

/** Returns the core Daily Notes config if the plugin is enabled, else null. */
export function dailyNotesOptions(app: App): Required<DailyNotesOptions> | null {
	const internal = (app as App & { internalPlugins?: InternalPlugins }).internalPlugins;
	const daily = internal?.plugins?.['daily-notes'];
	if (!daily?.enabled) return null;
	const opts = daily.instance?.options ?? {};
	return {
		folder: normalizePath(opts.folder?.trim() || '/'),
		format: opts.format?.trim() || DEFAULT_FORMAT,
	};
}

/**
 * True if a note being created in `folder` with `requested` name looks like a
 * daily note: it lands in the daily-notes folder and its base name parses
 * strictly with the daily-notes date format.
 */
export function isDailyNote(app: App, folder: TFolder, requested: string | undefined): boolean {
	const opts = dailyNotesOptions(app);
	if (!opts || !requested) return false;

	const slash = requested.lastIndexOf('/');
	const base = slash >= 0 ? requested.slice(slash + 1) : requested;
	const subdir = slash >= 0 ? requested.slice(0, slash) : '';
	const target = normalizePath(subdir ? `${folder.path}/${subdir}` : folder.path);

	if (target !== opts.folder) return false;
	return moment(base, opts.format, true).isValid();
}
