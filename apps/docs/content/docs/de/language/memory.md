---
title: "Speicher"
description: "Speicherlayout und Ergänzungen zum Besitz."
---

Zwei Fragen zum Speicher, die die früheren Seiten offengelassen haben: Array von Structs gegenüber Struct von
Arrays sowie lineare Typen.

## 1. Wo wir stehen [#1-where-we-are]

Werte haben einen Besitzer. Ein `sink`-Parameter oder ein `move` nimmt einen Wert weg, `deinit` läuft, wenn ein
Wert den Gültigkeitsbereich verlässt, und ein verschobener Wert kann nicht mehr verwendet werden. In der
Typentheorie heißt das **affin**: Ein Wert darf höchstens einmal verwendet werden, und er darf auch verworfen
werden.

## 2. AoS und SoA [#2-aos-and-soa]

- **AoS** (array of structs, Array von Structs): Die Felder jedes Elements liegen beieinander. So legt C ein
  `point[]` an, und genau das ist `[point]` in dieser Sprache. Es ist das richtige Layout, wenn man ganze
  Elemente verwendet, und es entspricht C für die Interoperabilität.
- **SoA** (struct of arrays, Struct von Arrays): ein Array pro Feld. Es ist das richtige Layout, wenn eine
  Schleife nur ein Feld anfasst (alle `x`-Werte), weil die Daten dicht im Cache liegen und sich gut
  vektorisieren lassen.

**Vorschlag.** Standard ist AoS, weil es vorhersehbar und C-kompatibel ist. SoA ist optional als Sammlungstyp mit
derselben Schnittstelle:

```
var points: soa<point> = soa []
points.push!(point { x: 1.0, y: 2.0 })

points[0].x                  // reads through a view of element 0, same code as a list
points.x                     // the whole x column as a read-only [float]: a SIMD-friendly slice
for inout p of points { p.x += 1.0 }
```

Da Referenzen unter Wertsemantik temporär (zweiter Klasse) sind, ist `points[i]` immer eine Sicht, die nur für
eine Anweisung existiert. Das Layout dahinter kann sich also ändern, ohne dass sich Code ändert, der es benutzt.
Das ist ein echter Vorteil gegenüber Sprachen, in denen Elementreferenzen entkommen können. `soa<point, 8>` ist
die geblockte Variante (AoSoA), die je Block 8 Elemente für die Vektorbreite zusammenfasst.

Ein Compiler, der das Layout selbst wählt, bleibt auf der Liste »später«. Er braucht eine
Gesamtprogrammanalyse.

Das Tupel fester Größe `(A, B; N)` ist ein verschränktes Layout, die AoS-Variante gemischter Typen. `soa<T>` ist
sein Gegenstück, sodass beide zusammen beide Enden abdecken.

## 3. Lineare Typen [#3-linear-types]

Affine Typen lassen es zu, einen Wert stillschweigend zu verwerfen. **Lineare** Typen verbieten das: Ein Wert muss
genau einmal verbraucht werden. So werden »diese Datei muss geschlossen werden«, »diese Transaktion muss
bestätigt oder zurückgerollt werden« oder »diese Berechtigung muss zurückgegeben werden« zu Übersetzungsfehlern.
Rust hat keine linearen Typen (nur Warnungen). Austral und Hylo haben sie.

**Vorschlag.** Wir haben das fast schon. Ein optionaler Modifikator kommt hinzu:

```
linear struct transaction { ... }

fn commit(sink t: transaction) -> void ! db_error { ... }
fn rollback(sink t: transaction) { ... }

fn work() -> void ! db_error {
    const t = begin()?
    do_things(t)               // read-only use, fine
    t.commit!!()               // consumed. Forgetting this is a compile error.
}
```

- Ein linearer Wert muss auf jedem Pfad verbraucht werden, auch bei frühen Rückgaben und `?`. Der Compiler nennt
  den Pfad, der ihn vergessen hat.
- Ein linearer Typ hat kein `deinit`, weil er nie implizit verworfen werden kann.
- `sink` bedeutet schon »nimmt den Wert weg«, und `!!` kennzeichnet schon den verbrauchenden Aufruf, also braucht
  es keine neue Syntax an der Aufrufstelle.
- Generischer Code braucht Sorgfalt: Typparameter dürfen standardmäßig verworfen werden, also kann `T` kein
  linearer Typ sein, es sei denn, die Schranke sagt es (`<T: linear>`). Diese Tür beim Entwurf des
  Typprüfers offenhalten; nirgends fest verdrahten, dass »jeder Typ verworfen werden kann«.

**Stufenplan.** Version 1 ist affin plus eine `@must_use`-Warnung. Echte `linear`-Typen kommen, sobald der
Typprüfer existiert, weil sie die Regeln für Generics ändern. Das Wort `linear` ist ab jetzt reserviert (weiches
Schlüsselwort).

---

## Umgesetzt: soa [#built-soa]

`soa<T>` für ein Struct `T` funktioniert wie oben beschrieben (siehe IR24 in `ir.md`): `soa []`, `soa [a, b]`, `push!`, `pop!`, `insert!`, `remove!`, `clear!`, `len`, `points[i]`, `points[i].x`, `points.x`, `for`- und `for inout`-Schleifen, `copy`, `==`, `print`. Die geblockte Form `soa<T, N>` wird akzeptiert und verhält sich gleich; ihr geblocktes Speicherlayout bleibt dem Backend überlassen.

## Temporäre Werte [#temporaries]

Ein Wert, der erzeugt, aber nie benannt wird (ein ignoriertes Funktionsergebnis, das Objekt hinter `make_dog("a").name`, ein spontan gebautes Argument), wird am **Ende seiner Anweisung** zerstört, in umgekehrter Reihenfolge der Erzeugung. Übernimmt ihn etwas (eine Variable, ein Feld, ein `sink`-Parameter, `return`), zerstört ihn stattdessen später der neue Besitzer. Der Compiler führt diese Buchhaltung beim Erzeugen des Codes (das Hauptbuch, IR22); in geradlinigem Code entstehen keine Laufzeitkosten über das hinaus, was Variablen ohnehin zahlen.

## Entscheidungen aus Entwurf 1 [#decisions-from-draft-1]

- **M1** AoS ist das Standardlayout. `soa<T>` ist die optionale Sammlung, mit `soa<T, 8>` als geblockter Variante.
- **M2** Spaltenzugriff (`points.x`, ein schreibgeschütztes `[float]`) ist dabei.
- **M3** Vom Compiler gewählte Layouts bleiben eine spätere Optimierung.
- **M4** `linear` ist ein optionaler Modifikator, eingeplant nach dem Typprüfer. Das Wort ist ab jetzt als weiches Schlüsselwort reserviert.
