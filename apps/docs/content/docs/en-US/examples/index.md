---
title: Examples
description: Short complete programs. Each one compiles and prints exactly what is shown.
---

Save a program as a `.pel` file and run it with `pelago run`. More programs live in the [examples repository](https://github.com/pelagolang/examples).

## FizzBuzz

```pelago
fn main() {
    for i in 1..=15 {
        if i % 15 == 0 {
            print("FizzBuzz")
        } else if i % 3 == 0 {
            print("Fizz")
        } else if i % 5 == 0 {
            print("Buzz")
        } else {
            print("#i")
        }
    }
}
```

```text
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
```

## Word counts

A map from words to counts, using `get` with a fallback and a sorted list of the keys.

```pelago
fn main() {
    const text = "the sea and the sky and the sand"
    var counts: map<string, int> = map {}
    for word of text.split(" ") {
        const key = "#word"
        const seen = counts.get(key) ?? 0
        counts.insert!(sink key, seen + 1)
    }

    var words: [string] = []
    for w of counts.keys() { words.push!(copy w) }
    words.sort!()
    for w of words {
        print("#w: #(counts[w])")
    }
}
```

```text
and: 2
sand: 1
sea: 1
sky: 1
the: 3
```

## Big factorials

`std.big` computes with integers of any size, so there is no overflow to worry about.

```pelago
import std.big
import { bigint } = std.big

fn factorial(n: int) -> bigint {
    var result = big.fromInt(1)
    for i in 2..=n {
        result = result * big.fromInt(i)
    }
    result
}

fn main() {
    print("#(factorial(25))")
    print("#(factorial(50))")
}
```

```text
15511210043330985984000000
30414093201713378043612608166064768844377641568960512000000000000
```

## A parser that cannot fail silently

Errors are values. This function reports exactly what went wrong, and `?` hands the problem up.

```pelago
enum problem {
    empty
    not_a_number(text: string)
    negative(value: int)
}

fn parse_age(text: string) -> int ! problem {
    if text.isEmpty() { return err(problem.empty) }
    switch text.parseInt() {
        case ok(n):
            if n < 0 { return err(problem.negative(n)) }
            ok(n)
        case err(_): err(problem.not_a_number(copy text))
    }
}

fn describe(text: string) -> string ! problem {
    const age = parse_age(text)?
    ok("age #age")
}

fn main() {
    for input of ["36", "", "abc", "-4"] {
        switch describe(input) {
            case ok(s): print(s)
            case err(.empty): print("nothing entered")
            case err(.not_a_number(t)): print("not a number: #t")
            case err(.negative(v)): print("negative age: #v")
        }
    }
}
```

```text
age 36
nothing entered
not a number: abc
negative age: -4
```

## A generic stack

```pelago
struct stack<T> {
    items: [T]

    fn push(inout self, sink item: T) { self.items.push!(item) }
    fn pop(inout self) -> T? = self.items.pop!()
    fn size(self) -> int = self.items.len()
}

fn main() {
    var s: stack<string> = stack { items: [] }
    s.push!("a")
    s.push!("b")
    print("#(s.size())")
    print("#(s.pop!() ?? "empty")")
    print("#(s.pop!() ?? "empty")")
    print("#(s.pop!() ?? "empty")")
}
```

```text
2
b
a
empty
```

## Sum in parallel

```pelago
fn sum(xs: [int]) -> int {
    var t = 0
    for x of xs { t += x }
    t
}

fn main() {
    const xs = [1, 2, 3, 4, 5, 6, 7, 8]
    var left = 0
    var right = 0
    const mid = xs.len() / 2
    scope s {
        s.spawn([inout left] ~> left = sum(xs[..mid]))
        s.spawn([inout right] ~> right = sum(xs[mid..]))
    }
    print("#left + #right = #(left + right)")
}
```

```text
10 + 26 = 36
```
