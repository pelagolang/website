---
title: std.kdf
description: Key derivation with HKDF and PBKDF2, over any hasher.
---

```text
import std.kdf
```

Both functions run over HMAC with any [`hasher`](./hash.md).

**HKDF** (RFC 5869) turns one secret that is already random, such as a key-exchange result, into any number of keys, one per `info` value. **PBKDF2** (RFC 8018) turns a password into a key by repeating the HMAC `iterations` times. PBKDF2 is old and cheap to attack on GPUs, so Argon2 is planned for new password storage; use PBKDF2 where a standard asks for it.

| Function | Result | Notes |
| --- | --- | --- |
| `kdf.hkdf(h, salt, ikm, info, length)` | `[byte]` | Extract then expand in one call. |
| `kdf.hkdfExtract(h, salt, ikm)` | `[byte]` | The pseudo-random key from the input key material. |
| `kdf.hkdfExpand(h, prk, info, length)` | `[byte]` | `length` bytes from that key. |
| `kdf.pbkdf2(h, password, salt, iterations, length)` | `[byte]` | A key of `length` bytes from a password. |

`length` stops the program when it is below 0 or above the format's limit (for HKDF, 255 times the hash length). The functions are checked against the RFC 5869 vectors and Python's `hashlib.pbkdf2_hmac`.

```pelago
import std.hash
import std.kdf
import std.sha2
import { sha256, sha512 } = std.sha2

fn main() {
    const salt = hash.fromHex("000102030405060708090a0b0c") ?? []
    const key = kdf.hkdf(sha256.new(), salt, "input key".bytes().toList(), "context".bytes().toList(), 32)
    print(hash.hex(key))
    const pw = kdf.pbkdf2(sha256.new(), "password".bytes().toList(), "salt".bytes().toList(), 1, 32)
    print(hash.hex(pw))
}
```

```text
20c457485106ae38d687a4ce4ea601c9f3b95c554c16a78b4b6804e82bbe5df1
120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b
```

One iteration is only for the example. For real password storage pick an iteration count from current guidance (hundreds of thousands for SHA-256) and store the salt with the result.

## What is not there yet

Argon2, scrypt and bcrypt, and the PHC string format, are planned.
