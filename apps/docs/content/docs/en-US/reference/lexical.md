---
title: Lexical structure
description: Source files, comments, names, literals and escapes.
---

This page describes how Pelago source text is split into tokens.

## Source files

Source files are UTF-8 and end in `.pel`. A newline ends a statement; there are no semicolons. A statement can continue on the next line when the line ends in an operator, or when the next line starts with `.`, `|>`, `?` or `:` (as in method chains and conditionals). A `;` may separate two statements on one line.

## Comments

| Form | Meaning |
| --- | --- |
| `/// text` | Line comment. |
| `///* ... *///` | Block comment. Blocks nest. |
| `//~ text` | Documentation comment for the next item. |
| `//~* ... *~//` | Documentation block. |

`//` and `/* */` are not comments; the lexer reports an error that names the right form.

## Names

A name starts with a letter or underscore and continues with letters, digits and underscores. Names are case-sensitive. Type names are lowercase by convention.

Keywords are listed in [Keywords](./keywords). A hard keyword can never be used as a name; a soft keyword is special only where the grammar expects it, so `from`, `to`, `step`, `it` and similar words remain usable as ordinary names elsewhere.

## Integer literals

```pelago
fn main() {
    print("#(1_000) #(0x1F) #(0b11) #(0o17)")
}
```

```text
1000 31 3 15
```

Decimal, hexadecimal (`0x`), binary (`0b`) and octal (`0o`) forms are accepted, with `_` as a digit separator. An integer literal takes the type the context asks for (`int` by default) and must fit it.

## Floating-point literals

`3.14`, `2.5e-1` and `1e3` are `float` literals. After a `.`, digits are read as a tuple position, so `t.0.1` means the second element of the first element of `t`.

## Characters and strings

A character literal is written in single quotes: `'a'`, `'\n'`, `'é'`. A string literal is written in double quotes and may span lines. Both support these escapes:

| Escape | Meaning |
| --- | --- |
| `\n` `\t` `\r` `\0` | Newline, tab, carriage return, NUL. |
| `\\` `\'` `\"` | Backslash and quotes. |
| `\#` | A literal `#` (in strings). |
| `\u{...}` | A Unicode code point, in hexadecimal. |

```pelago
fn main() {
    print("tab:\there, quote:\" hash:\# unicode:\u{e9}")
}
```

```text
tab:	here, quote:" hash:# unicode:é
```

### Interpolation

Inside a string, `#name` inserts a variable and `#(expression)` inserts the value of an expression, converted to text. An expression may itself contain strings.

```pelago
fn main() {
    const name = "Ada"
    print("#name has #(name.len()) letters, #("nested: #name")")
}
```

```text
Ada has 3 letters, nested: Ada
```

## Punctuation

Operators use the longest match, so `>>=` is one token. They are described in [Operators](./operators).
