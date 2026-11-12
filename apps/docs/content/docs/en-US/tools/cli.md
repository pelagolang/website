---
title: Command line
description: Every pelago command and its options.
---

```text
pelago <command> [options] [path]
```

A `path` is a `.pel` file or a folder. With a folder, all the files in it are compiled as one package, so they can import each other.

## Everyday commands

| Command | What it does |
| --- | --- |
| `pelago check <path>` | Parse, resolve names and check types. Prints the errors and a summary such as `18 modules, 1856 definitions, 0 errors`. |
| `pelago run <path>` | Build machine code in memory and run `main`. |
| `pelago build [-o out] <path>` | Write a native executable. |
| `pelago fmt [--check] <path>...` | Format source files. See [Formatter](./formatter.md). |
| `pelago lsp` | Run the language server on standard input and output. See [Language server](./language-server.md). |

## `run`

| Option | Effect |
| --- | --- |
| `--no-opt` | Skip optimisation. |
| `--interp` | Run in the IR interpreter instead of native code. |
| `--opt` | With `--interp`: optimise the IR first. |
| `--stats` | Print IR statistics; with `--interp`, also the number of steps taken. |
| `--leak-check` | Report allocations that are still live at the end. |
| `--timings` | Print the time each compiler phase took. |

`run` ends with the exit status of your program. A compile error ends it with status 1.

## `build`

| Option | Effect |
| --- | --- |
| `-o <file>` | Output file name. |
| `--no-opt` | Do not optimise. |
| `--target=linux`, `--target=windows` | Operating system of the executable. |
| `--arch=aarch64` | Build for 64-bit ARM (Linux and Windows). The default is x86-64. |
| `--leak-check` | Build with allocation counting; the program exits with status 3 and reports `leaked N allocation(s)` if memory remains. |
| `--stats`, `--timings` | Compiler diagnostics. |

See [Targets](./targets.md).

## Looking inside the compiler

| Command | Output |
| --- | --- |
| `pelago ir <path>` | Check the program, lower it to the intermediate representation, verify it and print it. |
| `pelago parse <file>` | The syntax tree. `-` reads standard input. |
| `pelago lex <file>` | The tokens. `-` reads standard input. |
| `pelago keywords` | The hard and soft keywords. |
| `pelago tokens` | The operators and punctuation. |
| `pelago highlight <file>` | Colour a file: `--ansi`, `--html`, `--html-page` or `--plain`, with `--theme dark` or `--theme light`. |
| `pelago grammar` | The TextMate grammar used by editors. |

## Exit status

| Status | Meaning |
| --- | --- |
| 0 | Success. |
| 1 | A compile error, or the program stopped (`stopped: ...`). |
| 2 | Bad usage or a broken configuration file; or the status your program passed to `os.exit`. |
| 3 | `--leak-check` found a leak. |
