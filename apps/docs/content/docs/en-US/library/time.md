---
title: std.time
description: Clocks, durations and sleeping.
---

```text
import std.time
```

A `duration` is a length of time that carries its unit, so there is no bare `int` that might mean seconds or milliseconds. It is whole nanoseconds in an `int` (about 292 years either way), and arithmetic on it stops the program on overflow like any other integer arithmetic.

| Function | Result | Notes |
| --- | --- | --- |
| `time.seconds(n)`, `time.millis(n)`, `time.micros(n)`, `time.nanos(n)` | `duration` | Make a duration. |
| `time.now()` | `instant ! io_error` | A point on the monotonic clock. Only the difference between two of them means anything. |
| `time.sinceEpoch()` | `duration ! io_error` | The wall clock: time since 1970-01-01 UTC. |
| `time.sleep(d)` | | Wait for `d`. Other tasks run meanwhile. |

| Method | Result | Notes |
| --- | --- | --- |
| `asNanos()`, `asMicros()`, `asMillis()`, `asSeconds()` | `int` | The length in that unit, rounded towards zero. |
| `asSecondsFloat()` | `float` | |
| `abs()` | `duration` | |
| `a + b`, `a - b`, `-a` | `duration` | Durations add and subtract. |
| `a == b`, `a != b`, `a < b`, `a <= b`, `a > b`, `a >= b` | `bool` | Durations compare. |
| `instant.elapsed()` | `duration ! io_error` | The time since this instant. |
| `instant.since(earlier)` | `duration` | The distance between two instants. |
| `instant.plus(d)` | `instant` | |

A duration prints with the largest unit that keeps the number readable: `1.5s`, `250ms`, `42us` or `7ns`. Milliseconds and microseconds are cut towards zero when printed (`1500ns` prints as `1us`), so use `asNanos()` when you need the exact number.

```pelago
import std.time

fn main() {
    const a = time.millis(5)
    const b = time.seconds(1)
    print(a <= b, a > b, a >= a, a != b)
    print(time.nanos(1500).asNanos(), time.nanos(1500))
}
```

```text
true false true true
1500 1us
```

```pelago
import std.time

fn main() {
    const d = time.seconds(90) + time.millis(500)
    print(d, d.asMillis(), d.asSeconds(), d.asSecondsFloat())
    print(time.millis(1500) - time.seconds(2), time.millis(5) < time.seconds(1))
    switch time.now() {
        case ok(start):
            time.sleep(time.millis(20))
            switch start.elapsed() {
                case ok(e): print(e.asMillis() >= 20)
                case err(_): print("no clock")
            }
        case err(_): print("no clock")
    }
}
```

```text
90.5s 90500 90 90.5
-500ms true
true
```

The clocks work on Linux (x86-64 and AArch64), Windows (x86-64 and ARM64) and macOS (AArch64).

`sleep` asks the kernel to pause when every task is waiting, so it costs no processor time on Linux and macOS. Windows has no sleep call yet: there `sleep` still waits correctly, but by checking the clock again and again, so it uses a processor while it waits.

`select` can use a duration as a time limit: see [Concurrency](../guide/concurrency.md).

## What is not there yet

The module is small on purpose. These are missing today, so write them yourself where you need them:

- **Dates and calendars.** `time.sinceEpoch()` gives seconds since 1970 as a `duration`, and nothing turns that into a year, month or day. There is no date type, no time zones, no formatting and no parsing.
- **Scaling a duration.** `d * 2` and `d / 2` are compile errors, because `duration` has no multiplication or division. Build the length from the number instead, for example `time.millis(n * 5)`.
- **Instants.** An `instant` has no `<`, `==` or `print`, and no `-`. Use `a.since(b)` and compare the resulting durations. A wall-clock reading is a `duration`, not an `instant`.
- **Timers and deadlines.** There is no timer or ticker type. For a time limit use `select` with `case timeout(d)` (see [Concurrency](../guide/concurrency.md)).
- **Targets.** There is no sleep call on Windows yet (sleeping there waits by checking the clock).
