# Plan Persistente: Simulador de Zorzales

Este documento es la especificacion de trabajo para construir una segunda pagina del proyecto, `zorzales.html`, independiente de `index.html` pero reutilizando los aprendizajes del simulador de plato.

La sesion que ejecute este plan debe trabajar en:

```text
/Users/rcanales/Proyectos/Plato
```

## Objetivo

Crear `zorzales.html`: un simulador HTML autonomo, con `canvas`, desde el punto de vista del cazador situado en un puesto fijo y parcialmente oculto por canas/vegetacion.

El problema fisico es parecido al plato:

- hay que estimar adelanto,
- hay plomeo real con perdigones,
- hay tiempo de reaccion,
- hay trayectoria 3D,
- hay acierto/fallo fisico.

Pero el objetivo no es un plato balistico, sino un ave que vuela:

- puede cruzar,
- puede venir hacia el puesto,
- puede pasar por encima,
- puede aparecer lateralmente,
- puede subir o bajar,
- puede variar ligeramente el rumbo por aleteo,
- si recibe impacto cae por gravedad, girando, no se rompe en fragmentos.

## Principios de Diseno

1. Crear un archivo nuevo `zorzales.html`; no mezclar la logica con `index.html`.
2. Mantener la app como HTML autonomo sin build step ni dependencias externas.
3. Reutilizar ideas de `index.html`: proyeccion 3D, punto rojo, plomeo azul, ayuda de adelanto amarilla, correcciones, controles compactos.
4. No hacer landing page. La primera pantalla debe ser el simulador usable.
5. No representar aves protegidas como objetivos abatibles. Si se anaden especies no cazables, deben usarse como modo de identificacion/no disparar.
6. La escena debe mantener el punto de vista de ojo/cazador fijo. Mover el raton mueve el encare, no el mundo.
7. La ayuda de adelanto debe poder ocultarse.
8. La trayectoria del ave debe poder ocultarse.
9. Las ayudas de trayectoria/adelanto no deben pintarse bajo el suelo.

## Diferencias Frente a Plato

En `index.html`, el objetivo sale de una maquina del foso. En `zorzales.html`, el ave ya esta volando antes de ser visible.

Debe existir un concepto de visibilidad:

- el cazador esta en un puesto tapado con canas,
- hay una ventana de vision limitada,
- el ave puede entrar fisicamente antes, pero solo se ve cuando cruza la ventana.

La reaccion del usuario empieza cuando el ave se hace visible, no cuando nace la trayectoria.

## Escena Inicial

Render en `canvas`:

- cielo y campo,
- horizonte,
- puesto fijo,
- canas/vegetacion en primer plano que limitan la vision,
- ventana o huecos de visibilidad,
- ave pequena con silueta simple y aleteo,
- punto rojo de mira,
- patron azul de plomeo,
- ayuda amarilla de adelanto opcional,
- trayectoria opcional,
- paneles de correccion tras disparos.

La escena debe parecer un puesto de caza, no un campo de tiro al plato.

## Especies

Crear un objeto de configuracion por especie. Version inicial:

```js
const SPECIES = {
  thrush: {
    label: "Zorzal",
    bodyLengthM: 0.22,
    wingspanM: 0.34,
    radiusM: 0.075,
    speedKmh: [40, 65],
    flapHz: [5, 9],
    shot: "28 g"
  },
  pigeon: {
    label: "Paloma",
    bodyLengthM: 0.32,
    wingspanM: 0.66,
    radiusM: 0.13,
    speedKmh: [65, 95],
    flapHz: [4, 7],
    shot: "30-32 g"
  },
  pheasant: {
    label: "Faisan",
    bodyLengthM: 0.70,
    wingspanM: 0.80,
    radiusM: 0.18,
    speedKmh: [50, 75],
    flapHz: [3, 6],
    shot: "30-32 g"
  }
};
```

Estos rangos son aproximaciones de simulador, no certificaciones biologicas. La sesion ejecutora debe hacer una comprobacion rapida en internet y anadir fuentes en el README si crea documentacion.

## Trayectorias Iniciales

Crear presets controlados antes de introducir aleatoriedad libre:

1. `frontal_alto`: viene desde el fondo hacia el puesto y pasa por encima.
2. `frontal_bajo`: viene de frente, visible tarde, a menor altura.
3. `cruzado_izq_der`: cruza de izquierda a derecha por delante.
4. `cruzado_der_izq`: cruza de derecha a izquierda por delante.
5. `lateral_derecha`: aparece por la derecha, pasa cerca del puesto.
6. `lateral_izquierda`: aparece por la izquierda, pasa cerca del puesto.
7. `diagonal_der`: viene desde fondo-derecha hacia el puesto.
8. `diagonal_izq`: viene desde fondo-izquierda hacia el puesto.
9. `por_encima`: entra alto y pasa sobre el cazador.

Cada trayectoria debe tener:

- punto inicial,
- velocidad inicial,
- altura inicial,
- altura de paso,
- oscilacion suave de aleteo,
- variacion leve de rumbo,
- viento lateral opcional.

## Modelo de Vuelo

No usar una parabola limpia de plato. Usar una funcion de vuelo tipo:

```text
pos(t) = base_lineal(t) + oscilacion_aleteo(t) + deriva_suave(t)
```

Componentes:

- velocidad base de la especie,
- pequena oscilacion vertical por aleteo,
- oscilacion lateral suave,
- tendencia ascendente/descendente segun preset,
- viento lateral.

Ejemplo conceptual:

