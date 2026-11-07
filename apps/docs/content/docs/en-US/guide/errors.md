---
title: Errors and options
description: Results, options, the ? operator and the stops that end a program.
---

Pelago has no exceptions and no null. Every way a function can fail or come back empty is in its type, so the compiler makes you deal with it.

- `T?` is an **option**: a value of type `T`, or `none`.
- `T ! E` is a **result**: a value of type `T`, or an error of type `E`.

## Options

Use `??` to supply a fallback. Use `switch` or `is` to take the value out.

```pelago
fn find(xs: [int], v: int) -> int? {
    for i, x of xs {
        if x == v { return i }
    }
    none
}

fn main() {
    print("#(find([4, 5], 5) ?? -1)")
    print("#(find([4, 5], 9) ?? -1)")
    print("#(find([4, 5], 9).isNone())")
    print("#(find([4, 5], 5).map(i ~> i * 100) ?? 0)")

    const name: string? = none
    print(name ?? "anonymous")

    var cache: int? = none
    cache ??= 3
    print("#(cache ?? 0)")
}
```

```text
1
-1
true
100
anonymous
3
```

A plain value converts to an option where one is expected, so `return i` is enough in the function above. `??=` assigns only when the option is empty.

## Results

A function that can fail returns `T ! E`. Return `ok(value)` or `err(error)`, and `switch` on the outcome.

```pelago
enum parse_error {
    empty
    bad(text: string)
}

fn parse(s: string) -> int ! parse_error {
    if s.isEmpty() { return err(parse_error.empty) }
    switch s.parseInt() {
        case ok(n): ok(n)
        case err(_): err(parse_error.bad(copy s))
    }
}

fn main() {
    for input of ["12", "", "x1"] {
        switch parse(input) {
            case ok(n): print("ok #n")
            case err(.empty): print("empty")
            case err(.bad(t)): print("bad #t")
        }
    }
}
```

```text
ok 12
empty
bad x1
```

The error type can be anything: a string, an enum with details, or a struct.

## Passing errors up with `?`

`?` after a result unwraps the `ok` value, or returns the error from the current function straight away. The function must itself return a compatible result.

```pelago
fn half(n: int) -> int ! string {
    if n % 2 != 0 { return err("odd number: #n") }
    ok(n / 2)
}

fn quarter(n: int) -> int ! string {
    const h = half(n)?
    half(h)
}

fn main() {
    switch quarter(8) {
        case ok(v): print("quarter: #v")
        case err(e): print("failed: #e")
    }
    switch quarter(6) {
        case ok(v): print("quarter: #v")
        case err(e): print("failed: #e")
    }
}
```

```text
quarter: 2
failed: odd number: 3
```

`?` works on options too, in a function that returns an option.

## Helpers

Results and options have small helpers for the common cases:

| Helper | Meaning |
| --- | --- |
| `isSome()`, `isNone()` | Test an option. |
| `isOk()`, `isErr()` | Test a result. |
| `unwrapOr(x)` | The value, or `x` for an empty option. |
| `or(x)` | The value, or `x` for an error result. |
| `map(f)` | Transform the value inside. |
| `mapErr(f)` | Transform the error. |
| `orErr(e)` | Turn an empty option into the error `e`. |

```pelago
fn lookup(xs: [int], v: int) -> int ! string {
    const found: int? = xs.first()
    found.orErr("nothing for #v")
}

fn main() {
    print("#("x".parseInt().or(-1))")
    print("#(lookup([], 7).isErr())")
}
```

```text
-1
true
```

## Stops

Some faults are bugs, not conditions to handle: integer overflow, an index out of range, a failed `assert`, a call to `panic`. The program prints a message, ends and exits with a non-zero status. There is no way to catch a stop, so when a caller may reasonably want to react, return a result instead.

```pelago
fn main() {
    assert(1 + 1 == 2)
    panic("something broke")
}
```

```text
stopped: panic
```

Use `assert(condition)` for conditions that must hold, and `panic("message")` for states that should be impossible.
