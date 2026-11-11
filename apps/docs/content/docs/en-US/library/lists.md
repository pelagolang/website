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

`xs.iter()` gives an `iter<T>`, and `map` and `filter` return one too. An iterator can be walked with `for`, collected with `toList()` or `toSet()`, counted with `count()`, and asked for its `first()`. Iterators of numbers have `sum()`.

| Method | Result | Notes |
| --- | --- | --- |
| `map(f)`, `filter(f)` | `iter<U>`, `iter<T>` | Transform or keep elements. |
| `filterMap(f)`, `flatMap(f)` | `iter<U>` | `f` returns an option or an iterator; `none` drops the element. |
| `take(n)`, `skip(n)` | `iter<T>` | The first `n` elements, or all but the first `n`. |
| `takeWhile(f)`, `skipWhile(f)` | `iter<T>` | While `f` holds. |
| `chain(other)` | `iter<T>` | This iterator, then `other`. |
| `zip(other)` | `iter<(T, U)>` | Pairs, ending with the shorter one. |
| `enumerate()` | `iter<(int, T)>` | Each element with its position. |
| `reversed()` | `iter<T>` | Back to front. |
| `fold(init, f)` | `U` | Combine all elements, starting from `init`. |
| `any(f)`, `all(f)` | `bool` | Does `f` hold for some, or for every, element? |
| `find(f)` | `T?` | The first element for which `f` holds. |
| `position(f)` | `int?` | The index of that element. |
| `nth(n)`, `last()` | `T?` | The element at `n` (from 0), or the final one. |
| `min()`, `max()` | `T?` | The smallest or largest; `none` when empty. |
| `each(f)` | | Call `f` for each element. |

```pelago
fn main() {
    const xs = [3, 1, 4, 1, 5, 9, 2, 6]
    print(xs.iter().fold(0, (a, x) ~> a + x))
    print(xs.iter().any(x ~> x > 8), xs.iter().all(x ~> x > 1))
    print(xs.iter().find(x ~> x > 4), xs.iter().position(x ~> x == 4))
    print(xs.iter().take(3).toList(), xs.iter().skip(5).toList())
    print(xs.iter().take(2).enumerate().toList())
    print(xs.iter().take(3).zip(["a", "b"].iter()).toList())
    print(xs.iter().min(), xs.iter().max())
}
```

```text
31
true false
some(5) some(2)
[3, 1, 4] [9, 2, 6]
[(0, 3), (1, 1)]
[(3, "a"), (1, "b")]
some(1) some(9)
```

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