```js
y = y0 + vy * t + flapAmplitude * Math.sin(t * flapHz * Math.PI * 2)
x = x0 + vx * t + weaveAmplitude * Math.sin(t * weaveHz + phase)
z = z0 + vz * t
```

## Visibilidad del Puesto

El ave solo se renderiza como visible cuando:

- entra dentro de la ventana visual entre canas,
- o supera una mascara de visibilidad definida por angulo/sector.

Antes de ser visible puede existir fisicamente, pero:

- no se dibuja,
- no empieza el tiempo de reaccion,
- no deberia permitir disparo util salvo que el usuario dispare a ciegas.

Version inicial simple:

- dibujar canas como bandas verticales/diagonales en primer plano,
- definir una ventana central y dos laterales,
- mostrar el ave solo al cruzar esas ventanas.

## Disparo y Plomeo

Usar el mismo principio de `index.html`:

- punto rojo = punto donde dispara el usuario,
- plomeo azul = patron estimado donde viaja la nube,
- perdigones fisicos = determinan el impacto,
- no usar probabilidad inventada para acertar.

Cartucho inicial:

- carga: 28 g,
- velocidad configurable: rango inicial 360-410 m/s,
- perdigon configurable: empezar con #8 o #9 para zorzal,
- numero de perdigones aproximado segun carga y tamano,
- patron determinista con anillos/flujo, no solo gaussiano.

Mantener dos disparos como en plato.

## Adelanto

El adelanto debe calcularse con prediccion corta. A diferencia del plato, el ave puede cambiar rumbo, asi que no conviene extrapolar demasiado.

Recomendacion:

- usar la velocidad instantanea actual del ave,
- estimar interseccion con perdigones,
- refinar con busqueda local como en `recommendedAimAt()` de `index.html`,
- limitar visualmente el punto recomendado si cae bajo el suelo.

La ayuda amarilla debe poder ocultarse.

## Impacto y Caida

Si un perdigon impacta:

- estado del ave: `hit`,
- cancelar sustentacion,
- mantener algo de velocidad horizontal inicial,
- aplicar gravedad,
- aplicar rotacion,
- dibujar una caida con giro,
- opcional: pequenas plumas, no fragmentos.

Si no recibe impacto:

- el ave sigue volando hasta salir de escena,
- o desaparece al superar rango.

## Controles

Minimo:

- `Pedir ave`
- `Repetir ave`
- `Disparar`
- `Reset`
- especie: Zorzal / Paloma / Faisan
- trayectoria
- velocidad
- reaccion
- cartucho
- plomeo tiro 1
- plomeo tiro 2
- viento
- ayuda adelanto
- trayectoria
- plomeo
- zoom visual
- tiempo de analisis

Mantener tooltips `title` en controles, siguiendo `index.html`.

## HUD y Correcciones

Mostrar:

- estado,
- especie,
- trayectoria,
- velocidad,
- distancia aproximada,
- resultado,
- tiro 1 / tiro 2,
- roto/tocado/fallo.

Ventanas de correccion:

- adelanto: mas adelanto / quita adelanto,
- lateral: izquierda/derecha,
- altura: sube/baja,
- cada tiro por separado.

## Estructura Recomendada del Codigo

Aunque sea un solo HTML, organizar el script por secciones:

1. DOM handles
2. Species and trajectory constants
3. Simulation state
4. Vector math and projection
5. Bird flight model
6. Visibility model
7. Shot physics
8. Lead solver
9. Drawing functions
10. HUD/corrections
11. Controls/input
12. Validation helpers/comments

## Relacion con `index.html`

Antes de escribir desde cero, leer estas funciones de `index.html` y reutilizar el patron:

- `projectPoint`
- `projectAim`
- `aimFromScreen`
- `recommendedAimAt`
- `centerShotClosest`
- `makePelletDirections`
- `testPelletAgainstTarget`
- `drawCorrectionPanels`
- `drawLegend`

No copiar errores ya corregidos:

- el mundo no se mueve con el raton,
- las ayudas no se dibujan bajo el suelo,
- repetir no cuenta como pieza nueva,
- las correcciones de tiro 1 y tiro 2 se separan,
- el punto de mira debe coincidir con el cursor.

## Validacion Minima

Al terminar la primera version:

1. `node` debe parsear el `<script>` sin errores.
2. Todos los `document.getElementById(...)` deben tener un ID real.
3. Con ayuda de adelanto perfecta, al menos una bateria de pruebas debe acertar mayoritariamente para cada especie.
4. Desactivar trayectoria debe ocultar solo la linea de trayectoria.
5. Desactivar ayuda de adelanto debe ocultar solo la ayuda amarilla.
6. El ave impactada debe caer, no explotar.
7. Repetir ave debe mantener especie, trayectoria y puesto/escena sin sumar intento.

## Documentacion

Actualizar `README.md` cuando exista `zorzales.html`:

- anadir enlace a `zorzales.html`,
- explicar que es otro laboratorio,
- citar fuentes usadas para velocidades/tamanos,
- distinguir simulador de plato vs simulador de zorzales.

## Resultado Esperado de la Primera Iteracion

Una pagina `zorzales.html` usable, no perfecta:

- ave visible y con aleteo simple,
- entrada por trayectorias predefinidas,
- visibilidad limitada por puesto,
- plomeo fisico,
- ayuda de adelanto,
- impacto y caida,
- controles basicos,
- correcciones por disparo.

La prioridad es que el modelo conceptual este bien, no que el ave sea aun fotorealista.
