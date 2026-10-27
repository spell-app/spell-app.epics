# Sweep 2:  ui-components

Area:  spell-ui/src/components, elements, runtime, styles.
By the coherence agent, 2026-10-26 (epic `coherence`, sweep 2).  No code changed.
- 15 findings, one of them partly a word finding (#10, `dismissible`);  6 Score lines that count wrong.
- The score's hits in this area before:  Arrow keys 4 (UIMenu), A disclosure 2 (UIZoom), Numbers 1 (TitleFit, a false
  hit), A text position 1 (ComponentTokens).
- What holds:  P10's pieces have no new copy here.
  - `LoadOnce`, `HighlightedOption`, `ClipboardCopy`, `NativeFallback.send()`, `fetchOk()`
  - `UIT.FormControlAttributes`:  all nine value controls take it, ui-gaps P14's `<ui-textarea grow>` too
- What didn't:  code written after P8 and P10 merged (10-25, 15:30 and 16:01) rebuilt open / close, the popover panel
  and arrow keys:  ui-gaps P13 (the menu's overflow, 22:43), P14 (`<ui-zoom>`, 23:30), debut P17 (`<ui-theme-menu>`,
  moved into the components at 21:17).
- Sweep 1's eleven here are all closed (P6, P8, P10;  debut P17 folded `spell-brand.css` into `spell.css`).
- A copy-paste check (jscpd) over the area's TypeScript, tests and generated files left out:
  0.08% at 6 lines (2 clones), 0.7% at 4 lines (36);  its CSS 0.73% (4, the largest in a generated sheet).
- `epic owns` finds no branch changing these files now:  each finding names the epic whose phase wrote the code.
  ui-gaps, debut and elemental-spell are all still building.

## 1. One form sync for every native fallback

- **Kind:**  twice.  No one epic:  the newest copy is debut P14's (`<ui-icon-picker>`'s fallback, 10-25).
- **Where:**  each fallback reports its native control's value and validity to the form itself, in a `sync()`,
  and overrides `attached()` only to call it.
  - `spell-ui/src/components/ui-calendar/UICalendar.fallback.ts:70-82`
  - `spell-ui/src/components/ui-input/UIInput.fallback.ts:87-99`
  - `spell-ui/src/components/ui-icon-picker/UIIconPicker.fallback.ts:56-68`
  - `spell-ui/src/components/ui-checkbox/UICheckbox.fallback.ts:68-82`
  - `spell-ui/src/components/ui-rating/UIRating.fallback.ts:67-69, 80-89`
  - `spell-ui/src/components/ui-search/UISearch.fallback.ts:72-83`
  - `spell-ui/src/components/ui-slider/UISlider.fallback.ts:65-67, 87-96`
  - `spell-ui/src/components/ui-dropdown/UIDropdown.fallback.ts:78-80, 119-136`
  - `spell-ui/src/components/ui-select/UISelect.fallback.ts:104-106, 152-166`
  - beyond the area:  `spell-brand/src/components/brand-color-picker/BrandColorPicker.fallback.ts:56-58, 69-71`,
    `spell-brand/src/components/brand-composer/BrandComposer.fallback.ts:64-66, 81-83`
  - and six name the control by its placeholder when it has no name, the same line each:
    `UICalendar.fallback.ts:52`, `UIInput.fallback.ts:62`, `UIIconPicker.fallback.ts:41`, `UISearch.fallback.ts:48`,
    `UIDropdown.fallback.ts:49`, `UISelect.fallback.ts:50`
- **Shared:**  `setFormValue()`, `null` when there's no `name`;  `setValidity()` from the native control, anchored on it;
  once the nodes are attached, then on each change.
- **Differs:**  what the value is, and whose validity counts.
  - the value:  the control's (calendar, input, icon picker);  the box's chosen or unchosen value (checkbox);
    the chosen radio's (rating);  several as a `FormData` (slider, dropdown, select);  none for a file input;
    upper-cased (the brand's colour picker)
  - the validity:  the control's (five);  `valueMissing` alone (search;  dropdown and select work it out);
    none (slider, both brand fallbacks)
- **The one:**  `NativeFallback` (`spell-ui/src/elements/NativeFallback.ts`), as P10 gave it `send()`:
  - `syncForm({ value, control })`:  the form value (`null` without a `name`, a `FormData` for several) and the
    control's validity, anchored on it
  - its own `attached()` runs the fallback's sync once:  the eleven overrides go
  - `nameFromPlaceholder(control)`:  the six placeholder lines
- **Net effect:**
  - each fallback says only what its value is and which control holds the validity
  - the brand's two start reporting validity:  a `required` `<brand-composer>` whose render failed stops passing as
    valid
  - the next form control's fallback gets it for free (debut P14 just wrote one)
- **Saves:**  about 85 lines;  11 copies (9 here, 2 in the brand) and 6 one-liners.
- **Evidence:**
  - `rg -n 'setValidity\(|setFormValue\(' spell-ui/src/components spell-brand/src/components --glob '*fallback*'`:
    every hit sits in a fallback's own `sync()` (the button's submit aside)
  - `rg -n -A2 'override attached\(\)' spell-ui/src/components spell-brand/src/components --glob '*fallback*'`:
    11 overrides, each `this.sync(...)` and nothing else
  - `NativeFallback.ts:124-128`:  `attached()` is an empty hook

## 2. The menu's overflow and the zoom:  P8's and P10's pieces, written again

