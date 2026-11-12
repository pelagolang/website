---
title: std.fs
description: Read and write files by path.
---

```text
import std.fs
```

Paths are UTF-8 text, passed to the operating system unchanged. No function stops the program: each reports a failure as an `io_error` value, which has a `kind` (`notFound`, `denied`, `invalid` or `other`) and a `message`. Use `?` to pass it on, or `switch` to handle it.

| Function | Result | Notes |
| --- | --- | --- |
| `fs.readText(path)` | `string ! io_error` | The whole file. Text that is not valid UTF-8 is an error. |
| `fs.readBytes(path)` | `[byte] ! io_error` | The whole file as raw bytes. |
| `fs.writeText(path, text)` | `void ! io_error` | Create or replace the file. |
| `fs.appendText(path, text)` | `void ! io_error` | Add to the end, creating the file if needed. |
| `fs.open(path)` | `io.file ! io_error` | Open an existing file for reading. |
| `fs.create(path)` | `io.file ! io_error` | Create or replace a file for writing. |
| `fs.append(path)` | `io.file ! io_error` | Open for writing at the end. |

An open `io.file` reads and writes in pieces. It is closed when it goes out of scope.

| Method | Result | Notes |
| --- | --- | --- |
| `readLine!()` | `string? ! io_error` | The next line; `none` at the end of the file. |
| `readAll!()` | `string ! io_error` | The rest of the file. |
| `readBytes!()` | `[byte] ! io_error` | The rest of the file as bytes. |
| `write!(text)` | `void ! io_error` | Write text. |

```pelago frag
import std.fs

fn main() -> void ! io_error {
    fs.writeText("notes.txt", "one\ntwo\n")?
    var f = fs.open("notes.txt")?
    var more = true
    while more {
        switch f.readLine!()? {
            case some(line): print(line)
            case none: more = false
        }
    }
}
```

A missing file is an ordinary value:

```pelago
import std.fs

fn main() {
    switch fs.readText("this-file-does-not-exist.txt") {
        case ok(text): print(text)
        case err(e): print("failed: #(e.kind)")
    }
}
```

```text
failed: notFound
```

Standard input has the same shape in [std.io](./io.md): `io.readLine()`, `io.readAll()` and `io.readBytes()` never stop the program on a read error, and `io.tryReadLine()` and `io.tryReadAll()` return the `io_error` instead.
