---
title: Keywords
description: Hard and soft keywords.
---

## Hard keywords

Hard keywords are reserved everywhere and cannot be used as names.

```text
var const fn struct enum interface impl obj mod pkg import export use pub priv
meta macro deinit super let inout sink copy if else unless switch case guard
for in of while do loop break continue return defer become yield is true false
none self Self unsafe async await
```

Some of these name constructs that are only partly implemented, or reserved for later (for example `macro`, `yield` and `pkg`). They stay reserved so that programs written today keep working later.

## Soft keywords

Soft keywords are special in one position and ordinary names elsewhere.

```text
type ext union static operator init new delete open abstract override final
any default step to from it where linear once test asm volatile atomic scope
spawn chan select
```

For example `it` is the implicit parameter of a one-parameter closure but a plain name elsewhere; `open` and `override` modify object declarations; `to` is the conversion operator.

You can list both sets with `pelago keywords`.

## Words that are not in Pelago

Several familiar words are deliberately absent: `class`, `match`, `when`, `null`, `extern`, `comptime` and `inline` have no meaning, and there are no word operators such as `and`, `or` and `not`. Use `obj`, `switch`, `none`, `ext`, `meta` and the `@inline` attribute, and write `&&`, `||` and `!`.
