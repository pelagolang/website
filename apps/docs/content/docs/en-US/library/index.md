---
title: Standard library
description: "What comes with Pelago: the always-available core and the std modules you import."
---

The library has two parts.

**`core`** is always available. It provides the collection types, text, numbers, options and results, and tasks. Their methods come with the types, so nothing is imported to call `xs.sort!()` or `name.toUpper()`.

**`std`** is a set of modules you import when you need them:

| Module | Purpose |
| --- | --- |
| [`std.io`](./io.md) | Standard input and standard error. |
| [`std.fs`](./fs.md) | Read and write files by path. |
| [`std.path`](./path.md) | Join, split and clean paths as text. |
| [`std.time`](./time.md) | Clocks, durations and sleeping. |
| [`std.env`](./env.md) | Environment variables. |
| [`std.random`](./random.md) | Random numbers: from the system, or from a seeded generator you can replay. |
| [`std.hash`](./hash.md) | The streaming hash interface, hex helpers and a constant-time compare. |
| [`std.sha2`](./sha2.md) | SHA-224, SHA-256, SHA-384, SHA-512 and the SHA-512/t variants. |
| [`std.mac`](./mac.md) | HMAC over any hash. |
| [`std.kdf`](./kdf.md) | HKDF and PBKDF2 key derivation. |
| [`std.os`](./os.md) | The process: arguments and exit status. |
| [`std.json`](./json.md) | Parse and write JSON. |
| [`std.regex`](./regex.md) | Regular expressions. |
| [`std.big`](./big.md) | Integers of any size. |

## Pages

- [Lists](./lists.md), [Maps and sets](./maps-and-sets.md)
- [Strings](./strings.md), [Numbers](./numbers.md)
- [Options and results](./options-and-results.md)

## The prelude

These names are always in scope: the built-in types, `ok`, `err`, `none`, `print`, `assert`, `panic`, `spawn`, `chan` and `box`.

`print(value)` writes a value and a newline to standard output. Any value with a text form can be printed: numbers, strings, lists, maps, options and your own types when they implement `show`.

## Reading the method tables

A method marked with `!` in the table changes its receiver and must be called with the mark (`xs.push!(1)`). The others only read.
