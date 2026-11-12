---
title: FAQ
description: Answers to common questions about Pelago.
---

## What is Pelago for?

Systems programming where you want native executables, predictable behaviour and small programs: command-line tools, services, embedded and small-device software. It is a compiled language with no garbage collector and no runtime to ship with your code.

## How is memory managed without a garbage collector?

Every value has one owner. A value is released when its owner goes out of scope, and passing it with `sink` or assigning it moves it to a new owner. There is no borrow checker to learn: references last only for a call or a statement. See [Ownership and memory](./guide/ownership.md).

## Why do calls say `inout`, `sink` and `!`?

So that reading a line of code tells you what it can change or consume, without opening the function it calls. `f(inout x)` changes `x`, `f(sink x)` takes it, `list.push!(1)` changes the list and `task.join!!()` uses the task up.

## Does Pelago have exceptions or null?

No. A function that can fail returns a result (`T ! E`), a value that may be missing is an option (`T?`), and `?` passes a failure up. Faults that are bugs, such as overflow or an out-of-range index, stop the program with a message. See [Errors and options](./guide/errors.md).

## Why does integer overflow stop my program?

Because silently wrapping around is rarely what you meant. When you do want wrapping, use `+%`, `-%` and `*%`, or the `checked...` and `saturating...` methods, which say so in the code. Optimised builds keep the same behaviour.

## Why does `//` give an error?

Pelago comments are `///` for a line and `///* ... *///` for a block, and `//~` for documentation. The error message tells you which one to use. See [Comments and style](./guide/comments.md).

## Which systems can I build for?

Linux and Windows, on x86-64 and AArch64, from any of those systems. See [Targets](./tools/targets.md).

## Is there an installer or a package manager?

Not yet. You build the `pelago` tool from source, as described in [Install](./getting-started/install.md). The compiler is the only tool you need.

## Is the compiler written in Pelago?

Not yet. It is written in Rust today, with no dependencies, and the goal is to rewrite it in Pelago itself.

## Why does a construct like `**` or `do ... while` fail?

Some constructs are accepted by the checker before the code generator supports them, so they check cleanly and then stop at run time with `not lowered yet` (see the next question). Where a documented feature is not available yet, its page says so.

## A program prints `stopped: not lowered yet`. What is that?

You used something the compiler can parse and check but cannot yet turn into code. The message before it names the construct. Rewrite that part with another form, and please report it.

## How do I report a problem or ask for something?

Open an issue on [pelagolang/pelago](https://github.com/pelagolang/pelago/issues). Include the smallest program that shows the problem, the command you ran and its output.
