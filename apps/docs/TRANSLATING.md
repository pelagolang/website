# Translating the docs

English (`content/docs/en-US`) is the source. Every other language folder mirrors it. A page missing from a language falls back to English, so a translation can land one page at a time.

No paid API is involved. The script only tracks what is stale and checks what you wrote; the translating is done by a person or by a Claude Code session.

## Commands

Run from `apps/docs`:

```
node scripts/translations.mjs status [--lang es] [--json]   # what is missing or stale
node scripts/translations.mjs prepare <lang> <page>          # print the source with heading ids added
node scripts/translations.mjs check                          # validate every translated page
node scripts/translations.mjs record                         # store the current source hashes
```

`translations.lock.json` holds one source hash per translated page. When the English page changes, its hash no longer matches and `status` lists the page as stale in every language.

## Workflow

1. `status` to see what needs work.
2. `prepare <lang> <page>` gives the English text with an explicit heading id on every heading (`## Title [#title]`). Translate it into `content/docs/<lang>/<page>`.
3. `check` must pass.
4. `record` to mark the page as in step with the source.

## Rules

- Keep code blocks, inline code, URLs and file paths exactly as they are. The number of code fences must match the source.
- Keep the heading ids (`[#id]`) unchanged, so links and anchors work in every language. Translate only the heading text.
- Pelago keywords and identifiers stay in English: `fn`, `var`, `const`, `inout`, `sink`, `switch`, `result`, `option`, `none`, and so on. The language name, Pelago, is never translated.
- Translate `title` and `description` in the frontmatter.
- In `meta.json`, translate only `title` and `description`. Keep `pages`, `root` and the other keys.
- Link targets stay the same. Only the visible link text is translated.
- Arabic prose is right to left; code stays left to right (the layout handles this).
- Use the natural technical register of the language. Where a term has no settled translation, keep the English term and give the translation once in brackets.
- `en-UK` differs from `en-US` in spelling only (colour, optimise, behaviour).
