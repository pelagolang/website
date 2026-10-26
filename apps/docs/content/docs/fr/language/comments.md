---
title: "Commentaires"
description: "Pourquoi Pelago a sa propre syntaxe de commentaires : ///, //~ et leurs formes en bloc."
---

**Décision (propriétaire, 2026-10-20) :** option B, avec `//~` pour la documentation. `/// text` est le commentaire de ligne ordinaire, `///* ... *///` le commentaire de bloc ordinaire (il s'imbrique), `//~ text` une ligne de documentation, `//~* ... *~//` un bloc de documentation (il ne s'imbrique pas). `//` et `/* */` sont des erreurs de l'analyseur lexical avec une indication ; `////` est simplement un commentaire ordinaire (il commence par `///`). La documentation se rattache à l'élément qui suit ; il n'existe pas de forme distincte au niveau du fichier (un commentaire de documentation devant rien n'appartient à rien). Le reste de cette page est la discussion qui a mené ici ; la graphie `//!` qu'elle mentionne dans l'option B est devenue `//~`.


## Où en sommes-nous [#where-we-are]

Aujourd'hui (`lexer.rs`, `keywords.md`, `lexer.md`) : `// line`, `/* block */` (s'imbrique), `/// doc line`, `///* doc block *///`, et `//// ...` comme commentaire ordinaire (une bannière de barres obliques n'est donc pas de la documentation). L'avis du propriétaire : `//` et `/* */` existent déjà en C, Java, Rust et Go, ils ne nous sont donc pas propres ; `///` devrait être le commentaire de ligne ordinaire et `///* ... *///` celui sur plusieurs lignes. Supprimer `////`.

## Ce qu'une syntaxe de commentaires doit couvrir [#what-a-comment-syntax-has-to-cover]

1. Une note au lecteur, jusqu'à la fin de la ligne.
2. Une note sur plusieurs lignes, ou au milieu d'une ligne (`f(1, /* why */ 2)`).
3. Du code mis en commentaire (une zone, activée et désactivée rapidement).
4. La documentation de l'élément qui suit (affichée au survol, utilisée par les outils).
5. La documentation du fichier ou du module lui-même (un en-tête ; rien ne le suit).
6. Des marqueurs pour les outils (`TODO`, formateur désactivé/activé, une première ligne `#!` pour les scripts).

Deux tests pratiques pour tout choix :

- **Test de bascule.** Les éditeurs commentent une sélection en ajoutant un préfixe de ligne fixe puis en le retirant. Le préfixe ne doit pas être le début d'une autre forme de commentaire, sinon basculer une ligne de documentation en arrache la moitié (`/// doc` perd `//` et devient `/ doc`). C'est le bogue que l'extension VS Code présente aujourd'hui.
- **Test de coût.** Chaque forme est une règle du lexeur, une règle de grammaire (TextMate, tree-sitter), une entrée de configuration d'éditeur et une ligne dans le formateur. Moins de formes, moins de choses à garder synchronisées.

## Options [#options]

**A. La graphie du propriétaire, deux formes.** `/// text` est le commentaire ordinaire, jusqu'à la fin de la ligne. `///* ... *///` est le commentaire multiligne, et aussi le commentaire de documentation (d'une ligne ou de plusieurs). Pas de `//`, pas de `/* */`, pas de `////`.
- Couvre 1 (ligne), 2 (bloc), 3 (de nombreuses lignes `///`, bascule proprement), 4 et 5 (un bloc `///*` avant un élément, ou en tête de fichier).
- Ne fournit ni ligne de documentation distincte ni commentaire en ligne au milieu d'une ligne, sauf à utiliser le bloc pour cela, et alors un commentaire de bloc est un commentaire de documentation : `f(1, ///* why */// 2)` compterait comme une documentation qui n'appartient à rien.
- Test de bascule : le préfixe de ligne `///` est le début de `///*`, donc basculer une ligne d'un bloc de documentation pose le même problème de moitié arrachée, même si l'on bascule rarement des blocs de documentation.

**B. La graphie du propriétaire, quatre formes, séparées.** `/// text` ligne ordinaire ; `///* ... *///` bloc ordinaire (s'imbrique) ; `//! text` ligne de documentation ; `//!* ... *!//` bloc de documentation. Une forme de documentation ne commence jamais par le préfixe de ligne ordinaire, donc le test de bascule est réussi. `//` seul n'est pas un commentaire (une erreur qui dit « utilisez `///` »).
- Couvre 1 à 6 (`//!` en tête de fichier documente le fichier).
- Quatre formes ; une règle de plus à apprendre que dans les langages de la famille C, mais chacune est une simple variation de la précédente.

**C. Une autre famille, avec `#`.** `# text` ligne ordinaire, `#* ... *#` bloc, `## text` ligne de documentation, `#** ... **#` bloc de documentation. `#` est libre aujourd'hui en dehors des chaînes (il ne signifie l'interpolation qu'à l'intérieur).
- Court, familier des langages de script, et sans rien de commun avec C.
- Une première ligne `#!` s'y intègre naturellement. Coût : `##` commence par `#`, donc le test de bascule échoue pour les lignes de documentation ; l'interpolation `#name` dans les chaînes se lit différemment d'un commentaire `#`.

## Recommandation [#recommendation]

**B.** Elle conserve vos `///` et `///*` exactement comme formes ordinaires, règle le problème de bascule par conception, sépare la documentation des notes (une zone commentée n'est ainsi jamais de la documentation) et couvre tous les cas de la liste. A est la plus petite, mais elle confond documentation et commentaires de bloc, ce qui ne laisse aucune place au cas en ligne.

## Questions [#questions]

1. A, B ou C ?
2. `///* ... *///` s'imbrique-t-il (pour commenter une zone qui contient déjà un bloc) ? Recommandation : oui, comme `/* */` aujourd'hui.
3. Un `//` isolé est-il une erreur (avec l'indication d'écrire `///`) ou ignoré ? Recommandation : une erreur. Un `//` laissé par habitude serait sinon silencieusement du code.
4. Blocs de documentation : en B, `//!* ... *!//` est le bloc de documentation. Graphie acceptable, ou préférez-vous autre chose (`///**`) ?
5. Les commentaires de documentation se rattachent-ils uniquement à l'élément qui suit, avec `//!` pour le module ou le fichier englobant ? Recommandation : oui.
6. Une bannière comme `/////////////` doit-elle être permise comme commentaire ordinaire ? En B elle l'est déjà (une ligne `///`) ; aucune règle supplémentaire.
7. Continue-t-on à lire `//` et `/* */` pendant une version, avec une réécriture par `pelago fmt`, ou bascule-t-on d'un coup ? Recommandation : basculer d'un coup ; il n'y a pas encore d'utilisateurs, seulement nos exemples.

## Ce que le changement touche [#what-changing-it-touches]

`lexer.rs` (la règle `slash`, plus `#` pour C), `token.rs`, le colorateur syntaxique, `keywords.md`, `lexer.md`, `basics.md`, `parser.md` (commentaires de documentation), tous les fichiers `.pel` de `examples/`, `tree-sitter-pelago`, la grammaire TextMate et les configurations de langage de VS Code et de Zed. Une réécriture ponctuelle des exemples est facile à automatiser.
