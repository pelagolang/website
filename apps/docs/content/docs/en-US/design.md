---
title: Design and performance
description: What Pelago guarantees, what it costs, and how its speed is measured.
---

This page explains the choices behind the language and what to expect from the code it produces.

## Principles

**Values behave like values.** Two names never share a changeable value. You get a second one with `copy`, you hand one over with `sink`, and a function that may change your data says `inout` on the call. Programs are easier to reason about, and tasks cannot race on data they were not given. See [Ownership and memory](./guide/ownership).

**Cleanup is deterministic.** There is no garbage collector and no runtime to ship. A value is released when its owner leaves scope, `deinit` runs at that moment, and `defer` runs when its block ends.

**Faults stop the program instead of corrupting it.** Integer overflow, a division by zero and an index out of range end the program with a message and a non-zero status. Everything that can reasonably fail on a good day (parsing input, opening a file) is a `result` in the type, so the compiler makes you handle it. See [Errors and options](./guide/errors).

**One tool, no moving parts.** The `pelago` command checks, runs, builds, formats and serves editors. The native backend writes executables directly, with no assembler, linker or C library involved, so cross-compiling needs nothing installed.

**Say what you mean.** The call site shows what a call can change or consume (`inout`, `sink`, `!`, `!!`). Wrapping arithmetic is spelled `+%`. A lossy conversion has a named method such as `truncInt`.

## What the checks cost

Overflow and bounds checks are part of the language, so they stay in optimised code. The optimiser removes a check only when it can prove it cannot fail, and it never changes what a program prints or when it stops. Programs that need wrapping arithmetic ask for it explicitly with `+%`, `-%` and `*%`, which do not check.

C and Rust release builds normally leave overflow unchecked, so a comparison with them is a comparison of programs that do slightly different work. The [benchmarks page](../../../benchmarks/) is explicit about that, and also compares against C and Rust built with overflow checks on.

## Size and build speed

Executables are small because nothing is linked in that the program does not use. Small programs compile and start in tens of milliseconds, and `pelago run --timings` shows where the time goes. Measured binary sizes, next to C and Rust, are on the [benchmarks page](../../../benchmarks/).

## Measuring speed

Speed is measured by compiling small programs with Pelago, with C at `-O2` and with Rust at `-O`, running each several times and comparing the median time. Every program prints the same output as its C twin, or the comparison reports a mismatch. The [benchmarks page](../../../benchmarks/) shows a dated snapshot with the machine and the method, including the programs where Pelago is slower, and the sources of every benchmark are in the compiler repository under `bench`.

Some honest limits: the programs are small, so a few percent either way is noise; results come from cloud machines; and the x86-64 backend has had far more tuning than the AArch64 one.

## Where the language is heading

The compiler is written in Rust today. The goal is to rewrite it in Pelago itself. Running tasks on real parallel threads and `async` suspension are still to come. The [FAQ](./faq) lists the current limits plainly.
