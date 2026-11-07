---
title: Numbers
description: Methods of int and float, including checked, wrapping and saturating arithmetic.
---

## Integers

| Method | Result | Notes |
| --- | --- | --- |
| `abs()` | `int` | |
| `min(o)`, `max(o)` | `int` | |
| `pow(e)` | `int` | Overflow stops the program. |
| `checkedAdd(o)`, `checkedSub(o)`, `checkedMul(o)` | `int?` | `none` on overflow. |
| `wrappingAdd(o)`, `wrappingSub(o)`, `wrappingMul(o)` | `int` | Wrap around. The same as `+%`, `-%`, `*%`. |
| `saturatingAdd(o)`, `saturatingSub(o)` | `int` | Stop at the largest or smallest value. |
| `wrapToByte()` | `uint8` | Keep the low 8 bits. |
| `toByteChecked()` | `uint8?` | `none` when the value does not fit. |

The same pair exists for the other widths: `wrapToInt8` and `toInt8Checked`, `wrapToInt16` and `toInt16Checked`, `wrapToUint16`, `wrapToInt32`, `wrapToUint32` and their checked forms.

```pelago
fn main() {
    const x = 250
    print("#(x.wrapToByte()) #(300.wrapToByte()) #(300.toByteChecked() ?? 0)")
    print("#((-5).abs()) #(3.max(9)) #(2.pow(8))")
    print("#(x.checkedMul(x) ?? -1) #(x.saturatingSub(1000))")
}
```

```text
250 44 0
5 9 256
62500 -750
```

## Floats

| Method | Result | Notes |
| --- | --- | --- |
| `abs()`, `min(o)`, `max(o)` | `float` | |
| `sqrt()` | `float` | Correctly rounded; NaN for a negative number. |
| `floor()`, `ceil()`, `round()` | `float` | |
| `pow(e)` | `float` | Whole-number exponents only; others stop the program. |
| `fma(b, c)` | `float` | `self * b + c` with a single rounding. |
| `truncInt()`, `floorInt()`, `ceilInt()`, `roundInt()` | `int` | Convert to an integer. |

```pelago
fn main() {
    const r = 2.5
    print("#(r.floor()) #(r.ceil()) #(r.floorInt()) #(r.roundInt())")
    print("#(16.0.sqrt()) #(2.0.pow(3.0))")
}
```

```text
2 3 2 3
4 8
```

## Conversion

`n to float` converts an integer to a float. Going the other way loses information, so it uses a named method: `truncInt`, `floorInt`, `ceilInt` or `roundInt`.
