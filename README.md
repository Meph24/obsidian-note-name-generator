# Note Name Generator

An [Obsidian](https://obsidian.md) plugin that creates or renames notes with a **generated name**.
Out of the box the name is a random GUID. Optionally, any external program can produce the name instead,
reading the note's path and content, so the naming scheme is swappable without touching the plugin.

## Why

Timestamp-named notes and GUID-renamers exist, but each hard-codes one scheme.
This plugin separates *when* a name is needed (new note, rename) from *how* it is produced,
and lets you delegate the "how" to a script of your choice.

## Commands

| Command | What it does |
|---------|--------------|
| **Create new note with generated name** | Creates an empty note in Obsidian's default new-note location and opens it. |
| **Rename current note with generated name** | Runs the generator on the active note and renames it. Links to the note are updated. |

Bind them to hotkeys under **Settings → Hotkeys**.

## How the name is produced

1. If no generator command is configured, **or** the note is empty and *Random GUID when note is empty* is on,
   a random UUID v4 is used (e.g. `3f1c9e2a-7b4d-4c8e-9a1f-2d6e8b0c4a7e`).
2. Otherwise the configured shell command runs. Its first non-empty line of stdout becomes the name.
   Characters not allowed in file names are stripped and a trailing `.md` is removed.

New notes are always empty, so with the default settings they always receive a GUID.
Turn *Random GUID when note is empty* off if your generator should run even without content
(for example a timestamp generator).

### What the generator receives

| Channel | Content |
|---------|---------|
| `{{file}}` placeholder | absolute path of the note, quoted (empty for a new note) |
| `{{vaultPath}}` placeholder | vault-relative path, quoted (empty for a new note) |
| `NNG_FILE` env var | absolute path |
| `NNG_VAULT_PATH` env var | vault-relative path |
| stdin | note content (can be disabled in settings) |

The command runs through `cmd.exe` on Windows and `/bin/sh` elsewhere, so pipes and quoting work as in a terminal.
A non-zero exit code, a timeout, or empty output aborts the operation and shows the error as a notice.

### Examples

Name the note after its first heading (PowerShell):

```
powershell -NoProfile -Command "$t=[Console]::In.ReadToEnd(); if($t -match '(?m)^#\s+(.+)$'){$Matches[1]}"
```

Zettelkasten timestamp (PowerShell, turn off *Random GUID when note is empty*):

```
powershell -NoProfile -Command "Get-Date -Format yyyyMMddHHmmss"
```

Python script that gets the path as an argument and the content on stdin:

```
python C:\tools\note_namer.py {{file}}
```

## Taking over Obsidian's own "New note"

Obsidian's file explorer button, `Ctrl+N`, and plugins such as [Tray](https://github.com/dragonwocky/obsidian-tray)'s
global quick note all create notes through the same internal method. The plugin can hook it so every new note
gets a generated name, no matter where it was created from. The hook is removed when the plugin unloads.

| Mode | Behaviour |
|------|-----------|
| **Off** (default) | Only this plugin's own commands and ribbon icon generate names. |
| **Untitled only** | Replaces the name when none was given or it matches the *Untitled pattern* (Obsidian's localized default, e.g. `Untitled 3`, `Unbenannt`). Names chosen by other plugins are kept. |
| **All** | Always replaces the base name. Tray's quick note then gets a generated name instead of a date; its folder setting is still honoured. |

**Daily notes are protected.** The core Daily Notes plugin creates its notes through the same method, but their
names follow a fixed scheme, so by default the hook leaves any note alone that lands in the daily-notes folder and
whose name parses with the daily-notes date format. Turn *Leave daily notes alone* off if you really want them renamed.
Note that a Tray quick note can only be told apart from a daily note if folder or date format differ.

If the generator fails, the originally requested name is used and the error is logged to the developer console.

## Settings

| Setting | Default | Meaning |
|---------|---------|---------|
| Name generator command | *(empty)* | Shell command; empty means built-in GUID |
| Pipe note content to stdin | on | Send note text to the generator |
| Random GUID when note is empty | on | Skip the generator for empty notes |
| Generator timeout (ms) | 10000 | Kill the generator after this long |
| Upper case | off | `3F1C9E2A-…` instead of `3f1c9e2a-…` |
| No hyphens | off | `3f1c9e2a7b4d…` |
| Ribbon icon | on | Left-sidebar icon that creates a note with a generated name |
| Take over new-note creation | Off | See above |
| Untitled pattern | `^(Untitled\|Unbenannt\|…)( \d+)?$` | Regex for names treated as "untitled" |
| Leave daily notes alone | on | Never rename core Daily Notes |

## Installation

### From a release

Download `main.js` and `manifest.json` from the latest release and put them in
`<vault>/.obsidian/plugins/note-name-generator/`. Reload Obsidian and enable the plugin
under **Settings → Community plugins**.

### With BRAT

Add this repository's URL in the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin.

### From source

```sh
npm install
npm run build                       # produces main.js in the repo root
npm run install:vault -- <vault>    # copies main.js + manifest.json into the vault
```

For live development, set `OBSIDIAN_PLUGINS_DIR` to `<vault>/.obsidian/plugins` and run `npm run dev`;
the bundle is then written straight into the vault on every change.

## Desktop only

The external generator uses Node's `child_process`, which is only available in the desktop app.

## Releasing

```sh
npm version 0.2.0        # bumps package.json, manifest.json, versions.json
git push --follow-tags   # CI builds and attaches main.js + manifest.json to the release
```

## License

[MIT](LICENSE)
