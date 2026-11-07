---
title: std.big
description: Integers of any size.
---

```text
import std.big
```

`bigint` holds a whole number of any size. It supports `+ - * / %` and unary `-`, with `/` and `%` rounding toward zero like `int`, and it can be compared and printed.

| Function or method | Result | Notes |
| --- | --- | --- |
| `big.fromInt(n)` | `bigint` | |
| `big.parse(text)` | `bigint ! parse_error` | Decimal digits with an optional `+` or `-`. |
| `pow(e)` | `bigint` | A non-negative whole exponent. |
| `divRem(o)` | `(bigint, bigint)` | Quotient and remainder. |
| `abs()`, `negate()` | `bigint` | |
| `sign()` | `int` | -1, 0 or 1. |
| `isZero()` | `bool` | |
| `toInt()` | `int ! parse_error` | An error when the value does not fit an `int`. |

```pelago
import std.big

fn main() {
    switch big.parse("123456789012345678901234567890") {
        case ok(a):
            print("#(a * a)")
            print("#(big.fromInt(10).pow(30) / a)")
        case err(e): print("bad: #(e.message)")
    }
    print("#(big.fromInt(2).pow(100))")
}
```

```text
15241578753238836750495351562536198787501905199875019052100
8
1267650600228229401496703205376
```
