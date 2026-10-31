# How to say data in Spell:  a survey, then a proposal

For epic `data`.  Agent `data-survey-language`, 2026-10-31.

**Nothing in part 3 parses today.**  Every program there is a proposal, written in Spell's style by hand.
Where a line uses a word that already works, the tables say so;  those claims come from reading the code on this branch.

The proposal in one breath:
- Spell says WHERE once, in one line:  `family cookbook is a web service at "https://..."`.
- A type says it lives there, with words Spell already has:  `- it is saved in the family cookbook`.
- After that, there are almost no new verbs.
  `every recipe`, `the first recipe`, `where`, `add`, `remove`, `set`, `undone as` all exist;  they now reach the place.
- New words are needed for only a few things:  sorting, the waiting / none / failed states, other people, all-or-nothing.

---

## 1. How Spell reads today

What I read:  [TaskList](app/tests/spell/__spell__/TaskList/TaskList.spell), [Solitaire](app/spaces/@spell/examples/Solitaire/), HabitTracker, FlashCards, ListaDeTareas,
`@spell/library/people`, `parser/README-spell.md`, `spellSyntax.json`, `languages/es/GLOSSARY.md`, `agents/coherence/words.md`, epic `language`'s Overview and questions.

Spell's shape, which any proposal must fit:
- **Things are declared by what's true of them,** in an outline of bullets:  `a "task" is a view:`, `- its "title" is text`.
- **One-of-a-kind things have no article:**  `task list is an app:` declares the type and its one instance (`CreateOneOfAKind`).
  - Today that's only apps and pages, "or a kind of one".
- **A property's reader is `its X`;  epic `language` adds `the X` inside actions** (`set the X to`, too).
  - In a loop or a `where`, `its X` is the item's, and `the X` is still the action's thing's.
  - This turns out to be exactly what a query needs:  `where its title includes the search`.
- **Actions describe themselves in bullets before their steps:**  `- shortcut`, `- enabled when`, `- undone as "Turn Card"`.
- **Epic `language`, decided:**
  - Actions just wait for anything slow.  `wait for:`, `animation` and `await` go (Q5, Q9).
  - A getter may wait;  a draw reading it shows "…", then fills in (Q8).
  - One queue per app:  a repeat of the running action is ignored, another waits, only the latest kept (Q6).
  - `at the same time:` and `meanwhile` say not to wait (Q7).
  - `where` and sort comparisons can't simply wait, because they run per item (Overview).

### Data words Spell ALREADY has

This is the survey's biggest surprise:  Spell has most of the reading vocabulary already, for things in memory.

| Words | What they do today | Where |
| --- | --- | --- |
| `every pile` | every thing of a type the program made, in the order made, as a scratch list | `EveryThing` |
| `the foundations` | the same, by its plural, unless a local or property has that name | `TheThings` |
| `the first tableau` | one thing, by the order made;  nothing if there's none | `ThingAtPlace` |
| `foundation "clubs"`, `tableau T1` | one thing, by its name;  nothing if there's none | `NamedThing` |
| `tasks in its checklist where it is active` | some of a list | `ListFilter` |
| `the first card in the deck where ...` | one of a list | `OrdinalWhereExpression` |
| `the first 5 cards of the deck` | the first few | ordinal-count rule |
| `the number of cards in the deck where ...` | a count | `ListCount` |
| `add X to L`, `remove X from L`, `remove tasks in L where ...`, `move X to L` | changing a list | lists |
| `a new task with title = "x"` | making one, not yet in any list | `NewThing` |
| `a card belongs to one pile` | one owner, and a `pile` getter on the card | `BelongsToOne` |
| `a X can belong to many Y` | many owners | `CanBelongToMany` |
| `a person is saved in its own file`, `... saved inline` | how it's split when saved | `SavedInFile`, `SavedInline` |
| `a person version 2 renames name to names`, `to upgrade (a person) to version 3:` | changing the shape of saved data | `VersionStep`, `UpgradeMethod` |
| `- undone as "Turn Card"`, a menu's `undo` and `redo` | undo | `ActionDetail` |
| `when its score changes:` | a property changed | `ChangedProperty` |
| `to draw its placeholder:` | what a viewable list shows while empty | `DrawIt` |
| `<ui-form value={it}>` | a form bound to a thing:  typing changes the thing | Spell UI |
| `<ui-loader>`, `<ui-placeholder>`, `<ui-message>`, `<ui-toast>` | the pictures for loading, failure, a notice | Spell UI |

**What's missing:**  no syntax has `sort`, `sorted`, `fetch`, `load`, `find`, `cloud`, `place`, `refresh`, `offline`, `someone`, `people`, `sum` or `total`
(searched in `spellSyntax.json`).

---

## 2. The survey:  how others say data to non-programmers

### What each one says, what worked, what confused

