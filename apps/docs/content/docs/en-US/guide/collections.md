---
title: Collections and strings
description: Lists, maps, sets, ranges, comprehensions and text.
---

## Lists

A list is an ordered, growable sequence. Its type is written `[T]` and a literal uses brackets. Indexes start at zero, and an index that is out of range stops the program with `stopped: index out of range` instead of reading stray memory.

```pelago
fn main() {
    var xs = [10, 20, 30, 40]
    print("#(xs[1]) #(xs.len())")

    xs.insert!(1, 15)
    print("#xs")
    print("#(xs.pop!() ?? 0)")
    print("#(xs.remove!(0))")
    xs.reverse!()
    print("#xs #(xs.reversed())")
    print("#(xs.isEmpty())")
}
```

```text
20 4
[10, 15, 20, 30, 40]
40
10
[30, 20, 15] [15, 20, 30]
false
```

Methods that change the list end in `!` at the call, such as `push!`, `pop!`, `insert!`, `remove!`, `sort!` and `reverse!`. Methods that only read have no mark. `first()`, `last()`, `get(i)` and `pop!()` return an option, because the list may be empty.

`[0; 4]` makes a list of four zeros.

### Slices

`xs[a..b]` is the part from `a` up to but not including `b`. Either end may be left out.

```pelago
fn main() {
    const xs = [10, 20, 30, 40]
    print("#(xs[2..]) #(xs[..2]) #(xs[1..3])")
}
```

```text
[30, 40] [10, 20] [20, 30]
```

## Builders

A builder creates a collection from another one. Read `[x of xs if cond ~> expr]` as "for each `x` of `xs`, where `cond`, make `expr`".

```pelago
fn main() {
    const xs = [1, 2, 3, 4, 5, 6]
    const squares = [x of xs ~> x * x]
    const even_squares = [x of xs if x % 2 == 0 ~> x * x]
    const labelled = [i, x of [7, 8] ~> "#i: #x"]
    print("#squares")
    print("#even_squares")
    print("#labelled")
}
```

```text
[1, 4, 9, 16, 25, 36]
[4, 16, 36]
["0: 7", "1: 8"]
```

Lists also have `map`, `filter` and `each` with closures, and `sum()` on lists of numbers:

```pelago
fn main() {
    const total = [1, 2, 3].map(x ~> x * 10).sum()
    print("#total")
}
```

```text
60
```

## Maps

A map pairs keys with values: `map<K, V>`.

```pelago
fn main() {
    var ages: map<string, int> = map { "ada": 36 }
    ages.insert!("alan", 41)
    print("#(ages.len()) #(ages.get("alan") ?? 0) #(ages.containsKey("grace"))")
    print("#(ages["ada"])")
    for name of ages.keys() { print(name) }
    print("#ages")
}
```

```text
2 41 false
36
ada
alan
{"ada": 36, "alan": 41}
```

`get` returns an option. Indexing with `[]` is for keys you know are present.

## Sets

A set keeps unique values.

```pelago
fn main() {
    var seen: set<int> = set { 1, 2 }
    seen.insert!(2)
    seen.insert!(3)
    print("#(seen.len()) #(seen.contains(3))")
}
```

```text
3 true
```

## Strings

A `string` is text stored as UTF-8. `len()` counts bytes, and `chars()` walks characters. Joining pieces with `+` works for short text; for a long result, build a string in place with `pushStr!` and `pushChar!`.

```pelago
fn main() {
    const word = "Pelago"
    print("#(word.len()) #(word.toUpper()) #(word.toLower())")
    print("#(word.contains("lag")) #(word.startsWith("Pe")) #(word.endsWith("go"))")
    print(word.replace("lag", "LAG"))

    for part of "a,b,c".split(",") { print(part) }

    var out = ""
    for i of 0..3 { out.pushStr!("#i;") }
    print(out)

    const parts: [string] = ["x", "y", "z"]
    print(parts.join(", "))
    print("a" + "b")
}
```

```text
6 PELAGO pelago
true true true
PeLAGo
a
b
c
0;1;2;
x, y, z
ab
```

Text that is not stored by itself, such as the pieces returned by `split` or `trim`, has the type `str`, a view into another string. Most methods accept both.

Parse numbers from text with `parseInt()` and `parseFloat()`. They return a result, because the text may not be a number; see [Errors and options](./errors).
