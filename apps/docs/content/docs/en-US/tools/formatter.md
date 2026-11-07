---
title: Formatter
description: pelago fmt keeps code consistently laid out.
---

`pelago fmt` rewrites `.pel` files in place.

```sh
pelago fmt src
pelago fmt main.pel util.pel
```

```text
2 file(s), 1 reformatted, 0 skipped
```

## What it does

The formatter works on the token stream. It fixes indentation, removes trailing spaces, collapses runs of blank lines and puts one space after commas. It does not change comments, and it does not reflow long lines yet.

Before it writes a file, it checks that the result has exactly the same tokens as the original, so formatting cannot change what a program means. A file with syntax errors is left alone and reported as skipped.

## Checking in CI

`--check` changes nothing and exits with status 1 when any file would change:

```sh
pelago fmt --check src
```

## Standard input

`pelago fmt -` reads source from standard input and writes the result to standard output, which is how editors that format a buffer use it.

## Settings

The indentation width comes from the `[fmt]` section of [`pelago.toml`](./pelago-toml). The language server formats through the same code, so "format document" in an editor gives the same result as the command.
