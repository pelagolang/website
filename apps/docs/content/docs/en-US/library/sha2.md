---
title: std.sha2
description: SHA-224, SHA-256, SHA-384, SHA-512, SHA-512/224 and SHA-512/256.
---

```text
import std.hash
import std.sha2
import { sha256, sha512 } = std.sha2
```

The six SHA-2 hashes of FIPS 180-4. Each one is a [`hasher`](./hash.md), so the same `update!`, `finish`, `digest` and `hex` work for all of them. Every digest is checked against the NIST examples and against Python's `hashlib`.

| Hash | Make one | Digest | Block |
| --- | --- | --- | --- |
| SHA-256 | `sha256.new()` | 32 bytes | 64 |
| SHA-224 | `sha256.new224()` | 28 bytes | 64 |
| SHA-512 | `sha512.new()` | 64 bytes | 128 |
| SHA-384 | `sha512.new384()` | 48 bytes | 128 |
| SHA-512/256 | `sha512.new512t256()` | 32 bytes | 128 |
| SHA-512/224 | `sha512.new512t224()` | 28 bytes | 128 |

The state is a plain value, so `finish` pads a copy and a hasher can be cloned or kept after you read a digest. The code has no branch and no table lookup that depends on the data, only wrapping addition, rotations and bit operations, so the time does not depend on what is hashed.

```pelago
import std.hash
import std.sha2
import { sha256, sha512 } = std.sha2

fn main() {
    print(hash.hex(hash.digestText(sha256.new(), "abc")))
    print(hash.hex(hash.digestText(sha512.new384(), "abc")))
}
```

```text
ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7
```

Keyed use is in [std.mac](./mac.md) and key derivation in [std.kdf](./kdf.md).
