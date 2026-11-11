---
title: Standard library
description: "What comes with Pelago: the always-available core and the std modules you import."
---

The library has two parts.

**`core`** is always available. It provides the collection types, text, numbers, options and results, and tasks. Their methods come with the types, so nothing is imported to call `xs.sort!()` or `name.toUpper()`.

**`std`** is a set of modules you import when you need them:

| Module | Purpose |
| --- | --- |
| [`std.io`](./io) | Standard input and standard error. |
| [`std.fs`](./fs) | Read and write files by path. |
| [`std.path`](./path) | Join, split and clean paths as text. |
| [`std.os`](./os) | The process: arguments and exit status. |
| [`std.json`](./json) | Parse and write JSON. |
| [`std.regex`](./regex) | Regular expressions. |
| [`std.big`](./big) | Integers of any size. |

## Pages

- [Lists](./lists), [Maps and sets](./maps-and-sets)
- [Strings](./strings), [Numbers](./numbers)
- [Options and results](./options-and-results)

## The prelude

These names are always in scope: the built-in types, `ok`, `err`, `none`, `print`, `assert`, `panic`, `spawn`, `chan` and `box`.

`print(value)` writes a value and a newline to standard output. Any value with a text form can be printed: numbers, strings, lists, maps, options and your own types when they implement `show`.

## Reading the method tables

A method marked with `!` in the table changes its receiver and must be called with the mark (`xs.push!(1)`). The others only read.
