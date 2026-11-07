---
title: Functions
description: Parameters, defaults, access modes, closures and calls.
---

## Declaring functions

```pelago
fn add(a: int, b: int) -> int {
    a + b
}

fn double(x: int) -> int = x * 2

fn main() {
    print("#(add(1, 2)) #(double(21))")
}
```

```text
3 42
```

The result type follows `->`. A function without one returns nothing. The last expression of a body is its result; use `return` to leave early. A single-expression function can be written with `=`.

## Defaults, names and variable arguments

A parameter with a default can be left out, and any argument can be passed by name. A final `...` parameter collects any number of values.

```pelago
fn greet(name: string, greeting: string = "Hello") {
    print("#greeting, #name")
}

fn total(...nums: int) -> int {
    var t = 0
    for n of nums { t += n }
    t
}

fn main() {
    greet("Ada")
    greet("Ada", greeting: "Hi")
    print("#(total(1, 2, 3))")
}
```

```text
Hello, Ada
Hi, Ada
6
```

## How arguments are passed

Every parameter has an access mode, and the call site shows it when it matters:

| Mode | In the declaration | At the call | Meaning |
| --- | --- | --- | --- |
| `let` (the default) | `x: [int]` | `f(x)` | The function reads the value. It cannot change it. |
| `inout` | `inout x: [int]` | `f(inout x)` | The function changes your variable in place. |
| `sink` | `sink x: [int]` | `f(sink x)` | The function takes the value; you cannot use it afterwards. |

```pelago
fn bump(inout n: int) { n += 1 }

fn count(sink xs: [int]) -> int = xs.len()

fn main() {
    var n = 1
    bump(inout n)
    print("#n")

    const xs = [1, 2, 3]
    print("#(count(sink xs))")
}
```

```text
2
3
```

Because the call repeats `inout` and `sink`, you can read what a line of code can change without opening the function. Leaving it out is an error:

```pelago error
fn add(inout xs: [int]) { xs.push!(1) }

fn main() {
    var xs = [1]
    add(xs)
}
```

```text
main:5:9: error: the argument `xs` is changed in place; write `inout ...` at the call
```

Methods follow the same idea with a mark on the method name: `list.push!(x)` changes the receiver and `task.join!!()` uses it up. See [Ownership](./ownership).

## Closures

A closure is written `parameters ~> body`. When it has a single parameter you may use the name `it`. A closure that changes a variable of the surrounding function lists it in square brackets with the mode.

```pelago
fn twice(f: fn(int) -> int, x: int) -> int = f(f(x))

fn main() {
    print("#(twice(x ~> x * 3, 2))")

    const tripled = [1, 2, 3].map(~> it * 3).toList()
    print("#tripled")

    var count = 0
    [1, 2, 3].each([inout count] x ~> count += x)
    print("#count")
}
```

```text
18
[3, 6, 9]
6
```

A function cannot return a closure that borrows from it, because the captured values would not outlive the call. Return a `box` of the function when you need to hand one back.

## Pipes

`|>` feeds the value on its left to the function on its right, which reads as a sequence of steps.

```pelago
fn shout(s: string) -> string = s.toUpper()

fn main() {
    const out = "hi" |> shout
    print(out)
}
```

```text
HI
```

## Tail calls

A function that ends by calling itself can say `become` instead of `return`. The compiler turns the call into a jump, so deep recursion uses no extra stack.

```pelago
fn sum_to(n: int, acc: int = 0) -> int {
    if n == 0 { return acc }
    become sum_to(n - 1, acc + n)
}

fn main() {
    print("#(sum_to(100000))")
}
```

```text
5000050000
```
