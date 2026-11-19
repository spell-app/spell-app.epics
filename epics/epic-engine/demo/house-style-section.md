<!-- For epic/README-config.md, after "The config file" section's table (or before "What's still Spell-shaped").
     Written by agent demo-ready for demo-docs to place;  the anchor id is new. -->

## <a id="your-house-style"></a>Your house style

The skills write two kinds of text:  pages for people (READMEs, guides), and text in the code (comments, docstrings,
`AGENTS.md` files, epic pages).
Each kind follows a VOICE, a Markdown file of rules the skills read before they write.

- Pages for people:  the plugin's own `readme` voice, unless you name yours.
- Text in the code:  YOUR house style.  The plugin ships none for it, and `epic init` names none.
  - Until you do, `epic voice code` says "no such voice here", and the skills fall back to what your `AGENTS.md` says.

Name your file in `.epic/config.json5`, from the repo's root:

```json5
"voices": { "code": "docs/STYLE.md" }
```

Then check it:

```sh
epic voice code          # prints your file
epic voice --for guide   # which voice guides take, and its file
```

- Any voice of the plugin's can be replaced the same way:  `"readme": "docs/our-readme-voice.md"`.
- Which kind of page takes which voice:  `"pageVoices"` (default `readme` for READMEs and guides, `code` for code and
  epic pages).
- Spell's own:  WWOD, in the kit's `agents/wwod/`;  its config names `agents/wwod/writing.md`.
