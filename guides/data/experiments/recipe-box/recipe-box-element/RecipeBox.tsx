import type { JSX } from "@solidjs/web"
import { For, Show } from "solid-js"

import {
  GraphPlace,
  Places,
  RemotePlace,
  RestPlace,
  type ListQuery,
  type PendingChanges,
  type Place,
  type PlaceConflict,
  type PlaceResult,
  type PlaceRow,
  type PlaceRowsChange,
  type PlaceWriteFailure
} from "spell/util/places"
import { pollWhileVisible } from "spell/util/polling"
import { E } from "spell/ui/core"

import { recipeBoxVocabulary } from "./RecipeBox.en"

import recipeBoxCSS from "./RecipeBox.css?inline"

/** Where `scripts/recipe-servers.ts` listens. */
const SERVERS = "http://127.0.0.1:4791"

/**
 * The token the demo's place server wants:  a real page has its own server's (`window.SPELL_SERVER.token`), but this
 * page is served by another one, and that server holds no keys.
 */
const DEMO_TOKEN = "recipe-box-demo"

/** How often it asks whether anyone else changed anything, in seconds. */
const POLL_SECONDS = 5

/**
 * Each back-end, by its name:  this much is all that differs, so `back-end="graphql"` is the one line that changes.
 * - REST says versions, so a clash merges per field, with a notice.
 * - GraphQL says none:  the last save wins that field.
 * - A folder is only reachable through a server side, `RemotePlace`:  it has versions, so a clash merges per field.
 */
const BACK_ENDS: Record<string, () => Place> = {
  rest: () =>
    new RestPlace({
      url: SERVERS,
      collections: { recipes: { fields: { title: "name" } } },
      versions: { field: "version" }
    }),
  folder: () => new RemotePlace({ url: `${SERVERS}/api/places/recipes`, token: DEMO_TOKEN }),
  graphql: () =>
    new GraphPlace({
      url: `${SERVERS}/graphql`,
      collections: {
        recipes: {
          list: "recipes",
          one: "recipe",
          paging: "connection",
          fields: ["id", "title: name", "cuisine", "servings", "notes"],
          insert: { mutation: "addRecipe", input: "RecipeInput!" },
          update: { mutation: "changeRecipe", id: "ID!", input: "RecipePatch!" },
          delete: { mutation: "removeRecipe", id: "ID!" }
        }
      }
    })
}

/** The one collection it shows. */
const COLLECTION = "recipes"

/** What the page says it's kept in. */
const BACK_END_NAMES: Record<string, string> = {
  rest: "a REST server",
  graphql: "a GraphQL server",
  folder: "a folder of files"
}

/** What each back-end's read asks for:  a folder's list holds no notes, so it has to say, and that's when its bodies are read. */
const READ_QUERIES: Record<string, ListQuery> = { folder: { select: ["title", "cuisine", "servings", "notes"] } }

/** Where "someone else" goes, for each back-end.  For a folder, it's the file saved behind the page's back. */
const ELSEWHERE: Record<string, string> = { folder: "folder" }

/** Something to tell the person, with what they can do about it. */
type Notice = {
  /** Tells it apart. */
  key: number
  /** The words. */
  text: string
  /** What's on its button, if it has one. */
  action?: string
  /** What its button does. */
  click?: () => void
}

/****************
 * ### `RecipeBox`
 * The component behind `<recipe-box>`, the data epic's demo:  recipes in a place, and nothing about the server but `BACK_ENDS`.
 * - One read (`PlaceResult`), asked again every few seconds while the page shows (`pollWhileVisible()`).
 * - Every write goes through `PendingChanges`:  shown at once, sent soon, in order.
 * - A GUIDE-ONLY element:  built into `recipe-box.bundle.js` by `epic/src/tools/bundle-experiment.ts`, on the page's Spell UI.
 ****************/
