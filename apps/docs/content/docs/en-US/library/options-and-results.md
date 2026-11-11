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
| `unwrapOrElse(f)` | `T` | The value, or the result of `f()`, which runs only when needed. |
| `andThen(f)` | `U?` | `f` returns an option; `none` stays `none`. |
| `filter(f)` | `T?` | Keep the value only when `f` holds. |
| `orElse(f)` | `T?` | The option itself, or `f()` when it is `none`. |
| `isSomeAnd(f)` | `bool` | Present, and `f` holds. |
| `zip(other)` | `(T, U)?` | Both values, or `none` if either is missing. |

## Results (`T ! E`)

| Method | Result | Notes |
| --- | --- | --- |
| `isOk()`, `isErr()` | `bool` | |
| `ok()` | `T?` | The value, or `none`. |
| `or(x)` | `T` | The value, or `x`. |
| `mapErr(f)` | `T ! F` | Transform the error. |
| `context(message)` | `T ! error` | Replace the error with one that carries `message`. |
| `map(f)` | `U ! E` | Transform the value when it is `ok`. |
| `andThen(f)` | `U ! E` | `f` returns a result; an error stays the same error. |
| `err()` | `E?` | The error, or `none`. |
| `unwrapOrElse(f)` | `T` | The value, or `f(error)`. |
| `isOkAnd(f)` | `bool` | `ok`, and `f` holds. |

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

```pelago
fn half(n: int) -> int? = n % 2 == 0 ? n / 2 : none

fn check(n: int) -> int ! string = n > 0 ? ok(n) : err("not positive")

fn main() {
    const a: int? = 8
    print(a.andThen(n ~> half(n)), a.filter(n ~> n > 9), a.zip("x"))
    const good = check(3)
    const bad = check(-1)
    print(good.map(n ~> n * 2), bad.map(n ~> n * 2), bad.err())
    print(bad.unwrapOrElse(e ~> e.len()), good.isOkAnd(n ~> n == 3))
}
```

```text
some(4) none some((8, "x"))
ok(6) err("not positive") some("not positive")
12 true
```
