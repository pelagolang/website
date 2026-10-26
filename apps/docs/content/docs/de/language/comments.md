---
title: "Kommentare"
description: "Warum Pelago eine eigene Kommentarsyntax hat: ///, //~ und ihre Blockformen."
---

**Entscheidung (Eigentümer, 2026-10-20):** Option B, mit `//~` für Dokumentation. `/// text` ist der gewöhnliche Zeilenkommentar, `///* ... *///` der gewöhnliche Blockkommentar (verschachtelt sich), `//~ text` eine Dokumentationszeile, `//~* ... *~//` ein Dokumentationsblock (verschachtelt sich nicht). `//` und `/* */` sind Lexer-Fehler mit einem Hinweis; `////` ist einfach ein gewöhnlicher Kommentar (er beginnt mit `///`). Dokumentation hängt sich an das folgende Element; eine eigene Form auf Dateiebene gibt es nicht (ein Dokumentationskommentar vor nichts gehört zu nichts). Der Rest dieser Seite ist die Diskussion, die hierher geführt hat; die Schreibweise `//!`, die sie in Option B erwähnt, wurde zu `//~`.


## Wo wir stehen [#where-we-are]

Heute (`lexer.rs`, `keywords.md`, `lexer.md`): `// line`, `/* block */` (verschachtelt sich), `/// doc line`, `///* doc block *///` und `//// ...` als gewöhnlicher Kommentar (ein Banner aus Schrägstrichen ist also keine Dokumentation). Die Sicht des Eigentümers: `//` und `/* */` gibt es schon in C, Java, Rust und Go, sie sind also nicht unsere eigenen; `///` soll der gewöhnliche Zeilenkommentar sein und `///* ... *///` der mehrzeilige. `////` entfällt.

## Was eine Kommentarsyntax abdecken muss [#what-a-comment-syntax-has-to-cover]

1. Eine Notiz für die Leserin oder den Leser, bis zum Zeilenende.
2. Eine Notiz über mehrere Zeilen oder mitten in einer Zeile (`f(1, /* why */ 2)`).
3. Auskommentierter Code (ein Bereich, schnell an- und ausschaltbar).
4. Dokumentation des folgenden Elements (in der Hover-Anzeige zu sehen, von Werkzeugen genutzt).
5. Dokumentation der Datei oder des Moduls selbst (ein Kopf; nichts folgt darauf).
6. Markierungen für Werkzeuge (`TODO`, Formatierer aus/an, eine `#!`-Zeile am Anfang für Skripte).

Zwei praktische Tests für jede Wahl:

- **Umschalttest.** Editoren kommentieren eine Auswahl, indem sie ein festes Zeilenpräfix voranstellen und wieder entfernen. Das Präfix darf nicht der Anfang einer anderen Kommentarform sein, sonst reißt das Umschalten einer Dokumentationszeile die Hälfte ab (`/// doc` verliert `//` und wird zu `/ doc`). Das ist der Fehler, den die VS-Code-Erweiterung heute hat.
- **Kostentest.** Jede Form ist eine Lexer-Regel, eine Grammatikregel (TextMate, tree-sitter), ein Editor-Konfigurationseintrag und eine Zeile im Formatierer. Weniger Formen, weniger Abstimmungsaufwand.

## Optionen [#options]

**A. Die Schreibweise des Eigentümers, zwei Formen.** `/// text` ist der gewöhnliche Kommentar bis zum Zeilenende. `///* ... *///` ist der mehrzeilige Kommentar und zugleich der Dokumentationskommentar (eine Zeile oder viele). Kein `//`, kein `/* */`, kein `////`.
- Deckt 1 (Zeile), 2 (Block), 3 (viele `///`-Zeilen, schaltet sauber um), 4 und 5 (ein `///*`-Block vor einem Element oder am Dateianfang) ab.
- Bietet weder eine getrennte Dokumentationszeile noch einen Inline-Kommentar mitten in der Zeile, es sei denn, der Block wird dafür benutzt, und dann ist ein Blockkommentar ein Dokumentationskommentar: `f(1, ///* why */// 2)` zählte als Dokumentation, die zu nichts gehört.
- Umschalttest: Das Zeilenpräfix `///` ist der Anfang von `///*`, das Umschalten einer Zeile eines Dokumentationsblocks hat also dasselbe Problem mit der abgerissenen Hälfte, wobei Dokumentationsblöcke selten umgeschaltet werden.

