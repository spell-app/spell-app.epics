---
id: r6
epic: editor
from: 🚧 from-jarvis (0c62d6c9)
at: 2026-11-19T21:26-05:00
status: filed
filed: P41 · Save Back To Disk
phase: p-save-back-to-disk
---

## The person's words

Ah, we'll want to think about storing file handles for apps that save to the disk.
Send as a phase to whichever other editor is approproate

---

Context (Claude, from epic from-jarvis's P9 · File Upload In Spell, Owen's comment C13):
- A file a person picks or drops gives a `File` in every browser, and an entry (`webkitGetAsEntry`, FileSystemEntry) that can walk a dropped folder, but can't write the file or be kept past a reload.
- A handle that CAN write the file and be kept (File System Access API:  `showOpenFilePicker()`, `getAsFileSystemHandle()` on a drop, stored in IndexedDB) is Chrome and Edge only.
- `<ui-uploader>` (now on main) already puts the handle in its `ui-file-dropped` event's detail where the browser gives one.
- Wanted, as a phase:  apps that save to the disk keep a file's handle, so the app can save back to the same file later, after a reload (Chrome / Edge), with a fallback (download / save-as) elsewhere.

## Context

From epic from-jarvis (🚧 from-jarvis): Owen's reply on C13, P9 · File Upload In Spell (epics/from-jarvis/from-jarvis.plan.html#p-file-upload-in-spell). <ui-uploader>: ui/src/components/ui-uploader/.
