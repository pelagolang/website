---
title: "内存"
description: "内存布局与所有权的补充。"
---

前面的页面留下了两个关于内存的问题：结构体数组与数组结构体的取舍，以及线性类型。

## 1. 现状 [#1-where-we-are]

值是有所有者的。`sink` 参数或 `move` 会把值拿走，值离开作用域时运行 `deinit`，被移动的值不能再使用。用类型理论的话说，这是**仿射**（affine）的：一个值最多使用一次，也可以被丢弃。

## 2. AoS 与 SoA [#2-aos-and-soa]

- **AoS**（array of structs，结构体数组）：每个元素的字段放在一起。C 就是这样排布 `point[]` 的，本语言中的 `[point]` 也是如此。当你使用整个元素时，这是合适的布局，并且与 C 互操作时保持一致。
- **SoA**（struct of arrays，数组结构体）：每个字段一个数组。当循环只访问一个字段（所有 `x` 值）时，这是合适的布局，因为数据在缓存中紧凑，也很容易向量化。

**提案。** 默认使用 AoS，因为它可预测且与 C 兼容。SoA 是可选的，作为一种接口相同的集合类型：

```
var points: soa<point> = soa []
points.push!(point { x: 1.0, y: 2.0 })

points[0].x                  // reads through a view of element 0, same code as a list
points.x                     // the whole x column as a read-only [float]: a SIMD-friendly slice
for inout p of points { p.x += 1.0 }
```

在值语义下，引用是临时的（二等公民），所以 `points[i]` 始终是一个只存在于一条语句内的视图，其背后的布局可以改变，而无需修改使用它的任何代码。与元素引用可以逃逸的语言相比，这是一个实实在在的优势。`soa<point, 8>` 是分块变体（AoSoA），按向量宽度把每 8 个元素分为一块。

由编译器自行选择布局仍留在“以后再说”的清单上，因为它需要全程序分析。

固定大小的元组 `(A, B; N)` 是一种交错布局，即混合类型的 AoS 形式。`soa<T>` 与它相反，因此两者涵盖了两个极端。

## 3. 线性类型 [#3-linear-types]

仿射类型允许悄悄丢弃一个值。**线性**类型则禁止这样做：值必须恰好被消耗一次。这样就能把“这个文件必须关闭”“这个事务必须提交或回滚”“这个权限必须归还”变成编译错误。Rust 没有线性类型（只有警告），Austral 和 Hylo 有。

**提案。** 我们几乎已经具备了。增加一个可选的修饰符：

```
linear struct transaction { ... }

fn commit(sink t: transaction) -> void ! db_error { ... }
fn rollback(sink t: transaction) { ... }

fn work() -> void ! db_error {
    const t = begin()?
    do_things(t)               // read-only use, fine
    t.commit!!()               // consumed. Forgetting this is a compile error.
}
```

- 线性值必须在每条路径上被消耗，包括提前返回和 `?`。编译器会指出哪条路径遗漏了。
- 线性类型没有 `deinit`，因为它永远不能被隐式丢弃。
- `sink` 本来就表示“把值拿走”，`!!` 本来就标记消耗性调用，所以调用处不需要新语法。
- 泛型代码需要小心：默认情况下类型参数可以被丢弃，所以 `T` 不能是线性类型，除非约束这样声明（`<T: linear>`）。设计类型检查器时要保留这扇门；不要在任何地方写死“每个类型都可以被丢弃”。

**分阶段。** 第 1 版是仿射加 `@must_use` 警告。真正的 `linear` 类型在类型检查器完成之后到来，因为它会改变泛型的规则。`linear` 这个词现在就保留下来（软关键字）。

---

## 已实现：soa [#built-soa]

结构体 `T` 的 `soa<T>` 按上文所述工作（见 `ir.md` 中的 IR24）：`soa []`、`soa [a, b]`、`push!`、`pop!`、`insert!`、`remove!`、`clear!`、`len`、`points[i]`、`points[i].x`、`points.x`、`for` 与 `for inout` 循环、`copy`、`==`、`print`。分块形式 `soa<T, N>` 可以接受，行为相同；其分块内存布局留给后端处理。

## 临时值 [#temporaries]

一个被创建却从未命名的值（被忽略的函数结果、`make_dog("a").name` 背后的对象、临时构造的参数）会在**其语句结束时**销毁，销毁顺序与创建顺序相反。如果有东西接管了它（变量、字段、`sink` 参数、`return`），则由新的所有者稍后销毁。编译器在生成代码时记录这些账目（账本，IR22）；在顺序执行的代码中，除了变量本来就要付出的开销之外，没有运行时成本。

## 草案 1 的决定 [#decisions-from-draft-1]

- **M1** AoS 是默认布局。`soa<T>` 是可选的集合，`soa<T, 8>` 是其分块变体。
- **M2** 列访问（`points.x`，只读的 `[float]`）纳入。
- **M3** 由编译器选择布局仍是以后的优化。
- **M4** `linear` 是可选修饰符，安排在类型检查器之后。该词现在作为软关键字保留。
