---
title: "Motifs de liste"
description: "Filtrage selon la forme d'une liste."
---

Des motifs qui regardent à l'intérieur d'une liste, d'un tableau ou d'une tranche. Ils s'intègrent à tout ce qui
figure dans `switch.md` : les branches de `switch`, `is` dans les conditions, `guard ... else`, les gardes avec
`if`, les alternatives et `name is pattern`.

## 1. Les formes [#1-the-shapes]

```
switch xs {
    case []:                       "empty"
    case [x]:                      "one: #x"
    case [a, b]:                   "two: #a and #b"
    case [first, ...rest]:         "#first, then #(rest.len()) more"
}
```

| Motif | Correspond à |
|---|---|
| `[]` | une liste sans élément |
| `[a, b]` | exactement deux éléments, liés à `a` et `b` |
| `[a, ...rest]` | un ou plusieurs ; `rest` est tout ce qui suit `a` (éventuellement vide) |
| `[...init, last]` | un ou plusieurs ; `init` est tout ce qui précède `last` |
| `[first, ...mid, last]` | deux ou plus, le milieu étant lié à `mid` |
| `[first, ...]` | un ou plusieurs ; le reste est ignoré (un `...` nu) |
| `[0, x]`, `[.circle(r), ...]` | les éléments peuvent être n'importe quel motif : littéraux, intervalles, cas d'enum, listes imbriquées |

- **Le marqueur de reste est `...`**, le même symbole que l'étalement (spread) dans `[0, ...xs, 99]` : dans une
  expression il étale des éléments vers l'extérieur, dans un motif il les rassemble vers l'intérieur. Les motifs
  de struct gardent `..` pour « ignorer les autres champs » ; les deux diffèrent parce que le reste d'une liste a
  une longueur et porte généralement un nom.
- Au plus un marqueur de reste par motif.
- Fonctionne sur `[T]`, `[T; N]` et les vues de tranche. Avec un tableau de taille fixe, la longueur est connue :
  `[a, b]` sur un `[int; 2]` correspond donc toujours, et le compilateur le sait.

## 2. Le reste est une vue [#2-the-rest-is-a-view]

`rest` est une **vue de tranche** (collections.md, section 2), pas une nouvelle liste. Elle ne coûte donc rien à
créer (un pointeur et une longueur) et, comme toute vue, elle dure aussi longtemps que la branche et ne peut être
ni stockée ni renvoyée. Pour la conserver : `copy rest`.

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

## 3. Modes d'accès [#3-access-modes]

Les modes s'appliquent aux liaisons comme partout ailleurs. Le mode se place devant la liaison à laquelle il
s'applique :

```
switch inout xs {
    case [inout first, ...inout rest]:
        first += 1                  // changes xs[0] in place
        rest.reverse!()             // changes the rest in place
    case []: ...
}
```

- Par défaut, c'est en lecture seule (`let`). `inout` exige que le scrutin soit lui aussi `inout`.
- **`sink` n'est pas autorisé sur les éléments** : retirer un élément d'une liste laisserait un trou. Pour
  démonter une liste entière, utilisez des méthodes de type `pop`/`remove`, ou un futur motif de liste `sink`
  (section 7).

## 4. Où ils fonctionnent [#4-where-they-work]

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

- **Exhaustivité :** le compilateur suit les longueurs. `[]` plus `[_, ...]` est complet ; `[]`, `[_]`,
  `[_, _, ...]` l'est aussi. Les longueurs manquantes sont nommées dans l'erreur.
- **Les déclarations ne doivent pas échouer.** `const [a, b] = xs` n'est accepté que si `xs` est un tableau de
  taille fixe de cette longueur (`[int; 2]`). Pour une liste, utilisez `guard xs is [a, b] else { ... }` ou
  `if xs is`.
- Les alternatives fonctionnent quand elles lient les mêmes noms : `case [x], [x, _]:`.
- `name is pattern` fonctionne : `case whole is [first, ...]:` conserve la liste et son premier élément.
- **Le texte prend en charge les deux** : cas littéraux et motifs de liste (LP7). Sur un `string` ou un `str`, les
  éléments sont des `char` et le reste est une vue `str` : `case ['a', ...rest]:` ou `case [c, ...]:`. Les
  littéraux restent la façon simple de tester une valeur entière (`case "add":`). Les longueurs se comptent en
  caractères ; tester une longueur parcourt donc le texte une fois ; le filtrage depuis le début ne décode jamais
  plus que ce dont le motif a besoin.

## 5. Clore la question des constructeurs (B5) [#5-closing-the-builder-question-b5]

Les constructeurs avaient besoin d'un moyen d'ignorer les éléments qui ne correspondent pas. `is` lie déjà des
noms, donc aucune nouvelle syntaxe n'est nécessaire. Un filtre écrit avec `is` rend ses noms disponibles pour le
résultat :

```
const radii = [s of shapes if s is .circle(r) ~> r]                  // only circles
const firsts = [x of rows if x is [first, ...] ~> first]             // rows that are not empty
const values = [o of opts if o is some(v) ~> v * 2]                  // some options only
```

(Le cas présent d'une `option` est `some(v)` ; voir les décisions plus bas.)

## 6. Pourquoi pas d'autres conceptions [#6-why-not-other-designs]

- **`[first, ..rest]` (Rust) :** `..` signifie déjà « ignorer les autres champs » dans les motifs de struct, et
  `...` est l'étalement que tout le monde voit dans les listes.
- **`first :: rest` (ML / Haskell) :** les motifs cons supposent des listes chaînées. Les nôtres sont des
  tableaux, où « le reste » est une vue, et les cas du milieu et de la fin (`[...init, last]`) coûtent aussi peu
  que celui du début.
- **Un `match` séparé pour les listes :** un seul `switch` pour tout était la décision.

## 7. Laissé pour plus tard (à revoir quand le vérificateur existera) [#7-left-for-later-revisit-after-the-checker-exists]

- **À retenir pour les versions futures : `sink` dans les motifs de liste.** Des motifs de liste consommants (`switch sink xs { case [a, ...rest]: ... }`, où `a` et `rest` deviennent
  possédés). Possible une fois que `sink` sur une liste propriétaire pourra rendre les morceaux en toute sécurité ; il faut d'abord le vérificateur.
- **Motifs sur les maps et les ensembles.** Les recherches restent `map.get(k)`, qui renvoie une `option`, filtrée normalement.
- **Motifs sur les itérateurs**, qui ne peuvent pas être stockés et n'ont pas de longueur.

## Décisions du brouillon 1 [#decisions-from-draft-1]

- **LP1** `...` est le marqueur de reste (nu pour ignorer, `...name` pour lier), au plus un par motif.
- **LP2** `rest` est une vue de tranche temporaire ; `copy rest` produit une liste possédée.
- **LP3** Les modes d'accès précèdent la liaison : `[inout first, ...inout rest]`.
- **LP4** `sink` sur les éléments d'un motif de liste n'est pas autorisé en v1. Conservé dans la liste des points à revoir (section 7).
- **LP5** Les tableaux de taille fixe peuvent être déstructurés dans de simples déclarations ; les listes utilisent `guard ... is` ou `if ... is`.
- **LP6** (a) `if x is pattern` dans un constructeur apporte ses noms au résultat (clôt B5). (b) Le cas présent d'une
  `option` se filtre par `some(v)`, un mot réservé aux motifs comme `ok` et `err` ; les valeurs s'écrivent toujours telles quelles.
- **LP7** Le texte prend en charge les deux : cas littéraux et motifs de liste sur des `char` avec un reste `str`.
- **LP8** Le marqueur de reste peut se placer au milieu.
