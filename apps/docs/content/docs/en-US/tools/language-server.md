---
title: Language server
description: Editor features from pelago lsp.
---

`pelago lsp` is a language server built into the compiler. It speaks the Language Server Protocol over standard input and output, so any editor with a client can use it. The [VS Code and Zed extensions](../getting-started/editors) start it for you.

## Features

| Feature | What you get |
| --- | --- |
| Diagnostics | Errors and warnings from every compiler stage as you type, cleared as soon as they are fixed. |
| Hover | A function's signature, the shape of a type, or the type of an expression. |
| Go to definition | Works across the files of a package. |
| Find references | Every use of a name in the package. |
| Rename | Renames a name and all its uses; the library and built-ins cannot be renamed. |
| Completion | Keywords, declarations, locals and the members of a value's type after a dot. |
| Signature help | The parameters of a call. |
| Outline | The functions and types of the current file. |
| Semantic colours | Highlighting that knows functions from methods and types from variables. |
| Formatting | The same layout as [`pelago fmt`](./formatter). |

## Limits

The checker looks at the whole package each time a file changes. That is fast for small and medium projects.

## Using it from another editor

Start `pelago lsp` as the server for `.pel` files with no arguments. If your editor cannot find `pelago`, give it the full path to the executable.
