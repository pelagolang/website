---
title: std.path
description: Join, split and clean paths as text.
---

```text
import std.path
```

Paths are text, and these functions never touch the disk. Both `/` and `\` separate components, so a Windows path and a POSIX path read the same. The functions that build a path write `/`, which every operating system accepts.

| Function | Result | Notes |
| --- | --- | --- |
| `path.join(head, tail)` | `string` | Joins with one `/`. An empty side is dropped; an absolute `tail` replaces `head`. |
| `path.fileName(p)` | `str` | The last component; empty for `/` and `""`. |
| `path.parent(p)` | `str?` | Everything before the last component; `none` for a root or an empty path. |
| `path.stem(p)` | `str` | The file name without its last extension. |
| `path.extension(p)` | `str?` | The text after the last dot, without it. `none` for `.bashrc`, `noext` and `trail.`. |
| `path.withExtension(p, ext)` | `string` | Replace the extension; an empty `ext` removes it. |
| `path.isAbsolute(p)` | `bool` | Starts at a root: `/x`, `\x` or a drive such as `C:\x`. |
| `path.components(p)` | `iter<str>` | The non-empty parts in order. |
| `path.normalise(p)` | `string` | Drop `.` and empty parts and resolve `..` where possible, without following links. The empty result is `.`. |

```pelago
import std.path

fn main() {
    print(path.join("src", "main.pel"))
    print(path.fileName("a/b.txt"), path.stem("a/b.tar.gz"))
    print(path.extension("a/b.tar.gz"), path.extension(".bashrc"))
    print(path.parent("a/b/c.txt"), path.parent("/"))
    print(path.withExtension("a/b.txt", "md"))
    print(path.components("a/b/./c").toList())
    print(path.normalise("a/b/../c"))
}
```

```text
src/main.pel
b.txt b.tar
some("gz") none
some("a/b") none
a/b.md
["a", "b", ".", "c"]
a/c
```
