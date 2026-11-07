---
title: Ownership and memory
description: Value semantics, moves, copies, cleanup and boxes, with no garbage collector.
---

Pelago has no garbage collector and no borrow checker. Every value has one owner, values are independent of each other, and memory is released at a point you can read in the source.

## Values are independent

Assigning a value gives the new name its own value. For plain data such as numbers the old name stays usable. For data that owns memory, such as a list or a struct with a list in it, assignment **moves** it, and the compiler stops you using the old name. Write `copy` when you want two.

```pelago
fn main() {
    var a = [1, 2, 3]
    const b = copy a
    a.push!(4)
    print("#a #b")
}
```

```text
[1, 2, 3, 4] [1, 2, 3]
```

Using a moved value is a compile error that names the line and the fix:

```pelago error
fn main() {
    const a = [1, 2, 3]
    const b = a
    print("#(a.len())")
}
```

```text
main:4:14: error: `a` was moved on line 3 and cannot be used again; write `copy a` there to keep it
```

Because two names never share one mutable value, there are no hidden changes through aliases and no data races between tasks.

## Reading, changing and giving away

Functions say how they use an argument, and so do the calls ([Functions](./functions) has the table). `sink` hands ownership over. After the call the caller no longer has the value:

```pelago
fn count(sink xs: [int]) -> int = xs.len()

fn main() {
    const xs = [1, 2, 3]
    print("#(count(sink xs))")
}
```

```text
3
```

A reader never needs a reference that outlives a call, because references are temporary: they exist for the duration of a call or a statement. That is why Pelago can avoid lifetime annotations altogether.

## Cleanup

A value is released when its owner goes out of scope. If a type declares `deinit`, it runs at that point, in the reverse order of creation. A value that was moved away is cleaned up by its new owner.

```pelago
struct handle {
    name: string

    deinit { print("closing #(self.name)") }
}

fn use_it(sink h: handle) {
    print("using #(h.name)")
}

fn main() {
    const a = handle { name: "a" }
    {
        const b = handle { name: "b" }
        print("inner")
    }
    const c = handle { name: "c" }
    use_it(sink c)
    print("end")
}
```

```text
inner
closing b
using c
closing c
end
closing a
```

This is the pattern for files, sockets and locks: the resource is closed when its owner goes away, without a `finally` block.

To check that a program releases everything it allocates, run or build it with `--leak-check`. If memory is still allocated when the program ends, it reports `leaked N allocation(s)` and exits with status 3.

## Boxes

Values live where they are declared, so a type cannot contain itself directly. A `box<T>` stores its value on the heap, and it is what lets a type refer to itself, as a tree does.

```pelago
enum tree {
    leaf
    node(box<tree>, int, box<tree>)
}

fn sum(t: tree) -> int {
    switch t {
        case .leaf: 0
        case .node(l, v, r): sum(l.get()) + v + sum(r.get())
    }
}

fn main() {
    const t = tree.node(box(tree.leaf), 5, box(tree.leaf))
    print("#(sum(t))")
}
```

```text
5
```

A box has `get()` to read, `set!(value)` to replace the content, and `take!!()` to move the content out and consume the box.
