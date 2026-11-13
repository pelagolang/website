---
title: std.env
description: Read environment variables.
---

```text
import std.env
```

| Function | Result | Notes |
| --- | --- | --- |
| `env.get(name)` | `string?` | The value, or `none` when the variable is not set. A variable set to empty text is `some("")`. |
| `env.has(name)` | `bool` | Whether it is set, even to empty text. |
| `env.vars()` | `[(string, string)]` | Every variable as a (name, value) pair. |

The values are copies, so they stay valid for as long as the program runs.

```pelago
import std.env

fn main() {
    print(env.has("PELAGO_DOCS_SURELY_NOT_SET"), env.get("PELAGO_DOCS_SURELY_NOT_SET"))
    print(env.get("PELAGO_DOCS_SURELY_NOT_SET") ?? "default")
}
```

```text
false none
default
```

Like `main(args)`, this works in the interpreter and on Linux (x86-64 and AArch64), Windows (x86-64 and ARM64) and macOS (AArch64).
