---
title: std.mac
description: HMAC over any hasher.
---

```text
import std.mac
```

HMAC (RFC 2104, FIPS 198-1) works over any [`hasher`](./hash.md). Pass a new hasher of the kind you want, for example `sha256.new()`. A key longer than the hash's block is hashed first, and a shorter one is zero padded, as the standard says. It is checked against the RFC 4231 vectors and Python's `hmac`.

| Function | Result | Notes |
| --- | --- | --- |
| `mac.sign(h, key, msg)` | `[byte]` | The HMAC of `msg` under `key`, with the hash kind of `h`. |
| `mac.verify(h, key, msg, tag)` | `bool` | True when `tag` is the HMAC of `msg`. It compares in constant time. |
| `mac.start(h, key)` | `hmac` | A streaming HMAC: feed it with `update!(data)` and read the tag with `finish()`. |

```pelago
import std.hash
import std.mac
import std.sha2
import { sha256, sha512 } = std.sha2

fn main() {
    const key = "key".bytes().toList()
    const msg = "message".bytes().toList()
    const tag = mac.sign(sha256.new(), key, msg)
    print(hash.hex(tag))
    print(mac.verify(sha256.new(), key, msg, tag), mac.verify(sha256.new(), key, "other".bytes().toList(), tag))
    var m = mac.start(sha256.new(), key)
    m.update!("mess".bytes().toList())
    m.update!("age".bytes().toList())
    print(hash.equalConstTime(m.finish(), tag))
}
```

```text
6e9ef29b75fffc5b7abae527d58fdadb2fe42e7219011976917343065f58ed4a
true false
true
```

Always check a tag with `verify` (or `hash.equalConstTime`), never with `==`.

## What is not there yet

Only HMAC. Poly1305, CMAC, GMAC and KMAC are planned.