| System | How it says data | Worked for laypeople | Confused them |
| --- | --- | --- | --- |
| **HyperCard / HyperTalk** | `go to the last card of this stack`, `get word 3 to 10 of line 8 of theAnswer`;  `get` lands in `it`;  ordinals before nouns | **No save.**  Typing writes to the stack's file;  "no need to save during operation".  The data and the interface are one thing | No undo past a bad change:  a 2004 critic says you can't revert, as changes are already on disk.  Failures are silent unless you read `the result` right after |
| **AppleScript** | `every window whose zoomed is true`, `files in myFolder where name contains "AppleScript"`;  `where` and `that` synonyms of `whose` | Plurals, `every`, `whose` read aloud well | The filter form works only on application objects, not on AppleScript's own lists:  two kinds of list, one look.  **That's the trap "local must feel like server" must avoid** |
| **Inform 7** | ONE sentence for three jobs:  `The mouse is in the teapot.` (starting state), `... when the mouse is in the teapot` (a test), `now the mouse is in the teapot` (a change).  Relations:  `Pet-ownership relates various animals to one person (called the owner).`  Tables:  `the atomic number corresponding to a symbol of "Fe" in the Table of Selected Elements` | The owner gets a name on the far side, in the declaration.  Cardinality in everyday words:  "various ... to one".  Asking first:  `if there is an element corresponding to ...`, then `otherwise` | A lookup that finds nothing is a run-time error unless you checked first.  `the ... corresponding to ...` is long |
| **Excel / Sheets** | `XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])`;  `IMPORTRANGE(url, range)`;  Power Query's "Get Data" and "APPLIED STEPS" | **The state shows in place, in the cell:**  "Loading…", `#N/A`, `#REF!` with a prompt to "Allow Access".  `if_not_found` puts "no match" next to the lookup | Codes (`#REF!`) say something's wrong, not what.  Permission shows up as an error, then a button.  Refresh in Power Query is a separate, manual idea |
| **Airtable / Notion** | "Link" tables, and the link is mirrored.  Lookup:  each linked value.  Rollup:  one sum, average or count | "The association is automatically mirrored in the other table."  People think in lists, not keys | Three field types for what English says one way.  Airtable needs a page on rollup vs lookup.  Notion's relations start one-way until a "Show on" toggle |
| **Bubble** | `Do a search for` a type, with constraints, then `:first item`;  `Current user`, `Current cell's`;  `Get data from an external API` | Element searches are "synchronised with the database in real-time":  live by default, nobody asks | "A search always returns a list, even when only one thing matches", and anything expecting one thing flags an error.  "Ignore empty constraints":  an empty search box returns everything.  A forum post asks why constraints reach only one related type.  Filters after the fact are slower ("Advanced") |
| **Glide / Softr / Retool** | Glide:  Relation, Lookup, Rollup columns.  Softr:  connect a source, bind a block.  Retool:  a resource (the connection), a query (one request), `isFetching` | **Retool splits WHERE (resource) from WHAT (query).**  Softr binds any block to any source through the same steps | Softr's own docs:  switching a block's source "resets some settings", so save a restore point.  **So its swap isn't free.**  Retool people wire `isFetching` to `hidden` by hand;  its forum has repeated threads about table loading state |
| **Scratch cloud variables** | A checkbox on a variable, and a ☁ on its name.  The same blocks as any variable | **The best proof of "local feels like remote":  same blocks, one checkbox** | Numbers only;  10 per project;  no lists (rejected, despite many requests);  "rubber band" values after an old-value echo.  Chat is banned |
| **Wolfram** | `EntityValue[Entity["Country","France"], "Population"]`;  a class gets a list | One form for one or many or a class | A notation, not words |
| **COBOL / SQL** | `MOVE x TO y`.  SEQUEL:  "as closely as possible to natural language", for business analysts | Reads aloud | Chamberlin:  "In the end, SQL is mainly used by programmers", and "English is not an orthogonal language".  **English-looking is not the same as layperson-friendly.**  Joins expose the storage |
| **Logo** | Lists and words, one data shape (from memory, see below) | Small, one idea | No sharing, no outside data |
| **Natural-language queries** | Free-form questions turned into a query | Nothing to learn, at first | **Habitability:**  people can't tell what it can understand.  Ambiguity at word and sentence level.  Recent reviews still list complex queries as unsolved |
| **Apple Shortcuts** | `Get Contents of URL`, with GET, POST, PUT, PATCH, DELETE exposed, and JSON into a Dictionary | The verb names the thing, not the protocol, for a read | Everything past reading is HTTP vocabulary.  A blocked request shows "network connection was lost" |
| **Zapier / IFTTT** | "A trigger is an event that starts a Zap";  `New` vs `New or Updated` | "When this happens, do that" needs no teaching | **Polling is invisible:**  15 minutes on the free plan, most triggers poll, so "when" isn't when.  `New` vs `New or Updated` needed its own warning |
| **Figma** (not asked for;  it's the owner's "wonky for a second") | Per property:  "the document will just end up with the last value that was sent" | Changes to different properties never conflict.  Your unacknowledged edit beats an incoming older one, so no flicker | |
| **Non-programmer studies** (Pane, Myers) | People use "AND" where Boolean logic needs "OR".  HANDS provided "queries and aggregate operations to match the way non-programmers express" solutions | Children using HANDS with queries and aggregates did significantly better than those on a version without them | |
| **"The cloud" itself** (Citrix / Wakefield 2012, 1,006 US adults) | 51% think storms interfere with it;  29% think it's an actual cloud, the sky or weather-related;  of those who say they never use it, 95% do | They do not need to understand it, and they use it anyway.  **The fuzzy picture is fine, so long as nothing makes them manage it** | |

### What it adds up to

1. **Don't add a verb for reading.**
   Bubble's "Do a search for" is three words of machinery in front of the noun, where AppleScript's `every window whose` is just the noun.
   Spell has `every recipe where` nearly free.
2. **One word in the language tells one from many.**
   Bubble's list-vs-one-thing error can't happen if the words say it:  `the first recipe`, a singular;  `every recipe`, a list.
3. **Same words, one checkbox.**  Scratch's cloud variable is the model:  it changes the declaration, and no block.
   AppleScript's `whose` is the warning:  never let filters work on one kind of list and not another.
