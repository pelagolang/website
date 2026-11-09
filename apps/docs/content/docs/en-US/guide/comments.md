---
title: Comments and style
description: Line, block and documentation comments, and how pelago fmt lays out code.
---

Pelago has its own comment syntax, chosen so that a comment is never confused with an operator and a documentation comment is never confused with a plain one.

| Form | Meaning |
| --- | --- |
| `/// text` | A line comment. |
| `///* ... *///` | A block comment. Blocks nest. |
| `//~ text` | A documentation comment for the item that follows. |
| `//~* ... *~//` | A documentation block. |

```pelago
/// A plain comment, ignored by tools.
///* A block comment
    ///* that nests *///
*///

//~ Adds two numbers.
//~
//~ Documentation comments belong to the function below.
fn add(a: int, b: int) -> int = a + b

fn main() {
    print("#(add(1, 2))")
}
```

```text
3
```

A plain `//` or `/* */` is a syntax error, and the message tells you which form to use.

## Formatting

`pelago fmt` rewrites files into the standard layout, so teams do not argue about it. `pelago fmt --check` only reports files that would change, which suits continuous integration. Options can be set in the `fmt` section of `pelago.yaml`.

## Naming

Type names are lowercase (`int`, `string`, `point`). The standard library names methods in lower camel case (`toUpper`, `isEmpty`, `checkedAdd`). A method that changes its receiver keeps its plain name and is called with `!`, so no suffix such as `_mut` is needed.