- **Kind:**  rebuilt.  ui-gaps P13 (the overflow, 10-25 22:43) and P14 (`<ui-zoom>`, 23:30).
- **Where:**
  - `spell-ui/src/components/ui-menu/UIMenu.tsx`, the overflow menu of a `shrinkable` menu or toolbar:
    - 430-435:  its own `UI.overlays` entry (`kind: "popover"`, `restoreFocus: false`, `onDismiss`):
      `PopoverPanel.overlay` (`spell-ui/src/elements/PopoverPanel.ts:32-45`)
    - 438-441:  its own anchor name, `--${UI.ids.next(tag)}`:  `PopoverPanel`'s (`PopoverPanel.ts:75-79`)
    - 556, 612:  `anchor-name` / `position-anchor` written inline:  `anchorStyle` / `panelStyle`
      (`PopoverPanel.ts:65-73`)
    - 465-483:  the popover shown and the overlay entry opened while open and connected, the cleanup undoing both:
      `PopoverPanel.follow()` (`PopoverPanel.ts:47-63`);  878, `POPOVER_OPEN` a second time (`PopoverPanel.ts:93`)
    - 499-509, 519-536:  ↑ ↓ Home End through its rows by hand (`rowBoxes`, `focusRow()`, `onOverflowMenuKey`):
      `UI.focus.arrowKey()` (`spell-ui/src/runtime/RovingTabindex.ts:200-209`)
  - `spell-ui/src/components/ui-zoom/UIZoom.tsx:33-36, 71-82, 98-103`:  its own `open` state, opened and shut with
    `requestChange("isOpen", …, () => true)`:  `E.Disclosure` (`src/element/Disclosure.ts:75-106`);
    its button (120-128) says no `aria-expanded` (`Disclosure.ariaExpanded`)
- **Shared:**  an open state;  a panel in the top layer, hung from its button, closed by Escape or a click outside;
  arrows moving through rows.
- **Differs:**
  - the menu has no form value, so it never loads `spell-ui/forms`, where `PopoverPanel` lives (`forms.ts:9`):
    the likely reason it was written again
  - opening focuses the chosen row;  Tab closes;  the menu sends no open / close events (its vocabulary has only
    `ui-choosing`, so a `PopoverPanel` holding it would send none either)
  - the zoom sends no events of its own:  its `<ui-modal>`'s come out
- **The one:**
  - `F.PopoverPanel` (`spell-ui/src/elements/PopoverPanel.ts`), moved into `spell-ui/core`:  its premise,
    "every control that opens one has a value" (`PopoverPanel.ts:25`, `forms.ts:1-11`), no longer holds.
    Or the menu imports `spell-ui/forms`:  then every page with a shrinkable menu loads the forms chunk.
  - `UI.focus.arrowKey()` for the rows, `orientation: "vertical"`, as `UIThemeEditor.onSwatchKey()` uses it
    (`spell-ui/src/components/ui-theme-editor/UIThemeEditor.tsx:350-362`)
  - `E.Disclosure({ component: this, member: "isOpen" })` for the zoom
