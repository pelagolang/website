---
title: Wide and narrow floats
description: float16, float128 and float256, IEEE 754 formats implemented in software.
---

Three more floating-point types, next to `float` (64 bits) and `float32`.

| Type | Bits | Exponent bits | Significand bits | About |
| --- | --- | --- | --- | --- |
| `float16` | 16 | 5 | 11 | 3 digits, largest value 65504 |
| `float128` | 128 | 15 | 113 | 34 digits, largest value about 1.2e4932 |
| `float256` | 256 | 19 | 237 | 71 digits |

They are the standard IEEE 754 binary formats: round to nearest even, subnormals, infinities, NaN and signed zero. They are written in Pelago itself, with no hardware support and no C library, so they work on every target the compiler builds for.

- **Literals** are rounded once, correctly, when the program is compiled. `1e4000` is a fine `float128`.
- **Arithmetic** is `+ - * / %`, negation and the comparisons. Floats do not stop the program on overflow: you get `inf`, `nan` or `-0` as IEEE says. (Integer overflow still stops the program.) A comparison with `nan` is false, except `!=`.
- **Conversion** with `to` widens when nothing is lost: any integer type to any of these floats (rounded when it must be), and a float to a wider float. `x.toFloat()` narrows one of these floats to a plain `float`. Narrowing to a smaller soft float is not written yet.
- **Printing** gives the shortest text that reads back as the same value, so `0.1` prints `0.1`.

```pelago
fn main() {
    const a: float128 = 1.0
    const b: float128 = 3.0
    print(a / b, a + b, a - b, a * b, b % 2.0, -a)
    var c: float128 = 0.1
    c += 0.2
    print(c, c == 0.3, c > 0.3)
    const d: float256 = 1.0
    print(d / 3.0, (d / 3.0) * 3.0)
    const h: float16 = 0.1
    print(h, h + h, 65504.0 to float16, h * 1000.0)
    print(5 to float128, (7 to int128) to float256, (a / b).toFloat() == 1.0 / 3.0)
    const big: float128 = 1e4000
    print(big, big * big, -big * big, big * big - big * big)
    print(a / (a - a), (a - a) / (a - a))
}
```

```text
0.3333333333333333333333333333333333 4 -2 3 1 -1
0.30000000000000000000000000000000004 false true
0.333333333333333333333333333333333333333333333333333333333333333333333333 1
0.1 0.2 65500 100
5 7 true
1e+4000 inf -inf nan
inf nan
```

The `0.1 + 0.2` line shows the usual binary rounding: at 128 bits it is still not exactly `0.3`, just closer.

## What is not there yet

- **Maths functions.** There is no `sqrt`, `floor` or other function for these types, and no fused multiply-add.
- **Statements.** `switch` patterns and `for` ranges over them are not built.
- **JSON.** They are not part of `@derive(toJson)` and `fromJson`.
- **Speed.** Everything is plain loops, correct first. `%` with a huge gap between the exponents is slow. The same speed list as for [wide integers](./wide-integers.md) applies.

The routines were checked against exact rational arithmetic: 750 random cases for `float128` (add, subtract, multiply, divide and remainder, bit for bit), 400 for `float16` and 12 for `float256`, plus literals at all three formats.
