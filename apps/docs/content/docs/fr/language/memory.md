---
title: "Mémoire"
description: "Disposition en mémoire et compléments sur la possession."
---

Deux questions sur la mémoire que les pages précédentes ont laissées ouvertes : tableau de structs contre
struct de tableaux, et types linéaires.

## 1. Où en sommes-nous [#1-where-we-are]

Les valeurs ont un propriétaire. Un paramètre `sink` ou un `move` retire une valeur à son propriétaire, `deinit`
s'exécute quand une valeur sort de la portée, et une valeur déplacée ne peut plus être utilisée. En théorie des
types, c'est **affine** : une valeur peut être utilisée au plus une fois, et elle peut aussi être abandonnée.

## 2. AoS et SoA [#2-aos-and-soa]

- **AoS** (array of structs, tableau de structs) : les champs de chaque élément sont côte à côte. C'est ainsi que
  C dispose un `point[]`, et c'est ce que désigne `[point]` dans ce langage. C'est la bonne disposition quand on
  utilise des éléments entiers, et elle correspond à C pour l'interopérabilité.
- **SoA** (struct of arrays, struct de tableaux) : un tableau par champ. C'est la bonne disposition quand une
  boucle ne touche qu'un champ (toutes les valeurs `x`), car les données sont denses dans le cache et se
  vectorisent bien.

**Proposition.** AoS par défaut, car c'est prévisible et compatible avec C. SoA est optionnel, sous la forme d'un
type de collection avec la même interface :

```
var points: soa<point> = soa []
points.push!(point { x: 1.0, y: 2.0 })

points[0].x                  // reads through a view of element 0, same code as a list
points.x                     // the whole x column as a read-only [float]: a SIMD-friendly slice
for inout p of points { p.x += 1.0 }
```

Comme les références sont temporaires (de seconde classe) avec la sémantique de valeur, `points[i]` est toujours
une vue qui n'existe que le temps d'une instruction ; la disposition sous-jacente peut donc changer sans modifier
le code qui l'utilise. C'est un vrai avantage par rapport aux langages où les références vers des éléments peuvent
s'échapper. `soa<point, 8>` est la variante par blocs (AoSoA), qui regroupe 8 éléments par bloc selon la largeur
des vecteurs.

Un compilateur qui choisirait la disposition tout seul reste dans la liste « plus tard ». Il faut une analyse du
programme entier.

Le tuple de taille fixe `(A, B; N)` est une disposition entrelacée, la version AoS des types mixtes. `soa<T>` est
son contraire, et les deux couvrent donc les deux extrêmes.

## 3. Types linéaires [#3-linear-types]

Les types affines permettent d'abandonner une valeur en silence. Les types **linéaires** l'interdisent : une
valeur doit être consommée exactement une fois. C'est ainsi que « ce fichier doit être fermé », « cette
transaction doit être validée ou annulée » ou « cette autorisation doit être rendue » deviennent des erreurs de
compilation. Rust n'a pas de types linéaires (seulement des avertissements). Austral et Hylo en ont.

**Proposition.** Nous y sommes presque. Ajouter un modificateur optionnel :

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

- Une valeur linéaire doit être consommée sur tous les chemins, y compris les retours anticipés et `?`. Le
  compilateur indique quel chemin l'a oubliée.
- Un type linéaire n'a pas de `deinit`, car il ne peut jamais être abandonné implicitement.
- `sink` signifie déjà « prend la valeur », et `!!` marque déjà l'appel qui consomme, donc aucune nouvelle syntaxe
  au site d'appel.
- Le code générique demande de l'attention : par défaut, les paramètres de type peuvent être abandonnés, donc `T`
  ne peut pas être un type linéaire sauf si la borne le dit (`<T: linear>`). Garder cette porte ouverte lors de la
  conception du vérificateur de types ; ne figer nulle part que « tout type peut être abandonné ».

**Étapes.** La version 1 est affine plus un avertissement `@must_use`. Les vrais types `linear` arrivent une fois
le vérificateur de types en place, car ils changent les règles des génériques. Le mot `linear` est réservé dès
maintenant (mot-clé souple).

---

## Réalisé : soa [#built-soa]

`soa<T>` pour un struct `T` fonctionne comme décrit ci-dessus (voir IR24 dans `ir.md`) : `soa []`, `soa [a, b]`, `push!`, `pop!`, `insert!`, `remove!`, `clear!`, `len`, `points[i]`, `points[i].x`, `points.x`, les boucles `for` et `for inout`, `copy`, `==`, `print`. La forme par blocs `soa<T, N>` est acceptée et se comporte de la même façon ; sa disposition mémoire par blocs est laissée au backend.

## Temporaires [#temporaries]

Une valeur qui est créée mais jamais nommée (un résultat de fonction que l'on ignore, l'objet derrière `make_dog("a").name`, un argument construit à la volée) est détruite à la **fin de son instruction**, dans l'ordre inverse de sa création. Si quelque chose la prend (une variable, un champ, un paramètre `sink`, `return`), c'est le nouveau propriétaire qui la détruit plus tard. Le compilateur tient cette comptabilité pendant qu'il génère le code (le registre, IR22) ; il n'y a aucun coût à l'exécution dans le code séquentiel, au-delà de ce que paient déjà les variables.

## Décisions du brouillon 1 [#decisions-from-draft-1]

- **M1** AoS est la disposition par défaut. `soa<T>` est la collection optionnelle, avec `soa<T, 8>` comme variante par blocs.
- **M2** L'accès par colonne (`points.x`, un `[float]` en lecture seule) est retenu.
- **M3** Les dispositions choisies par le compilateur restent une optimisation ultérieure.
- **M4** `linear` est un modificateur optionnel, planifié après le vérificateur de types. Le mot est réservé dès maintenant comme mot-clé souple.
