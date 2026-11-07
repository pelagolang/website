---
title: Concurrency
description: Tasks, channels and scopes.
---

Concurrent code in Pelago builds on the ownership rules: a task owns what it is given, so tasks cannot share a changing value by accident.

## Tasks

`spawn` starts a task running a closure and returns a handle. `join` waits for the task and gives back its result. `join` uses the handle up, so the call is marked `!!`.

```pelago
fn main() {
    const task = spawn(~> 6 * 7)
    print("answer: #(task.join!!())")
}
```

```text
answer: 42
```

A task's closure lists what it takes from its surroundings. `[sink data]` moves `data` into the task, and the creating code can no longer touch it:

```pelago
fn crunch(data: [int]) -> int {
    var t = 0
    for x of data { t += x * x }
    t
}

fn main() {
    const data = [1, 2, 3]
    const task = spawn([sink data] ~> crunch(data))
    print("#(task.join!!())")
}
```

```text
14
```

## Channels

A channel carries values between tasks. `chan<T>()` creates a sender and a receiver. `send` puts a value in, and `recv` takes one out, giving an option: `none` means the channel is closed and empty, which happens when every sender is gone.

```pelago
fn main() {
    const (tx, rx) = chan<int>()
    spawn([sink tx] ~> {
        for i of 0..3 { tx.send(i) }
    })

    var total = 0
    var running = true
    while running {
        switch rx.recv() {
            case some(v): total += v
            case none: running = false
        }
    }
    print("#total")
}
```

```text
3
```

The sender is moved into the task. When the task ends it is dropped, the channel closes and the loop above finishes.

## Scopes

A `scope` runs tasks that may borrow from the surrounding code, and it waits for all of them before it ends. Each task states which variables it changes.

```pelago
fn sum(xs: [int]) -> int {
    var t = 0
    for x of xs { t += x }
    t
}

fn main() {
    const xs = [1, 2, 3, 4, 5, 6]
    var left = 0
    var right = 0
    const mid = xs.len() / 2
    scope s {
        s.spawn([inout left] ~> left = sum(xs[..mid]))
        s.spawn([inout right] ~> right = sum(xs[mid..]))
    }
    print("#(left + right)")
}
```

```text
21
```

Each task changes a different variable, and the compiler rejects a scope in which two tasks would change the same one.

Running tasks on real parallel threads and suspending `async` functions are still being completed, so this page sticks to what works today.
