---
title: Pattern matching
description: One switch for choosing by value and by shape, including lists and options.
---

Pelago has a single construct for branching on what a value is: `switch`. It handles numbers, enums, structs, tuples, lists and options, and it is an expression, so each case produces a value. When the value has a fixed set of shapes, such as an enum, the compiler checks that every case is covered. Otherwise add a `default`.

## Values and ranges

```pelago
fn classify(n: int) -> string {
    switch n {
        case 0: "zero"
        case 1, 2, 3: "small"
        case 4..10: "medium"
        case big if big > 1000: "huge"
        case ..0: "negative"
        default: "large"
    }
}

fn main() {
    for n of [0, 2, 5, 5000, -3, 50] { print(classify(n)) }
}
```

```text
zero
small
medium
huge
negative
large
```

`case 1, 2, 3` matches any of several values, `4..10` is a range, and `case big if big > 1000` binds the value to a name and adds a condition (a guard). Cases are tried in order.

## Enums

A pattern names a case and binds its fields.

```pelago
enum shape {
    circle(radius: float)
    rect(w: float, h: float)
    empty
}

fn area(s: shape) -> float {
    switch s {
        case .circle(r): 3.14159 * r * r
        case .rect(w, h): w * h
        case .empty: 0.0
    }
}

fn main() {
    print("#(area(.rect(2.0, 3.0)))")
}
```

```text
6
```

Leave out the `.empty` case and the compiler reports the missing one.

## Structs and tuples

```pelago
struct point {
    x: int
    y: int
}

fn where_is(p: point) -> string {
    switch p {
        case point { x: 0, y: 0 }: "origin"
        case point { x, .. }: "x is #x"
    }
}

fn main() {
    print(where_is(point { x: 0, y: 0 }))
    print(where_is(point { x: 4, y: 9 }))
}
```

```text
origin
x is 4
```

`..` ignores the remaining fields. Tuples match by position: `case (a, b):`.

## Lists

A list pattern matches the shape of a list, with `...` standing for the rest. This replaces most index arithmetic.

```pelago
fn describe(xs: [int]) -> string {
    switch xs {
        case []: "empty"
        case [x]: "one: #x"
        case [first, ..., last]: "from #first to #last"
    }
}

fn sum_list(xs: [int]) -> int {
    switch xs {
        case []: 0
        case [h, ...t]: h + sum_list(t)
    }
}

fn main() {
    print(describe([]))
    print(describe([7]))
    print(describe([1, 2, 3]))
    print("#(sum_list([1, 2, 3, 4]))")
}
```

```text
empty
one: 7
from 1 to 3
10
```

Literals work inside list patterns, which makes small command parsers easy to read:

```pelago
fn command(line: string) -> string {
    switch line.split(" ").toList() {
        case ["add", name]: "adding #name"
        case ["rename", old, new]: "renaming #old to #new"
        case [cmd, ...]: "unknown command #cmd"
        case []: "empty"
    }
}

fn main() {
    print(command("add bob"))
    print(command("rename a b"))
    print(command("zap"))
}
```

```text
adding bob
renaming a to b
unknown command zap
```

## Options and results

`some(...)` and `none` match options; `ok(...)` and `err(...)` match results.

```pelago
fn main() {
    const opt: int? = 7
    switch opt {
        case some(n) if n > 3: print("big")
        case some(_): print("small")
        case none: print("missing")
    }
}
```

```text
big
```

## `is`: a pattern as a test

When you only care about one shape, `is` tests it and binds names for the block that follows. It also works inside a list builder as a filter.

```pelago
enum shape {
    circle(radius: float)
    square(side: float)
}

fn main() {
    const shapes = [shape.circle(1.0), shape.square(2.0), shape.circle(3.0)]
    const first = shapes[0]
    if first is .circle(r) { print("radius #r") }

    const radii = [s of shapes if s is .circle(r) ~> r]
    print("#radii")
}
```

```text
radius 1
[1, 3]
```
