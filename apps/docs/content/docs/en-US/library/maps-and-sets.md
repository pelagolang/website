---
title: Maps and sets
description: Methods of map and set.
---

## `map<K, V>`

A map is created with a literal, `map { key: value, ... }`, and typed `map<K, V>`. Keys must support equality and hashing.

| Method | Result | Notes |
| --- | --- | --- |
| `len()`, `isEmpty()` | | |
| `get(k)` | `V?` | `none` when the key is missing. |
| `m[k]` | `V` | Stops the program when the key is missing. |
| `containsKey(k)` | `bool` | |
| `insert!(k, v)` | `V?` | Adds or replaces; returns the previous value. |
| `remove!(k)` | `V?` | Removes the key; returns its value. |
| `clear!()` | | |
| `keys()` | `iter<K>` | |
| `values()` | `iter<V>` | |

```pelago
fn main() {
    var stock: map<string, int> = map { "apples": 3 }
    stock.insert!("pears", 5)
    const old = stock.insert!("apples", 4)
    print("#(old ?? 0) #(stock.get("apples") ?? 0)")
    print("#(stock.remove!("pears") ?? 0) #(stock.len())")
    for name of stock.keys() { print(name) }
}
```

```text
3 4
5 1
apples
```

## `set<T>`

| Method | Result | Notes |
| --- | --- | --- |
| `len()`, `isEmpty()` | | |
| `contains(x)` | `bool` | |
| `insert!(x)` | `bool` | `true` when `x` was not already present. |
| `remove!(x)` | `bool` | `true` when `x` was present. |
| `clear!()` | | |
| `iter()` | `iter<T>` | |

```pelago
fn main() {
    var seen: set<int> = set { 1, 2 }
    print("#(seen.insert!(2)) #(seen.insert!(3))")
    print("#(seen.remove!(1)) #(seen.len())")
}
```

```text
false true
true 2
```
