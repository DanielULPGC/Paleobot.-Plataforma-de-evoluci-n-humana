# Protocolo de medición en el aula

Objetivo: decidir, con datos de los equipos reales, si la portada con escena
tridimensional (`portada-sylva.html`) puede usarse con alumnado o si debe
mantenerse la portada actual (`index.html`).

## Preparación

1. Copie en la raíz del Atlas, junto a `datos.js` y `index.html`:
   `portada-sylva.html`, la carpeta `inner-green-assets/`, la carpeta
   `licencias/` y `medir-rendimiento.html`.
2. Abra el Atlas como lo abrirá el alumnado (servidor web o Moodle). Si abre
   los ficheros directamente desde el disco, anótelo: el resultado puede diferir.

## Medición

En cada equipo del aula (al menos el ordenador del profesorado con el
proyector conectado y uno de los equipos del alumnado):

1. Abra `medir-rendimiento.html` y ponga el navegador a pantalla completa (F11).
2. Cierre las demás pestañas y programas.
3. Mida `portada-sylva.html` tres veces con los valores por defecto
   (5 s de calentamiento y 30 s de medición). No mueva el ratón ni cambie de pestaña.
4. Mida también `index.html` una vez, como referencia.
5. Descargue el informe JSON de cada medición y anote los datos en
   `registro-mediciones.csv`.

## Decisión

Por equipo, se toma el **peor** de los tres resultados:

| Veredicto | Criterio | Decisión |
|---|---|---|
| Apto | P95 ≤ 33,3 ms y menos del 1 % de fotogramas por encima de 100 ms | Puede usarse la portada 3D |
| Apto con reservas | P95 ≤ 50 ms | Usable; recordar el botón de pausa |
| No apto | P95 > 50 ms, o menos de 60 intervalos registrados | Mantener la portada actual en ese equipo |
| No válida | La pestaña se ocultó durante la medición | Repetir |

Si el ordenador del profesorado con proyector no es «apto», la portada 3D no
debe ser la entrada por defecto del Atlas.

Los umbrales son un criterio de diseño propuesto para este prototipo, no una
norma. Se basan en la fluidez percibida habitual (30 fotogramas por segundo) y
pueden ajustarse de forma razonada; en ese caso, documéntelo.

## Privacidad

El medidor no envía datos. El informe incluye el nombre de la tarjeta gráfica
y el navegador del equipo, necesarios para interpretar la medición; no
contiene datos personales. Guárdelo solo si lo necesita.

## Verificación del propio medidor

Se comprobó con dos controles opuestos en el entorno de construcción:

- Página estática (stub de `index.html`): 481 fotogramas, mediana y P95 de
  16,7 ms: **apto**.
- Portada 3D con WebGL por software (SwiftShader): 0 fotogramas en 8 s:
  **no apto, muestra insuficiente**. Es el resultado esperado de un equipo sin
  aceleración gráfica y no dice nada de los equipos del aula.
- Análisis axe-core (WCAG 2.x A/AA) del medidor: sin infracciones.
