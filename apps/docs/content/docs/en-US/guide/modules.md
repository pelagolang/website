---
title: Modules and imports
description: How files become modules, how names are shared, and how imports are written.
---

## A file is a module

Every `.pel` file is a module named after the file: `geometry.pel` is the module `geometry`. A folder of files groups modules, so `shapes/circle.pel` is `shapes.circle`.

Names are private to their module unless marked `pub`. The order of declarations inside a module does not matter, and modules may import each other.

## Sharing names

Mark what other modules may use with `pub`. This file is `geometry.pel`:

```text
pub struct point {
    pub x: int
    pub y: int
}

pub fn origin() -> point = point { x: 0, y: 0 }

fn helper() -> int = 1
```

`helper` stays private. Another module in the same folder can import the module, or some of its names:

```text
import geometry
import { origin } = geometry

fn main() {
    const p = origin()
    const q = geometry.point { x: 3, y: 4 }
    print("#(p.x) #(q.y)")
}
```

Run a folder to build all of its files together:

```sh
pelago run .
```

```text
0 4
```

(`pelago run main.pel` on a single file sees only that file; give it the folder so sibling modules are found.)

## Import forms

An import is a binding, written like the declarations around it.

| Form | Effect |
| --- | --- |
| `import std.os` | The module, under its last name: `os.exit(1)`. |
| `import tools = std.os` | The module under another name: `tools.exit(1)`. |
| `import { exit } = std.os` | Some names, directly: `exit(1)`. |
| `import { exit: leave } = std.os` | One name, renamed. |
| `import { ... } = std.os` | Everything the module makes public. |
| `pub import { exit } = std.os` | Imports the names and re-exports them to your own importers. |

`use` is another spelling of `import`. Imports go at the top level of a file, not inside functions.

## Import paths

| Path | Meaning |
| --- | --- |
| `std.os` | The first part is a package, here the standard library. |
| `geometry.shapes` | The first part names a top-level module of your own package. |
| `.sibling` | A leading dot is relative to the current file's folder. |
| `..util.strings` | `..` goes up one folder. |

## What is in scope without an import

The prelude: the built-in types (`int`, `float`, `string`, `option`, `result` and so on), `ok`, `err`, `none`, `print`, `assert`, `panic` and a few more. Everything else comes from an import.

Methods belong to their type and arrive with it; you do not import them separately.

## Packages from Islet

A dependency installed by [Islet](../tools/islet) is imported by the package's name: `import json.decode` reads the module `decode` of the package `json`. A second major version is a module of the first: `import json.v2.decode`. `pelago` finds installed packages in `deps/map.yaml`, which `islet install` writes, and refuses to build when `deps/` is out of date with `islet.lock`. Each package has its own import table, so two packages can use different versions of a third.

## The standard library

The library has two parts. `core` is built in and always available: lists, maps, strings, numbers, results and options, tasks. `std` holds modules you import when needed: `std.io`, `std.fs`, `std.path`, `std.os`, `std.json`, `std.regex` and `std.big`.

```pelago exit
import std.os

fn main(args: [string]) {
    if args.len() < 2 {
        print("usage: tool <name>")
        os.exit(2)
    }
    print("hello, #(args[1])")
}
```

```text
usage: tool <name>
```