4. **No save command.**  HyperCard showed it in 1987.  The cost is HyperCard's own critic's:  it needs a real undo, which Spell has.
5. **WHERE and WHAT are separate.**  Retool's resource and query.  Softr shows that a block's source mustn't sit inside the block.
6. **The states belong in place, next to the read,** as in a cell's "Loading…" or `if_not_found`.
   Retool shows what happens otherwise:  everyone wiring a flag by hand, and forum threads.
7. **Links are one idea.**  Airtable's link, lookup and rollup are three field types, where English already has `the name of its cook` and `the number of its ingredients`.
   Neither joins nor the word "relation" should appear.
8. **The owner has a name on both sides**, from one declaration.  Inform and Airtable do this;  Notion's opt-in toggle only adds a step.
9. **Be honest about `when`.**  Zapier's polling hides that "when" may mean 15 minutes.  It belongs in the place's line, once.
10. **English-looking isn't enough.**  SQL proves it.  Free-form English isn't either:  habitability.
    Spell's answer already exists:  a line nothing reads is an error where it stands.
11. **`and` will be used to mean `or`.**  "Ana and Bo's recipes" will be written `where its cook is "Ana" and its cook is "Bo"`.  It needs a warning.

### What I couldn't verify

- **Pane et al. 2001:**  the full text wouldn't load (certificate error, 503, empty PDF), and no tool here reads the thesis's PDF.
  - The "AND where OR" and HANDS lines come from search snippets of the 2006 chapter and the thesis.
  - I have no verified percentages on aggregates against loops.
- **Reisner's human-factors studies of SQUARE / SEQUEL:**  not found.  "Joins expose the storage" is my reading, not a study's.  Chamberlin's quotes are via The Register's interview.
- **Bubble being confusing:**  the manual states the rules, and there's one forum post.  That these confuse beginners is my inference, not a study's.
- **IFTTT:**  its help page returned 403.  I say nothing about it beyond what's commonly known of the name.
- **Apple Shortcuts `Find` and `Filter` actions:**  not found;  `Get Contents of URL` is from Apple's guide.
- **Logo's `MAKE`:**  from memory only.
- **HyperTalk:**  Wikipedia and a 1988 Dr. Dobb's article, not Apple's reference.  The autosave critic is one blog post.
- **Retool:**  from search snippets of its docs, and undated forum threads.
- **Wolfram's free-form input:**  not checked;  the guide pages I tried were 404.
- **Google Docs' status text** ("All changes saved in Drive"):  secondary sources only;  no Spanish wording found.  So "saved in" being what people already read is likely, but not proven.
- **Androutsopoulos' 1995 survey:**  not retrieved;  habitability comes from later papers citing the idea.

---

## 3. The proposal:  the words

Each concept:  the plain-English explanation, then the words.  **Status** is `works`, `extends` (a word that works today, reaching further) or `new`.

### 3.1 Where the data lives

**In plain English:**  your data has to be kept somewhere.  You name that place once, and everything else in the program uses the name.  To move your data, you change that one line.

```spell
family cookbook is a web service at "https://api.example.com/v1"
```

| Words | Status | Spanish |
| --- | --- | --- |
| `X is a web service at "..."` | new (extends `task list is an app`) | `X es un servicio web en "..."` |
| `X is a graph service at "..."` | new | `X es un servicio de grafos en "..."` |
| `X is a file at "..."` | new | `X es un archivo en "..."` |
| `X is a folder at "..."` | new | `X es una carpeta en "..."` |
| `X is this device` | new | `X es este dispositivo` |
| `X is a live room at "..."` (WebSocket / multiplayer) | new | `X es una sala en vivo en "..."` |
| `the cloud` | new, a built-in place | `la nube` |

- Each kind is a type, as `app` and `card game` are, so a library can add one:  `family cookbook is a supabase project at "..."`.
- It's the one place back-end details may go, indented under it, in everyday words:

  ```spell
  family cookbook is a web service at "https://api.example.com/v1":
  	- recipes are at "/dishes"
  	- a recipe's title is called "dish_name"
  	- its key is the secret "COOKBOOK_KEY"
  	- it is checked every 30 seconds
  ```

  - A back-end that follows the usual conventions needs none of those lines.
  - `- it is checked every 30 seconds` is the honest version of live, for one that can't tell us.  Without it and without a way to tell us, a page refreshes on return.
  - A key is named, never written:  a secret in source would ship to every browser.
- **The edge:**  a type with no place stays in memory, as today.  No existing program changes.

### 3.2 A type lives there

**In plain English:**  say where recipes are kept.  That's all a recipe has to say.  From then on, a recipe you add or change is kept there, by itself, with no "save" step.

```spell
a "recipe" is a view:
	- it is saved in the family cookbook
	- its "title" is text
```

```spell
una "receta" es una vista:
	- se guarda en el recetario familiar
	- su "título" es texto
```

| Words | Status | Spanish |
| --- | --- | --- |
| `- it is saved in the family cookbook`, `a recipe is saved in ...` | extends `is saved in its own file` | `se guarda en ...`, which the glossary has |
| `- it is saved in the cloud` | new:  no place line at all | `se guarda en la nube` |

- `is saved in its own file` keeps its meaning:  how a thing is split.  On a folder place it means one file per recipe;  on a web service it means nothing, and Spell says so.
- There's no `save` statement.  `set the title of the recipe to "Soup"` is enough.  That's Scratch and HyperCard's lesson.

### 3.3 Reading all, one, some

**In plain English:**  ask for the recipes as if they were right here.  Spell goes and gets them, and it knows how to ask for only what the page needs.

