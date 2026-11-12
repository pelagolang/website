---
title: Troubleshooting
description: Solutions to the problems people hit when installing and first using Pelago.
---

## `pelago` is not recognised

The shell cannot find the executable.

- If you used `cargo install --path compiler`, the tool is in Cargo's `bin` folder: `%USERPROFILE%\.cargo\bin` on Windows, `~/.cargo/bin` on Linux and macOS. Check that folder is on your `PATH` and open a **new** terminal.
- If you only ran `cargo build --release`, call the tool by its path: `target\release\pelago.exe` on Windows, `target/release/pelago` elsewhere.

## The editor shows no errors or highlighting

- Highlighting works without the tool; diagnostics need the language server, which is the `pelago` executable. Run `pelago check hello.pel` in a terminal. If that works but the editor stays silent, set the server path explicitly (in VS Code, **Pelago: Server Path**) and restart the editor.
- Only files ending in `.pel` are recognised.

## `run` works but my program does something different with `--interp`

`pelago run` executes native code; `--interp` uses the IR interpreter. They are meant to agree. If they do not, that is a compiler bug: please open an issue on [pelagolang/pelago](https://github.com/pelagolang/pelago/issues) with the smallest program that shows it.

## `stopped: ...` and a non-zero exit status

Your program ended because it broke a rule the language enforces at run time, such as `main:12: stopped: arithmetic overflow` or `main:7: stopped: index out of range`. The message names the file and line of the check that failed, so start there. These are not crashes of the compiler. Fix the value that caused it, or handle the case before the faulty operation.

## `error: cannot find value ...` after a type error

One mistake can produce several messages, because a declaration that failed to check leaves its name undefined for later lines. Fix the first error and run the check again.

## Building for another system

`pelago build --target=windows -o app.exe main.pel` builds a Windows executable from Linux, and `--target=linux` does the reverse. Add `--arch=aarch64` for ARM 64-bit. The executable cannot run on the machine you built it on unless that machine matches the target.

## Still stuck

Open an [issue](https://github.com/pelagolang/pelago/issues) with the command you ran, its output and your operating system.
