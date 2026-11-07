---
title: Declarations
description: The forms of top-level and local declarations.
---

A module is a list of declarations. Their order does not matter. Each can be marked `pub` to be visible outside the module; the default is private.

## Constants and variables

```text
const name = value
const name: type = value
var name: type = value
```

## Functions

```text
fn name(parameters) -> result { body }
fn name(parameters) -> result = expression
```

Parameters are `name: type`, optionally preceded by `inout` or `sink`, optionally followed by `= default`. A final `...name: type` collects the remaining arguments. A result type may be a plain type, `T?`, `T ! E`, or absent. The body's last expression is its value. A function that must not return has the type `never`.

Attributes go before a declaration: `@inline fn square(x: int) -> int = x * x` asks for inlining.

## Structs, enums and interfaces

```text
struct name<T> { fields, methods, init, deinit }
enum name { case, case(field: type) }
interface name { fn method(self) -> type }
impl interface_name for type { methods }
```

Fields are `name: type` with an optional `= default`. A method's first parameter is `self`, `inout self` or `sink self`. `init` runs when a value is built by calling the type; `deinit` runs when the value goes out of scope.

## Objects

```text
open obj base { fields, open fn method(self) -> type }
obj derived : base { override fn method(self) -> type }
```

`open` allows extension or overriding. `:` names the base.

## Imports

```text
import path
import alias = path
import { name, name: alias, ... } = path
pub import { name } = path
```

See [Modules and imports](../guide/modules).
