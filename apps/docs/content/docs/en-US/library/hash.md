---
title: std.hash
description: The one streaming interface every hash shares, with hex helpers and a constant-time compare.
---

```text
import std.hash
```

Every hash in `std` is a `hasher`: a plain value you feed bytes and ask for a digest. The digest never depends on how you split the input into chunks. Reading the digest works on a copy, so a hasher can keep going afterwards, and there is no "finalised" state to misuse. The hashes live in their own modules: [std.sha2](./sha2.md) today, with more planned.

| Method | Result | Notes |
| --- | --- | --- |
| `h.update!(data)` | | Feed bytes into the hash. |
| `h.finish()` | `[byte]` | The digest of everything fed so far. It does not change `h`. |
| `h.reset!()` | | Back to the state of a new hasher. |
| `h.fresh()` | a new hasher | A new hasher of the same kind, with nothing fed. |
| `h.outputSize()` | `int` | Bytes in the digest. |
| `h.blockSize()` | `int` | Bytes the hash takes at a time (HMAC needs it). |

| Function | Result | Notes |
| --- | --- | --- |
| `hash.digest(h, data)` | `[byte]` | The digest of `data` from a new hasher of the kind of `h`. What `h` has been fed is ignored. |
| `hash.digestText(h, text)` | `[byte]` | The same, for the UTF-8 bytes of a string. |
| `hash.hex(data)` | `string` | Lowercase hex. |
| `hash.fromHex(text)` | `[byte]?` | The bytes a hex text spells, or `none` when the length is odd or a character is not a hex digit. |
| `hash.equalConstTime(a, b)` | `bool` | Compares two byte lists in time that depends only on their length, never on where they differ. |

Use `equalConstTime` for MACs, tokens and password hashes. `==` stops at the first difference and so leaks where it was.

```pelago
import std.hash
import std.sha2
import { sha256, sha512 } = std.sha2

fn main() {
    var h = sha256.new()
    h.update!("hello ".bytes().toList())
    h.update!("world".bytes().toList())
    print(hash.hex(h.finish()))
    print(hash.hex(hash.digestText(sha256.new(), "abc")))
    print(hash.hex(hash.digestText(sha512.new384(), "abc")))
    print(h.outputSize(), h.blockSize())
    print(hash.fromHex("00ff10") ?? [], hash.fromHex("zz"))
}
```

```text
b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7
32 64
[0, 255, 16] none
```

## What is not there yet

Only SHA-2 exists so far. SHA-3, BLAKE2, BLAKE3, MD5 and SHA-1, checksums and fast non-cryptographic hashes are planned, and so are extendable-output functions; see [std.sha2](./sha2.md) for what is built. There is no password hashing beyond PBKDF2 yet (see [std.kdf](./kdf.md)).
