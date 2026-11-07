---
title: Run and build
description: "The everyday pelago commands: check, run, build and format."
---

`pelago` is one tool with a handful of commands. Each takes a file or a directory of `.pel` files.

| Command | What it does |
| --- | --- |
| `pelago check <path>` | Parses, resolves names and checks types. Runs nothing. |
| `pelago run <path>` | Builds machine code in memory and runs `main`. |
| `pelago build [-o out] <path>` | Writes a native executable. |
| `pelago fmt [--check] <path>` | Formats `.pel` files in place. |
| `pelago lsp` | Starts the language server for editors. |

## Running

```
pelago run hello.pel
```

`run` uses native code by default. On a platform where that is not available, or when you want to compare behaviour, run the IR interpreter instead:

```
pelago run --interp hello.pel
```

The interpreter also takes `--opt` to optimise first and `--stats` to count executed steps.

## Building

```
pelago build -o hello hello.pel
```

Options you will use most:

| Option | Effect |
| --- | --- |
| `-o <file>` | Name of the executable. |
| `--no-opt` | Skip optimisation. Faster to build, slower to run. |
| `--target=linux` or `--target=windows` | Build for another operating system. |
| `--arch=aarch64` | Build for AArch64 instead of x86-64 (Linux and Windows). |
| `--leak-check` | Report memory that was never released when the program ends. |
| `--timings` | Print how long each compiler phase took. |

Executables are standalone: there is no linker step and no C library to install on the target machine.

## Command-line arguments

`main` may take the arguments as a list of strings. The first element is the program name. Pass arguments to a built executable:

```
import std.os

fn main(args: [string]) {
    if args.len() < 2 {
        print("usage: args <name>")
        os.exit(2)
    }
    print("hello, #(args[1])")
}
```

```
pelago build -o args args.pel
./args Sea
```

```
hello, Sea
```

`os.exit` ends the program with the given status code.

## Exit status and stops

A program that finishes `main` exits with status 0. When Pelago detects a fault such as integer overflow, it stops the program, prints a message and exits with a non-zero status:

```
fn main() {
    var x: int = 9223372036854775807
    x += 1
    print(x)
}
```

```
stopped: arithmetic overflow
```

Overflow is never silently wrapped, in debug or optimised builds alike.

## Formatting

```
pelago fmt src
pelago fmt --check src
```

The first rewrites files; the second only reports files that would change, which suits continuous integration. Use `-` to format standard input to standard output.
