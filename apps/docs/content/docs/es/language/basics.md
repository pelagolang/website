---
title: "Fundamentos"
description: "Variables, constantes y los tipos básicos."
---

Escrito como sería una primera lección de Python, una idea cada vez. La sintaxis es un
boceto para reaccionar, no una decisión final.

**Decidido hasta ahora:** `fn` para funciones, `var` y `const`, nombres de tipo en minúsculas,
enteros con tamaño de 8 a 64 bits, genéricos con `<T>`, y los saltos de línea terminan las sentencias.

## 1. Una variable es un nombre para un valor [#1-a-variable-is-a-name-for-a-value]

```
var score = 10
const name = "Dennis"
```

- `var` crea una variable que puedes cambiar más adelante.
- `const` crea una que no puedes cambiar. Por la semántica de valores, «no se puede cambiar» va
  en serio: nada alcanzable a través de ese nombre puede cambiar tampoco.
- El nombre va primero. No se escribe ningún tipo, porque el compilador lo deduce.

## 2. Cambiar una variable [#2-changing-a-variable]

```
var score = 10
score = 15          // fine
score += 5          // score is now 20

const pi = 3.14
pi = 3.2            // error: pi is const
```

## 3. Tipos [#3-types]

Cada valor tiene un tipo, y una variable conserva su tipo para siempre. Esta es la gran
diferencia con Python.

```
var score = 10
score = "ten"       // error: score is an int, "ten" is a string
```

| Tipo | Contiene | Ejemplo |
|---|---|---|
| `int` | números enteros | `42`, `-7` |
| `float` | números decimales | `3.14` |
| `bool` | verdadero o falso | `true` |
| `char` | un carácter | `'a'` |
| `string` | texto | `"hello"` |

Tamaños exactos para cuando te importa la memoria:

| Con signo | Sin signo | Rango del que tiene signo |
|---|---|---|
| `int8` | `uint8` | -128 to 127 |
| `int16` | `uint16` | aprox. -32 mil a 32 mil |
| `int32` | `uint32` | aprox. -2100 millones a 2100 millones |
| `int64` | `uint64` | aprox. -9,2 trillones a 9,2 trillones |

y `float32`, `float64` para decimales.

## 4. Escribir el tipo tú mismo [#4-writing-the-type-yourself]

El tipo va después del nombre, como en TS. Solo lo necesitas cuando el compilador no puede
deducirlo, o cuando quieres ser explícito.

```
var score: int = 10
const ratio: float = 0.5
var small: int8 = 100
var count: int            // error: a variable must be given a value
```

Una variable siempre debe recibir un valor cuando se crea. No hay variables sin
inicializar ni null, lo que elimina toda una clase de errores.

## 5. Imprimir y comentarios [#5-printing-and-comments]

```
print("Hello")
print(score)
/// this is a comment
```

## 6. Convertir entre tipos (propuesta, propia) [#6-converting-between-types-proposal-custom]

Las conversiones siempre se escriben de forma explícita, nunca en silencio. Propuesta: una palabra simple, `to`.

```
const whole = 7
const decimal = whole to float      // 7.0
const text = whole to string        // "7"
```

El compilador solo permite `to` cuando no se puede perder nada. Las conversiones que pueden
perder información o fallar necesitarán otra grafía, visible. Lo resolveremos
cuando lleguemos a los errores.

## 7. Cadenas con valores dentro (decidido: nuestro propio marcador `#`) [#7-strings-with-values-inside-decided-our-own--marker]

Un `#` seguido de un nombre pone ese valor en el texto. Para algo más grande que
un nombre, enciérralo entre paréntesis.

```
print("Score: #score")              // Score: 10
print("Next: #(score + 1)")         // Next: 11
print("A literal hash: \#")         // A literal hash: #
```

La expresión se comprueba al compilar el programa, así que un error se detecta antes
de ejecutarlo. El control del formato (decimales, ancho), las cadenas multilínea
y las cadenas sin procesar llegarán más tarde y no cambian este marcador.

---

## Lo que ya es propio [#what-is-already-our-own]

La sintaxis es el lugar más barato para ser diferente, así que la lista siguiente trata sobre todo
de lo que el lenguaje *hace*. Todo lo de aquí es una decisión deliberada, no una copia.

- Un lenguaje de aspecto TS **sin GC y sin referencias que se guarden**, solo semántica de valores.
- **`inout` repetido en el sitio de la llamada**, para ver cada mutación donde ocurre.
- **`const` verdaderamente inmutable**, hasta el fondo.
- **Sin null.** La ausencia es un tipo (`option<T>`), nunca una sorpresa.
- **Conversiones escritas como `to`**, y solo cuando no se puede perder nada (propuesta).
- **Cadenas que se interpolan con `#`**, un marcador que no hemos visto en otros sitios.
- **Un solo `switch`/`case` que también es coincidencia de patrones.**
- **La eficiencia en tokens como objetivo de diseño**, medida con tokenizadores reales.

## Decisiones del borrador 2 [#decisions-from-draft-2]

- **[B1]** El compilador acepta cualquier estilo de nombres. La biblioteca estándar y el formateador eligen uno.
- **[B2]** `int` siempre tiene exactamente 64 bits.
- **[B3]** Los nombres de tipo van en minúsculas. (Abierto: ¿también tus propios tipos?)
- **[B4]** Las conversiones se escriben `x to float`.

- **[B5]** La interpolación de cadenas usa `#nombre` y `#(expresión)`.
- **[B6]** Se permiten nombres en minúsculas y con mayúscula inicial para tus propios tipos. El compilador
  acepta ambos, como con los nombres de variable (B1). El formateador y la biblioteca estándar usan mayúscula
  para los tipos que defines, para que destaquen. Un tipo y un valor en el mismo ámbito no pueden compartir nombre.

## Todavía abierto [#still-open]

**[B7] La palabra clave `let`.** Reservada y sin uso por ahora. Candidata principal para más adelante:
el miembro de solo lectura del trío de modos de acceso (`let` / `inout` / `sink`), posiblemente opcional
porque es el valor predeterminado silencioso. Dónde podría aparecer el trío: parámetros de función
(incluido `self`), variables de bucle (`for inout x in xs` para cambiar elementos en el sitio),
enlaces de patrón en `switch` y capturas de cierres. Se decide al llegar a las funciones.
