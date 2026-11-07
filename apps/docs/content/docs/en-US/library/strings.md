---
title: Strings
description: Methods of string, str and char.
---

`string` owns its text; `str` is a view of text owned elsewhere. Methods marked below for `str` work on both.

## Reading

| Method | Result | Notes |
| --- | --- | --- |
| `len()` | `int` | Length in bytes. |
| `isEmpty()` | `bool` | |
| `chars()` | `iter<char>` | Characters. |
| `bytes()` | `iter<byte>` | Bytes. |
| `byteAt(i)` | `byte` | Stops when out of range. |
| `s[a..b]` | `str` | A slice by byte positions. |
| `contains(part)` | `bool` | |
| `startsWith(p)`, `endsWith(p)` | `bool` | |
| `split(sep)` | `iter<str>` | |
| `trim()` | `str` | Without surrounding white space. |
| `toUpper()`, `toLower()` | `string` | |
| `replace(from, to)` | `string` | Every occurrence. |
| `parseInt()` | `int ! parse_error` | |
| `parseFloat()` | `float ! parse_error` | |

## Building

| Method | Notes |
| --- | --- |
| `pushStr!(text)` | Append text. |
| `pushChar!(c)` | Append a character. |
| `pushByte!(b)` | Append a byte. |
| `clear!()` | Empty the string. |
| `a + b` | A new string. |

A list of strings has `join(separator)`. A list of bytes has `toText()`.

```pelago
fn main() {
    const line = "  name=Ada ; age=36  "
    const clean = line.trim()
    print("[#clean]")
    for field of clean.split(";") { print("<#(field.trim())>") }

    var out = ""
    out.pushStr!("n=")
    out.pushChar!('7')
    print(out)
    print("#("42".parseInt().or(0) + 1)")
    for b of "AB".bytes() { print("#b") }
}
```

```text
[name=Ada ; age=36]
<name=Ada>
<age=36>
n=7
43
65
66
```

## Characters

`char` has `isDigit()`, `isAlpha()`, `isUpper()`, `isLower()`, `isSpace()`, `toUpper()` and `toLower()`. These test and convert ASCII letters and digits.

```pelago
fn main() {
    var digits = 0
    for c of "a1b22".chars() {
        if c.isDigit() { digits++ }
    }
    print("#digits #('q'.toUpper())")
}
```

```text
3 Q
```
