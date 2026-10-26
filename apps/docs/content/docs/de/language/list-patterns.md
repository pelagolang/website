---
title: "Listenmuster"
description: "Abgleich nach der Form einer Liste."
---

Muster, die in eine Liste, ein Array oder einen Slice hineinsehen. Sie fügen sich in alles aus `switch.md` ein:
`switch`-Zweige, `is` in Bedingungen, `guard ... else`, Wächter mit `if`, Alternativen und `name is pattern`.

## 1. Die Formen [#1-the-shapes]

```
switch xs {
    case []:                       "empty"
    case [x]:                      "one: #x"
    case [a, b]:                   "two: #a and #b"
    case [first, ...rest]:         "#first, then #(rest.len()) more"
}
```

| Muster | Passt auf |
|---|---|
| `[]` | eine Liste ohne Elemente |
| `[a, b]` | genau zwei Elemente, gebunden an `a` und `b` |
| `[a, ...rest]` | eines oder mehrere; `rest` ist alles nach `a` (möglicherweise leer) |
| `[...init, last]` | eines oder mehrere; `init` ist alles vor `last` |
| `[first, ...mid, last]` | zwei oder mehr, die Mitte ist an `mid` gebunden |
| `[first, ...]` | eines oder mehrere; der Rest wird ignoriert (ein nacktes `...`) |
| `[0, x]`, `[.circle(r), ...]` | Elemente können beliebige Muster sein: Literale, Bereiche, Enum-Fälle, verschachtelte Listen |

- **Der Rest-Marker ist `...`**, dasselbe Symbol wie der Spread in `[0, ...xs, 99]`: In einem Ausdruck verteilt es
  Elemente nach außen, in einem Muster sammelt es Elemente nach innen. Struct-Muster behalten `..` für »die
  übrigen Felder ignorieren«; beide unterscheiden sich, weil der Rest einer Liste eine Länge und meist einen
  Namen hat.
- Höchstens ein Rest-Marker pro Muster.
- Funktioniert mit `[T]`, `[T; N]` und Slice-Sichten. Bei einem Array fester Größe ist die Länge bekannt, also
  passt `[a, b]` auf ein `[int; 2]` immer, und der Compiler weiß das.

## 2. Der Rest ist eine Sicht [#2-the-rest-is-a-view]

`rest` ist eine **Slice-Sicht** (collections.md, Abschnitt 2), keine neue Liste. Sie kostet also nichts in der
Erzeugung (ein Zeiger und eine Länge) und lebt wie jede Sicht nur so lange wie der Zweig; sie kann weder
gespeichert noch zurückgegeben werden. Um sie zu behalten: `copy rest`.

```
fn sum(xs: [int]) -> int {
    switch xs {
        case []:             0
        case [h, ...t]:      h + sum(t)          // t is a view; passing it down is fine
    }
}

fn count(xs: [int], acc: int) -> int {
    switch xs {
        case []:             acc
        case [_, ...t]:      become count(t, acc + 1)    // guaranteed tail call
    }
}
```

## 3. Zugriffsmodi [#3-access-modes]

Modi funktionieren wie überall an Bindungen. Der Modus steht vor der Bindung, für die er gilt:

```
switch inout xs {
    case [inout first, ...inout rest]:
        first += 1                  // changes xs[0] in place
        rest.reverse!()             // changes the rest in place
    case []: ...
}
```

- Standard ist schreibgeschützt (`let`). `inout` verlangt, dass auch das geprüfte Objekt `inout` ist.
- **`sink` ist bei Elementen nicht erlaubt**: Ein Element aus einer Liste zu nehmen, würde ein Loch hinterlassen.
  Um eine ganze Liste zu zerlegen, nutzt man Methoden im Stil von `pop`/`remove` oder ein künftiges
  `sink`-Listenmuster (Abschnitt 7).

## 4. Wo sie funktionieren [#4-where-they-work]

```
if args is [cmd, ...rest] { run(cmd, rest) }

guard args is [path] else { return err(usage()) }       // path is usable after the guard

switch line.split(" ").to_list() {
    case ["add", name]:            add!(name)
    case ["remove", name]:         remove!(name)
    case ["list"]:                 list()
    case ["rename", old, new]:     rename!(old, new)
    case [cmd, ...]:               print("unknown command #cmd")
    case []:                       print("empty line")
}
```

- **Vollständigkeit:** Der Compiler verfolgt Längen. `[]` plus `[_, ...]` ist vollständig; ebenso `[]`, `[_]`,
  `[_, _, ...]`. Fehlende Längen werden im Fehler genannt.
