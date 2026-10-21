---
title: "Grundlagen"
description: "Variablen, Konstanten und die Grundtypen."
---

So geschrieben, wie eine erste Python-Lektion verlaufen würde, eine Idee nach der anderen. Die Syntax ist
ein Entwurf, auf den man reagieren kann, keine endgültige Entscheidung.

**Bisher entschieden:** `fn` für Funktionen, `var` und `const`, kleingeschriebene Typnamen,
Ganzzahlen mit fester Größe von 8 bis 64 Bit, Generics mit `<T>`, Zeilenumbrüche beenden Anweisungen.

## 1. Eine Variable ist ein Name für einen Wert [#1-a-variable-is-a-name-for-a-value]

```
var score = 10
const name = "Dennis"
```

- `var` erzeugt eine Variable, die Sie später ändern können.
- `const` erzeugt eine, die Sie nicht ändern können. Wegen der Wertsemantik heißt „nicht änderbar“ wirklich
  nicht änderbar: Auch nichts, was über diesen Namen erreichbar ist, kann sich ändern.
- Der Name steht zuerst. Ein Typ wird nicht geschrieben, weil der Compiler ihn selbst ableitet.

## 2. Eine Variable ändern [#2-changing-a-variable]

```
var score = 10
score = 15          // fine
score += 5          // score is now 20

const pi = 3.14
pi = 3.2            // error: pi is const
```

## 3. Typen [#3-types]

Jeder Wert hat einen Typ, und eine Variable behält ihren Typ für immer. Das ist der große
Unterschied zu Python.

```
var score = 10
score = "ten"       // error: score is an int, "ten" is a string
```

| Typ | Enthält | Beispiel |
|---|---|---|
| `int` | ganze Zahlen | `42`, `-7` |
| `float` | Dezimalzahlen | `3.14` |
| `bool` | wahr oder falsch | `true` |
| `char` | ein Zeichen | `'a'` |
| `string` | Text | `"hello"` |

Genaue Größen, wenn Sie auf den Speicher achten:

| Mit Vorzeichen | Ohne Vorzeichen | Bereich des Typs mit Vorzeichen |
|---|---|---|
| `int8` | `uint8` | -128 to 127 |
| `int16` | `uint16` | etwa -32 Tausend bis 32 Tausend |
| `int32` | `uint32` | etwa -2,1 Milliarden bis 2,1 Milliarden |
| `int64` | `uint64` | etwa -9,2 Trillionen bis 9,2 Trillionen |

und `float32`, `float64` für Dezimalzahlen.

## 4. Den Typ selbst schreiben [#4-writing-the-type-yourself]

Der Typ steht nach dem Namen, wie in TS. Sie brauchen ihn nur, wenn der Compiler ihn nicht
ableiten kann oder wenn Sie ausdrücklich sein wollen.

```
var score: int = 10
const ratio: float = 0.5
var small: int8 = 100
var count: int            // error: a variable must be given a value
```

Eine Variable muss bei ihrer Erzeugung immer einen Wert bekommen. Es gibt keine
nicht initialisierten Variablen und kein null, wodurch eine ganze Klasse von Fehlern entfällt.

## 5. Ausgeben und Kommentare [#5-printing-and-comments]

```
print("Hello")
print(score)
/// this is a comment
```

## 6. Zwischen Typen umwandeln (Vorschlag, eigene Lösung) [#6-converting-between-types-proposal-custom]

Umwandlungen werden immer ausdrücklich geschrieben, nie stillschweigend. Vorschlag: ein einfaches Wort, `to`.

```
const whole = 7
const decimal = whole to float      // 7.0
const text = whole to string        // "7"
```

Der Compiler erlaubt `to` nur, wenn nichts verloren gehen kann. Umwandlungen, die Informationen
verlieren oder fehlschlagen können, brauchen eine andere, sichtbare Schreibweise. Das klären wir,
wenn wir bei den Fehlern ankommen.

## 7. Zeichenketten mit Werten darin (entschieden: unsere eigene `#`-Markierung) [#7-strings-with-values-inside-decided-our-own--marker]

Ein `#`, gefolgt von einem Namen, setzt diesen Wert in den Text ein. Für alles, was größer ist
als ein Name, setzen Sie Klammern.

```
print("Score: #score")              // Score: 10
print("Next: #(score + 1)")         // Next: 11
print("A literal hash: \#")         // A literal hash: #
```

Der Ausdruck wird beim Kompilieren des Programms geprüft, ein Fehler ist also ein Fehler, bevor das
Programm läuft. Formatsteuerung (Dezimalstellen, Breite), mehrzeilige Zeichenketten und rohe
Zeichenketten kommen später und ändern diese Markierung nicht.

---

## Was bereits unser Eigenes ist [#what-is-already-our-own]

Bei der Syntax ist es am billigsten, anders zu sein; die Liste unten handelt daher vor allem davon,
was die Sprache *tut*. Alles hier ist eine bewusste Entscheidung, keine Kopie.

- Eine Sprache, die wie TS aussieht, aber **ohne GC und ohne gespeicherte Referenzen**, nur mit Wertsemantik.
- **`inout` wird an der Aufrufstelle wiederholt**, damit Sie jede Änderung dort sehen, wo sie passiert.
- **Ein `const`, das wirklich unveränderlich ist**, bis ganz nach unten.
- **Kein null.** Abwesenheit ist ein Typ (`option<T>`), nie eine Überraschung.
- **Umwandlungen als `to` geschrieben**, und nur wenn nichts verloren gehen kann (Vorschlag).
- **Zeichenketten, die mit `#` interpolieren**, eine Markierung, die wir sonst nirgends gesehen haben.
- **Ein einziges `switch`/`case`, das zugleich Mustervergleich ist.**
- **Token-Effizienz als Entwurfsziel**, gemessen an echten Tokenizern.

## Entscheidungen aus Entwurf 2 [#decisions-from-draft-2]

- **[B1]** Der Compiler akzeptiert jeden Benennungsstil. Die Standardbibliothek und der Formatierer wählen einen.
- **[B2]** `int` ist immer genau 64 Bit breit.
- **[B3]** Typnamen sind kleingeschrieben. (Offen: auch Ihre eigenen Typen?)
- **[B4]** Umwandlungen werden `x to float` geschrieben.

- **[B5]** Die Zeichenketten-Interpolation verwendet `#name` und `#(Ausdruck)`.
- **[B6]** Für eigene Typen sind sowohl klein- als auch großgeschriebene Namen erlaubt. Der Compiler
  akzeptiert beides, wie bei Variablennamen (B1). Der Formatierer und die Standardbibliothek verwenden einen Großbuchstaben
  für selbst definierte Typen, damit sie auffallen. Ein Typ und ein Wert im selben Gültigkeitsbereich dürfen nicht denselben Namen tragen.

## Noch offen [#still-open]

**[B7] Das Schlüsselwort `let`.** Derzeit reserviert und ungenutzt. Aussichtsreichster Kandidat für später:
das schreibgeschützte Mitglied des Zugriffsmodus-Trios (`let` / `inout` / `sink`), möglicherweise optional,
weil es der stille Standard ist. Wo das Trio auftauchen könnte: Funktionsparameter
(einschließlich `self`), Schleifenvariablen (`for inout x in xs`, um Elemente an Ort und Stelle zu ändern),
Musterbindungen in `switch` und Closure-Captures. Wird entschieden, wenn wir bei den Funktionen ankommen.
