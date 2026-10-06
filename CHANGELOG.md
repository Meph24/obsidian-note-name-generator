# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning: [SemVer](https://semver.org/).

## [Unreleased]

### Added
- Ribbon icon (left sidebar) that creates a note with a generated name; can be turned off
- Optional takeover of Obsidian's own new-note creation (file explorer, `Ctrl+N`, Tray quick note)
  with modes *Off*, *Untitled only* (configurable pattern) and *All*
- *Leave daily notes alone* (default on): the takeover skips notes created by the core Daily Notes plugin

## [0.1.0] - 2026-10-06

### Added
- Command *Create new note with generated name*
- Command *Rename current note with generated name*
- Built-in random GUID generator (UUID v4) with upper-case and no-hyphen options
- Pluggable external generator: any shell command, fed the note path via placeholders
  and environment variables and the note content via stdin
- Option to fall back to a random GUID when the note is empty