- **Deklarationen dürfen nicht fehlschlagen.** `const [a, b] = xs` wird nur akzeptiert, wenn `xs` ein Array fester
  Größe mit dieser Länge ist (`[int; 2]`). Für eine Liste nimmt man `guard xs is [a, b] else { ... }` oder
  `if xs is`.
- Alternativen funktionieren, wenn sie dieselben Namen binden: `case [x], [x, _]:`.
- `name is pattern` funktioniert: `case whole is [first, ...]:` behält die Liste und ihr erstes Element.
- **Text unterstützt beides**, Literalfälle und Listenmuster (LP7). Über einem `string` oder `str` sind die
  Elemente `char`s und der Rest ist eine `str`-Sicht: `case ['a', ...rest]:` oder `case [c, ...]:`. Literale
  bleiben der einfache Weg, einen ganzen Wert zu testen (`case "add":`). Längen werden in Zeichen gezählt, ein
  Längentest durchläuft den Text also einmal; der Abgleich von vorn dekodiert nie mehr, als das Muster braucht.

## 5. Die Builder-Frage (B5) abschließen [#5-closing-the-builder-question-b5]

Builder brauchten eine Möglichkeit, nicht passende Elemente zu überspringen. `is` bindet bereits Namen, also ist
keine neue Syntax nötig. Ein mit `is` geschriebener Filter macht seine Namen für das Ergebnis verfügbar:

```
const radii = [s of shapes if s is .circle(r) ~> r]                  // only circles
const firsts = [x of rows if x is [first, ...] ~> first]             // rows that are not empty
const values = [o of opts if o is some(v) ~> v * 2]                  // some options only
```

(Der Present-Fall einer `option` ist `some(v)`; siehe die Entscheidungen unten.)

## 6. Warum nicht andere Entwürfe [#6-why-not-other-designs]

- **`[first, ..rest]` (Rust):** `..` bedeutet in Struct-Mustern bereits »andere Felder ignorieren«, und `...` ist
  der Spread, den jeder aus Listen kennt.
- **`first :: rest` (ML / Haskell):** Cons-Muster setzen verkettete Listen voraus. Unsere sind Arrays, bei denen
  »der Rest« eine Sicht ist und der Mittel- und Endfall (`[...init, last]`) so billig sind wie der Anfang.
- **Ein eigenes `match` für Listen:** Ein `switch` für alles war die Entscheidung.

## 7. Für später offen (nach dem Prüfer neu bewerten) [#7-left-for-later-revisit-after-the-checker-exists]

- **Für spätere Versionen merken: `sink` in Listenmustern.** Verbrauchende Listenmuster (`switch sink xs { case [a, ...rest]: ... }`, bei denen `a` und `rest`
  besessen werden). Möglich, sobald `sink` auf einer besitzenden Liste die Teile sicher zurückgeben kann; dafür wird zuerst der Prüfer gebraucht.
- **Muster auf Maps und Sets.** Nachschlagen bleibt `map.get(k)` mit einer `option` als Ergebnis, die normal abgeglichen wird.
- **Muster auf Iteratoren**, die nicht gespeichert werden können und keine Länge haben.

## Entscheidungen aus Entwurf 1 [#decisions-from-draft-1]

- **LP1** `...` ist der Rest-Marker (nackt zum Ignorieren, `...name` zum Binden), höchstens einer pro Muster.
- **LP2** `rest` ist eine temporäre Slice-Sicht; `copy rest` erzeugt eine besessene Liste.
- **LP3** Zugriffsmodi stehen vor der Bindung: `[inout first, ...inout rest]`.
- **LP4** `sink` bei Elementen von Listenmustern ist in v1 nicht erlaubt. Bleibt auf der Liste der Punkte zur Neubewertung (Abschnitt 7).
- **LP5** Arrays fester Größe können in einfachen Deklarationen zerlegt werden; Listen nutzen `guard ... is` oder `if ... is`.
- **LP6** (a) `if x is pattern` in einem Builder bringt seine Namen ins Ergebnis (schließt B5). (b) Der Present-Fall einer
  `option` wird als `some(v)` abgeglichen, ein reines Musterwort wie `ok` und `err`; Werte werden weiterhin nackt geschrieben.
- **LP7** Text bekommt beides: Literalfälle und Listenmuster über `char`s mit einem `str`-Rest.
- **LP8** Der Rest-Marker darf in der Mitte stehen.
