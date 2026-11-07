---
title: A tour of Pelago
description: A guided walk through the language in ten short steps, with a program for each.
---

This tour introduces Pelago by example. Each step is a complete program: save it as a `.pel` file and run it with `pelago run`. The [language guide](../guide/values) covers every topic in depth.

## 1. Values and variables

`const` binds a value that never changes. `var` binds one that can. Types are inferred, and you can write them after a colon. Inside a string, `#name` inserts a variable and `#(expression)` inserts any expression.

```pelago
fn main() {
    const language = "Pelago"
    var visits: int = 0
    visits += 1
    print("#language has had #visits visit, next is #(visits + 1)")
}
```

```text
Pelago has had 1 visit, next is 2
```

## 2. Functions

A function names its parameter types and its result type. The last expression is the result, so `return` is only needed for an early exit. Parameters can have defaults and be passed by name.

```pelago
fn area(w: int, h: int) -> int {
    w * h
}

fn greet(name: string, greeting: string = "Hello") {
    print("#greeting, #name")
}

fn main() {
    print("#(area(3, 4))")
    greet("Ada")
    greet("Ada", greeting: "Welcome")
}
```

```text
12
Hello, Ada
Welcome, Ada
```

## 3. Structs and methods

A `struct` groups fields. Methods live inside it. A method that changes the value says `inout self`, and the call says so too, with a `!` after the method name.

```pelago
struct point {
    x: int
    y: int

    fn sum(self) -> int = self.x + self.y

    fn shift(inout self, dx: int, dy: int) {
        self.x += dx
        self.y += dy
    }
}

fn main() {
    var p = point { x: 1, y: 2 }
    p.shift!(10, 10)
    print("#(p.x), #(p.y), sum #(p.sum())")
}
```

```text
11, 12, sum 23
```

## 4. Enums and `switch`

An `enum` lists the shapes a value can take, and each case can carry data. `switch` takes a value apart by shape, and the compiler checks that every case is handled.

```pelago
enum shape {
    circle(radius: float)
    rect(w: float, h: float)
    empty
}

fn area(s: shape) -> float {
    switch s {
        case .circle(r): 3.14159 * r * r
        case .rect(w, h): w * h
        case .empty: 0.0
    }
}

fn main() {
    print("#(area(.rect(2.0, 3.0)))")
    print("#(area(.circle(1.0)))")
}
```

```text
6
3.14159
```

## 5. Lists, maps and sets

Collections are values with literal syntax. A list builder `[x of xs if cond ~> expr]` filters and transforms in one expression, and `~>` introduces a closure.

```pelago
fn main() {
    var scores = [3, 1, 2]
    scores.push!(5)
    scores.sort!()
    print("#scores")

    const evens = [x of scores if x % 2 == 0 ~> x * 10]
    print("#evens")

    var ages: map<string, int> = map { "ada": 36 }
    ages.insert!("alan", 41)
    print("#(ages.get("alan") ?? 0)")
}
```

```text
[1, 2, 3, 5]
[20]
41
```

## 6. Results and options

There are no exceptions and no null. A function that can fail returns `T ! E`, a value that may be absent has type `T?`, and `?` passes a failure up to the caller.

```pelago
fn half(n: int) -> int ! string {
    if n % 2 != 0 { return err("odd number: #n") }
    ok(n / 2)
}

fn quarter(n: int) -> int ! string {
    const h = half(n)?
    half(h)
}

fn main() {
    switch quarter(8) {
        case ok(v): print("quarter: #v")
        case err(e): print("failed: #e")
    }
    switch quarter(6) {
        case ok(v): print("quarter: #v")
        case err(e): print("failed: #e")
    }
}
```

```text
quarter: 2
failed: odd number: 3
```

## 7. Values, moves and copies

Pelago has no garbage collector and no borrow checker. Values are independent: assigning a value moves it, and `copy` makes a second one. The compiler tells you when you use something after it moved.

```pelago error
fn take(sink xs: [int]) -> int = xs.len()

fn main() {
    const xs = [1, 2, 3]
    print("#(take(sink xs))")
    print("#(xs.len())")
}
```

```text
main:6:14: error: `xs` was moved on line 5 and cannot be used again; write `copy xs` there to keep it
```

## 8. Interfaces

An `interface` describes behaviour. A type opts in with `impl`.

```pelago
interface speaker {
    fn speak(self) -> string
}

struct dog { name: string }

impl speaker for dog {
    fn speak(self) -> string = "#(self.name) says woof"
}

fn main() {
    const d = dog { name: "Rex" }
    print(d.speak())
}
```

```text
Rex says woof
```

## 9. Generics

Type parameters go in angle brackets. A bound such as `order` says what the type must support.

```pelago
fn largest<T: order>(a: T, b: T) -> T {
    a > b ? a : b
}

fn main() {
    print("#(largest(3, 9)) #(largest(2.5, 1.5))")
}
```

```text
9 2.5
```

## 10. Tasks

`spawn` starts a task and `join` waits for its result. Calls that use up a value, like `join`, are marked with `!!`.

```pelago
fn main() {
    const task = spawn(~> 6 * 7)
    print("answer: #(task.join!!())")
}
```

```text
answer: 42
```

## Where next

The [language guide](../guide/values) goes through each of these topics in turn, and [Run and build](../getting-started/run-and-build) lists everything the `pelago` tool can do.
