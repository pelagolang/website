---
title: Install
description: Build the pelago tool from source on Windows, Linux or macOS.
---

Pelago ships as a single command-line tool called `pelago`. There are no prebuilt downloads yet, so for now you build it from source. The build has no dependencies beyond the Rust toolchain and takes about half a minute.

## 1. Install Rust

Install the stable toolchain from [rustup.rs](https://rustup.rs). On Windows, download and run `rustup-init.exe`.

## 2. Build and install Pelago

The commands are the same in PowerShell, bash and zsh.

```sh
git clone https://github.com/pelagolang/pelago
cd pelago
cargo install --path compiler
```

`cargo install` puts `pelago` in Cargo's `bin` folder (`%USERPROFILE%\.cargo\bin` on Windows, `~/.cargo/bin` elsewhere). The Rust installer normally adds that folder to your `PATH`; open a new terminal after installing so the change is picked up.

If you would rather not install it, `cargo build --release` leaves the tool at `target/release/pelago` (`target\release\pelago.exe` on Windows).

## 3. Check that it works

```sh
pelago run examples/hello.pel
```

You should see `Hello, world`. If the shell cannot find `pelago`, see [Troubleshooting](./troubleshooting.md).

## Supported targets

| Target | Architectures |
| --- | --- |
| Linux (ELF) | x86-64, AArch64 |
| Windows (PE) | x86-64, AArch64 |

Cross-compiling needs no extra tools: `pelago build --target=windows` on Linux produces a Windows executable, and the other way round. See [Run and build](./run-and-build.md).

## Next

Write your first program in [Hello, world](./hello-world.md).
