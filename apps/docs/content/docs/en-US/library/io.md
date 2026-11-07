---
title: std.io
description: Standard input and standard error.
---

```text
import std.io
```

Standard output is `print`, which is always available. `std.io` adds the other two standard streams.

| Function | Result | Notes |
| --- | --- | --- |
| `io.eprint(text)` | | Write to standard error. |
| `io.eprintln(text)` | | Write a line to standard error. |
| `io.readAll()` | `string` | Read standard input until it ends. |
| `io.readLine()` | `string?` | The next line, or `none` at the end of input. |

Standard output is flushed before anything is written to standard error, so the two streams appear in the order your program wrote them.

```pelago
import std.io

fn main() {
    io.eprintln("reading...")
    var lines = 0
    var running = true
    while running {
        switch io.readLine() {
            case some(_): lines++
            case none: running = false
        }
    }
    print("#lines lines")
}
```

Run it with input piped in:

```sh
printf 'a\nb\nc\n' | pelago run count.pel
```

```text
3 lines
```
