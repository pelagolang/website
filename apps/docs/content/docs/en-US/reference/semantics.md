---
title: Semantics
description: What programs mean: values, moves, evaluation, faults and cleanup.
---

## Values

Every value has exactly one owner. Assigning, passing with `sink` or returning a value moves it, and a moved name cannot be used again. `copy` makes an independent duplicate. Plain numbers, `bool` and `char` are copied implicitly because moving them would be indistinguishable.

Two names never refer to the same changeable value, so a change is visible only through the name it was made through.

## References are temporary

A parameter passed by `let` (the default) or `inout` is a temporary reference that lasts for the call. Such a reference cannot be stored, returned or captured past its use, which is why no lifetime annotations exist.

## Access modes

| Mode | Callee may | Caller afterwards |
| --- | --- | --- |
| `let` | Read. | Unchanged. |
| `inout` | Read and change. | Sees the changes. |
| `sink` | Keep or consume. | No longer has the value. |

At a call the marks `inout` and `sink` are written on the argument. A method that changes its receiver is called with `!` and one that consumes it with `!!`. Omitting a required mark is an error.

## Evaluation order

Operands and arguments are evaluated left to right. `&&`, `||`, `??` and `?:` evaluate their right side only when needed.

## Faults

The following stop the program: integer overflow, division or remainder by zero, an index or slice outside a list, a failed `assert`, and a call to `panic`. A stop writes `stopped: <reason>` to standard error and ends the process with status 1. Stops cannot be caught and do not unwind; `deinit` does not run for values still alive.

An error that a caller may reasonably handle is a `result`, not a stop.

## Cleanup

When a scope ends, the values it owns are released in reverse order of declaration, running each type's `deinit` first. A value moved out earlier is released by its new owner. A program that ends with allocations still live is reported by `--leak-check`.

## Exhaustiveness

A `switch` over an enum, an option or a result must cover every case or have a `default`. The compiler names a missing case.

## Tasks

A task owns what its closure takes with `sink`. Two tasks in one `scope` may not both capture a variable if either changes it. A channel's `recv` returns `none` once every sender has gone.
