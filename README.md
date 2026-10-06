# GUID Note

Create new notes whose name is a GUID, or let an external program decide the name.

## Commands

| Command | What it does |
|---------|--------------|
| **Create new note with generated name** | Creates an empty note in Obsidian's default new-note location and opens it. |
| **Rename current note with generated name** | Runs the generator against the active note and renames it. Links are updated. |

## Name generation

1. If no generator command is configured, or the note is empty and *Random GUID when note is empty* is on, a random UUID v4 is used.
2. Otherwise the configured shell command runs. Its first non-empty stdout line becomes the name (illegal filename characters stripped, trailing `.md` removed).

The generator receives the note via:

- `{{file}}` placeholder → absolute path (quoted)
- `{{vaultPath}}` placeholder → vault-relative path (quoted)
- env vars `GUIDNOTE_FILE`, `GUIDNOTE_VAULT_PATH`
- note content on stdin (toggle in settings)

Example generator (PowerShell, names the note after its first heading):

```
powershell -NoProfile -Command "$t=[Console]::In.ReadToEnd(); if($t -match '(?m)^#\s+(.+)$'){$Matches[1]}"
```

## Build & install

```
npm install
npm run build
```

Copy `main.js` and `manifest.json` to `<vault>/.obsidian/plugins/guid-note/`, then reload and enable in **Settings → Community plugins**.