| Say | Means | Status | Spanish |
| --- | --- | --- | --- |
| `every recipe`, `the recipes` | all of them | extends | `cada receta`, `las recetas` |
| `the first recipe` | the oldest | extends | `la primera receta` |
| `recipe "Soup"` | the one named Soup, or nothing | extends | `receta "Sopa"` |
| `the first recipe where its title is "Soup"` | the first that fits, or nothing | new short form, for `the first recipe in ... where` | `la primera receta donde su título es "Sopa"` |
| `every recipe where it is quick` | the ones that fit | new short form | `cada receta donde es rápida` |
| `the recipes where its cook is the current person` | the same, by plural | new short form | `las recetas donde su cocinero es la persona actual` |
| `... sorted by its title` | in order | new | `... (ordenadas\|ordenados) por su título` |
| `... sorted by its minutes from highest to lowest` | the other way | new | `... de mayor a menor` |
| `the first 20 recipes where it is quick` | a few | extends | `las primeras 20 recetas donde es rápida` |
| `the number of recipes where it is quick` | a count;  it doesn't fetch them | extends | `el número de recetas donde es rápida` |
| `the total of its prices` | a sum | new:  Spell has no sum word | `el total de sus precios` |
| `if there is a recipe where ...` | is there one? | extends (`hay una`) | `si hay una receta donde ...` |

- The whole read goes out as one question;  the compiler translates `where` and `sorted by` for a place that can answer them, and does the rest in the browser.
  - That squares with epic `language`:  the `where` itself never waits.  The read does.
- **The edges:**
  - A saved list is a question, not a list you hold.  `every` today is "a scratch list";  for a saved type it's those in the place.
    `add X to the recipes` must therefore mean "keep it", where `add X to every card` would change nothing today.
  - `the recipes` follows epic `language`'s order.  An app with its own `its "recipes"` gets the property.  Spell should warn when a saved type's plural is hidden that way;  the example below uses `its "matches"` to stay clear.
  - **`and` for `or`:**  `where its cook is "Ana" and its cook is "Bo"` can never be true, and Spell should say so, offering `its cook is "Ana" or "Bo"`, which already works.
  - **Empty search:**  `where its title includes the search` with an empty search matches everything.  That's what people expect here, and unlike Bubble, it's not a setting.
  - Paging is left out.  `the first 20` covers most of it, and a list element can ask for more by itself;  to be decided with the back-end survey.

### 3.4 Showing it:  waiting, none, failed

**In plain English:**  a read has four outcomes:  here they are, still waiting, there aren't any, it didn't work.  Each has a sensible picture, so you can write nothing.  To say it your own way, put your words right beside the read.

```spell
- to draw its shelf:
	for each recipe in its matches
		draw the recipe
	while waiting:
		<ui-loader/>
	if there are none:
		<ui-text>No recipes yet.  Add the first one.</ui-text>
	if that fails:
		<ui-message color="red">
			Can't reach the cookbook right now.
			<ui-button onClick={try again}>Try again</ui-button>
		</ui-message>
```

| Words | Status | Spanish |
| --- | --- | --- |
| `while waiting:` | new | `mientras espera:` |
| `if there are none:` | new | `si no hay (ninguno\|ninguna):` |
| `if that fails:` | new | `si falla:` |
| `try again` | new | `volver a intentar` |
| `to draw its placeholder:` | works:  the same as `none`, on a viewable list | `para dibujar su marcador` |
| `its matches are waiting`, `its matches failed`, `the problem` | new:  to read the state anywhere | `están esperando`, `fallaron`, `el problema` |
| `the cookbook is offline` | new | `está sin conexión` |

**With nothing written, a person still sees** (the defaults, which matter more than the words):
- waiting:  "…", as Q8 decided, then it fills in
- none:  the list's placeholder, or nothing
- failed:  an inline message in the list's place, with Try again
- A failed read never makes the page blank.

`that` rather than `it`, since `it` is already the outline's thing.  In Spanish, `eso` means `it`, but `si falla:` needs no pronoun.

### 3.5 Adding, changing, removing

**In plain English:**  the same words as any list.  It's kept straight away, and you see it straight away.  If it doesn't work, it's put back, and you're told.

```spell
add (a new recipe with title = the draft) to the recipes       // works, reaches further
set the title of the recipe to "Soup"                          // works
remove the recipe from the recipes                             // works
remove recipes in the recipes where it is done                 // works
```

| Words | Status | Spanish |
| --- | --- | --- |
| `all or nothing:`, then steps | new:  if any step fails, every step is put back | `todo o nada:` |
| `if that fails:`, after a step | new:  replaces the default notice | `si falla:` |
| `a draft of the recipe`, `save the draft`, `throw away the draft` | new:  edit first, then keep | `un borrador de la receta`, `guardar el borrador`, `descartar el borrador` |

- `<ui-form value={it}>` writes as you type, batched by Spell.
- `<ui-form value={a draft of the recipe}>` holds back until `save the draft`.  Most edits don't need it:  it's for an Edit screen with a Cancel button.
- `a new recipe` alone keeps nothing.  That's what makes it a draft that never needs to exist in the place.
- `a person version 2 renames ...` and `to upgrade` already cover a changing shape.

### 3.6 Things owned by a thing

**In plain English:**  a recipe has ingredients.  Say so, and each ingredient knows its recipe.  You never connect them by hand.

```spell
a "recipe" is a view:
	- it is saved in the family cookbook
	- its "ingredients" is a list of ingredients

an "ingredient" is a thing:
	- its "name" is text
an ingredient belongs to one recipe
```

