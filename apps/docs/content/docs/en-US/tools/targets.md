---
title: Targets
description: Which systems Pelago builds for, and how to cross-compile.
---

`pelago build` writes a standalone executable. It contains its own startup code and runtime, and needs no linker, assembler or C library on the build machine or the target.

| Operating system | x86-64 | AArch64 |
| --- | --- | --- |
| Linux | yes | yes |
| Windows | yes | yes |

Choose the target with `--target` and `--arch`. Any build machine can produce any combination:

```sh
pelago build -o hello hello.pel
pelago build --target=windows -o hello.exe hello.pel
pelago build --arch=aarch64 -o hello-arm hello.pel
```

`pelago run` runs the program on the machine you are on; it does not run a cross-compiled executable.

## Size

A hello-world executable is a few kilobytes: about 2.5 KB for x86-64 Linux and 3.5 KB for Windows. Programs grow with what they use from the library.

## Optimisation

Builds are optimised by default. `--no-opt` turns the optimiser off, which shortens compile time while you are debugging. Optimisation never changes what a program prints or when it stops: overflow checks and bounds checks stay in optimised code.
