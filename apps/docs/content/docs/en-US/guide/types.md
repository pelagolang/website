---
title: Types
description: struct, enum, obj, interface, generics and type aliases.
---

Type names are lowercase. Pelago has four ways to define your own types: `struct` and `enum` for plain data, `obj` for types with inheritance, and `interface` for shared behaviour.

## Structs

A `struct` is a group of named fields. Fields can have defaults, and methods are declared inside.

```pelago
struct user {
    name: string
    age: int = 18

    fn greeting(self) -> string = "Hi, #(self.name)"
}

fn main() {
    const u = user { name: "Ada" }
    print("#(u.name) is #(u.age). #(u.greeting())")
}
```

```text
Ada is 18. Hi, Ada
```

A method that changes the value is declared `inout self` and called with `!`, as in `p.shift!(1, 1)`. A method that consumes the value is declared `sink self` and called with `!!`.

### Assignment copies the meaning, not the memory

A struct is a value. `copy` makes an independent second value, and changing one does not affect the other.

```pelago
struct user {
    name: string
    age: int = 18
}

fn main() {
    const a = user { name: "Ada" }
    var b = copy a
    b.age = 30
    print("#(a.age) #(b.age)")
}
```

```text
18 30
```

### Custom construction

An `init` can check its arguments. Its result type says it may fail, and calling the type like a function runs it.

```pelago
struct range {
    lo: int
    hi: int

    init(lo: int, hi: int) -> Self ! string {
        if lo > hi { return err("bad range") }
        self.lo = lo
        self.hi = hi
    }

    fn width(self) -> int = self.hi - self.lo
}

fn main() {
    switch range(1, 5) {
        case ok(r): print("width #(r.width())")
        case err(e): print(e)
    }
    switch range(5, 1) {
        case ok(r): print("width #(r.width())")
        case err(e): print(e)
    }
}
```

```text
width 4
bad range
```

## Enums

An `enum` is a choice between named cases, and each case can carry fields. Use `switch` to take one apart; see [Pattern matching](./switch.md).

```pelago
enum shape {
    circle(radius: float)
    rect(w: float, h: float)
    empty
}

fn main() {
    const s = shape.circle(2.0)
    if s is .circle(r) { print("radius #r") }
}
```

```text
radius 2
```

A leading dot (`.circle`) asks the compiler to find the case in the expected enum, so you can leave out the type name when it is clear.

## Interfaces

An `interface` lists methods. A type satisfies it with `impl`. A value of type `any interface_name` can hold any type that implements it, so you can keep different types in one list.

```pelago
interface area_of {
    fn area(self) -> float
}

struct square { side: float }
struct circle { r: float }

impl area_of for square {
    fn area(self) -> float = self.side * self.side
}

impl area_of for circle {
    fn area(self) -> float = 3.0 * self.r * self.r
}

fn total(shapes: [any area_of]) -> float {
    var t = 0.0
    for s of shapes { t += s.area() }
    t
}

fn main() {
    const shapes: [any area_of] = [square { side: 2.0 }, circle { r: 1.0 }]
    print("#(total(shapes))")
}
```

```text
7
```

## Objects and inheritance

Use `obj` when types form a family. A base marked `open` can be extended with `:`, and a method marked `open fn` can be replaced with `override fn`.

```pelago
open obj animal {
    name: string

    open fn speak(self) -> string = "..."
    fn intro(self) -> string = "#(self.name): #(self.speak())"
}

obj dog : animal {
    override fn speak(self) -> string = "Woof"
}

obj fish : animal { }

fn main() {
    const a = dog { name: "Rex" }
    const b = fish { name: "Nemo" }
    print(a.intro())
    print(b.intro())
}
```

```text
Rex: Woof
Nemo: ...
```

Reach for `struct` and `interface` first; they are simpler and cover most designs. `obj` is for cases where sharing fields and default behaviour through a base type is the clearest model.

## Generics

Type parameters go in angle brackets, and a bound says what the type has to support. Generic types work the same way.

```pelago
struct stack<T> {
    items: [T]

    fn push(inout self, sink item: T) { self.items.push!(item) }
    fn size(self) -> int = self.items.len()
}

fn largest<T: order>(a: T, b: T) -> T {
    a > b ? a : b
}

fn main() {
    var s: stack<int> = stack { items: [] }
    s.push!(1)
    s.push!(2)
    print("#(s.size()) #(largest(3, 9)) #(largest(2.5, 1.5))")
}
```

```text
2 9 2.5
```

## Type aliases

`type` gives an existing type another name.

```pelago
type meters = float

fn main() {
    const m: meters = 2.5
    print("#m")
}
```

```text
2.5
```
