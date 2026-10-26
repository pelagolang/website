---
title: "列表模式"
description: "按列表的形状进行匹配。"
---

这些模式可以查看列表、数组或切片的内部。它们能与 `switch.md` 中的一切配合使用：`switch` 分支、条件中的 `is`、`guard ... else`、带 `if` 的守卫、备选项以及 `name is pattern`。

## 1. 形状 [#1-the-shapes]

```
switch xs {
    case []:                       "empty"
    case [x]:                      "one: #x"
    case [a, b]:                   "two: #a and #b"
    case [first, ...rest]:         "#first, then #(rest.len()) more"
}
```

| 模式 | 匹配 |
|---|---|
| `[]` | 没有元素的列表 |
| `[a, b]` | 恰好两个元素，分别绑定到 `a` 和 `b` |
| `[a, ...rest]` | 一个或多个；`rest` 是 `a` 之后的全部内容（可能为空） |
| `[...init, last]` | 一个或多个；`init` 是 `last` 之前的全部内容 |
| `[first, ...mid, last]` | 两个或更多，中间部分绑定到 `mid` |
| `[first, ...]` | 一个或多个；其余部分被忽略（单独的 `...`） |
| `[0, x]`, `[.circle(r), ...]` | 元素可以是任何模式：字面量、范围、枚举分支、嵌套列表 |

- **剩余标记是 `...`**，与 `[0, ...xs, 99]` 中的展开（spread）是同一个符号：在表达式中它把元素向外展开，在模式中它把元素向内收集。结构体模式保留 `..` 表示“忽略其他字段”；两者不同，是因为列表的剩余部分有长度，而且通常有名字。
- 每个模式最多一个剩余标记。
- 适用于 `[T]`、`[T; N]` 和切片视图。对固定数组而言长度是已知的，所以 `[a, b]` 匹配 `[int; 2]` 总是成功，编译器也知道这一点。

## 2. 剩余部分是一个视图 [#2-the-rest-is-a-view]

`rest` 是一个**切片视图**（collections.md 第 2 节），而不是新列表。所以创建它没有成本（一个指针加一个长度），并且和所有视图一样，它只在该分支内有效，不能被保存或返回。要保留它：`copy rest`。

```
fn sum(xs: [int]) -> int {
    switch xs {
        case []:             0
        case [h, ...t]:      h + sum(t)          // t is a view; passing it down is fine
    }
}

fn count(xs: [int], acc: int) -> int {
    switch xs {
        case []:             acc
        case [_, ...t]:      become count(t, acc + 1)    // guaranteed tail call
    }
}
```

## 3. 访问模式 [#3-access-modes]

访问模式作用于绑定，和别处一样。模式写在它所作用的绑定之前：

```
switch inout xs {
    case [inout first, ...inout rest]:
        first += 1                  // changes xs[0] in place
        rest.reverse!()             // changes the rest in place
    case []: ...
}
```

- 默认只读（`let`）。`inout` 要求被检查的对象本身也是 `inout`。
- **元素上不允许 `sink`**：从列表中取走一个元素会留下一个空洞。要拆解整个列表，请使用 `pop`/`remove` 一类的方法，或未来的 `sink` 列表模式（第 7 节）。

## 4. 适用位置 [#4-where-they-work]

```
if args is [cmd, ...rest] { run(cmd, rest) }

guard args is [path] else { return err(usage()) }       // path is usable after the guard

switch line.split(" ").to_list() {
    case ["add", name]:            add!(name)
    case ["remove", name]:         remove!(name)
    case ["list"]:                 list()
    case ["rename", old, new]:     rename!(old, new)
    case [cmd, ...]:               print("unknown command #cmd")
    case []:                       print("empty line")
}
```

- **穷尽性：** 编译器会跟踪长度。`[]` 加 `[_, ...]` 是完整的；`[]`、`[_]`、`[_, _, ...]` 也是。缺失的长度会在错误信息中指出。
- **声明不能失败。** 只有当 `xs` 是具有该长度的固定数组（`[int; 2]`）时，才接受 `const [a, b] = xs`。对于列表，请使用 `guard xs is [a, b] else { ... }` 或 `if xs is`。
- 当备选项绑定相同的名字时可以使用：`case [x], [x, _]:`。
- `name is pattern` 可用：`case whole is [first, ...]:` 同时保留列表及其第一个元素。
- **文本同时支持**字面量分支和列表模式（LP7）。对 `string` 或 `str` 而言，元素是 `char`，剩余部分是 `str` 视图：`case ['a', ...rest]:` 或 `case [c, ...]:`。字面量仍是测试整个值的简单方式（`case "add":`）。长度按字符计数，所以长度测试会遍历一次文本；从头开始匹配时解码的内容绝不会超过模式所需。

## 5. 解决构建器问题（B5）[#5-closing-the-builder-question-b5]

构建器需要一种跳过不匹配项的办法。`is` 已经能绑定名字，所以不需要新语法。用 `is` 写的过滤器会让它的名字可用于结果：

```
const radii = [s of shapes if s is .circle(r) ~> r]                  // only circles
const firsts = [x of rows if x is [first, ...] ~> first]             // rows that are not empty
const values = [o of opts if o is some(v) ~> v * 2]                  // some options only
```

（`option` 的有值分支是 `some(v)`；见下面的决定。）

## 6. 为什么不用其他设计 [#6-why-not-other-designs]

- **`[first, ..rest]`（Rust）：** `..` 在结构体模式中已经表示“忽略其他字段”，而 `...` 是大家在列表中见到的展开。
- **`first :: rest`（ML / Haskell）：** cons 模式假定是链表。我们的是数组，“其余部分”是一个视图，中间和末尾的情形（`[...init, last]`）与开头一样廉价。
- **为列表单独设一个 `match`：** 决定是所有场合只用一个 `switch`。

## 7. 留待以后（检查器完成后再回顾）[#7-left-for-later-revisit-after-the-checker-exists]

- **留待后续版本：列表模式中的 `sink`。** 消耗型列表模式（`switch sink xs { case [a, ...rest]: ... }`，其中 `a` 和 `rest` 成为
  被拥有的值）。当拥有型列表上的 `sink` 能安全地交还各部分时即可实现；需要先有检查器。
- **映射和集合上的模式。** 查找仍是返回 `option` 的 `map.get(k)`，按常规方式匹配。
- **迭代器上的模式**，迭代器无法存储，也没有长度。

## 草案 1 的决定 [#decisions-from-draft-1]

- **LP1** `...` 是剩余标记（单独使用表示忽略，`...name` 表示绑定），每个模式最多一个。
- **LP2** `rest` 是临时的切片视图；`copy rest` 生成被拥有的列表。
- **LP3** 访问模式写在绑定之前：`[inout first, ...inout rest]`。
- **LP4** v1 中不允许对列表模式的元素使用 `sink`。保留在待回顾清单中（第 7 节）。
- **LP5** 固定数组可以在普通声明中解构；列表使用 `guard ... is` 或 `if ... is`。
- **LP6** (a) 构建器中的 `if x is pattern` 把它的名字带入结果（解决 B5）。(b) `option` 的有值分支以 `some(v)` 匹配，
  这是像 `ok` 和 `err` 一样只用于模式的词；值本身仍直接书写。
- **LP7** 文本两者兼得：字面量分支，以及在 `char` 上带 `str` 剩余部分的列表模式。
- **LP8** 剩余标记可以位于中间。
