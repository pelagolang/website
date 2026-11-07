---
title: Values and variables
description: Constants, variables, the basic types, operators and control flow.
---

## Constants and variables

`const` binds a name to a value that cannot change. `var` binds one that can. Prefer `const`; the compiler rejects a change to a constant.

```pelago error
fn main() {
    const limit = 10
    limit = 20
}
```

```text
main:3:5: error: `limit` is a `const`, so it cannot be changed; declare it with `var`
```

A type is inferred from the value, or written after a colon:

```pelago
fn main() {
    const language = "Pelago"
    var count: int = 10
    count += 5
    count++
    print("#language #count")
}
```

```text
Pelago 16
```

## Basic types

| Type | Examples | Notes |
| --- | --- | --- |
| `int` | `42`, `1_000_000`, `0xFF`, `0b1010` | 64-bit signed. Overflow stops the program. |
| `float` | `3.14`, `1e-3` | 64-bit floating point. |
| `bool` | `true`, `false` | |
| `char` | `'a'`, `'\t'` | One Unicode character. |
| `string` | `"hello"` | Text. See [Collections and strings](./collections). |

Sized integers (`int8`, `uint8`, `int16`, `uint16`, `int32`, `uint32`, `int64` and so on) exist for compact data and file formats.

Underscores in numbers are ignored, so `1_000_000` is one million.

## Strings with values inside

`#name` puts a variable into a string and `#(expression)` puts in any expression. To write a literal `#`, escape it as `\#`.

```pelago
fn main() {
    const a = 6
    const b = 7
    print("#a times #b is #(a * b), literal \#")
}
```

```text
6 times 7 is 42, literal #
```

## Numbers

Integer division truncates toward zero and `%` is the remainder. Mixing `int` and `float` needs an explicit conversion, so a lossy conversion is never silent.

```pelago
fn main() {
    print("#(7 / 2) #(7 % 2) #(-7 / 2)")
    print("#(7.0 / 2.0)")
    print("#(7 to float / 2.0)")
    print("#(2.9.truncInt())")
}
```

```text
3 1 -3
3.5
3.5
2
```

`to` converts when nothing can be lost (`int` to `float`). For conversions that can lose information, use a method that says how: `truncInt`, `floorInt`, `roundInt`, `toByteChecked`, `wrapToByte`.

### Overflow

Arithmetic on `int` that does not fit stops the program with `stopped: arithmetic overflow`. When you want a different behaviour, ask for it by name:

```pelago
fn main() {
    const big: int = 9223372036854775807
    print("#(big.checkedAdd(1) ?? -1)")
    print("#(big +% 1)")
    print("#(big.saturatingAdd(1))")
}
```

```text
-1
-9223372036854775808
9223372036854775807
```

`checkedAdd` returns an option, `+%` wraps around, and `saturatingAdd` stops at the limit. The same families exist for subtraction and multiplication (`-%`, `*%`, `checkedMul`, `saturatingSub`).

## Tuples

A tuple groups a fixed number of values of different types. Fields are numbered from zero.

```pelago
fn main() {
    const t = (1, "two", 3.0)
    print("#(t.0) #(t.1)")
}
```

```text
1 two
```

## Conditions

`if` is an expression, so it can produce a value. The conditional operator `? :` is the short form. `unless` is `if` with the condition reversed.

```pelago
fn main() {
    const x = 42
    const size = if x > 100 { "huge" } else if x > 10 { "medium" } else { "small" }
    const parity = x % 2 == 0 ? "even" : "odd"
    print("#size, #parity")
    unless x == 0 { print("not zero") }
}
```

```text
medium, even
not zero
```

Comparisons are `==`, `!=`, `<`, `>`, `<=`, `>=`; logic is `&&`, `||` and `!`. Pelago uses symbols, not words, for operators, except `in` for ranges and `is` and `to` for tests and conversions.

## Loops

`for` walks a range or a collection. `0..3` stops before 3 and `0..=3` includes it. `while` repeats while a condition holds, and `loop` repeats until `break`.

```pelago
fn main() {
    for i in 0..3 { print("i=#i") }
    for word of ["a", "b"] { print(word) }

    var n = 0
    loop {
        n++
        if n == 3 { break }
    }
    print("n=#n")
}
```

```text
i=0
i=1
i=2
a
b
n=3
```

Use `in` for a range of numbers and `of` for the items of a collection; `for i, x of items` gives the index too. `continue` skips to the next round. Give a loop a label to leave an outer loop from an inner one:

```pelago
fn main() {
    var found = 0
    search: for i of 0..10 {
        for j of 0..10 {
            if i * j == 12 {
                found = i * 10 + j
                break search
            }
        }
    }
    print("#found")
}
```

```text
26
```