export class RecipeBox extends E.UIComponent<typeof recipeBoxVocabulary> {
  @E.proto static vocabulary = recipeBoxVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { recipeBox: recipeBoxCSS }
  } satisfies Partial<E.ElementSetup>

  /** Every recipe showing. */
  @E.state accessor recipes: PlaceRow[] = []
  /** Where saving stands, in words. */
  @E.state accessor saving = ""
  /** What's being said to the person. */
  @E.state accessor notices: Notice[] = []
  /** The new recipe's title, as it's typed. */
  @E.state accessor newTitle = ""

  /** The list of places:  one here, under the name `recipes`. */
  private places: Places | undefined
  /** The one read. */
  private result: PlaceResult | undefined
  /** The changes on their way. */
  private pending: PendingChanges | undefined
  /** How many notices there have been. */
  private noticesMade = 0

  ////////////////
  // ## Which back-end
  ////////////////

  /** Which back-end:  the page's address says, else `back-end`. */
  private get backEndName(): string {
    const named = new URLSearchParams(location.search).get("back-end") ?? this.backEnd ?? "rest"
    return named in BACK_ENDS ? named : "rest"
  }

  ////////////////
  // ## Reading
  ////////////////

  /** Start on connecting, and stop reading on leaving. */
  @E.whileConnected
  protected startReading() {
    const name = this.backEndName
    const places = new Places({ keepPendingAs: `recipe-box-${name}` }).add(COLLECTION, BACK_ENDS[name]!())
    const pending = places.pendingFor(COLLECTION)
    const query = READ_QUERIES[name]
    const result = places.read({ placeName: COLLECTION, collection: COLLECTION, ...(query && { query }) })
    this.places = places
    this.pending = pending
    this.result = result
    const stops = [
      places.onRows((change) => this.rowsChanged(change)),
      places.onConflict((conflict) => this.merged(conflict)),
      places.onWriteFailed((failure) => this.refused(failure)),
      pending.onStateChange(() => (this.saving = pending.queue.text)),
      pollWhileVisible(POLL_SECONDS, () => this.readAgain())
    ]
    void this.read(result.load())
    return () => {
      stops.forEach((stop) => stop())
      result.leave()
    }
  }

  /** Ask the place again:  a poll. */
  private readAgain(): Promise<void> {
    return this.read(this.result!.reload())
  }

  /** Show what a read brought:  a read that couldn't says so once. */
  private async read(reading: Promise<unknown>): Promise<void> {
    const noServer = this.translationForKey("no-server")
    try {
      await reading
    } catch {
      return this.tellOnce(noServer)
    }
    const { contents } = this.result!
    if (contents) this.recipes = contents
    this.notices = this.notices.filter(({ text }) => text !== noServer)
  }

  /** Rows changed under what's showing:  a write, an answer, a heal. */
  private rowsChanged({ rows, idField, removed = [] }: PlaceRowsChange): void {
    const changed = new Map(rows.map((row) => [row[idField], row]))
    const kept = this.recipes
      .filter((recipe) => !removed.includes(`${recipe[idField] as string}`))
      .map((recipe) => {
        const row = changed.get(recipe[idField])
        changed.delete(recipe[idField])
        return row ? { ...recipe, ...row } : recipe
      })
    this.recipes = [...kept, ...changed.values()]
  }

  ////////////////
  // ## Writing
  ////////////////

  /** `field` of `recipe` is now `value`:  shown at once, sent soon. */
  private setField(recipe: PlaceRow, field: string, value: unknown): void {
    const was = recipe[field]
    if (value === was) return
    this.pending!.setField({ collection: COLLECTION, id: `${recipe.id as string}`, field, value, was })
  }

  /** Add what's been typed, under an id made here. */
  private addRecipe(): void {
    const title = this.newTitle.trim()
    if (!title) return
    const id = `r-${Date.now().toString(36)}`
    this.pending!.insert({ collection: COLLECTION, id, fields: { title, cuisine: "", servings: 2, notes: "" } })
    this.newTitle = ""
  }

  /** It's gone, at once. */
  private removeRecipe(recipe: PlaceRow): void {
    this.recipes = this.recipes.filter((other) => other !== recipe)
    this.pending!.delete({ collection: COLLECTION, id: `${recipe.id as string}` })
  }

  /**
   * A second person renames it, right now, behind this page's back:  for trying a clash.
   * - Straight to the server:  so it's as if it came from another window.
   */
  private async someoneElseRenames(recipe: PlaceRow): Promise<void> {
    const name = this.translationForKey("elsewhere-title", { title: `${recipe.title as string}` })
    const where = ELSEWHERE[this.backEndName] ?? "recipes"
    await fetch(`${SERVERS}/someone-else/${where}/${encodeURIComponent(`${recipe.id as string}`)}`, {
      method: "POST",
      body: JSON.stringify({ name })
    })
  }

  ////////////////
  // ## Telling the person
  ////////////////

  /** A merge kept this person's value:  it says what was lost. */
  private merged({ field, theirs, useTheirs }: PlaceConflict): void {
    const text = this.translationForKey("merged", { field, theirs: `${theirs as string}` })
    this.tell(text, this.translationForKey("use-theirs"), useTheirs)
  }

  /** The server said no. */
  private refused({ error, retry }: PlaceWriteFailure): void {
    this.tell(this.translationForKey("refused", { why: error.message }), this.translationForKey("retry"), retry)
  }

  /** Say `text`, unless it's being said. */
  private tellOnce(text: string): void {
    if (!this.notices.some((notice) => notice.text === text)) this.tell(text)
  }

  /** Say `text`, with a button. */
  private tell(text: string, action?: string, click?: () => void): void {
    const notice: Notice = { key: ++this.noticesMade, text, ...(action && { action }), ...(click && { click }) }
    this.notices = [...this.notices, notice]
  }

  /** Stop saying `notice`. */
  private dismiss(notice: Notice): void {
    this.notices = this.notices.filter((other) => other !== notice)
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class="box" part={this.partForName("box")}>
        <div class="bar">
          <span>{this.translationForKey("stored-in", { backEnd: BACK_END_NAMES[this.backEndName]! })}</span>
          <output>{this.saving}</output>
        </div>
        <For each={this.notices} keyed={(notice: Notice) => notice.key}>
          {(notice) => this.notice(notice())}
        </For>
        <form
          class="adding"
          onSubmit={(event) => {
            event.preventDefault()
            this.addRecipe()
          }}
        >
          <ui-input
            placeholder={this.translationForKey("new-title")}
            value={this.newTitle}
            on-ui-typed={(event: CustomEvent<{ value: string }>) => (this.newTitle = event.detail.value)}
          />
          <ui-button color="primary" onClick={() => this.addRecipe()}>
            {this.translationForKey("add")}
          </ui-button>
        </form>
        <div class="recipes">
          <For each={this.recipes} keyed={(recipe: PlaceRow) => recipe.id}>
            {(recipe) => this.recipe(recipe)}
          </For>
        </div>
      </div>
    )
  }

  /** One recipe:  each field a box to change it in.  `recipe` is an accessor:  the same box stays as it changes. */
  private recipe(recipe: () => PlaceRow): JSX.Element {
    const field = (name: string, key: "title" | "servings" | "notes", type = "text") => (
      <ui-input
        label={this.translationForKey(key)}
        type={type}
        value={`${recipe()[name] as string}`}
        on-ui-typed={(event: CustomEvent<{ value: string }>) => {
          const { value } = event.detail
          this.setField(recipe(), name, type === "number" ? Number(value) : value)
        }}
      />
    )
    return (
      <div class="recipe" part={this.partForName("recipe")} data-id={`${recipe().id as string}`}>
        {field("title", "title")}
        {field("servings", "servings", "number")}
        {field("notes", "notes")}
        <div class="actions">
          <ui-button size="small" appearance="basic" onClick={() => void this.someoneElseRenames(recipe())}>
            {this.translationForKey("elsewhere")}
          </ui-button>
          <ui-button size="small" appearance="basic" onClick={() => this.removeRecipe(recipe())}>
            {this.translationForKey("remove")}
          </ui-button>
        </div>
      </div>
    )
  }

  /** One notice. */
  private notice(notice: Notice): JSX.Element {
    return (
      <ui-message color="yellow">
        <p>{notice.text}</p>
        <Show when={notice.action}>
          <ui-button
            size="small"
            onClick={() => {
              notice.click!()
              this.dismiss(notice)
            }}
          >
            {notice.action}
          </ui-button>
        </Show>{" "}
        <ui-button size="small" appearance="basic" onClick={() => this.dismiss(notice)}>
          {this.translationForKey("dismiss")}
        </ui-button>
      </ui-message>
    )
  }
}

/** The vocabulary's attribute getters, typed:  `this.backEnd`. */
export interface RecipeBox extends E.AttributeValues<typeof recipeBoxVocabulary> {}