| You say | Means | Airtable's word | Status |
| --- | --- | --- | --- |
| `its ingredients` | a recipe's | link | works |
| `the recipe of the ingredient` | the other side, free | mirrored link | extends |
| `the name of its cook` | through a link | lookup | works |
| `the number of its ingredients` | counted | rollup | works |
| `every recipe where the name of its cook is "Ana"` | across a link | a join;  Bubble's "one level" limit | new, for the compiler |
| `an ingredient belongs to one recipe` | removed with its recipe | | extends:  today the owner must be a list type |
| `a recipe can belong to many cookbooks` | many on both sides | many-to-many | extends |
| `its "cook" is a person` | points at one, owns nothing | | works |

- The point:  **three field types become ordinary English,** and "relation" and "join" never appear.
- Spanish has `pertenece a una`, `puede pertenecer a muchas`, `el nombre de su cocinero`.
- **The edge:**  "removed with its recipe" is new meaning for `belongs to`, which today only means "one list at a time".  A question for Owen, below.

### 3.7 Live updates

**In plain English:**  if it changes out there, it changes on your page.  You don't ask for this.

- Nothing to write:  anything drawn from a saved list stays current, if the place can tell us.  (Bubble does this.)
- Only for doing something ABOUT a change:

| Words | Status | Spanish |
| --- | --- | --- |
| `when a recipe is added:` | new | `cuando se agrega una receta:` |
| `when a recipe is removed:` | new | `cuando se quita una receta:` |
| `when a recipe changes:` | extends `when its X changes` | `cuando cambia una receta:` |
| `refresh the recipes` | new, for a place that can't tell us | `recargar las recetas` |
| `- it is checked every 30 seconds`, on the place | new | `- se revisa cada 30 segundos` |

- `refresh` isn't `actualizar` in Spanish, which already means a version upgrade.

### 3.8 "Something changed while you were editing"

**In plain English:**  two people can change one recipe.  If you change different things, both stick.  If you change the same thing, the last one wins, and the other person is told.  What you're typing is never yanked away.

- Rules, from Figma:
  - each property on its own, so a title and a time never collide
  - the same property:  the last to arrive wins
  - your unconfirmed change beats an older one arriving, so nothing flickers
- Default picture:  a quiet notice in the field, with Keep mine / Use theirs.  Nothing to write.
- For the rare program that wants its own:

```spell
- when someone else changes it:
	notify the name of the person + " just changed " + the title of it
```

| Words | Status | Spanish |
| --- | --- | --- |
| `when someone else changes it:` | new;  `the person`, `the property`, `the old value` come with it | `cuando otra persona (lo\|la) cambia:` |
| `it is being edited`, `it is being edited by someone else` | new | `está siendo editado`, `... por otra persona` |

### 3.9 Undo

**In plain English:**  undo takes back what YOU did, even if others have been working.

- `- undone as "Remove Recipe"` and the app's `undo` and `redo` all work today, and keep working (Spanish:  `se deshace como`).
- **The edges:**
  - If someone changed the same property since, undo leaves theirs alone, and says so.
  - Undoing a remove brings it back with the same id only if the place allows that.  Otherwise it's a new one, and links to it are lost.  Check per kind of place.

### 3.10 Someone else is here

**In plain English:**  you can see who else has this open, and what they're looking at.  It goes away when they do, and isn't kept.

| Words | Status | Spanish |
| --- | --- | --- |
| `the current person` | new | `la persona actual` |
| `the people here` | new | `las personas presentes` |
| `the people editing it` | new | `las personas que lo editan` |
| `when someone arrives:`, `when someone leaves:` | new | `cuando llega alguien:`, `cuando alguien se va:` |
| `- each person here has a "pointer" as a position` | new:  shared, never saved | `- cada persona presente tiene un "puntero" como posición` |

- `the current person` is a `person`, from `@spell/library/people`.
- **The edge:**  a file has no idea who's here, so `the people here` is only you, and `when someone else changes it` never runs.  Spell should warn at the place line.

### 3.11 Cancelling

**In plain English:**  if you walk away, Spell stops fetching what you no longer need.  What you already changed still gets kept.

- Reads:  nothing to write.  Leave a page, and its reads stop.
- Writes:  never cancelled by leaving.  Your change finishes.
- By hand:

