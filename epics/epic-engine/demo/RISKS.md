# Demo risks, 2026-11-19 08:00

For Owen only.  What could go wrong live, and the fallback.  Written by agent demo-ready, 2026-11-18 evening.

## Live risks

1. **A merge restarts the page server mid-demo.**
   Every `epic merge` into main restarts it, and the side bar shows "waiting for the page server".
   - Fallback:  stop merging at 07:30.  Tell running sessions `/focus` with no merges, or park them.
2. **An agent or a session still working tonight changes a page you're showing.**
   - Fallback:  `epic agents` at 07:45;  nothing should be running.  Close sessions you won't show.
3. **A permission prompt stalls a live build.**
   - Fallback:  pre-run the steps you'll show (demo-script's staged demo), or answer the prompt on screen and say why
     it asks.
4. **The epic page is slow on the projector machine (I333).**
   - Fallback:  demo on a SHORT epic page (the staged demo's), not epic-engine's (hundreds of items).
     Fold the Log before you start.
5. **The Review tab is empty or shows the wrong page after a window reload.**
   - Fallback:  `epic open <epic>` in a terminal you have ready, or the checklist button in the tab's title bar.
6. **Accept's 5-minute countdown makes a live Accept look like nothing happened.**
   - Fallback:  say so before you press;  or show it, then press again to take it back.
7. **Auto Send fires while you're talking.**
   - Fallback:  set Auto Send to Off in the page's gear before the demo, Send by hand.
8. **"nobody is listening" on the page you show.**
   - Fallback:  have the epic's session open and idle in its window;  Send wakes it anyway, but slower.
9. **A test turn is held by another run (`the test turn is stuck`).**
   - Fallback:  don't run tests live;  `epic turns` shows who holds it.
10. **Wifi:  the epic repo's turn-end sync (pull and push) hangs or fails.**
    - It never blocks the turn;  commits wait.  If the venue's wifi is bad:  `/airplane` before, `/airplane land` after.
11. **Someone installs from npm during the talk and sees no top-bar tabs.**
    - `spell@next` is 0.8.10 (`latest` is still 0.8.1:  say `@next`).
    - A repo set up with `epic init` gets no tabs at all (T96, from reading the code;  fresh-install may confirm).
      Show the Epics page by its address, `/epics/index.html`.
12. **The extension's Epic Docs tab shows Spell's guides.**
    - Fallback:  keep to the Review and Details tabs (Q73 asks whether to fold Epic Docs away).
13. **Notifications pop over the screen** (Slack, Mail, Claude's own "needs your attention").
    - Fallback:  macOS Focus "Do Not Disturb" on, before you plug in.

## Before 08:00, a checklist

- [ ] `git -C ~/www/spell status`:  main clean, nothing unmerged you want shown
- [ ] `spell server status` (4747) and `epic hub ensure` (4848) both answer
- [ ] `epic agents`:  none running;  `epic turns`:  free
- [ ] The Epics page looks tidy:  72 epics, 28 "urgent".  Star the 3-5 you'll show, so they're first (Favorites)
- [ ] Light theme (projectors wash out dark), and zoom:  VS Code `Cmd +` twice, the browser 125%
- [ ] VS Code:  one window, the Claude panel left, the Review tab right, the terminal closed
- [ ] Auto Send set to Off, or to "2 minutes" and said out loud
- [ ] A backup screen recording of the staged demo (QuickTime, `Cmd Shift 5`), in case the live run stalls
- [ ] One slide, "What is epic":  a plan you and Claude both edit, live;  a worktree per epic;  you review on the
      page, Claude builds;  `npx spell@next epic init`
- [ ] The FAQ page open in a tab, for questions:  epic/README-faq.md (once demo-docs places it)
- [ ] Do Not Disturb on;  Slack and Mail closed
- [ ] Power cable;  the display mirrored, not extended (or extended, with VS Code on the projector)

## Not risks any more (fixed tonight)

- The top bar's Spell tabs (Epic/UI, Spell/UI, App, App/UI, Brand):  hidden in the epic repo's settings (J275).
- The home page's Spell cards and title:  now "Epics", with Guides, Sagas, Epics and Templates only.
- `claude -p` hanging on the plugin (I319):  fixed.
