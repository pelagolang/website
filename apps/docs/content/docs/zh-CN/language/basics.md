---
title: "基础"
description: "变量、常量和基本类型。"
---

按照 Python 第一课的方式来写，一次只讲一个想法。这里的语法只是供讨论的草图，
不是最终决定。

**目前已决定：** 用 `fn` 定义函数，用 `var` 和 `const`，类型名小写，
有大小的整数从 8 位到 64 位，`<T>` 泛型，换行结束语句。

## 1. 变量是值的名字 [#1-a-variable-is-a-name-for-a-value]

```
var score = 10
const name = "Dennis"
```

- `var` 创建之后可以修改的变量。
- `const` 创建不能修改的变量。由于采用值语义，“不能修改”是真正的不能修改：
  通过这个名字能访问到的任何内容也都不能修改。
- 名字写在前面。不写类型，因为编译器会推断出来。

## 2. 修改变量 [#2-changing-a-variable]

```
var score = 10
score = 15          // fine
score += 5          // score is now 20

const pi = 3.14
pi = 3.2            // error: pi is const
```

## 3. 类型 [#3-types]

每个值都有类型，变量的类型永远不变。这是与 Python 的最大区别。

```
var score = 10
score = "ten"       // error: score is an int, "ten" is a string
```

| 类型 | 存放 | 示例 |
|---|---|---|
| `int` | 整数 | `42`, `-7` |
| `float` | 小数 | `3.14` |
| `bool` | 真或假 | `true` |
| `char` | 单个字符 | `'a'` |
| `string` | 文本 | `"hello"` |

在意内存时可以使用确切的大小：

| 有符号 | 无符号 | 有符号类型的范围 |
|---|---|---|
| `int8` | `uint8` | -128 to 127 |
| `int16` | `uint16` | 约 -3.2 万到 3.2 万 |
| `int32` | `uint32` | 约 -21 亿到 21 亿 |
| `int64` | `uint64` | 约 -922 亿亿到 922 亿亿 |

小数还有 `float32` 和 `float64`。

## 4. 自己写出类型 [#4-writing-the-type-yourself]

类型写在名字后面，和 TS 一样。只有在编译器推断不出来，或者想写得明确时才需要。

```
var score: int = 10
const ratio: float = 0.5
var small: int8 = 100
var count: int            // error: a variable must be given a value
```

变量在创建时必须有值。没有未初始化的变量，也没有 null，这样就消除了一整类错误。

## 5. 打印与注释 [#5-printing-and-comments]

```
print("Hello")
print(score)
/// this is a comment
```

## 6. 类型之间的转换（提案，自创） [#6-converting-between-types-proposal-custom]

转换总是明确写出，绝不静默发生。提案：用一个普通的词 `to`。

```
const whole = 7
const decimal = whole to float      // 7.0
const text = whole to string        // "7"
```

只有在不会丢失任何信息时，编译器才允许使用 `to`。可能丢失信息或失败的转换
需要另一种可见的写法。等讲到错误时再确定。

## 7. 字符串中嵌入值（已决定：我们自己的 `#` 标记） [#7-strings-with-values-inside-decided-our-own--marker]

`#` 后面跟一个名字，就会把该值放进文本中。比名字更复杂的内容，请用括号括起来。

```
print("Score: #score")              // Score: 10
print("Next: #(score + 1)")         // Next: 11
print("A literal hash: \#")         // A literal hash: #
```

表达式在程序编译时检查，所以错误会在程序运行之前就被发现。格式控制（小数位、宽度）、
多行字符串和原始字符串以后再加，不会改变这个标记。

---

## 哪些已经是我们自己的 [#what-is-already-our-own]

语法是最容易做出差异的地方，所以下面的列表主要讲语言*做什么*。
这里的每一项都是有意的选择，而不是照搬。

- 一门看起来像 TS 的语言，**没有 GC，也没有可以存储的引用**，只有值语义。
- **调用处重复写 `inout`**，让你在每次修改发生的地方都能看到。
- **真正不可变的 `const`**，一直深入到底。
- **没有 null。** “没有”是一种类型（`option<T>`），绝不会是意外。
- **转换写作 `to`**，而且只在不会丢失任何信息时允许（提案）。
- **用 `#` 插值的字符串**，一个我们在别处没见过的标记。
- **一个同时也是模式匹配的 `switch`/`case`。**
- **把 token 效率作为设计目标**，用真实的分词器来衡量。

## 第 2 稿的决定 [#decisions-from-draft-2]

- **[B1]** 编译器接受任何命名风格。标准库和格式化工具会选定一种。
- **[B2]** `int` 始终正好是 64 位。
- **[B3]** 类型名小写。（未决：自己定义的类型也是吗？）
- **[B4]** 转换写作 `x to float`。

- **[B5]** 字符串插值使用 `#name` 和 `#(expression)`。
- **[B6]** 自己定义的类型可以用小写，也可以用首字母大写的名字。编译器
  两种都接受，与变量名一样（B1）。格式化工具和标准库对你定义的类型使用首字母大写，
  这样更醒目。同一作用域中的类型和值不能同名。

## 仍未决定 [#still-open]

**[B7] `let` 关键字。** 目前保留但未使用。后续的主要候选用法是：
访问模式三件套（`let` / `inout` / `sink`）中的只读成员，因为它是默认情况，所以可能可以省略。
三件套可能出现的位置：函数参数（包括 `self`）、循环变量（用 `for inout x in xs` 原地修改元素）、
`switch` 中的模式绑定，以及闭包捕获。等讲到函数时再决定。
