---
title: std.json
description: Parse and write JSON.
---

```text
import std.json
```

`json.parse(text)` returns a `json.value ! parse_error`. A `value` is one of:

| Case | Holds |
| --- | --- |
| `nothing` | JSON `null`. |
| `flag(value)` | A boolean. |
| `number(value)` | A `float`. All JSON numbers are floats. |
| `text(value)` | A string. |
| `items(values)` | An array. |
| `fields(keys, values)` | An object. Keys keep the order they were written in. |

Methods on a `value`:

| Method | Result | Notes |
| --- | --- | --- |
| `get(key)` | `value?` | A field of an object. |
| `at(i)` | `value?` | An element of an array. |
| `size()` | `int` | Number of elements or fields. |
| `asNumber()`, `asText()`, `asBool()` | `float?`, `string?`, `bool?` | The content when the value has that kind. |
| `encode()` | `string` | Compact JSON text. |
| `pretty(indent)` | `string` | Indented JSON text; `indent` defaults to 2. |

```pelago
import std.json

fn main() {
    switch json.parse("{\"name\": \"Pelago\", \"tags\": [1, 2]}") {
        case ok(doc):
            print(doc.encode())
            const tags = doc.get("tags") ?? json.value.nothing
            print("#(tags.size()) tags, second is #((tags.at(1) ?? json.value.nothing).asNumber() ?? 0.0)")
        case err(e): print("bad: #(e.message)")
    }
    switch json.parse("{oops") {
        case ok(_): print("unexpected")
        case err(e): print("bad: #(e.message)")
    }
}
```

```text
{"name":"Pelago","tags":[1,2]}
2 tags, second is 2
bad: a key must be a string
```

## Typed decoding and encoding

Instead of walking a `value`, you can describe the data as a struct or enum and let the compiler write the code. `@derive(fromJson)` adds `<name>Decode(text)`, which returns the type or a `json_error`; `@derive(toJson)` adds `<name>Encode(x)`, which returns compact JSON text. For a struct called `point` they are `pointDecode` and `pointEncode`.

```pelago
import std.json

@derive(fromJson, toJson)
struct point { x: int, y: int }

@derive(fromJson, toJson)
struct server {
    host: string
    port: uint16
    tags: [string]
    tls: bool = false
    note: string?
    origin: point
}

fn main() {
    const text = "{\"host\": \"a\", \"port\": 80, \"tags\": [\"x\"], \"origin\": {\"x\": 1, \"y\": -2}, \"extra\": 1}"
    switch serverDecode(text) {
        case ok(s):
            print("#(s.host):#(s.port) tls=#(s.tls) note=#(s.note) origin=#(s.origin.x),#(s.origin.y)")
            print(serverEncode(s))
        case err(e): print("error #e")
    }
    switch serverDecode("{\"host\": \"a\", \"port\": 70000, \"tags\": [], \"origin\": {\"x\": 1, \"y\": 2}}") {
        case ok(_): print("unexpected")
        case err(e): print("error #e")
    }
}
```

```text
a:80 tls=false note=none origin=1,-2
{"host":"a","port":80,"tags":["x"],"tls":false,"note":null,"origin":{"x":1,"y":-2}}
error 1:23: $.port: 70000 does not fit in uint16 (0 to 65535)
```

The rules:

- Numbers are exact. An integer field reads an integer and stops with an error when the number does not fit the type, so a `uint16` never wraps.
- A field with a default may be missing. An optional field (`T?`) may be missing or `null`. An unknown field in the input is ignored.
- Lists, nested structs, tuples and fixed-size arrays work as fields. A [braid](../guide/braids.mdx) is one flat array.
- An enum with no payloads is a string (`"blue"`). A case with a payload is an object with one key, the case name: `{"circle": {"radius": 2}}`.
- An error says where: line and column in the text, then the path in the value, such as `$.tags[1]: expected text, found an integer` or `$.origin: missing field "y"`.
- What `toJson` writes, `fromJson` reads back to the same value.

Not available yet: renaming fields, a strict mode that rejects unknown fields, and map fields in the encoder.
