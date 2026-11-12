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
| `a < b`, `a == b` | `bool` | Durations compare. |
| `instant.elapsed()` | `duration ! io_error` | The time since this instant. |
| `instant.since(earlier)` | `duration` | The distance between two instants. |
| `instant.plus(d)` | `instant` | |

A duration prints with its unit.

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

Clocks and `sleep` work on Linux (x86-64 and AArch64). On Windows and macOS there is no clock call yet, so the clock functions return an `io_error` and `sleep` stops the program with "no clock on this target yet". With nothing else to run, `sleep` waits by watching the clock instead of asking the system to pause, so it uses a processor while it waits.

`select` can use a duration as a time limit: see [Concurrency](../guide/concurrency.md).
