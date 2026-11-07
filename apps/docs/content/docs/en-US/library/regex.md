---
title: std.regex
description: Regular expressions that run in time proportional to the text.
---

```text
import std.regex
```

`regex.compile(pattern)` returns a `regex ! parse_error`. Matching is done by a Pike VM, so the time grows with the length of the text times the length of the pattern, and never exponentially.

## Syntax

Literals, `.`, classes (`[a-z]`, `[^...]`), the escapes `\d \D \w \W \s \S \b \B`, anchors `^` and `$`, groups `( )` and `(?: )`, alternation `|`, repetition `* + ?`, `{n}`, `{n,}`, `{n,m}` and the lazy forms such as `*?`. Flags like `(?i)` are not supported. Matching works on bytes, so `.` and classes see UTF-8 text one byte at a time.

## Methods

| Method | Result | Notes |
| --- | --- | --- |
| `isMatch(text)` | `bool` | Does the pattern match anywhere? |
| `find(text)` | `found?` | The first match. |
| `findAll(text)` | `[found]` | Every match. |
| `count(text)` | `int` | The number of matches. |
| `replaceAll(text, replacement)` | `string` | `$0` in the replacement is the whole match; `$1` and up are groups. |
| `groups()` | `int` | Number of capture groups. |

A `found` has `start` and `end` byte positions, and `group(text, n)` returns the text of group `n` (0 is the whole match) or `none` when that group did not take part.

```pelago
import std.regex

fn main() {
    switch regex.compile("(a+)b|c") {
        case ok(re):
            print("#(re.isMatch("xaab")) #(re.count("ab c"))")
            print(re.replaceAll("ab c", "<$0>"))
            switch re.find("xaab") {
                case some(m): print("#(m.start)..#(m.end) #(m.group("xaab", 1) ?? "-")")
                case none: print("no match")
            }
        case err(e): print("bad pattern: #(e.message)")
    }
}
```

```text
true 2
<ab> <c>
1..4 aa
```
