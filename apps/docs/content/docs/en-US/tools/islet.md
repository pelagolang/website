---
title: Islet
description: "The package manager for Pelago: a shared store, a lock file, signed packages and a transparency log."
---

Islet is Pelago's package manager. Its command is `islet`, and it lives in its own repository, [pelagolang/islet](https://github.com/pelagolang/islet). Pelago has no general-purpose linker, so a package is source code that the compiler reads next to yours. `pelago` never runs Islet: Islet writes a map of the installed packages, and `pelago check`, `run` and `build` read it.

Islet is young. There is no public registry yet, and packages come from a folder you point it at (`--index <dir>` or `ISLET_INDEX`) or from a registry folder (see [Registries](#registries)).

## The pieces

| Piece | What it does |
| --- | --- |
| The store | Every package version is kept once, named by its BLAKE3 hash, and projects link into it (a junction on Windows). It is `~/.islet`, or `.islet` at the drive root on Windows; `ISLET_STORE` changes it. |
| `islet.yaml` | Your package's name, version and dependencies. Another file keeps its own keys: `pelago.yaml` stays the compiler's file. |
| `islet.lock` | What the whole project resolved to, with each package's hash and signer. Commit it. |
| `deps/` | Where `islet install` links the locked packages, with `deps/map.yaml` for the compiler. |
| `monorepo.yaml` | For a workspace: one shared list of dependency versions that members can use with `from: monorepo`. |

All of these are written in the same strict block-style subset of YAML as [`pelago.yaml`](./pelago-yaml.md).

```yaml
format: 1

package:
  name: demo
  version: 0.1.0
  license: MIT OR Apache-2.0

dependencies:
  json: 1.2.0
  json/v2:
    version: 2.0.1
```

A second major version of a package is part of its name: `json/v2`. In Pelago code it is a module below the first one: `import json.decode` reads the module `decode` of the package `json`, and `import json.v2.decode` reads it from the second major.

Versions are chosen by minimal version selection: the lowest version that satisfies every requirement. Two packages may use different versions of a third in one build; each version is loaded once.

## Everyday commands

| Command | Effect |
| --- | --- |
| `islet add <dir> <name>[/vN][@version]` | Add or change a dependency in `islet.yaml`, keeping comments and order. |
| `islet remove <dir> <name>[/vN]` | Remove one. |
| `islet lock <dir>` | Resolve the project and write `islet.lock`. `--check` fails if the file on disk is not what resolving gives. |
| `islet install <dir>` | Store and link every locked package under `deps/` and write `deps/map.yaml`. |
| `islet tree <dir>` | Print each member's dependencies from the lock. |
| `islet check <path>` | Check `islet.yaml`, `monorepo.yaml` and `islet.lock`, with line numbers. |
| `islet hash <dir>` | Print the hash of a folder. Text files are hashed with line endings normalised to LF, so one package has one hash on every system. |

If `deps/` no longer matches `islet.lock`, the compiler refuses to build and tells you to run `islet install`.

## Signing

Every package is signed, and the signature covers a short statement: the package name, its version and the hash of its whole file tree. There is no archive to attack, because what is signed is what the store addresses and what the compiler reads.

- Keys are Ed25519. A key's identity is the BLAKE3 hash of its public key, written `key:<hex>`, so there is no name registry to trust or squat on.
- Private keys live in the operating system's key store (Keychain, Secret Service, or Windows DPAPI), with a key file as the fallback.
- The first time Islet sees a package it records the signer in `islet.lock`. A later release signed by a different key is refused until you run `islet trust`, the way a changed SSH host key is. A publisher can change keys with a rotation signed by both the old and the new key.

| Command | Effect |
| --- | --- |
| `islet key gen`, `key list`, `key show <id>` | Make and inspect signing keys. |
| `islet sign <dir> --key <id>` | Sign a package folder. |
| `islet verify <dir>` | Check the signatures of a package folder. |
| `islet trust <dir> <name> <key id>` | Pin a package to another signer by hand. |
| `islet rotate <name> --old <id> --new <id>` | The old key states that the new key now publishes the package; the new key co-signs. |
| `islet lock <dir> --require-signed` | Fail on a package nobody signed. |

Verification needs only the public key and the signature, so it works offline.

## Registries

A registry is a folder of static files that any web server or CDN can serve. Alongside the packages it holds an append-only transparency log: a Merkle tree of every release, with signed tree heads that independent witnesses co-sign. Nothing the registry says about itself is believed; a client trusts the log key and witnesses it was told about.

When you lock against a registry, Islet checks the signed head and the witnesses, checks that the log has only grown since it was last seen, and proves each locked package's release is in the log. It refuses a yanked release, a revoked key, two releases of one version, or a pin that disagrees with the log.

| Command | Effect |
| --- | --- |
| `islet registry add <dir> --log-key <id> [--witness <id>]... [--need n]` | Trust this registry on this machine. |
| `islet lock <dir> --registry <dir-or-address>` | Lock against a registry, folder or `http(s)://` address, checking every proof. |
| `islet install <dir> --registry <dir-or-address>` | Fetch and install the locked packages. |
| `islet registry check <dir>` | Check the head and log as a client would. |
| `islet registry init`, `publish`, `yank`, `revoke`, `cosign` | Run a registry: create it, add a signed release, withdraw a release, record a compromised key, or have a witness cosign a head. |
| `islet registry serve <dir> [--port n]` | Serve a registry folder read-only over HTTP. |

A key holder can ask for their own key to be revoked with a request signed by that key, and the registry operator can revoke too; clients treat both the same.

Not built yet: looking up yanks and revocations without reading the whole log, which a large registry will need.
