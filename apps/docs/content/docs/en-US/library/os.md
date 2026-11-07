---
title: std.os
description: The process: arguments and exit status.
---

```text
import std.os
```

| Item | Notes |
| --- | --- |
| `main(args: [string])` | `main` may declare a list of strings as its parameter. The first element is the program name. |
| `os.exit(code)` | End the program at once with this status. Standard output is flushed, but `deinit` does not run. |

```pelago exit
import std.os

fn main(args: [string]) {
    if args.len() < 2 {
        print("usage: greet <name>")
        os.exit(2)
    }
    print("hello, #(args[1])")
}
```

```text
usage: greet <name>
```

`os.exit` has the type `never`, so the compiler knows the code after it is not reached. Use the exit status to tell scripts whether your tool succeeded: 0 for success and non-zero for failure.
