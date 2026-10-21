---
title: "Les bases"
description: "Variables, constantes et types de base."
---

Écrit comme le serait une première leçon de Python, une idée à la fois. La syntaxe est une
esquisse à laquelle réagir, pas une décision définitive.

**Décidé jusqu'ici :** `fn` pour les fonctions, `var` et `const`, des noms de types en minuscules,
des entiers de taille fixe de 8 à 64 bits, des génériques `<T>`, et les sauts de ligne terminent les instructions.

## 1. Une variable est un nom pour une valeur [#1-a-variable-is-a-name-for-a-value]

```
var score = 10
const name = "Dennis"
```

- `var` crée une variable que vous pouvez modifier plus tard.
- `const` en crée une que vous ne pouvez pas modifier. Grâce à la sémantique de valeur, « ne peut pas changer » veut
  vraiment dire ce que cela dit : rien d'accessible par ce nom ne peut changer non plus.
- Le nom vient en premier. Aucun type n'est écrit, car le compilateur le déduit.

## 2. Modifier une variable [#2-changing-a-variable]

```
var score = 10
score = 15          // fine
score += 5          // score is now 20

const pi = 3.14
pi = 3.2            // error: pi is const
```

## 3. Types [#3-types]

Chaque valeur a un type, et une variable garde son type pour toujours. C'est la grande
différence avec Python.

```
var score = 10
score = "ten"       // error: score is an int, "ten" is a string
```

| Type | Contient | Exemple |
|---|---|---|
| `int` | nombres entiers | `42`, `-7` |
| `float` | nombres décimaux | `3.14` |
| `bool` | vrai ou faux | `true` |
| `char` | un caractère | `'a'` |
| `string` | du texte | `"hello"` |

Tailles exactes, pour quand la mémoire compte :

| Signé | Non signé | Plage du type signé |
|---|---|---|
| `int8` | `uint8` | -128 to 127 |
| `int16` | `uint16` | environ -32 mille à 32 mille |
| `int32` | `uint32` | environ -2,1 milliards à 2,1 milliards |
| `int64` | `uint64` | environ -9,2 trillions à 9,2 trillions |

et `float32`, `float64` pour les décimaux.

## 4. Écrire le type soi-même [#4-writing-the-type-yourself]

Le type se place après le nom, comme en TS. Vous n'en avez besoin que lorsque le compilateur ne peut pas
le déduire, ou lorsque vous voulez être explicite.

```
var score: int = 10
const ratio: float = 0.5
var small: int8 = 100
var count: int            // error: a variable must be given a value
```

Une variable doit toujours recevoir une valeur à sa création. Il n'y a ni variable
non initialisée ni null, ce qui supprime toute une classe de bogues.

## 5. Affichage et commentaires [#5-printing-and-comments]

```
print("Hello")
print(score)
/// this is a comment
```

## 6. Convertir entre types (proposition, maison) [#6-converting-between-types-proposal-custom]

Les conversions sont toujours écrites explicitement, jamais en silence. Proposition : un mot simple, `to`.

```
const whole = 7
const decimal = whole to float      // 7.0
const text = whole to string        // "7"
```

Le compilateur n'autorise `to` que lorsque rien ne peut être perdu. Les conversions qui peuvent
perdre de l'information ou échouer demanderont une autre écriture, visible. Nous le définirons
quand nous arriverons aux erreurs.

## 7. Chaînes contenant des valeurs (décidé : notre propre marqueur `#`) [#7-strings-with-values-inside-decided-our-own--marker]

Un `#` suivi d'un nom insère cette valeur dans le texte. Pour tout ce qui est plus grand
qu'un nom, mettez-le entre parenthèses.

```
print("Score: #score")              // Score: 10
print("Next: #(score + 1)")         // Next: 11
print("A literal hash: \#")         // A literal hash: #
```

L'expression est vérifiée à la compilation du programme, donc une erreur est signalée avant
l'exécution. Le contrôle du format (décimales, largeur), les chaînes multilignes et les chaînes
brutes viendront plus tard et ne changent pas ce marqueur.

---

## Ce qui est déjà bien à nous [#what-is-already-our-own]

La syntaxe est l'endroit le moins coûteux pour être différent ; la liste ci-dessous porte donc surtout sur
ce que le langage *fait*. Tout ici est un choix délibéré, pas une copie.

- Un langage à l'allure de TS **sans GC et sans références stockées**, uniquement de la sémantique de valeur.
- **`inout` répété au point d'appel**, pour voir chaque mutation là où elle se produit.
- **Un `const` vraiment immuable**, jusqu'au bout.
- **Pas de null.** L'absence est un type (`option<T>`), jamais une surprise.
- **Des conversions écrites `to`**, et seulement quand rien ne peut être perdu (proposition).
- **Des chaînes qui s'interpolent avec `#`**, un marqueur que nous n'avons vu nulle part ailleurs.
- **Un seul `switch`/`case`, qui sert aussi au filtrage par motifs.**
- **L'efficacité en tokens comme objectif de conception**, mesurée avec de vrais tokeniseurs.

## Décisions du brouillon 2 [#decisions-from-draft-2]

- **[B1]** Le compilateur accepte n'importe quel style de nommage. La bibliothèque standard et le formateur en choisissent un.
- **[B2]** `int` fait toujours exactement 64 bits.
- **[B3]** Les noms de types sont en minuscules. (Ouvert : vos propres types aussi ?)
- **[B4]** Les conversions s'écrivent `x to float`.

- **[B5]** L'interpolation de chaînes utilise `#nom` et `#(expression)`.
- **[B6]** Les noms en minuscules comme ceux commençant par une majuscule sont permis pour vos propres types. Le compilateur
  accepte les deux, comme pour les noms de variables (B1). Le formateur et la bibliothèque standard utilisent une majuscule
  pour les types que vous définissez, afin qu'ils ressortent. Un type et une valeur dans la même portée ne peuvent pas porter le même nom.

## Encore ouvert [#still-open]

**[B7] Le mot-clé `let`.** Actuellement réservé et inutilisé. Principal candidat pour plus tard :
le membre en lecture seule du trio de modes d'accès (`let` / `inout` / `sink`), peut-être facultatif
puisqu'il est la valeur par défaut silencieuse. Endroits où le trio pourrait apparaître : paramètres de fonction
(y compris `self`), variables de boucle (`for inout x in xs` pour modifier les éléments sur place),
liaisons de motifs dans `switch`, et captures de fermetures. À décider quand nous arriverons aux fonctions.
