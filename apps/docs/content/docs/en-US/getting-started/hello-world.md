---
title: Hello, world
description: Write, check, run and build your first Pelago program.
---

Pelago source files end in `.pel`. Create a file called `hello.pel`:

```
fn main() {
    print("Hello, world")
}
```

Every program starts at a function called `main`. `print` writes its argument and a newline to standard output.

Run it:

```
pelago run hello.pel
```

```
Hello, world
```

## A slightly bigger program

Strings can embed values: `#name` inserts a variable, and `#(expression)` inserts the result of any expression. Create `greet.pel`:

```
fn greet(name: string) -> string {
    return "Hello, #name!"
}

fn main() {
    print(greet("Pelago"))
    var total = 0
    for i in 1..=3 {
        total += i
    }
    print("sum: #total")
}
```

```
pelago run greet.pel
```

```
Hello, Pelago!
sum: 6
```

A few things to notice:

- `fn` declares a function. Parameter types are written after the name, and the result type follows `->`.
- `var` declares a variable you can change. `const` declares one you cannot.
- `1..=3` is a range that includes both ends; `1..3` stops before 3.
- There are no semicolons; a newline ends a statement.

## What the compiler tells you

The checker reports problems with the file, line and column. This program mixes up a type:

```
fn main() {
    const n: int = "five"
    print(n)
}
```

```
bad:2:20: error: this has type `string`, but `int` is expected
```

`pelago check` runs the same checks without executing anything, which is useful in scripts and editors.

## Build an executable

```
pelago build -o hello hello.pel
./hello
```

`build` writes a native executable. Use `hello.exe` and `.\hello` in PowerShell on Windows. The next page covers the commands and their options.
