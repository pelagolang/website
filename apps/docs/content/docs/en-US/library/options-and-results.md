---
title: Options and results
description: Methods of T? and T ! E.
---

See [Errors and options](../guide/errors) for how to use them.

## Options (`T?`)

| Method | Result | Notes |
| --- | --- | --- |
| `isSome()`, `isNone()` | `bool` | |
| `unwrapOr(x)` | `T` | The value, or `x`. Same as `?? x`. |
| `map(f)` | `U?` | Transform the value when present. |
| `orErr(e)` | `T ! E` | Turn `none` into the error `e`. |

## Results (`T ! E`)

| Method | Result | Notes |
| --- | --- | --- |
| `isOk()`, `isErr()` | `bool` | |
| `ok()` | `T?` | The value, or `none`. |
| `or(x)` | `T` | The value, or `x`. |
| `mapErr(f)` | `T ! F` | Transform the error. |
| `context(message)` | `T ! error` | Replace the error with one that carries `message`. |

```pelago
fn main() {
    const missing: int? = none
    print("#(missing.isNone()) #(missing.unwrapOr(7))")
    const parsed = "12".parseInt()
    print("#(parsed.isOk()) #(parsed.ok() ?? 0)")
    const failed = "zz".parseInt().mapErr(e ~> "bad input")
    print("#(failed.or(-1))")
}
```

```text
true 7
true 12
-1
```

`parse_error` is the error type returned by `parseInt`, `parseFloat`, `json.parse`, `regex.compile` and `big.parse`. Its `message` field describes the problem.
