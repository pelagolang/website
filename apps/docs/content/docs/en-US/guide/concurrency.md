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

## Stopping tasks

Stopping is cooperative: nothing interrupts a task and nothing unwinds. `t.cancel()` asks a task to stop, and the task sees `cancelled()` become true; `s.cancel()` does the same for every task of a scope, including ones started afterwards. A task that wants to stop early looks at `cancelled()` between steps. A cancelled task still has to be joined (or dropped) as usual. `yield_now()` lets other tasks run.

```pelago
fn main() {
    const t = spawn(() ~> {
        var n = 0
        while !cancelled() {
            n += 1
            yield_now()
        }
        n > 0
    })
    yield_now()
    t.cancel()
    print(t.join!!())
}
```

```text
true
```

A `select` can wait for a channel and for cancellation at once: the arm `case cancelled()` runs when the running task or its scope is cancelled.

```pelago
fn main() {
    const (tx, rx) = chan<int>()
    scope s {
        s.spawn([sink rx] () ~> {
            select {
                case v = rx.recv() { print("got") }
                case cancelled() { print("cancelled") }
            }
        })
        yield_now()
        yield_now()
        s.cancel()
    }
    print("end")
}
```

```text
cancelled
end
```

## Ending the program

Returning from `main` ends the program. A task that was started with a plain `spawn` and never joined is abandoned at that point: it does not keep running after `main`. Join what you need, or start it inside a `scope`, which always waits.

## Stacks

Every task, and every coroutine, runs on its own stack of 256 KiB, taken from a pool and reused. A page that cannot be accessed sits below each stack, so a task that recurses too deeply stops the program instead of overwriting other memory.

## Async functions

An `async fn` is a function that runs as a task. Calling it starts the body at once and gives a `future<T>`. `await` waits for the result, and `blockOn(future)` does the same from ordinary code such as `main`. There is no executor to choose and no second kind of function: a future is a task handle, and each concurrent call has a stack of its own.

```pelago
async fn double(x: int) -> int { x * 2 }

async fn both() -> int {
    const a = double(4)
    const b = double(5)
    await a + await b
}

fn main() {
    print(blockOn(both()))
}
```

```text
18
```

Two async calls can wait for each other, because each runs as its own task. Here the consumer is started first and waits for what the producer, started second, sends:

```pelago
async fn producer(sink tx: sender<int>) {
    for i of 0..3 { tx.send(i + 1) }
}

async fn consumer(sink rx: receiver<int>) -> int {
    var t = 0
    for v of rx.iter() { t += v }
    t
}

fn main() {
    const (tx, rx) = chan<int>()
    const c = consumer(sink rx)
    const p = producer(sink tx)
    blockOn(p)
    print(blockOn(c))
}
```

```text
6
```

Because the body runs on a stack of its own, what it uses must move in. A parameter that owns memory is copied into the task, a `sink` parameter is moved, and an `inout` parameter is an error: take the value with `sink` and return what changed.

Running tasks on real parallel threads is still being completed, so this page sticks to what works today.
