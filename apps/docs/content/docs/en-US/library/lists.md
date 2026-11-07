---
title: Lists
description: Methods of [T], the growable list.
---

A list is written `[T]` (or `list<T>`) with a literal such as `[1, 2, 3]`. See [Collections and strings](../guide/collections) for an introduction.

| Method | Result | Notes |
| --- | --- | --- |
| `len()` | `int` | Number of elements. |
| `isEmpty()` | `bool` | |
| `get(i)` | `T?` | The element, or `none` when `i` is out of range. |
| `first()`, `last()` | `T?` | |
| `contains(x)` | `bool` | Needs elements that can be compared for equality. |
| `push!(x)` | | Add at the end. |
| `pop!()` | `T?` | Remove and return the last element. |
| `insert!(i, x)` | | Insert before position `i`. |
| `remove!(i)` | `T` | Remove and return the element at `i`. |
| `clear!()` | | Remove everything. |
| `extend!(other)` | | Append another list. |
| `reserve!(n)` | | Make room for `n` more elements. |
| `sort!()` | | Sort in place (elements must be orderable). |
| `sorted()` | `[T]` | A sorted copy. |
| `reverse!()` | | Reverse in place. |
| `reversed()` | `[T]` | A reversed copy. |
| `swap!(a, b)` | | Exchange two elements. |
| `toList()` | `[T]` | A copy. |
| `map(f)`, `filter(f)` | `iter<T>` | Lazy; follow with `toList()` or `sum()`. |
| `each(f)` | | Call `f` for each element. |

```pelago
fn main() {
    var xs = [5, 3, 8, 1]
    xs.sort!()
    xs.extend!([10, 12])
    xs.swap!(0, 1)
    print("#xs")
    print("#(xs.get(2) ?? -1) #(xs.get(99) ?? -1)")
    print("#(xs.sorted().reversed())")
    print("#(xs.filter(x ~> x > 5).toList())")
    print("#(xs.map(x ~> x * 2).sum())")
}
```

```text
[3, 1, 5, 8, 10, 12]
5 -1
[12, 10, 8, 5, 3, 1]
[8, 10, 12]
78
```

## Iterators

`map` and `filter` return an `iter<T>`. An iterator can be walked with `for`, collected with `toList()` or `toSet()`, counted with `count()`, and asked for its `first()`. Iterators of numbers have `sum()`.

Lists of strings have `join(separator)`, which returns one string.

```pelago
fn main() {
    const words: [string] = ["pelago", "is", "open"]
    print(words.join(" "))
    print("#(words.map(w ~> w.len()).count())")
}
```

```text
pelago is open
3
```
