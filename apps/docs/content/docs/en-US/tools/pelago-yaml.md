---
title: pelago.yaml
description: The configuration file for Pelago tools.
---

`pelago.yaml` holds settings for the tools. The tool looks for the closest `pelago.yaml` in the folder of the file it is working on and in the folders above it, so one file at the root of a project covers everything below it.

The file is a strict, block-style subset of YAML, the same one Islet reads: `format: 1` comes first, then sections. Anchors, tags, flow style with content, tabs and duplicate keys are errors. Today it has one section, `fmt`:

```yaml
format: 1
fmt:
  indent: 4    # spaces per level, 1 to 8
  width: 100   # 20 to 400; reserved for line wrapping
```

| Key | Default | Meaning |
| --- | --- | --- |
| `indent` | `4` | Spaces per indentation level, from 1 to 8. |
| `width` | `100` | The line width, from 20 to 400. Reserved for line wrapping, which the formatter does not do yet. |

Unknown sections and keys are errors that name the line, so a typo does not silently do nothing:

```text
./pelago.yaml: 3:3: unknown key `indnt` in `fmt` (known: `indent`, `width`)
```

The formatter and the language server both read this file, so your editor and the command line agree.
