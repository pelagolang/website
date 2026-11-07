---
title: Operators
description: Every operator, its precedence and its meaning.
---

Pelago uses symbols for operators. Two words act as operators too: `in` and `is`, plus the conversion `to`.

## Precedence

From loosest to tightest binding:

| Level | Operators | Notes |
| --- | --- | --- |
| Assignment | `=` `+=` `-=` `*=` `/=` `%=` `&=` `\|=` `^=` `<<=` `>>=` `+%=` `-%=` `*%=` `??=` | Right associative. |
| Conditional | `a ? b : c` | Right associative. |
| 1 | `\|>` | Pipe. |
| 2 | `??` | Fallback for an empty option. |
| 3 | `\|\|` | Logical or. |
| 4 | `&&` | Logical and. |
| 5 | `==` `!=` `<` `>` `<=` `>=` `is` `in` | Comparison and tests. |
| 6 | `..` `..=` | Ranges. |
| 7 | `to` `to?` | Conversion. |
| 8 | `\|` | Bitwise or. |
| 9 | `^` | Bitwise exclusive or. |
| 10 | `&` | Bitwise and. |
| 11 | `<<` `>>` | Shifts. |
| 12 | `+` `-` `+%` `-%` | Addition and subtraction. |
| 13 | `*` `/` `%` `*%` | Multiplication, division, remainder. |
| Unary | `-` `!` `~` `copy` | Prefix. |
| Power | `**` | Binds tighter than unary minus, right associative. |
| Postfix | `.` `?.` `(...)` `[...]` `?` `!` `!!` `++` `--` | Field, call, index and the marks below. |

Bitwise operators bind tighter than comparison, so `a & b == 0` means `(a & b) == 0`, which avoids a classic C trap.

## Arithmetic

`+ - * / %` work on numbers. Integer arithmetic checks for overflow and stops the program with `stopped: arithmetic overflow` when the result does not fit. Integer division truncates toward zero and `%` has the sign of the left operand. Division by zero stops the program.

The wrapping forms `+%`, `-%` and `*%` (and their assignment forms) discard the carry and wrap around instead. Use them on purpose, for hashes and checksums.

```pelago
fn main() {
    const big: int = 9223372036854775807
    print("#(big +% 1)")
    print("#(-7 / 2) #(-7 % 2)")
}
```

```text
-9223372036854775808
-3 -1
```

`**` is the power operator. It is accepted by the checker, but the native code generator does not support it yet; use `pow` (`2.pow(10)` for integers) in programs you need to run.

## Comparison and logic

`==` and `!=` compare values structurally, so two lists with equal elements are equal. Comparing with `<` and the others needs the type to support ordering. `&&` and `||` short-circuit.

## Bitwise

`& | ^ ~ << >>` work on integers.

## Ranges

`a..b` excludes `b`; `a..=b` includes it. Ranges are used in `for` loops, slices and `switch` patterns, and `x in 1..10` tests membership. A `step` can follow a range in a loop head.

## Options and chaining

| Operator | Meaning |
| --- | --- |
| `a ?? b` | `a` if present, otherwise `b`. |
| `a ??= b` | Assign `b` to `a` when `a` is empty. |
| `a?.b` | Field or method of `a` when present, otherwise empty. |
| `e?` | Unwrap a result or option, or return the failure from the function. |

## Conversion and tests

`x to float` converts when nothing can be lost; a conversion that can lose information is refused and has a named method instead (`truncInt`, `toByteChecked`, `wrapToByte`). `x to? T` returns an option for a checked downcast. `v is pattern` tests a value against a pattern and binds names for the code it guards.

## Call-site marks

| Mark | Where | Meaning |
| --- | --- | --- |
| `inout` | argument | The callee changes this variable. |
| `sink` | argument | The callee takes this value. |
| `!` | after a method name | The method changes its receiver. |
| `!!` | after a method name | The method consumes its receiver. |
| `copy` | prefix | Make an independent copy instead of moving. |

## Pipe and closures

`x |> f` calls `f(x)`. `~>` separates a closure's parameters from its body. `..` also spreads in other positions: `...rest` in a pattern binds the rest of a list and `...xs` in a call passes a list as separate arguments.
