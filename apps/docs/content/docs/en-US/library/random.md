---
title: std.random
description: Random numbers from the system, or from a generator you can replay.
---

```text
import std.random
```

There are two sources, and you choose between them on purpose.

- **The system's generator** gives numbers that never repeat and cannot be replayed. It can fail, so each function returns an `io_error` on failure: where the target has no such call yet (macOS) or when the system refuses.
- **A seeded `rng`** gives the same numbers for the same seed, on every machine and every target. It cannot fail, so its methods return plain values.

Neither is for secrets: an `rng` is a small, fast generator (splitmix64), not a cipher.

| Function | Result | Notes |
| --- | --- | --- |
| `random.between(lo, hi)` | `int ! io_error` | From `lo` to `hi`, both included, with no bias towards small numbers. Stops the program when `lo` is above `hi` or the range is 2^63 or more wide. |
| `random.fraction()` | `float ! io_error` | From 0 (included) up to 1 (not included). |
| `random.bytes(n)` | `[byte] ! io_error` | `n` random bytes. |
| `random.fresh()` | `rng ! io_error` | A generator seeded from the system, for many cheap draws. |
| `random.seeded(seed)` | `rng` | A generator you can replay. |

| Method | Result | Notes |
| --- | --- | --- |
| `r.next!()` | `int` | The next 64 random bits, of any sign. |
| `r.between!(lo, hi)` | `int` | Like `random.between`, from this generator. |
| `r.fraction!()` | `float` | Like `random.fraction`, from this generator. |

```pelago
import std.random

fn main() -> void ! io_error {
    var a = random.seeded(42)
    var b = random.seeded(42)
    print(a.between!(1, 6) == b.between!(1, 6), a.fraction!() == b.fraction!())
    const die = random.between(1, 6)?
    print(die >= 1 && die <= 6)
    const f = random.fraction()?
    print(f >= 0.0 && f < 1.0)
    const raw = random.bytes(5)?
    print(raw.len())
}
```

```text
true true
true
true
5
```

Use a seeded `rng` for tests, simulations and games that must replay, and write the seed down. Use the system's generator when you want a different result every run.
