---
title: "Memoria"
description: "Disposición en memoria y extras de propiedad."
---

Dos cuestiones sobre la memoria que las páginas anteriores dejaron abiertas: array de structs frente a
struct de arrays, y los tipos lineales.

## 1. Dónde estamos [#1-where-we-are]

Los valores tienen dueño. Un parámetro `sink` o un `move` le quita un valor a su dueño, `deinit` se ejecuta
cuando un valor sale del ámbito, y un valor movido no puede volver a usarse. En teoría de tipos eso es
**afín**: un valor puede usarse como máximo una vez, y también puede descartarse.

## 2. AoS y SoA [#2-aos-and-soa]

- **AoS** (array of structs, array de structs): los campos de cada elemento van juntos. Así dispone C un
  `point[]`, y eso es `[point]` en este lenguaje. Es la disposición adecuada cuando usas elementos completos y
  coincide con C para la interoperabilidad.
- **SoA** (struct of arrays, struct de arrays): un array por campo. Es la disposición adecuada cuando un bucle
  toca un solo campo (todos los valores `x`), porque los datos quedan compactos en la caché y se vectorizan bien.

**Propuesta.** Por defecto se usa AoS, porque es predecible y compatible con C. SoA es opcional, como un tipo de
colección con la misma interfaz:

```
var points: soa<point> = soa []
points.push!(point { x: 1.0, y: 2.0 })

points[0].x                  // reads through a view of element 0, same code as a list
points.x                     // the whole x column as a read-only [float]: a SIMD-friendly slice
for inout p of points { p.x += 1.0 }
```

Como las referencias son temporales (de segunda clase) bajo la semántica de valores, `points[i]` es siempre una
vista que existe durante una sola sentencia, de modo que la disposición subyacente puede cambiar sin cambiar el
código que la usa. Es una ventaja real frente a los lenguajes donde las referencias a elementos pueden escapar.
`soa<point, 8>` es la variante por bloques (AoSoA), que agrupa 8 elementos por bloque según el ancho de vector.

Un compilador que elija la disposición por sí solo sigue en la lista de «más adelante». Requiere análisis del
programa completo.

La tupla de tamaño fijo `(A, B; N)` es una disposición intercalada, la versión AoS de los tipos mixtos. `soa<T>`
es su opuesto, así que ambas cubren los dos extremos.

## 3. Tipos lineales [#3-linear-types]

Los tipos afines permiten descartar un valor en silencio. Los tipos **lineales** lo prohíben: un valor debe
consumirse exactamente una vez. Así se convierten en errores de compilación cosas como «este archivo debe
cerrarse», «esta transacción debe confirmarse o revertirse» o «este permiso debe devolverse». Rust no tiene tipos
lineales (solo avisos). Austral y Hylo sí.

**Propuesta.** Casi lo tenemos ya. Añade un modificador opcional:

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

- Un valor lineal debe consumirse en todos los caminos, incluidos los retornos anticipados y `?`. El compilador
  indica qué camino lo olvidó.
- Un tipo lineal no tiene `deinit`, porque nunca puede descartarse de forma implícita.
- `sink` ya significa «quita el valor», y `!!` ya marca la llamada que consume, así que no hace falta sintaxis
  nueva en el sitio de la llamada.
- El código genérico requiere cuidado: por defecto los parámetros de tipo pueden descartarse, así que `T` no puede
  ser un tipo lineal salvo que la cota lo indique (`<T: linear>`). Mantén esta puerta abierta al diseñar el
  comprobador de tipos; no fijes en ningún sitio que «todo tipo puede descartarse».

**Fases.** La versión 1 es afín más un aviso `@must_use`. Los tipos `linear` de verdad llegan cuando exista el
comprobador de tipos, porque cambian las reglas de los genéricos. La palabra `linear` queda reservada desde ahora
(palabra clave blanda).

---

## Implementado: soa [#built-soa]

`soa<T>` para un struct `T` funciona como se describe arriba (véase IR24 en `ir.md`): `soa []`, `soa [a, b]`, `push!`, `pop!`, `insert!`, `remove!`, `clear!`, `len`, `points[i]`, `points[i].x`, `points.x`, los bucles `for` y `for inout`, `copy`, `==`, `print`. La forma por bloques `soa<T, N>` se acepta y se comporta igual; su disposición de memoria por bloques se deja al backend.

## Temporales [#temporaries]

Un valor que se crea pero nunca recibe nombre (el resultado de una función que ignoras, el objeto que hay detrás de `make_dog("a").name`, un argumento construido sobre la marcha) se destruye al **final de su sentencia**, en el orden inverso al de creación. Si algo lo toma (una variable, un campo, un parámetro `sink`, `return`), el nuevo dueño lo destruye más tarde. El compilador lleva esta contabilidad mientras genera el código (el libro de cuentas, IR22); no hay coste en tiempo de ejecución en el código lineal más allá de lo que ya pagan las variables.

## Decisiones del borrador 1 [#decisions-from-draft-1]

- **M1** AoS es la disposición por defecto. `soa<T>` es la colección opcional, con `soa<T, 8>` como variante por bloques.
- **M2** El acceso por columnas (`points.x`, un `[float]` de solo lectura) entra.
- **M3** Las disposiciones elegidas por el compilador quedan como una optimización posterior.
- **M4** `linear` es un modificador opcional, programado después del comprobador de tipos. La palabra queda reservada desde ahora como palabra clave blanda.
