---
title: "Comentarios"
description: "Por qué Pelago tiene su propia sintaxis de comentarios: ///, //~ y sus formas de bloque."
---

**Decisión (propietario, 2026-10-20):** opción B, con `//~` para la documentación. `/// text` es el comentario de línea ordinario, `///* ... *///` el comentario de bloque ordinario (se anida), `//~ text` una línea de documentación, `//~* ... *~//` un bloque de documentación (no se anida). `//` y `/* */` son errores del analizador léxico con una pista; `////` es simplemente un comentario ordinario (empieza por `///`). La documentación se asocia al elemento que sigue; no existe una forma separada a nivel de archivo (un comentario de documentación antes de nada no pertenece a nada). El resto de esta página es la discusión que condujo hasta aquí; la grafía `//!` que menciona en la opción B pasó a ser `//~`.


## Dónde estamos [#where-we-are]

Hoy (`lexer.rs`, `keywords.md`, `lexer.md`): `// line`, `/* block */` (se anida), `/// doc line`, `///* doc block *///`, y `//// ...` como comentario ordinario (así un banner de barras no es documentación). La opinión del propietario: `//` y `/* */` ya existen en C, Java, Rust y Go, así que no son propios; `///` debería ser el comentario de línea ordinario y `///* ... *///` el de varias líneas. Eliminar `////`.

## Qué tiene que cubrir una sintaxis de comentarios [#what-a-comment-syntax-has-to-cover]

1. Una nota para el lector, hasta el final de la línea.
2. Una nota de varias líneas, o en mitad de una línea (`f(1, /* why */ 2)`).
3. Código comentado (una región, que se active y desactive rápido).
4. Documentación del elemento que sigue (se muestra al pasar el ratón y la usan las herramientas).
5. Documentación del propio archivo o módulo (una cabecera; no le sigue nada).
6. Marcas para herramientas (`TODO`, formateador desactivado/activado, una primera línea `#!` para scripts).

Dos pruebas prácticas para cualquier elección:

- **Prueba de alternancia.** Los editores comentan una selección añadiendo un prefijo de línea fijo y quitándolo de nuevo. El prefijo no debe ser el comienzo de otra forma de comentario, o alternar una línea de documentación le arranca la mitad (`/// doc` pierde `//` y queda `/ doc`). Este es el fallo que tiene hoy la extensión de VS Code.
- **Prueba de coste.** Cada forma es una regla del analizador léxico, una regla de gramática (TextMate, tree-sitter), una entrada de configuración del editor y una línea en el formateador. Menos formas, menos que mantener sincronizado.

## Opciones [#options]

**A. La grafía del propietario, dos formas.** `/// text` es el comentario ordinario, hasta el final de la línea. `///* ... *///` es el comentario de varias líneas, y también el comentario de documentación (de una línea o de muchas). Ni `//`, ni `/* */`, ni `////`.
- Cubre 1 (línea), 2 (bloque), 3 (muchas líneas `///`, se alterna bien), 4 y 5 (un bloque `///*` antes de un elemento, o al principio del archivo).
- No ofrece una línea de documentación separada ni un comentario en línea a mitad de renglón salvo que se use el bloque para ello, y entonces un comentario de bloque es un comentario de documentación: `f(1, ///* why */// 2)` contaría como documentación que no pertenece a nada.
- Prueba de alternancia: el prefijo de línea `///` es el comienzo de `///*`, así que alternar una línea de un bloque de documentación tiene el mismo problema de arrancar la mitad, aunque rara vez se alternan los bloques de documentación.

**B. La grafía del propietario, cuatro formas, separadas.** `/// text` línea ordinaria; `///* ... *///` bloque ordinario (se anida); `//! text` línea de documentación; `//!* ... *!//` bloque de documentación. Una forma de documentación nunca empieza con el prefijo de línea ordinario, así que se supera la prueba de alternancia. Un `//` solo no es comentario (un error que dice «usa `///`»).
- Cubre de 1 a 6 (`//!` al principio de un archivo documenta el archivo).
- Cuatro formas; una regla más que aprender que en los lenguajes de la familia C, pero cada una es una variación sencilla de la anterior.

**C. Otra familia, con `#`.** `# text` línea ordinaria, `#* ... *#` bloque, `## text` línea de documentación, `#** ... **#` bloque de documentación. `#` está libre fuera de las cadenas hoy (solo significa interpolación dentro de ellas).
- Corto, familiar de los lenguajes de scripting y sin nada en común con C.
- Una primera línea `#!` encaja de forma natural. Coste: `##` empieza por `#`, así que las líneas de documentación no superan la prueba de alternancia; la interpolación `#name` en las cadenas se lee distinto de un comentario `#`.

## Recomendación [#recommendation]

**B.** Conserva tus `///` y `///*` exactamente como formas ordinarias, resuelve por diseño el problema de la alternancia, separa la documentación de las notas (así una región comentada nunca es documentación) y cubre todos los casos de la lista. A es la más pequeña, pero hace que documentación y comentarios de bloque sean lo mismo, lo que deja sin sitio al caso en línea.

## Preguntas [#questions]

1. ¿A, B o C?
2. ¿Se anida `///* ... *///` (para comentar una región que ya contiene un bloque)? Recomendación: sí, como hace hoy `/* */`.
3. ¿Un `//` suelto es un error (con una pista para escribir `///`) o se ignora? Recomendación: un error. Un `//` olvidado por costumbre sería, si no, código en silencio.
4. Bloques de documentación: en B, `//!* ... *!//` es el bloque de documentación. ¿Grafía aceptable, o se prefiere otra (`///**`)?
5. ¿Los comentarios de documentación se asocian solo al elemento que sigue, con `//!` para el módulo o archivo que los contiene? Recomendación: sí.
6. ¿Debe permitirse un banner como `/////////////` como comentario ordinario? En B ya lo es (una línea `///`); no hace falta una regla extra.
7. ¿Seguimos leyendo `//` y `/* */` durante una versión, con una reescritura de `pelago fmt`, o cambiamos de golpe? Recomendación: cambiar de golpe; todavía no hay usuarios, solo nuestros ejemplos.

## Qué toca el cambio [#what-changing-it-touches]

`lexer.rs` (la regla `slash`, más `#` si es C), `token.rs`, el resaltador, `keywords.md`, `lexer.md`, `basics.md`, `parser.md` (comentarios de documentación), todos los archivos `.pel` de `examples/`, `tree-sitter-pelago`, la gramática TextMate y las configuraciones de lenguaje de VS Code y Zed. Reescribir los ejemplos de una sola vez es fácil de automatizar.
