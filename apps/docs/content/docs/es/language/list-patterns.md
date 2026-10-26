---
title: "Patrones de lista"
description: "Coincidencia según la forma de una lista."
---

Patrones que miran dentro de una lista, un array o un slice. Se integran con todo lo de `switch.md`: los brazos
de `switch`, `is` en condiciones, `guard ... else`, guardas con `if`, alternativas y `name is pattern`.

## 1. Las formas [#1-the-shapes]

```
switch xs {
    case []:                       "empty"
    case [x]:                      "one: #x"
    case [a, b]:                   "two: #a and #b"
    case [first, ...rest]:         "#first, then #(rest.len()) more"
}
```

| Patrón | Coincide con |
|---|---|
| `[]` | una lista sin elementos |
| `[a, b]` | exactamente dos elementos, ligados a `a` y `b` |
| `[a, ...rest]` | uno o más; `rest` es todo lo que va después de `a` (posiblemente vacío) |
| `[...init, last]` | uno o más; `init` es todo lo que va antes de `last` |
| `[first, ...mid, last]` | dos o más, con el medio ligado a `mid` |
| `[first, ...]` | uno o más; el resto se ignora (un `...` suelto) |
| `[0, x]`, `[.circle(r), ...]` | los elementos pueden ser cualquier patrón: literales, rangos, casos de enum, listas anidadas |

- **El marcador de resto es `...`**, el mismo símbolo que la expansión (spread) en `[0, ...xs, 99]`: en una
  expresión expande elementos hacia fuera, en un patrón los recoge hacia dentro. Los patrones de struct conservan
  `..` para «ignorar los demás campos»; son distintos porque el resto de una lista tiene una longitud y suele
  tener un nombre.
- Como máximo un marcador de resto por patrón.
- Funciona con `[T]`, `[T; N]` y vistas slice. Con un array fijo la longitud se conoce, así que `[a, b]` sobre un
  `[int; 2]` siempre coincide y el compilador lo sabe.

## 2. El resto es una vista [#2-the-rest-is-a-view]

`rest` es una **vista slice** (collections.md, sección 2), no una lista nueva. Por eso crearla no cuesta nada
(un puntero y una longitud) y, como toda vista, dura lo que dura el brazo y no puede guardarse ni devolverse. Para
conservarla: `copy rest`.

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

## 3. Modos de acceso [#3-access-modes]

Los modos funcionan sobre los enlaces como en cualquier otro sitio. El modo va delante del enlace al que se
aplica:

```
switch inout xs {
    case [inout first, ...inout rest]:
        first += 1                  // changes xs[0] in place
        rest.reverse!()             // changes the rest in place
    case []: ...
}
```

- Por defecto es de solo lectura (`let`). `inout` exige que el escrutinio también sea `inout`.
- **`sink` no se permite sobre elementos**: sacar un elemento de una lista dejaría un hueco. Para desarmar una
  lista entera, usa métodos del estilo `pop`/`remove`, o un futuro patrón de lista `sink` (sección 7).

## 4. Dónde funcionan [#4-where-they-work]

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

- **Exhaustividad:** el compilador sigue las longitudes. `[]` más `[_, ...]` es completo; también lo es `[]`,
  `[_]`, `[_, _, ...]`. Las longitudes que faltan se nombran en el error.
- **Las declaraciones no deben fallar.** `const [a, b] = xs` solo se acepta cuando `xs` es un array fijo con esa
  longitud (`[int; 2]`). Para una lista, usa `guard xs is [a, b] else { ... }` o `if xs is`.
- Las alternativas funcionan cuando ligan los mismos nombres: `case [x], [x, _]:`.
- `name is pattern` funciona: `case whole is [first, ...]:` conserva la lista y su primer elemento.
- **El texto admite ambas cosas**: casos literales y patrones de lista (LP7). Sobre un `string` o `str` los
  elementos son `char` y el resto es una vista `str`: `case ['a', ...rest]:` o `case [c, ...]:`. Los literales
  siguen siendo la forma sencilla de comprobar un valor completo (`case "add":`). Las longitudes se cuentan en
  caracteres, así que comprobar una longitud recorre el texto una vez; coincidir desde el principio nunca
  decodifica más de lo que el patrón necesita.

## 5. Cerrar la cuestión de los constructores (B5) [#5-closing-the-builder-question-b5]

Los constructores necesitaban una forma de saltarse los elementos que no coinciden. `is` ya liga nombres, así que
no hace falta sintaxis nueva. Un filtro escrito con `is` pone sus nombres a disposición del resultado:

```
const radii = [s of shapes if s is .circle(r) ~> r]                  // only circles
const firsts = [x of rows if x is [first, ...] ~> first]             // rows that are not empty
const values = [o of opts if o is some(v) ~> v * 2]                  // some options only
```

(El caso presente de una `option` es `some(v)`; véanse las decisiones más abajo.)

## 6. Por qué no otros diseños [#6-why-not-other-designs]

- **`[first, ..rest]` (Rust):** `..` ya significa «ignorar los demás campos» en los patrones de struct, y `...`
  es la expansión que todo el mundo ve en las listas.
- **`first :: rest` (ML / Haskell):** los patrones cons presuponen listas enlazadas. Las nuestras son arrays,
  donde «el resto» es una vista, y los casos del medio y del final (`[...init, last]`) cuestan igual que el del
  principio.
- **Un `match` aparte para listas:** la decisión fue un solo `switch` para todo.

## 7. Para más adelante (revisar cuando exista el comprobador) [#7-left-for-later-revisit-after-the-checker-exists]

- **Recordar para versiones futuras: `sink` en patrones de lista.** Patrones de lista que consumen (`switch sink xs { case [a, ...rest]: ... }`, donde `a` y `rest` pasan a ser
  propios). Posible cuando `sink` sobre una lista propietaria pueda devolver las piezas de forma segura; antes hace falta el comprobador.
- **Patrones sobre mapas y conjuntos.** Las búsquedas siguen siendo `map.get(k)`, que devuelve una `option`, comprobada de la forma normal.
- **Patrones sobre iteradores**, que no pueden almacenarse y no tienen longitud.

## Decisiones del borrador 1 [#decisions-from-draft-1]

- **LP1** `...` es el marcador de resto (suelto para ignorar, `...name` para ligar), como máximo uno por patrón.
- **LP2** `rest` es una vista slice temporal; `copy rest` crea una lista propia.
- **LP3** Los modos de acceso van delante del enlace: `[inout first, ...inout rest]`.
- **LP4** `sink` sobre elementos de patrones de lista no se permite en la v1. Se mantiene en la lista de cosas por revisar (sección 7).
- **LP5** Los arrays fijos pueden desestructurarse en declaraciones normales; las listas usan `guard ... is` o `if ... is`.
- **LP6** (a) `if x is pattern` en un constructor lleva sus nombres al resultado (cierra B5). (b) El caso presente de una
  `option` se comprueba como `some(v)`, una palabra solo de patrones como `ok` y `err`; los valores se siguen escribiendo sin más.
- **LP7** El texto admite ambas: casos literales y patrones de lista sobre `char` con un resto `str`.
- **LP8** El marcador de resto puede ir en medio.
