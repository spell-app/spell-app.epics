/**
 * The vocabulary of `<recipe-box>`, the data epic's demo:  every name the tag uses.
 * - A GUIDE-ONLY element (`guides/data/experiments/recipe-box/`):  not part of Spell UI, its site or its bundles.
 */

import type { E } from "spell/ui/core"

/****************
 * ### `recipeBoxVocabulary`
 * The names of `<recipe-box>`:  recipes kept in a place, added to and changed on the page.
 ****************/
export const recipeBoxVocabulary = {
  tag: "recipe-box",
  topics: ["data", "lists"],
  aka: ["recipes"],
  noun: "recipe box",
  description: "Recipes kept on a server, added to and changed right here.",
  attributes: [
    {
      name: "back-end",
      kind: "string",
      default: "rest",
      description:
        "Which back-end keeps them:  `rest`, `graphql`, `folder`, `sheet`, `sheet-no-id` or `google-sheet`.  The page's address can say too:  `?back-end=graphql`."
    },
    {
      name: "sheet",
      kind: "string",
      description:
        "The address of the CSV file `sheet` reads;  default `recipes.csv`, beside the page.  The page's address can say too:  `?sheet=...`."
    }
  ],
  events: [],
  slots: [],
  parts: [
    { name: "box", description: "The whole box." },
    { name: "recipe", description: "One recipe." },
    { name: "note", description: "What the read said about its rows." }
  ],
  states: [],
  texts: [
    { key: "title", text: "Title", description: "A recipe's title." },
    { key: "servings", text: "Servings", description: "How many it serves." },
    { key: "notes", text: "Notes", description: "A recipe's notes." },
    { key: "new-title", text: "A new recipe's title", description: "The box to name a new recipe in." },
    { key: "add", text: "Add recipe", description: "Adds the new recipe." },
    { key: "remove", text: "Remove", description: "Removes a recipe." },
    { key: "elsewhere", text: "Someone else renames it", description: "A second person, for trying a clash." },
    { key: "elsewhere-title", text: "{title} (from elsewhere)", description: "What that second person renames it to." },
    { key: "stored-in", text: "Kept in {backEnd}.", description: "Which server it's reading." },
    { key: "use-theirs", text: "Use theirs", description: "Puts their value back." },
    { key: "retry", text: "Retry", description: "Tries a refused change again." },
    { key: "dismiss", text: "Dismiss", description: "Closes a notice." },
    { key: "read-only", text: "Read only", description: "This place takes no changes." },
    { key: "serves", text: "Serves {servings}", description: "How many a recipe to read serves." },
    { key: "cant-read", text: "Can't read it:  {why}", description: "A read failed, and the place said why." },
    {
      key: "merged",
      text: "{field} also changed elsewhere.  Yours was kept;  theirs was:  {theirs}",
      description: "A merge kept this person's value."
    },
    { key: "refused", text: "Couldn't save your change:  {why}", description: "The server said no." },
    {
      key: "no-server",
      text: "Can't reach the recipe servers.  Start them:  yarn tsx scripts/recipe-servers.ts",
      description: "They aren't running."
    }
  ]
} as const satisfies E.ComponentVocabulary
