---
title: std.regex
description: Regular expressions that run in time proportional to the text.
---

```text
import std.regex
```

`regex.compile(pattern)` returns a `regex ! parse_error`. Matching is done by a Pike VM, so the time grows with the length of the text times the length of the pattern, and never exponentially.

## Syntax

Literals, `.`, classes (`[a-z]`, `[^...]`), the escapes `\d \D \w \W \s \S \b \B`, the anchors `^`, `$`, `\A` (start of text) and `\z` (end of text), groups `( )` and `(?: )`, named groups `(?<name>...)` or `(?P<name>...)`, alternation `|`, repetition `* + ?`, `{n}`, `{n,}`, `{n,m}` and the lazy forms such as `*?`.

Flags are switched on for the rest of the group: `(?i)` ignores case, `(?s)` lets `.` match a newline, `(?m)` lets `^` and `$` match at every line.

Lookahead `(?=...)` and `(?!...)` is supported and stays linear: each lookahead body is run once over the whole text, backwards, instead of once per position. Lookbehind is refused with a parse error.

Matching works on bytes, so `.` and classes see UTF-8 text one byte at a time, unless the pattern starts with `(?u)` (see Unicode mode below).

## Unicode mode

By default matching works on bytes. Start a pattern with `(?u)` (or a combined flag such as `(?ui)`) to match Unicode characters instead: `.` and classes take a whole character, `\b` and `\B` follow Unicode word characters, `\p{L}`-style general categories are available, and `(?i)` uses Python's case folds. Scripts (`\p{Greek}`), folds that expand to several characters, and lookahead or backreferences in Unicode mode at run time are not supported yet. At run time `(?u)` must be the first thing in the pattern; the `std.regexunicode` module holds the tables.

```pelago
import std.regex

@regex("(?u)(?<first>[à-ÿ]+)-(?<second>[α-ω]+)(?<mark>.)")
struct mixed {
    first: string
    second: string
    mark: string
}

fn main() {
    switch mixedFind("x été-αβγ😀 y") {
        case some(m): print(m.first, m.second, m.mark)
        case none: print("none")
    }
}
```

```text
é αβγ 😀
```

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

## Backreferences

`\1` to `\99`, `\k<name>` and `(?P=name)` repeat what an earlier group matched. A reference to a group that did not take part fails to match, and a group must be closed before it is referenced. A backreference cannot be done in time proportional to the text, so `regex.compile` refuses such a pattern. Use `regex.compileWithBackrefs`, and run it with a budget, a number of steps after which the search gives up:

| Method | Result |
| --- | --- |
| `search(text, budget)` | `matched(found)`, `nomatch` or `gaveUp`. |
| `searchAll(text, budget)` | `[found]?`, `none` when the budget ran out. |

```pelago
import std.regex

fn main() {
    switch regex.compileWithBackrefs("(\\w+) \\1") {
        case ok(re):
            switch re.search("it is is a test", 100000) {
                case .matched(m): print("matched #(m.start)..#(m.end)")
                case .nomatch: print("no match")
                case .gaveUp: print("gave up")
            }
        case err(e): print("bad pattern: #(e.message)")
    }
}
```

```text
matched 3..8
```

A backreference inside a lookahead, or into one, is a compile error. This is a deliberate difference from Python.

## Patterns checked by the compiler

An attribute on a struct compiles the pattern while your program is compiled. Each named group becomes a field, and a pattern that does not fit its fields is a compile error: a missing group, a group that may not take part but whose field is not optional (`T?`), or a digit group that can be longer than the number type allows. The generated matcher is plain code with fixed-size tables and no growable lists, so it needs no allocation to match.

```pelago
import std.regex

@regex("(?<year>\\d{4})-(?<month>\\d\\d)(-(?<day>\\d\\d))?")
struct date {
    year: uint16
    month: uint8
    day: uint8?
}

fn main() {
    switch dateFind("on 2026-11-10 and 1999-01") {
        case some(d): print(d.year, d.month, d.day)
        case none: print("none")
    }
    print(dateIsMatch("no date"), dateIsMatch("1999-01"))
    for d of dateFindAll("2026-11-10, 1999-01 and 2000-02-29") {
        print(d.year, d.month, d.day)
    }
}
```

```text
2026 11 some(10)
false true
2026 11 some(10)
1999 1 none
2000 2 some(29)
```

For a struct named `date` the functions are `dateFind`, `dateFindAll` and `dateIsMatch`. Fields are read as text, as numbers (`uint8`, `int`, ...) or as an option of either. When a number can have more digits than its type holds, the pattern is a compile error if every digit count is possible, and otherwise a text that does not fit is a failed match.

A pattern with a backreference is turned into plain alternatives when the referenced group always takes part, is not in a loop and can only match a short fixed set of strings, such as a quote character. Otherwise the generated functions take the budget as an extra argument and return `matched`, `nomatch` or `gaveUp`, like `search`.

Two guards apply to patterns with backreferences. A pattern whose backreferences read more than three groups is an error unless the attribute asks for more with a second number, `@regex("...", 5)`. A pattern that needs the budgeted search is a warning in `pelago check` and in the editor, and the comment above the generated code names which kind it got. `nameBudget(text)` (for a struct called `name`) suggests a starting budget of `64 * (text.length + 1)`; it is never applied for you.