| Words | Status | Spanish |
| --- | --- | --- |
| `cancel search` (any running action, by its name) | extends `cancel process x` | `cancelar búsqueda` |
| `- a new one replaces the last one` (an action's detail line:  typing a search) | new | `- una nueva reemplaza a la anterior` |
| `meanwhile refresh the recipes` | works once epic `language` builds it | as `language` picks |

- Q6's queue "ignores a repeat", which is wrong for a search as you type:  the newest must win.  So the action says it.
- **Needs epic `language`:**  Q6 notes "a long fetch holds clicks".  Reads made by drawing must stay out of that queue.

---

## 4. The whole app

A shared recipe box.  Words marked new are as above;  everything else exists.

```spell
## Recipe Box
// A family's recipes:  anyone can add one, change one, or take one out.
// What's where, top to bottom:
//   where the recipes live
//   a recipe, and its ingredients
//   the app:  find, add, and the shelf, with what it shows while waiting


## Where the recipes live:  the ONE line a different back-end changes
family cookbook is a web service at "https://api.example.com/v1"


## A recipe
a "recipe" is a view:
	- it is saved in the family cookbook
	- its "title" is text
	- its "cook" is a person
	- its "minutes" is a number
	- its "favorite" is yes or no
	- its "ingredients" is a list of ingredients
	- it "is quick" if its minutes is at most 30

	// a form of its own:  typing changes it, and that's kept, with no save step
	- to draw it:
		<ui-form value={it}>
			<div part="row">
				<ui-input name="title" aria-label="Recipe" appearance="transparent"/>
				<ui-checkbox name="favorite" aria-label="Favorite"/>
				<ui-text>{the number of its ingredients} ingredients, by {the nickname of its cook}</ui-text>
				<ui-button onClick={remove it}>Remove</ui-button>
			</div>
		</ui-form>

	- to remove it:
		- undone as "Remove Recipe"
		remove it from the recipes

an "ingredient" is a thing:
	- its "name" is text
	- its "amount" is text

// a recipe's ingredients go with it
an ingredient belongs to one recipe


## The app
recipe box is an app:
	// what the two fields hold:  these are only here, on this page
	- its "search" is text
	- its "draft" is text
	// in the "where", `its` is the recipe, and `the search` the app's
	- its "matches" is every recipe where its title includes the search, sorted by its title
	- its "box menu" is a menu of "undo" and "redo"
	- it has slots "shelf"

	// on the page at once;  put back with a notice if the cookbook says no
	- to add the draft:
		if the draft is "" return
		add (a new recipe with title = the draft, cook = the current person) to the recipes
		clear the draft

	// the shelf:  its recipes, or what to show instead
	- to draw its shelf:
		for each recipe in the matches
			draw the recipe
		while waiting:
			<ui-loader/>
		if there are none:
			<ui-text>No recipes yet.  Add the first one.</ui-text>
		if that fails:
			<ui-message color="red">
				Can't reach the cookbook right now.
				<ui-button onClick={try again}>Try again</ui-button>
			</ui-message>

	- to draw it:
		<ui-container class="RecipeBox">
			<ui-toolbar menu="box menu" aria-label="Recipes">
				<ui-text slot="title" size="large">Recipe Box</ui-text>
				<ui-text slot="right">{the number of the people here} here</ui-text>
			</ui-toolbar>
			<ui-form value={it}>
				<ui-input name="search" placeholder="Find a recipe" aria-label="Find"/>
				<ui-input name="draft" placeholder="A new recipe" aria-label="New recipe"/>
				<ui-button color="primary" disabled={the draft is ""} onClick={add the draft}>Add</ui-button>
			</ui-form>
			{draw its shelf}
		</ui-container>

start the recipe box
```

Note:  it says `the search` in a getter, not an action.  Epic `language` defines `the X` for "a type's action";  a getter would have to count.

### The same app, a different back-end

**Exactly one line changes:**

```spell
family cookbook is a web service at "https://api.example.com/v1"     // REST
family cookbook is a graph service at "https://api.example.com/gql"  // GraphQL
family cookbook is a folder at "recipes"                             // chunked files, as epic pages do
family cookbook is a file at "recipes.json5"                         // one file
family cookbook is this device                                       // the browser
family cookbook is a live room at "wss://rooms.example.com/family"   // multiplayer
```

- With `is saved in its own file` added to the recipe, the folder keeps one file per recipe.
- **What doesn't carry across, said by the compiler at that one line:**
  - a file or this device has no other people:  `the people here` is 1, and nobody else's changes arrive
  - a plain web service can't tell us about changes, so add `- it is checked every 30 seconds`, or accept a refresh on return
  - a web service whose names differ needs the mapping bullets from 3.1, in that one place
  - `all or nothing:` is only as real as the place allows;  on a plain web service it means "put back what got through", which can be seen for a moment
- Tests:  `spell test` runs with a place in memory, so `to test` lines need no server.

### The same lines in Spanish

```spell
recetario familiar es un servicio web en "https://api.example.com/v1"

una "receta" es una vista:
	- se guarda en el recetario familiar
	- su "título" es texto

caja de recetas es una aplicación:
	- sus "coincidencias" son cada receta donde su título incluye la búsqueda, ordenadas por su título
	- para agregar el borrador:
		si el borrador es "" devolver
		agregar (una nueva receta con título = el borrador, cocinero = la persona actual) a las recetas
		vaciar el borrador
	- para dibujar su estante:
		para cada receta en las coincidencias
			dibujar la receta
		mientras espera:
			<es-cargador/>
		si no hay ninguna:
			<es-texto>Aún no hay recetas.</es-texto>
		si falla:
			<es-mensaje>No se puede llegar al recetario.</es-mensaje>
```

(Illustrative:  the Spanish tag names aren't checked, and a property's agreement would need the existing `agreement.ts` rules.)

---

## 5. The forks

### Fork 1:  how a type says where it lives

| | Words | For | Against |
| --- | --- | --- | --- |
| **A** (recommended) | `- it is saved in the family cookbook` | Spell has `is saved in`;  Spanish has `se guarda en`, which reads naturally;  it's what people see apps say;  true for reading and writing | `saved` can sound like a step you must do;  `is saved in its own file` already means something a little different |
| B | `- it is kept in the family cookbook`, `Recipes are kept in the cloud` | The most natural English;  no hint of a step | A new word beside `saved`, for nearly one idea, against "one word for one idea" (`words.md`) |
| C | `- it comes from the family cookbook` | Bubble's and Retool's "data source" | **Reads one-way:**  a person won't expect to write to where something comes from.  "Local" doesn't "come from" anywhere.  Spanish `viene de` has the same trouble |
| D | `- it lives in the family cookbook` | Owen's own words | Cute;  `vive en` is odd in Spanish;  a new word again |

### Fork 2:  how the place is named and declared

| | Words | For | Against |
| --- | --- | --- | --- |
| **A** (recommended) | Your own name, with a kind:  `family cookbook is a web service at "..."` | Same shape as `task list is an app`;  a library can add kinds;  GraphQL and REST both use https, so a kind must be said;  the compiler knows what it can do | One more noun to learn per kind |
| B | Just an address:  `family cookbook is at "..."`, the kind guessed | Shortest;  the swap only touches the quotes | Guessing:  against Spell's "it doesn't guess".  `X is at` collides with `X is Y` as assignment |
| C | A shared word:  `a source`, `a store`, `a data source` | Bubble / Retool's word | `source` collides with Spell UI's `Sources` and "source code".  `store` is the people store in the app, and `tienda` is a shop.  Both are jargon |

Plus, whichever is picked:  **`the cloud` as a built-in place,** so a first program writes only `- it is saved in the cloud`, with no line of setup.  It's Owen's own sentence.  It needs Spell to host something:  **a question for the back-end survey.**

### Fork 3:  when a thing gets kept

| | Words | For | Against |
| --- | --- | --- | --- |
| **A** (recommended) | Adding it to the list:  `add (a new recipe ...) to the recipes`.  Then `set` just works | Exactly what a program in memory writes today;  `a new recipe` stays a harmless draft | It's a little odd that `add` to a read is a write |
| B | `a new recipe` is kept at once | One step fewer | Half-filled forms land in the shared box.  Tests and getters that make things write them |
| C | `save the recipe`, every time | Familiar | **Back-end shows through:**  local code wouldn't need it, and forgetting it loses data silently.  Against the owner's goal |

### Fork 4:  where the waiting, none and failed states go

| | Words | For | Against |
| --- | --- | --- | --- |
| **A** (recommended) | Riders on the loop:  `while waiting:`, `if there are none:`, `if that fails:` | All four outcomes on one screen, in order;  like an `if_not_found`;  needs no new type | `while` already has `- while the mouse is down:`, which "puts things back";  a new shape after a loop |
| B | Members of a viewable list:  `to draw its placeholder`, `to draw it while waiting`, `to draw it if it fails` | Extends what exists | Requires a type for every list shown;  each state is far from the read |
| C | Tags in markup:  `<if its matches are waiting>` | Works with today's `<if>` | Four hand-written tests;  it's what Retool people do with `isFetching` |

A's state phrases (`are waiting`, `failed`) stay available for C's case.

### Fork 5:  saying the person using it

| | Words | For | Against |
| --- | --- | --- | --- |
| **A** (recommended) | `the current person` | Plain;  `la persona actual` is natural;  Bubble's "Current user" shows people cope | Long |
| B | `you`:  `where its cook is you` | Shortest;  `words.md` already says "you" on pages | Who's "you" to an author writing a program?  Spanish `tú` / `usted` |
| C | `me` | Short | The person writing it isn't the one using it |

### Fork 6:  editing live, or from a copy

| | Words | For | Against |
| --- | --- | --- | --- |
| **A** (recommended) | Live by default;  `a draft of the recipe` when asked | Notion, Airtable, HyperCard;  the same as in-memory today | Every keystroke is seen by others, unless batched |
| B | A form holds its changes until Save | Familiar | Needs a Save in every form, and back-end shows through |

---

## 6. What collides with Spell's words

| Word | Already means | What to do |
| --- | --- | --- |
| `saved in` | `is saved in its own file`, `saved inline`:  how a thing is split | The two literal forms match first.  Say how they combine (3.2) |
| `every`, `the recipes` | "A scratch list":  "only the program's things", "it takes none from the lists that hold them" | **A real change of meaning, for saved types only.**  No existing program has one |
| `the first recipe` | `thingAtPlace`:  the order made | Same, by the place's order:  oldest first, as Bubble's default |
| `recipe "Soup"` | `thingNamed`:  by the name given to it | Which property is "the name"?  An open question |
| `belongs to one` | One list at a time.  It refuses a non-list owner today | Extended, plus "removed with it" |
| `when ... changes` | `(when\|on) (its\|the)? X changes`, with the `its` optional | **Trap:**  `when someone else changes it` could read as a property called "someone else".  Needs a higher priority, and a test.  Same for `when a recipe changes` |
| `while` | `- while the mouse is down:` puts every property back afterwards | `while waiting:` isn't a handler, and puts nothing back.  A different rule with a similar look |
| `send` | Events, up the chain | **Never use it for data.**  `send the recipe to the cookbook` must not exist |
| `get` | `get thing` declares a new `it` | `get the recipes` then simply works, so people from Shortcuts or HyperCard are fine.  No `fetch` |
| `cancel` | `cancel event`, `cancel process x` | `cancel search`, by action name.  `animation` is leaving (Q9) |
| `draft` | A property in TaskList, HabitTracker, and `borrador` in ListaDeTareas | `its draft` stays the property.  `a draft of X` is a new phrase.  **Readers may trip;**  `a copy of` is the alternative (lists only today) |
| `a copy of` | `a (copy\|duplicate) of list? X` | A copy forgets its original;  a draft doesn't |
| `it`, `eso` | `it` is the outline's thing;  Spanish `eso` also means `it` | `if that fails:` in English, `si falla:` in Spanish |
| `place` | Only inside code:  `thing_at_place`.  No syntax | Fine to use in docs.  Not needed as a keyword under Fork 2A |
| `source` | Spell UI's `Sources`, `SourceElement`, source code | Don't use |
| `store` | The app's people store;  a shop | Don't use |
| `actualizar` | Spanish:  `para actualizar (una person) a la versión 4` | `recargar` for refresh |
| `find`, `load`, `fetch` | Free, and people name their own actions this (`load the scores`, Q7's example) | **Don't reserve them.**  An action `to find the recipes` must keep working |
| `person`, `people` | `person` is a library type, and the epics' code word;  WWOD says "people" | Good fit.  Needs `@spell/library/people` to be built in for `the current person` |

### Words people will reach for, and should get a helpful error

`save`, `fetch`, `query`, `search for`, `connect to`, `database`, `join`, `relation`:  each gets a parser message, as `- it has parts` does today, naming what to write.

---

## 7. Questions for Owen

1. `belongs to one`:  should removing a recipe remove its ingredients?  I've assumed yes.  It changes what those words mean today, and a card leaving a pile never dies.
2. `the cloud` as a built-in:  does Spell host data at all?  Without that, `the cloud` must name something in project settings.
3. Does a getter count for `the X`?  Epic `language`'s P2 says actions.  The queries above read much better if so:  `where its title includes the search`.
4. Reads made by drawing must stay out of `language`'s one queue (Q6), or a slow page holds clicks.  That's for epic `language` too.
5. `where` on what can't be sent to the place:  run it in the browser silently, or warn?  I'd run it silently, and warn only on very large reads.  Bubble's "Advanced" constraint is the same idea as a setting.

---

## 8. Sources

**HyperCard / HyperTalk**
- https://en.wikipedia.org/wiki/HyperCard
- https://mjtsai.com/blog/2004/05/10/saving/
- https://jacobfilipp.com/DrDobbs/articles/DDJ/1988/8814/8814d/8814d.htm
- https://lists.runrev.com/pipermail/use-livecode/2003-December/027085.html

**AppleScript**
- https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptLangGuide/reference/ASLR_reference_forms.html

**Inform 7**
- https://ganelson.github.io/inform-website/book/WI_13_1.html
- https://ganelson.github.io/inform-website/book/WI_13_5.html
- https://ganelson.github.io/inform-website/book/WI_13_9.html
- https://ganelson.github.io/inform-website/book/WI_16_1.html
- https://ganelson.github.io/inform-website/book/WI_16_2.html
- https://ganelson.github.io/inform-website/book/WI_16_3.html

**Excel / Sheets**
- https://support.google.com/docs/answer/3093340
- https://support.microsoft.com/en-us/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929
- https://support.microsoft.com/en-us/office/about-power-query-in-excel-7104fbee-9e62-4cb9-a02e-5bfb1a6c536a

**Airtable / Notion**
- https://support.airtable.com/docs/linking-records-in-airtable
- https://support.airtable.com/docs/rollup-field-overview
- https://www.notion.com/help/relations-and-rollups

**Bubble**
- https://manual.bubble.io/core-resources/data/data-sources
- https://manual.bubble.io/help-guides/data/the-database/finding-data
- https://manual.bubble.io/core-resources/data/search
- https://forum.bubble.io/t/why-does-bubble-restrict-do-a-search-for-constraints/397566

**Glide / Softr / Retool**
- https://www.glideapps.com/docs/computed-columns (via search results;  a direct fetch failed)
- https://docs.softr.io/core-concepts-overview/connect-your-data-source
- https://docs.softr.io/migration-tips/migrating-from-airtable-to-softr-databases
- https://docs.retool.com/queries/reference/objects/query
- https://docs.retool.com/queries/quickstart
- https://docs.retool.com/classic-apps/concepts/intro
- https://community.retool.com/t/how-do-i-control-table-loading-state/11297
- https://community.retool.com/t/loading-spinner-not-appearing/31408

**Scratch**
- https://en.scratch-wiki.info/wiki/Cloud_Data
- https://en.scratch-wiki.info/wiki/List_of_Block_Workarounds

**Wolfram**
- https://reference.wolfram.com/language/ref/EntityValue.html

**SQL / COBOL / Logo**
- https://www.theregister.com/2024/05/31/fifty_years_of_sql/
- https://en.wikipedia.org/wiki/Query_by_Example
- https://www.wikipedia.org/wiki/Cobol
- https://criticalcodestudies.com/flowmatic.html
- https://en.wikipedia.org/wiki/Logo_(programming_language)

**Natural-language queries**
- https://arxiv.org/pdf/1906.08990
- https://journal.hep.com.cn/fcs/EN/10.1007/s11704-025-50592-w
- https://www.springerprofessional.de/en/natural-language-interfaces-to-data-bases-some-practical-issues/13978576

**Apple Shortcuts**
- https://support.apple.com/guide/shortcuts/apd58d46713f/ios
- https://discussions.apple.com/thread/251045870
- https://redlib.hackliberty.org/r/shortcuts/comments/1k3wmrs/fix_for_the_network_connection_was_lost (a Reddit mirror, one person's report)

**Zapier**
- https://help.zapier.com/hc/en-us/articles/8496288188429-Learn-key-concepts-in-Zaps
- https://help.zapier.com/hc/en-us/articles/8496244568589

**Figma**
- https://www.figma.com/blog/how-figmas-multiplayer-technology-works/

**Non-programmer studies**
- https://dblp.org/rec/journals/ijmms/PaneRM01.html (the 2001 paper's record;  full text not read)
- https://link.springer.com/doi/10.1007/1-4020-5386-X_3 (the 2006 chapter, via snippets)
- https://www.csd.cmu.edu/sites/default/files/phd-thesis/CMU-CS-02-127.pdf (HANDS thesis, via snippets)

**"The cloud" as people picture it**
- https://www.businesswire.com/news/home/20120827006131/en/2712951/Most-Americans-Confused-By-Cloud-Computing-According-to-National-Survey
- https://www.eweek.com/cloud/cloud-computing-confusing-to-many-survey/
- https://www.nbcnews.com/technolog/survey-51-percent-think-stormy-weather-interferes-online-cloud-968907
