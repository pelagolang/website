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
