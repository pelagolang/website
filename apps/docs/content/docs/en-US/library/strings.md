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
| `trimStart()`, `trimEnd()` | `str` | Trim one side only. |
| `find(part)`, `findLast(part)` | `int?` | The byte position of the first or last match. |
| `charCount()` | `int` | The number of characters (`len()` counts bytes). |
| `stripPrefix(p)`, `stripSuffix(p)` | `str?` | The rest when the text starts or ends with `p`; `none` otherwise. |
| `splitOnce(sep)` | `(str, str)?` | Split at the first `sep`. |
| `lines()` | `iter<str>` | Lines, without `\n` or `\r\n`. |
| `repeat(n)` | `string` | The text `n` times. |
| `padLeft(width, c)`, `padRight(width, c)` | `string` | Fill with `c` up to `width` characters; longer text is unchanged. |
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

`join(separator)` works on a list of strings and on an iterator of strings.

```pelago
fn main() {
    const s = "hello, wörld, hello"
    print(s.find("hello"), s.find("xyz"), s.findLast("hello"))
    print(s.len(), s.charCount())
    print("key=value=x".stripPrefix("key="), "file.pel".stripSuffix(".rs"))
    print("a=b=c".splitOnce("="))
    print("a\nb\r\nc\n".lines().toList())
    print("7".padLeft(3, '0'), "7".padRight(3, '-'), "ab".repeat(3))
    print(["a", "b", "c"].join(", "), "x y z".split(" ").join("+"))
}
```

```text
some(0) none some(15)
20 19
some("value=x") none
some(("a", "b=c"))
["a", "b", "c"]
007 7-- ababab
a, b, c x+y+z
```