- **Net effect:**
  - the overflow menu is a `PopoverPanel` and one `follow()`:  its overlay entry, ids, effect body and constant go
  - its arrows skip disabled rows, as every other Spell UI list's do
    (the hand-written ones land on `aria-disabled` rows, `UIMenu.tsx:643`)
  - `<ui-zoom>`'s button says `aria-expanded`
  - a call for ui-gaps:  `PopoverPanel` into `core` (about 90 lines into core's bundle), or the menu on `forms`
- **Saves:**  about 45 lines;  one copy each of `PopoverPanel`, `arrowKey()` and `Disclosure`.
- **Evidence:**
  - `rg -n 'showPopover\(|hidePopover\(|overlays\.open\(|kind: "popover"' spell-ui/src/components spell-ui/src/elements`:
    besides `PopoverPanel.ts`, only `UIMenu.tsx:432, 469, 470, 480` hang a control's panel this way
    (`UIPopup`, the toasts, the sidebar and the dialog are overlays of their own)
  - `spell map uses PopoverPanel`:  calendar, dropdown, icon picker, search
  - `rg -n 'requestChange\("is(Open|Visible|Collapsed)' spell-ui/src`:  `UIZoom.tsx:81, 102` only

## 3. A shortcut's keys:  one grammar, one set of key caps

- **Kind:**  twice:  three grammars, two caps tables.  ui-gaps P9 (`<ui-keys>`) and elemental-spell P10 (`<ui-action>`).
- **Where:**
  - `spell-ui/src/runtime/Chord.ts:77-105, 128-152`:  `Chord.parse()`, what `UI.keyboard` matches with:
    `Mod` is Command on a Mac and Control elsewhere;  `meta` / `cmd` / `command` the Meta key itself
  - `spell-ui/src/components/ui-keys/UIKeys.tsx:38-44, 72-91, 109-181`:  its own split (`/(?<=.)\+/`), its own alias
    table (`ALIASES`, running the other way:  `arrowup` => `up`, where Chord turns `up` into `arrowup`), its own caps
    and spoken words;  `mod` is ⌘ or Ctrl, `meta` the Meta key (`UIKeys.en.ts:26-32`)
  - `spell-ui/src/components/ui-action/UIAction.tsx:131-155, 191-195`:  `keyCapsFor()`, a third parse and caps table;
    `meta` and `mod` are ⌘ on a Mac, Control elsewhere (`UIAction.en.ts:37-42`)
  - beyond the area:  spell's core matches the same text a fourth way, `shortcutMatches()`
    (`spell-parser/src/core/acting.ts:254-283`), `meta` being Command or Control, as Owen decided for spell
    (elemental-spell Q31, 2026-10-24:  "use meta key for control-or-command, based on the OS of the runtime")
- **Shared:**  the text `mod+shift+Z`:  modifiers then one key, joined by `+`;  which key is Command on a Mac;
  drawn as caps on a Mac (⌘ ⇧ Z), as words elsewhere.
- **Differs:**
  - **what `meta` means:**  `<ui-keys shortcut="meta+T">` draws "Meta T" off a Mac;  `<ui-action shortcut="meta+T">`,
    "Ctrl T"
  - `modifier` is `<ui-keys>`' alone:  `Chord.parse("modifier+S")` throws (`Chord.ts:89-99`)
  - `mod++` (the plus key) is Chord's;  `<ui-keys>` drops the key
  - Mac caps:  `<ui-keys>` draws ↩ ⇥ ⌫ and arrows;  `<ui-action>`, the key's name as written
  - off a Mac:  `<ui-keys>`' caps are English in code (`OTHER_CAPS`, `UIKeys.tsx:146-163`);
    `<ui-action>`'s are vocabulary texts, so translated (`UIAction.en.ts:50-53`)
  - several shortcuts a space apart, and the spoken name (`aria-label`):  `<ui-keys>`' alone
- **The one:**  `Chord` (`spell-ui/src/runtime/Chord.ts`), reached through `UI.keyboard.chord(text)`
  (`spell-ui/src/runtime/Keyboard.ts:44-50`:  "exposed so components can match chords ... without importing `Chord`";
  nothing calls it today);  plus ONE caps-and-words table beside it (`chord.caps(isApple)`, `chord.spoken()`),
  its words vocabulary texts;  `<ui-action>` draws a `<ui-keys>` in its shortcut part.
  - First a question for Owen:  which `meta` wins.  Q31 made it Command-or-Control for spell;
    Spell UI's `Chord` and `<ui-keys>` say the Meta key, with `mod` for Command-or-Control.
  - Spell's core can't import Spell UI (siblings):  a grammar both use would live in the kit (`spell/util`).
- **Net effect:**
  - one meaning for `meta+T`, drawn and pressed, on every Spell UI page
  - `<ui-keys>`' caps translated, as `<ui-action>`'s are
  - `<ui-action>`'s 25 lines and `<ui-keys>`' alias table go;  the caps live once
- **Saves:**  about 50 lines, 3 copies (a 4th in spell's core).
- **Evidence:**
  - `spell map uses Chord`:  `Keyboard.ts` alone;  `.chord()` has no caller
  - `rg -n '⌘' spell-ui/src --glob '*.ts*' --glob '!*.en.ts' --glob '!*.es.ts'`:  `UIKeys.tsx:129-130`,
    `UIAction.tsx:192`
  - `rg -n 'meta' spell-parser/src/core/described.ts spell-parser/src/core/acting.ts`:  `described.ts:62`,
    `acting.ts:124, 255-271`

## 4. Once per frame, however often asked

- **Kind:**  twice;  a mechanism the catalog doesn't have ("Wanted").  No epic:  the newest copy is ui-gaps P13's
  (`TitleFit`, "shaped like `SegmentedThumb`").
- **Where:**  a flag or a cancel handle per class, so a burst of asks runs the work once, at the next moment:
  - `spell-ui/src/components/ui-tab/UITabs.tsx:89-90, 97-105`:  after Solid's update (`refreshIsQueued`)
  - `spell-ui/src/components/ui-menu/UIMenu.tsx:682-683, 716-729`:  after Solid's update (`refreshIsQueued`)
  - `spell-ui/src/runtime/Visibility.ts:132-133, 186-194`:  the next task (`isCheckQueued`, `soon()`)
  - `spell-ui/src/components/ui-menu/SegmentedThumb.ts:35-36, 50-63`:  before the next paint, a new ask restarting it
    (`cancelQueued`)
  - `spell-ui/src/components/ui-menu/TitleFit.ts:52-53, 75-88`:  the same again (ui-gaps P13)
  - beyond the area:  `spell-brand/src/components/brand-checklist/BrandChecklist.tsx:53, 74-85` (UITabs' word for word,
    its comment too), `spell-ui/src/docs-components/ui-docs-toc/UIDocsToc.tsx:378-385`,
    `spell-epic/src/components/epic-page/EpicPage.tsx:600-611`
- **Shared:**  ask as often as you like;  the work runs once, at a set moment;  stopping cancels a pending one.
- **Differs:**  the moment (`afterSolidUpdate()`, `soon()`, `beforeNextPaint()`);  whether a new ask restarts the
  wait (a cancel handle) or rides the pending one (a flag);  the TOC's keeps the strongest of the asks.
- **The one:**  a helper beside the kit's timing ones (`src/element/timing.ts`), its name saying WHEN, e.g.
  `readonly refit = new E.Queued(E.beforeNextPaint, () => this.measure())`, then `refit.ask()`, `refit.cancel()`.
- **Net effect:**
  - each copy is one field and one call:  its flag, cancel handle and their resets go
  - the next measurer, fitter or re-reader takes it instead of the dance
  - the catalog's "Wanted" gets the entry, and a Score line (`this\.\w*[qQ]ueued\w* = true|cancelQueued = `)
- **Saves:**  about 45 lines;  8 copies (5 here).
- **Evidence:**
  - `rg -n 'if \(this\.\w*([qQ]ueued|[sS]cheduled\w*)\w*\) return|this\.\w*[qQ]ueued\w* = true|this\.cancelQueued = ' src spell-ui/src spell-epic/src spell-brand/src spell-app/src`:
    the eight
  - `src/element/timing.ts`:  `afterSolidUpdate()`, `beforeNextPaint()`, `soon()`, `after()`, `every()`;  none coalesces

## 5. The dropdown and the select:  one value, one item reader

- **Kind:**  twice.  The old-name reads are ui-gaps' (its P4 added them;  its P13 / Q28 removed them everywhere but
  here);  the rest is no open epic's.
- **Where:**
  - the components' value, word for word:  `spell-ui/src/components/ui-dropdown/UIDropdown.tsx:108-122, 141-150` and
    `spell-ui/src/components/ui-select/UISelect.tsx:82-95, 145-155`
    (`value` from the selected items, `initialValue`, `chosenValues`, `selectedItemValues()`)
  - their fallbacks' item reader and value, near word for word:
    - `spell-ui/src/components/ui-dropdown/UIDropdown.fallback.ts:82-116, 139-164`
      (`chosen()`, `choices()`, `itemAttribute()`, `OLD_LABEL` / `OLD_KIND`, `Choice`)
    - `spell-ui/src/components/ui-select/UISelect.fallback.ts:108-150, 168-193`
  - beside them, the components' own item reader:  `spell-ui/src/components/ui-dropdown/SlottedItems.ts:56-120`
- **Shared:**  the chosen values from the `value` property, else the attribute (a list when `multiple`), else the
  `selected` items;  each `<ui-item>` child as an option, a header or a divider.
- **Differs:**  the select draws `<hr>` dividers and its options' parts, puts the flag and description into an
  option's text, and undoes a change while `readonly`;  the dropdown's fallback reads the `options` property first.
- **The one:**  one select-like value (a small class, or a base both components share);  and ONE item reader,
  `SlottedItems.valueFor()` made public, which the fallbacks call too (it's plain DOM already).
- **Net effect:**
  - **the fallbacks stop reading the old names `text` and `type`:**  since ui-gaps Q28 "the old attribute names do
    nothing now" (its commit `af709897`), yet `UIDropdown.fallback.ts:96-97` and `UISelect.fallback.ts:124-125` still
    read them, so a broken dropdown shows an item's old `text` the working one ignores
  - a translated page's items reach the fallbacks:  they look for `ui-item` by name (`:scope > ui-item`) and by
    English attribute names, where `SlottedItems` finds a translated tag through the registry (`SlottedItems.ts:60-61`)
  - the value is worked out once for both components
- **Saves:**  about 55 lines;  4 copies (2 values, 2 readers).
- **Evidence:**
  - jscpd (4 lines, 40 tokens):  `UIDropdown.fallback.ts:136-156 <> UISelect.fallback.ts:165-185` (21 lines),
    `UIDropdown.tsx:110-124 <> UISelect.tsx:83-97` (15), `UIDropdown.tsx:145-152 <> UISelect.tsx:149-156`,
    `UIDropdown.fallback.ts:69-79 <> UISelect.fallback.ts:95-105`, `:103-109 <> :133-139`
  - `git show af709897 -- src/components/ui-dropdown/SlottedItems.ts` (in spell-ui):  the old-name reads taken out
    there, not in the fallbacks;  `rg -n 'OLD_LABEL|OLD_KIND' spell-ui/src`

## 6. One reader of a table's columns, native rows or `<ui-row>`s

- **Kind:**  twice.  ui-gaps P7 (Table Rows, 10-25).
- **Where:**
  - `spell-ui/src/components/ui-table/TableSort.ts:42-69, 96-110`:  a native table's column of a cell (counting
    `colSpan`s), its header for a column, the cell over a column, reordering the body rows
  - `spell-ui/src/components/ui-table/TableSort.ts:71-89`:  the same walk again for the static render, by attributes
    (linkedom has no table API)
  - `spell-ui/src/components/ui-table/TableRows.ts:34-116`:  the same walk again for `<ui-row>` / `<ui-cell>`
    ("read as `TableSort` reads a native one", its line 5), counting `span`s;  `isOn()` (142-145) reads a boolean
    attribute's text by hand, as `E.Converters.boolean()` does (`spell-ui/src/vocabulary/Converters.ts:177`)
  - `spell-ui/src/components/ui-table/UICell.tsx:37-41`:  `columnSpan`, `TableRows.span()` again
  - `spell-ui/src/components/ui-table/UITable.tsx:494-495, 500, 505, 531, 542`:  five places choosing which reader
    (`table instanceof HTMLTableElement ? TableSort.x() : TableRows.x()`)
- **Shared:**  rows, header rows, cells, a cell's span;  a cell's column;  the lowest header row's cell over a column;
  the body rows sorted by a column's text.
- **Differs:**  how rows, cells and spans are found (`tHead` / `rows` / `cells` / `colSpan`;  `colspan` attributes;
  `<ui-row>` / `<ui-cell>` children and `span`, translated tags too);  where sorted rows go (each `tbody`;  before the
  footer row).
- **The one:**  `TableSort`'s walk, once, over elements (as its static copy already reads them), handed a shape
  (`rows()`, `cells()`, `span()`, `isHeaderRow()`):  native, static and rows-mode.
- **Net effect:**
  - `UITable` asks one reader;  its five branches go
  - `TableRows` keeps only the rows-mode shape;  `staticHeaderAt()` goes
  - a fix to the walk (rowspans, `TableSort.ts:8-9`'s NOTE) lands for all three
- **Saves:**  about 50 lines;  3 copies, plus UICell's span and `isOn()`.
- **Evidence:**  `rg -n 'TableRows\.|TableSort\.' spell-ui/src/components/ui-table/UITable.tsx`;
  `spell map uses TableSort`:  `UITable.tsx` alone.

## 7. A form state's four `:state()`s, once

- **Kind:**  twice.  No open epic.
- **Where:**  `isError`, `isInfo`, `isSuccess`, `isWarning`, each an `@E.cssState` getter comparing the state shown:
  - `spell-ui/src/components/ui-form/UIField.tsx:175-202`
  - `spell-ui/src/components/ui-form/UIFields.tsx:28-50`
  - `spell-ui/src/components/ui-form/UIForm.tsx:185-212`
- **Shared:**  one of `error`, `info`, `success`, `warning` drawn as `:state()`s.
- **Differs:**  which state shows:  a field's errors make it `error`, a form's failed check makes it `error`,
  a group shows its attribute.
- **The one:**  the `cssStates()` hook, "for a computed set" (`src/element/UIComponent.tsx:902`), fed by one helper in
  `spell-ui/src/components/components.types.ts` beside `UIT.FormState`;  each keeps its own `shownState`.
- **Net effect:**  twelve getters become three one-line hooks;  nothing else reads them
  (`UIPropertyGroup`'s `isError` is its own).
- **Saves:**  about 55 lines;  3 copies.
- **Evidence:**
  - jscpd:  `UIField.tsx:177-204 <> UIForm.tsx:187-214` (28 lines, the area's longest clone)
  - `rg -n '\.(isError|isInfo|isSuccess|isWarning)\b' spell-ui/src`:  no reader of these three's

## 8. One link root:  `link` unless disabled, and its `target`

- **Kind:**  twice.  ui-gaps P3 (every tag takes `link` and `target`) and P9 (`<ui-link>`).
- **Where:**  eleven families draw their own `<a>`, each working out its `href` and `target`:
  - `spell-ui/src/components/ui-text/UIText.tsx:35-61` and `spell-ui/src/components/ui-text/UILink.tsx:31-48`:
    the same `linkAddress` and the same `<Dynamic a|span>`, word for word (`<ui-link>` already imports `UIText`, line 5)
  - `spell-ui/src/components/ui-button/UIButton.tsx:209-213`, `ui-label/UILabel.tsx:115-122`,
    `ui-card/UICard.tsx:141-149`, `ui-step/UIStep.tsx:158-165`, `ui-item/UIItem.tsx:349-361`,
    `ui-breadcrumbs/UIBreadcrumb.tsx:38`, `ui-image/UIImage.tsx:67-75`, `ui-parts/UIHeader.tsx:30-46`
  - the parts' roots:  `spell-ui/src/elements/PartComponent.tsx:43-47, 60-72` (`rootHref`, `rootTarget`),
    filled in by `ui-parts/UIAuthor.ts`, `UITitle.ts`, `UIDetail.ts`
- **Shared:**  an `<a href>` while linked, the family's own tag otherwise;  no `href` while disabled, `aria-disabled`;
  `target` with the link.
- **Differs:**  the tag otherwise (`span`, `div`, `button`, `article`, `hN`);  disabled read as the attribute
  (`this.disabled`:  image, label, card, step) or as `isDisabled`, a disabled fieldset included (button, item).
- **The one:**  two getters on the kit's `UIComponent`, where P3 put the shared `link` (`src/element/UIComponent.tsx:341-417`):
  `linkTo` (the family's own `link` or the shared one, none while disabled) and `linkTarget`;
  `<ui-link>` a subclass of `UIText` with its own vocabulary.
- **Net effect:**
  - **`target` works on every tag, as the shared attribute promises** ("Where `link` opens",
    `spell-ui/src/vocabulary/SharedVocabulary.ts:159-164`):  today `<ui-image>`, `<ui-title>`, `<ui-detail>` and
    `<ui-header>` take it (`SharedVocabulary.takesShared()`) and drop it, as their links never pass one
    (`UIImage.tsx:68-75`, `UITitle.ts:13-20`, `UIDetail.ts:15-21`, `UIHeader.tsx:30-33`)
  - one rule for a disabled link
  - `<ui-link>`'s copied render goes
- **Saves:**  about 35 lines;  11 copies.
- **Evidence:**  `rg -n 'href=\{' spell-ui/src/components spell-ui/src/elements --glob '*.tsx'`;  for each vocabulary
  declaring `link`, `rg -c 'name: "target"'` on it and `rg -c 'target=\{'` on its component:  image, title, detail and
  header declare no `target` and draw none.

## 9. The theme menu's arrow keys, on `RovingTabindex`

- **Kind:**  rebuilt.  debut P17 moved `<ui-theme-menu>` into the components (it was the docs' `<ui-docs-themes>`).
  The catalog lists it "not swept yet" (`agents/coherence/catalog.md:367`).
- **Where:**  `spell-ui/src/components/ui-theme-menu/UIThemeMenu.tsx`
  - 308, 321-332, 537-543:  the scheme control (Light | Dark | Auto), a radio group:  arrows move AND choose, wrapping,
    the chosen one the tab stop
  - 352, 427-430, 442-464, 529-535:  the theme list, a menu:  ↑ ↓ Home End move;  a reactive `tabStopTheme` draws each
    row's `tabindex`
- **Shared:**  what `UI.focus.arrowKey()` does (`spell-ui/src/runtime/RovingTabindex.ts:200-209`), as the radio group
  (`spell-ui/src/components/ui-checkbox/UIRadio.tsx:119-128`) and the theme editor's swatches
  (`spell-ui/src/components/ui-theme-editor/UIThemeEditor.tsx:350-362`:  "move AND choose, wrapping, as in any radio
  group") already use it.
- **Differs:**  the scheme control chooses as it moves (`onChange`);  the list only moves.
- **The one:**  `UI.focus.arrowKey(event, { container, items, orientation, tabindex: "left alone", onChange })`.
- **Net effect:**
  - its two key maps, `onSchemeKey()`, `onMenuKey()`, `rows()` and `focusRow()` go;  the tab stops stay as drawn
  - right-to-left flips the scheme control's ← →, and Home / End work there, as in every Spell UI group
  - the catalog's "not swept yet" names `spell-ui/src/components/ui-theme-menu/`
- **Saves:**  about 35 lines;  2 copies.
- **Evidence:**  `rg -n '\[(\w+\.)?Key\.(arrow\w+|home|end)\]\s*:' src spell-ui/src spell-epic/src spell-brand/src spell-app/src`:
  only `UIThemeMenu.tsx:531-534, 539-542`, a shape the Score line can't see (below).
- Beside it, the same file hears its own children through `ref` + `addEventListener("ui-changed" / "ui-opening" /
  "ui-closing")` (387-389, 470-483), where Spell UI's rule is `on-ui-changed={f}` (spell-ui's `AGENTS.md`, "Events"):
  the only component that still does (`UIThemeEditor.tsx` writes `on-ui-*` six times).

## 10. One close button, and one close for `<ui-message>`

- **Kind:**  twice, and two words.  No open epic owns it;  the attribute's rename is ui-gaps' kind of change
  (`spell ui rename`, `replaces`).
- **Where:**
  - the same close button, four times:  `<button class="close" part="close">` with its translated name, and a
    `closeGlyph` drawing `UIT.CLOSE_ICON` while closable
    - `spell-ui/src/components/ui-message/UIMessage.tsx:45-49, 81-91`
    - `spell-ui/src/components/ui-toast/UIToast.tsx:175, 241-252`
    - `spell-ui/src/components/ui-nag/UINag.tsx:251, 257-267`
    - `spell-ui/src/components/ui-modal/DialogComponent.tsx:320-324, 445-455`
  - the message closes by hand, outside `Disclosure`:  `UIMessage.tsx:100-104` sends `ui-closing`, then sets `hidden`;
    no `ui-closed` follows (`UIMessage.en.ts:104-113`), where the nag and the toast send both through a `Disclosure`
    (`UINag.tsx:183-198`);  neither the catalog's Disclosure takers nor its "Left" list name it
  - two words:  the message says `dismissible`, "Dismiss", `onDismiss`, `MessageDismissDetail` (`UIMessage.en.ts:98, 126`,
    `UIMessage.tsx:87, 101`, `spell-ui/src/components/components.types.ts:376-377`;  Spanish `descartable`,
    `UIMessage.es.ts:14`), where the toast, nag, modal and flyout say `closable` and "Close";
    words.md, open / close:  "Not: ... dismiss", "A message dismissed for good closes too"
- **Shared:**  a button that closes its box, its icon and name;  a cancelable `ui-closing`, then the box hidden.
- **Differs:**  the handler and the text key;  the dialog names its part through `dialogPart()`.
- **The one:**  the close button drawn once (a render helper beside `IconGlyph`, handed the click and the text key);
  the message on a `Disclosure` kept on `hidden`, as the nag's (`UINag.tsx:183-198`);  `closable` for the message,
  with `replaces: ["dismissible"]`.
- **Net effect:**
  - four copies of the button become calls
  - the message sends `ui-closed` once hidden, as every other closable box does
  - one word for it:  `<ui-message closable>`, its button named "Close"
  - left for Owen:  `UI.toasts.dismiss()` and the close reasons' `"dismiss"` (`components.types.ts:833, 871`) say the
    old word in public API too
- **Saves:**  about 40 lines;  4 copies;  one word.
- **Evidence:**  jscpd:  `UIMessage.tsx:76-92 <> UIToast.tsx:236-252` (17 lines), `UIMessage.tsx:81-96 <> UINag.tsx:257-271`
  (16), `DialogComponent.tsx:443-456 <> UINag.tsx:255-268` (14);  `rg -n 'CLOSE_CLASS|closeGlyph = ' spell-ui/src/components`.

## 11. Scroll keys over a row:  `<ui-toolbar>`'s, written again in the kit's site header

- **Kind:**  twice, across repos.  epic-engine I138 (the kit's `SiteHeader`, 2026-10-26 20:11).
- **Where:**
  - `spell-ui/src/components/ui-toolbar/UIToolbar.tsx:57-109, 149-170, 197`:  `canScrollStart` / `canScrollEnd` from
    `scrollLeft > 1` and `scrollLeft + clientWidth < scrollWidth - 1`;  ‹ › scrolling 0.8 of the width (`PAGE_SHARE`)
  - `src/server/site/SiteHeader.ts:243-268, 327-332`:  the same test, the same 0.8 (`SCROLL_SHARE`), the same ‹ ›
    ("as Spell UI's `<ui-toolbar>`", its line 25)
- **Shared:**  which ends of a row can still scroll;  a key scrolling most of a row;  the keys shown only while there's
  more that way.
- **Differs:**  `<ui-toolbar>` honours reduced motion (`UIToolbar.tsx:107`);  the header always scrolls smoothly
  (`SiteHeader.ts:254`).  The header's buttons are its own HTML.
- **The one:**  a plain-DOM helper in the kit (`spell/util/dom`, beside `nextFrame()` and `copyText()`):
  `scrollEnds(box)` (`{ start, end }`) and `scrollByRow(box, direction)`, reduced motion included.
  The kit can't import Spell UI;  Spell UI imports the kit's generic files one by one.
- **Net effect:**  one test of a row's ends, one scroll step;  the header stops ignoring reduced motion.
- **Saves:**  about 25 lines;  2 copies.
- **Evidence:**  `git show --stat 21210f9` (`SiteHeader.ts`, +64);
  `rg -n 'scrollBy|SCROLL_SHARE|PAGE_SHARE' src/server/site spell-ui/src/components/ui-toolbar`.

## 12. `ParentLink`'s glue, once

- **Kind:**  twice.  elemental-spell P18 (Parent Attribute).
- **Where:**  the same ten lines, word for word:  a field, and an `@E.onChange("isConnected", "parent")` method.
  - `spell-ui/src/components/ui-step/UIStep.tsx:58-68`
  - `spell-ui/src/components/ui-tab/UITab.tsx:92-102`
  - `spell-ui/src/components/ui-section/UISection.tsx:121-131`
- **Shared:**  `new E.ParentLink({ domElement, attribute: localAttribute("parent") })`, followed while connected.
- **Differs:**  nothing but the comment naming the container.
- **The one:**  wired once for every tag whose vocabulary declares `parent`, as the kit's `UIComponent` wires the shared
  `link`.  `ParentLink` is plain DOM (`spell-ui/src/elements/ParentLink.ts:19`):  it could move to the kit's
  `spell/element`, beside `Disclosure`.
- **Net effect:**  three copies go;  the next element that joins a container (an epic element too) takes `parent` by
  declaring it.
- **Saves:**  about 25 lines;  3 copies.
- **Evidence:**  jscpd:  `UIStep.tsx:59-71 <> UITab.tsx:93-105` (13 lines), `UISection.tsx:122-133 <> UITab.tsx:93-104` (12).

## 13. "Did the click land on a control of its own?":  one list, one walk

- **Kind:**  twice.  The newest copy is ui-gaps P3's (`OWN_CONTROLS`, in the kit).
- **Where:**  each climbs the event's path up to its own box and asks whether anything on the way is a control:
  - `spell-ui/src/components/components.types.ts:1310-1331`:  `TITLE_CONTROLS`, `TitleControls.isClicked()`
    (the accordion's and section's titles)
  - `src/element/UIComponent.tsx:387-400, 1268-1269`:  `onSharedLinkClick()`, `OWN_CONTROLS` (a linked element's click)
  - `spell-ui/src/components/ui-toast/UIToast.tsx:604-611, 691`:  `landedOnClickable()`, `CLICKABLE`
  - the approve / deny walk, twice:  `spell-ui/src/components/ui-modal/DialogComponent.tsx:471-485` and
    `UIToast.tsx:583-603` (the toast's adds its buttons and its `actions` slot)
- **Shared:**  "a click on a control inside me is that control's, not mine";  the path walked inward-out, up to the
  element.
- **Differs:**  where the walk stops (the element;  the title's toggle);  and the lists:
  - `[role=button]`:  link and toast, not a title:  a `<div role="button">` in an accordion's title folds the panel
  - `[tabindex]`:  title and toast, not a link:  a focusable widget inside a `<ui-card link>` follows the link
  - `summary`, `details`, a bare `a`:  the toast's only;  `[contenteditable]`:  the title's only
- **The one:**  one list and one walk in the kit (`src/element/`, where `OWN_CONTROLS` is;  the kit can't import Spell
  UI's `UIT`):  e.g. `isOwnControlClick(event, { upTo, before })`;  the dialog's and toast's action walks on one helper
  beside `UIT.ModalActionSelectors`.
- **Net effect:**  one answer to "is this a control?" for titles, links and toasts;  three lists become one.
- **Saves:**  about 20 lines;  5 copies.
- **Evidence:**  `rg -n 'TITLE_CONTROLS|OWN_CONTROLS|const CLICKABLE' src/element spell-ui/src`;
  `rg -n 'for \(const target of event\.composedPath\(\)\)' spell-ui/src/components`.

## 14. No transitions while the scheme switches:  one rule for every theme

- **Kind:**  twice (CSS).  debut P17 (One Theme Set).
- **Where:**
  - `spell-ui/src/styles/themes/spell.css:719-735` and `spell-ui/src/styles/themes/glass.css:514-531`
    (Fruity imports Glass):  `:root.ui-scheme-switching` sets a flag, and a style query turns every transition off for
    that frame
  - `ThemePreference` sets `ui-scheme-switching` under EVERY theme
    (`spell-ui/src/components/ui-theme-menu/ThemePreference.ts:196-203`)
  - `themes/merlot.css` and `themes/classic.css` (the base under every theme) have no such rule
- **Shared:**  the same twelve lines;  debut J12 copied Spell's into Fruity ("No transitions while switching light /
  dark:  applied:  the Spell theme's switch, copied").
- **Differs:**  nothing.
- **The one:**  the rule once, in a foundation sheet every page loads (`spell-ui/src/styles/`):  a theme can't miss it.
- **Net effect:**
  - switching light / dark under Merlot, or under Classic alone, stops animating every colour;  two copies become one
  - the buttons' press-in, restated in the same two sheets (`spell.css:705-717`, `glass.css:500-512`), is a theme's
    look, and stays
- **Saves:**  about 12 lines;  2 copies, and Merlot's and Classic's gap.
- **Evidence:**  `rg -c 'scheme-switching' spell-ui/src/styles/themes/*.css`:  `spell.css` 5, `glass.css` 4, no other;
  jscpd (CSS):  `glass.css:501-519 <> spell.css:706-724`.

## 15. A tag's own `:host` rule from its attributes

- **Kind:**  twice.  ui-gaps P7, P8, P12 (cell, stack, terms).
- **Where:**  each writes a `<style>` of its own with a `:host { … }` rule built from its attributes, "so the page's
  own `style` stays the author's":
  - `spell-ui/src/components/ui-stack/UIStack.tsx:31-51`
  - `spell-ui/src/components/ui-table/UICell.tsx:62-80`
  - `spell-ui/src/components/ui-terms/UITerms.tsx:31-43`
  - the same job, done the other way:  `spell-ui/src/components/ui-root/RootBox.ts:6-60`, a constructed sheet adopted
    into the shadow root, every value checked (`CSS.supports()`) "so an attribute can never inject other declarations"
  - and a stale pointer:  `spell-ui/src/components/ui-video/UIVideo.css:4` names a `hostLayout` that `<ui-video>`
    doesn't have (it writes `aspect-ratio` inline, `UIVideo.tsx:50`)
- **Shared:**  the element's own layout as a `:host` rule, never its `style` attribute.
- **Differs:**  the declarations, from each family's own maps (`SPACING`, `ALIGN`, `JUSTIFY`, `VERTICAL`).
- **The one:**  one hook on the kit's `UIComponent`, a getter of declarations it writes into one adopted sheet, as
  `RootBox` does;  or at the least one helper for the `<style>`.
- **Net effect:**  three families drop their plumbing;  the next layout tag writes only its declarations;
  `RootBox`'s sheet handling gets a second user.
- **Saves:**  about 15 lines;  3 copies (4 with `RootBox`).
- **Evidence:**  `rg -n ':host \{ \$\{|<style>\{this\.\w+\}</style>|hostLayout' spell-ui/src`;
  jscpd:  `UIStack.tsx:41-56 <> UICell.tsx:69-84` (16 lines).

## Score lines that overcount

And three that miss.

- **Numbers** (`Math\.min\(.*Math\.max\(|Math\.max\(.*Math\.min\(|/ 1024\b`):  counts any line with both calls.
  - False hits:  `spell-ui/src/components/ui-menu/TitleFit.ts:264` (a span:  the rightmost edge minus the leftmost);
    beyond the area, `spell-parser/src/core/collection-other.ts:212` (two branches of a ternary).
  - Tighter:  the other call INSIDE the first one's parentheses:

    ```text
    Math\.min\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*?Math\.max\(|Math\.max\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*?Math\.min\(|/ 1024\b
    ```

    - over every repo's `src/` (comment lines out):  drops exactly those two (and `PerfRun.ts:117`, a test helper),
      adds none.  Numbers 20 => 18.
- **Words, open / close:**  12 of its 15 hits are in this area, and none is a word left to replace.
  - `spell-ui/src/components/ui-root/UIRoot.catalog.ts:253, 257`:  generated ("GENERATED -- do not edit")
  - `spell-ui/src/components/ui-section/UISection.en.ts:104`:  `replaces: [{ from: "collapsed", … }]`, the old-name
    record `spell ui rename` reads:  it has to say the old word
  - kept on purpose by ui-gaps:  `<ui-comment>` / `<ui-comments>` `collapsed` (J14:  "a look switch ... stays";
    `UIComment.en.ts:30, 48`, `UIComment.tsx:31`, `UIComments.en.ts:47, 61`, `UIComments.tsx:31, 75`), and
    `<ui-section>`'s `:state(collapsed)` (J13:  "stays as it is either way";  `UISection.en.ts:293`, `UISection.tsx:194`)
  - Tighter:  `not spell-ui/src/components/ui-root/UIRoot.catalog.ts`;  `(?<!from: )"collapsed"`;  and the two keeps
    written into words.md's entry, so the count leaves them out
  - It misses what is left:  `dismissible` (finding 10;  add `\bdismissible\b`).  `collapsible`, `collapsing` and
    `fold-icon` wait on ui-gaps' open "fold into ?" (its request r1, "STILL OPEN").
- **Arrow keys through a list** (`(case |=== )(\w+\.)?Key\.(arrow\w+|home|end)\b`):  undercounts.
  - It can't see a key MAP:  `UIThemeMenu.tsx:531-534, 539-542`, two hand-written groups (finding 9).
  - It counts one handler four times:  `UIMenu.tsx:528-531` is one copy (finding 2).
  - Wider:  add `|\[(\w+\.)?Key\.(arrow\w+|home|end)\]\s*:`.
  - Its "Not swept yet ... `UIThemeMenu`" (`catalog.md:367`):  that's `spell-ui/src/components/ui-theme-menu/` now.
- **A disclosure:**  sees the open state, not the popover half:  the menu's hand-built overflow panel
  (`UIMenu.tsx:430-435, 465-483`) counts nothing.
  - Add a `PopoverPanel` line:  `kind: "popover"` · home `spell-ui/src/elements/PopoverPanel.ts` · not
    `spell-ui/src/components/ui-popup/` (it finds `UIMenu.tsx:432` alone today).
- **A text position and its offset:**  `spell-ui/src/styles/ComponentTokens.ts:180` is a real offset => line, but its
  home (`P.positionForOffset()`, spell-parser) is a sibling Spell UI can't import;  so are 2 more of its 6 copies (the
  kit's `src/cli/map/CodeMap.ts`, spell-epic's `src/tools/offline.ts`).  A home in the kit (`spell/util/string`) would
  serve all six:  for the epic-tools-kit and parser-app sweeps.
- **A growing text box:**  its home is stale.  Since ui-gaps P14 the mechanism is `<ui-textarea grow>`
  (`spell-ui/src/components/ui-input/UITextarea.tsx:18-80`, `UIInput.css:233-245`), and `<epic-text-box>` is built on
  it (`spell-epic/src/components/epic-text-box/EpicTextBox.tsx:50, 125-133`).
  - "It is", the home and `in spell-epic/src/` should name `UITextarea`;  `UIDropdown.css:488`
    (`field-sizing: content` on the search box's one line) is another job.

## Considered, left out

- `<ui-comment(s)> collapsed`, `<ui-section>`'s `:state(collapsed)`:  kept by ui-gaps J13 / J14.
- `collapsible`, `collapsing`, `fold-icon` (`UISection.en.ts:92, 111`, `UISections.en.ts:26`, `UIAccordion.en.ts:86`):
  ui-gaps r1's open "fold into ?" decides them.
- `<ui-video ratio="16/9">` (`UIVideo.en.ts:39`, ui-gaps P11) beside `<ui-embed aspect-ratio="16:9">`
  (`UIEmbed.en.ts:73`):  two names and two spellings for a player's shape;  words.md doesn't decide it:  a question for
  ui-gaps.
- The accordion's and section's `LoadableBody` glue (`UIAccordion.tsx:202-247`, `UISection.tsx:378-432`):  2 copies,
  about 15 lines, the statuses spelled two ways (`"loaded"` beside `E.SourceStatus.loaded`):  worth folding into
  `LoadableBody` when either is touched.
- `UIPropertyEditor.tsx:378, 402, 429`:  raw `CustomEvent`s on its child property and group elements, English names
  where a translated tag's own `send()` would translate:  three lines, a suspected bug more than a mechanism.
- `IconCatalog.searchWords()` (`IconCatalog.ts:111-123`):  one load, forgotten when it fails, by hand
  (`LoadOnce`'s `"forgotten"`, for one key):  one copy, a few lines.
- Page sheets registered by hand (`UIPage.tsx:84-95`, `UIDimmer.tsx:129`, `UITable.tsx:144-153`, `ToastStack.ts:205`):
  each at its own moment, two lines each.
- `UIImage.tsx:129`'s raw `"Enter"` / `" "`:  a one-line drive-by onto `UIT.Key`.
- `DismissalStore` (the nag's) not on `PrefStore`:  its docstring says why (Fomantic's keys, cookies).
- `UIPopup`'s anchors:  hung from any element of the page, not a control's own panel.
- `UIReveal`'s `FOCUSABLE`, `FormFields`' `CONTROL_SELECTOR`, the toast's `FORM_CONTROLS`:  other questions than
  "a control of its own".
- The vocabularies' `direction` / `spacing` values, `UIStack`'s and `UITerms`' `SPACING` scales:  each family's own
  (ui-gaps P4's design).
- The themes' button press-in:  a theme's look;  the hue-text recipe per theme:  sweep 1 left it out.
- jscpd's other clones (the cards / statistics / items group renders, `UIIcon` / `UIIcons`, the calendar's and input's
  fallback builds):  a few lines of render each, or finding 1's.
- `UICell`'s bare `row.valueNamed?.()` (`UICell.tsx:53`):  safe, the table's barrel loads the grid family first.
- Apple sniffs outside Spell UI (`src/server/liveClient.ts:712`, `spell-epic/src/tools/_assets/spell-doc-comments.js:970`,
  `spell-app/src/app/runner/SpellElement.tsx:789`):  other areas' sweeps.
- `UIDocsSearch`'s own popover, highlight and arrows:  the docs components, the ui-docs-tools sweep's.
