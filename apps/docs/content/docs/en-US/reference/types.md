---
title: Types
description: The built-in types and how types are written.
---

## Numbers

| Type | Meaning |
| --- | --- |
| `int`, `uint` | The default signed integer (64 bits) and the unsigned machine integer. |
| `int8`, `int16`, `int32`, `int64` | Signed integers of a given width. |
| `uint8`, `uint16`, `uint32`, `uint64` | Unsigned integers of a given width. `byte` is another name for `uint8`. |
| `int128`, `uint128`, `int256`, `uint256` | Wide integers, with the same checked arithmetic. See [Wide integers](../library/wide-integers.md). |
| `float`, `float32` | IEEE 754 floating point, 64 and 32 bits. |
| `float16`, `float128`, `float256` | IEEE 754 formats implemented in software. See [Wide and narrow floats](../library/wide-floats.md). |

Arithmetic on every integer type is checked: a result that does not fit stops the program. A narrower integer is made from an `int` explicitly with `wrapToByte()`, `toByteChecked()` and the matching methods for the other widths (`wrapToInt16`, `toInt32Checked`, ...). The first wraps around and the second returns an option.

## Text and truth

| Type | Meaning |
| --- | --- |
| `bool` | `true` or `false`. |
| `char` | A single character. |
| `string` | Owned UTF-8 text. |
| `str` | A view of text that belongs to something else, such as the pieces returned by `split`. |

## Compound types

| Type | Example | Meaning |
| --- | --- | --- |
| Tuple | `(int, string)` | A fixed group of values; fields are `t.0`, `t.1`. |
| Braid | `(int, string; 4)` | A fixed-size run whose types repeat in a cycle. See [Braids](../guide/braids.mdx). |
| List | `[int]` or `list<int>` | A growable sequence. |
| Map | `map<string, int>` | Keys with values. |
| Set | `set<int>` | Unique values. |
| Range | `0..10` | A span of integers. |
| Box | `box<tree>` | A value stored on the heap. |

## Options, results and functions

| Type | Meaning |
| --- | --- |
| `T?` | A `T` or `none`. |
| `T ! E` | A `T` or an error `E`. |
| `fn(A, B) -> R` | A function or closure. `once fn` marks a closure that may be called only once. |
| `never` | The type of an expression that does not return, such as `panic("...")`. |

A function without a result type returns nothing.

## Types you define

`struct`, `enum`, `obj` and `interface` declare new types; see the [guide](../guide/types.md). A value of type `any shape` holds any type that implements the interface `shape`. Generic types and functions take type parameters in angle brackets, optionally bounded: `fn largest<T: order>(a: T, b: T) -> T`.

Standard interfaces include `order` (comparison with `<`), `eq`, `show` (conversion to text), and the operator interfaces `add`, `sub`, `mul`, `div`, `rem` and `neg`, which a type implements to support the matching operator.

## Aliases

```pelago
type meters = float

fn main() {
    const m: meters = 2.5
    print("#m")
}
```

```text
2.5
```

An alias is another name for the same type, not a new type.