**B. Die Schreibweise des Eigentümers, vier Formen, getrennt gehalten.** `/// text` gewöhnliche Zeile; `///* ... *///` gewöhnlicher Block (verschachtelt sich); `//! text` Dokumentationszeile; `//!* ... *!//` Dokumentationsblock. Eine Dokumentationsform beginnt nie mit dem gewöhnlichen Zeilenpräfix, daher besteht sie den Umschalttest. Ein einzelnes `//` ist kein Kommentar (ein Fehler, der sagt: »nimm `///`«).
- Deckt 1 bis 6 ab (`//!` am Dateianfang dokumentiert die Datei).
- Vier Formen; eine Regel mehr zu lernen als in Sprachen der C-Familie, aber jede ist eine einfache Variation der vorigen.

**C. Eine andere Familie, mit `#`.** `# text` gewöhnliche Zeile, `#* ... *#` Block, `## text` Dokumentationszeile, `#** ... **#` Dokumentationsblock. `#` ist heute außerhalb von Zeichenketten frei (es bedeutet nur innerhalb davon Interpolation).
- Kurz, aus Skriptsprachen vertraut und ohne Gemeinsamkeit mit C.
- Eine `#!`-Zeile am Anfang passt natürlich dazu. Kosten: `##` beginnt mit `#`, der Umschalttest scheitert also bei Dokumentationszeilen; die Interpolation `#name` in Zeichenketten liest sich anders als ein `#`-Kommentar.

## Empfehlung [#recommendation]

**B.** Sie behält deine `///` und `///*` genau als gewöhnliche Formen, behebt das Umschaltproblem durch den Entwurf, trennt Dokumentation von Notizen (ein auskommentierter Bereich ist also nie Dokumentation) und deckt jeden Fall der Liste ab. A ist die kleinste, macht aber Dokumentation und Blockkommentare zu einer Sache, wodurch der Inline-Fall keinen Platz hat.

## Fragen [#questions]

1. A, B oder C?
2. Verschachtelt sich `///* ... *///` (einen Bereich auskommentieren, der schon einen Block enthält)? Empfehlung: ja, wie `/* */` heute.
3. Ist ein einzelnes `//` ein Fehler (mit dem Hinweis, `///` zu schreiben) oder wird es ignoriert? Empfehlung: ein Fehler. Ein aus Gewohnheit übrig gebliebenes `//` wäre sonst stillschweigend Code.
4. Dokumentationsblöcke: In B ist `//!* ... *!//` der Dokumentationsblock. Akzeptable Schreibweise, oder lieber etwas anderes (`///**`)?
5. Hängen sich Dokumentationskommentare nur an das folgende Element, mit `//!` für das umgebende Modul oder die Datei? Empfehlung: ja.
6. Soll ein Banner wie `/////////////` als gewöhnlicher Kommentar erlaubt sein? In B ist er es schon (eine `///`-Zeile); keine zusätzliche Regel.
7. Lesen wir `//` und `/* */` noch eine Version lang weiter, mit einer Umschreibung durch `pelago fmt`, oder stellen wir sofort um? Empfehlung: sofort umstellen; es gibt noch keine Nutzer, nur unsere Beispiele.

## Was die Änderung berührt [#what-changing-it-touches]

`lexer.rs` (die `slash`-Regel, plus `#` bei C), `token.rs`, den Hervorheber, `keywords.md`, `lexer.md`, `basics.md`, `parser.md` (Dokumentationskommentare), jede `.pel`-Datei in `examples/`, `tree-sitter-pelago`, die TextMate-Grammatik sowie die Sprachkonfigurationen von VS Code und Zed. Eine einmalige Umschreibung der Beispiele lässt sich leicht per Skript erledigen.
