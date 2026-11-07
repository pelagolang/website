---
title: Editor setup
description: Syntax highlighting and live diagnostics for Pelago in VS Code, Zed and other editors.
---

Pelago has extensions for VS Code and Zed, and a Tree-sitter grammar for everything else. The extensions colour `.pel` files only; they never change your theme or workbench colours.

## The language server

Both extensions start `pelago lsp` in the background. It provides errors as you type, hover information, go to definition, find references, completion and a document outline. For this to work, install the `pelago` tool first (see [Install](./install)) and confirm that `pelago` runs in a new terminal. On Windows, restart the editor after changing `PATH`.

## VS Code

Install **Pelago** from the Visual Studio Marketplace, search for it in the Extensions view, or run:

```sh
code --install-extension pelagolang.pelago
```

If `pelago` is not on your `PATH`, set **Pelago: Server Path** in the settings to the full path of the executable. To install a build by hand, download the `.vsix` from the [latest release](https://github.com/pelagolang/vscode-pelago/releases), open the `...` menu in the Extensions view and choose **Install from VSIX...**.

## Zed

The extension is not in the Zed registry yet. Clone [zed-pelago](https://github.com/pelagolang/zed-pelago), open the command palette, run `zed: install dev extension` and choose the folder. Zed compiles the grammar itself, so Rust must be installed through rustup.

## Neovim, Helix and others

[tree-sitter-pelago](https://github.com/pelagolang/tree-sitter-pelago) is a Tree-sitter grammar with highlight queries. Any editor that loads Tree-sitter grammars can use it.

## Without an editor

`pelago highlight` colours a file in a terminal or as HTML:

```sh
pelago highlight --ansi hello.pel
pelago highlight --html hello.pel
```

Add `--theme light` or `--theme dark` to choose the palette.
