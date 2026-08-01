# Plato

Simulador 3D en HTML para estudiar el tiro al plato desde la perspectiva real del ojo del tirador. El objetivo no es inventar un juego abstracto, sino construir un laboratorio visual de física aplicada: salida del plato, velocidad, ángulo, reacción del tirador, adelanto, dispersión del cartucho y corrección tras el primer y segundo tiro.

Construido por **Roberto Canales Mora**: [robertocanales.com/proyectos#plato](https://robertocanales.com/proyectos#plato). Licencia: [MIT](#14-licencia).

La aplicación se ejecuta como una página HTML autónoma y renderiza la escena con `canvas`, sin dependencias externas. Está pensada para iterar rápido sobre la física y la representación visual antes de convertirla, si procede, en un juego completo o una experiencia VR.

**Probar la aplicación:** <a href="https://rcanalescoder.github.io/Plato/" target="_blank" rel="noopener">abrir el simulador en GitHub Pages</a>. En GitHub, el enlace directo a `index.html` muestra el código; GitHub Pages es la URL publicada que ejecuta la aplicación. El proyecto sigue siendo un único fichero ejecutable, por lo que también puede servirse localmente con `python3 -m http.server 8000` y abrir `http://localhost:8000/`.

**Documentación pedagógica:** <a href="https://rcanalescoder.github.io/Plato/docs.html" target="_blank" rel="noopener">abrir la documentación en GitHub Pages</a>. Incluye infografías PNG generativas, explicación para tiradores, explicación técnica y bibliografía.

![Vista principal del simulador](docs/screenshots/vista-principal.png)

## 1. Alcance

El simulador representa una tirada de 25 platos en tres modalidades:

- **Foso universal**: cinco máquinas dentro de una zanja. El señuelo naranja está centrado sobre la máquina 3 e indica el punto de salida del plato cuando la máquina está ajustada a cero grados.
- **Foso olímpico**: quince máquinas agrupadas en cinco puestos. En este modo el señuelo activo se desplaza delante del puesto del tirador y los otros posibles señuelos se muestran en gris.
- **Robot**: una única máquina oscilante/programable, inspirada en wobble trap, Automatic Ball Trap y tiradas populares con máquina robot. Puede trabajar con preset compatible ABT o con presets no normativos de feria/popular. El tirador también rota por los cinco puestos, igual que en una tirada completa.

El punto de vista principal es el del ojo derecho del tirador, situado a 1,70 m de altura. La escopeta no se dibuja como un objeto externo; el usuario ve el punto de mira rojo y, cuando hay ganancia de solista, un punto traslúcido que indica cómo sube el punto efectivo de impacto.

## 2. Controles

- **Pedir plato**: solicita un nuevo plato.
- **Repetir plato**: relanza el mismo plato anterior con la misma máquina, ángulo, altura y distancia. Sirve para estudiar platos muy laterales o rápidos.
- **Disparar**: dispara el cartucho actual.
- **Reset**: reinicia la tirada.
- **Puesto - / Puesto +**: cambia el puesto inicial o actual.
- **Plana / Alta**: alterna entre solista sin ganancia y solista elevada.
- **Ratón**: el cursor del juego es el propio punto rojo de mira.
- **Botón derecho**: pide plato.
- **Botón izquierdo**: dispara el primer y segundo tiro.
- **Leyenda**: muestra los símbolos de la escena y, en pantallas con espacio suficiente, una guía rápida de ratón: derecho para pedir plato, izquierdo para disparar y movimiento para apuntar.
- **Ayuda adelanto**: muestra u oculta el punto/área amarilla donde conviene llevar el tiro. Al ocultarla, la física y las correcciones siguen calculándose.
- **Trayectoria**: muestra u oculta la línea naranja discontinua del vuelo del plato.
- **Zoom visual**: acerca la escena para pantallas pequeñas o usuarios con peor visión. El valor `1.00x` conserva la escala reglamentaria; valores mayores estrechan la lente visual sin cambiar distancias ni físicas.
- **Retardo salida**: tiempo breve entre pedir el plato y que este salga realmente del foso. Por defecto es `0,03 s`, pensado como retardo de sistema/lanzadora, no como reacción humana.
- **Plomeo tiro 1 / Plomeo tiro 2**: ajustan la apertura del patrón de cada disparo, como una aproximación a chokes diferentes.
- **Variación plomeo**: introduce irregularidad entre disparos: huecos, pequeñas agrupaciones y diferencias leves de velocidad entre perdigones.
- **Energía residual**: el simulador calcula la pérdida de velocidad por distancia y exige una energía mínima para romper. Si un perdigón toca pero llega flojo, se marca como `Toque flojo`.
- **Análisis**: controla cuánto tiempo quedan visibles los rastros y la rotura o caída del plato. La corrección del disparo se conserva hasta que el tirador cambia de puesto.
- **Robot fuerza**: solo en modalidad Robot; simula apretar o aflojar el muelle, alterando velocidad inicial y alcance.
- **Robot altura**: solo en modalidad Robot; suma o resta inclinación vertical a la máquina.
- **Robot lateral**: solo en modalidad Robot; multiplica la apertura lateral de la secuencia.
- **Repetir plato**: repite el mismo plato desde el mismo puesto, sin sumar plato ni avanzar la rotación.
- **Ayuda**: abre una explicación para principiantes sobre modalidades, velocidades, cartuchos, aperturas, trayectorias y lectura de los elementos de pantalla.

La escena no se mueve al apuntar. El suelo, el foso, el señuelo y las marcas permanecen fijos; lo que se mueve es el punto de mira, igual que en la percepción del tirador cuando conserva la cabeza alineada y desplaza la escopeta.

Si un plato sale de la ventana útil de tiro, el lance se cierra como fallo, desaparece la ayuda de adelanto y la tirada avanza al siguiente puesto sin esperar a que el plato caiga fuera de campo.

La proyección usa un campo de visión vertical base de 48 grados. Así el tamaño percibido del foso y del plato depende del ángulo de visión, no del formato exacto del monitor; una pantalla más ancha muestra más campo lateral, pero no debería alejar artificialmente la escena. El control de zoom visual multiplica la focal de cámara para mejorar legibilidad sin tocar la geometría real del campo.

## 3. Geometría de Campo

El sistema usa metros como unidad interna.

| Elemento | Valor implementado | Referencia usada |
| --- | ---: | --- |
| Altura del ojo | 1,70 m | Modelo del tirador definido para el simulador |
| Línea de puestos a foso | 15 m | Reglas FITASC/ISSF |
| Profundidad visual del foso | 1,45 m | Aproximación de escena |
| Separación puestos universal | 2,50 m | Aproximación práctica para cinco puestos |
| Separación puestos olímpico | 3,15 m | Rango ISSF 3,00-3,30 m |
| Máquinas universal | 5 | FITASC Universal Trench |
| Máquinas olímpico | 15 | ISSF Trap |
| Altura de salida visible | 0,16 m | Boca de salida sobre la tapa del foso |
| Posición máquina bajo foso | 0,50 m bajo tapa y 0,50 m retrasada | FITASC Universal Trench 1.03 |

En universal, el señuelo naranja se mantiene antes del foso y sobre la línea central del puesto 3. En olímpico, el señuelo activo aparece delante del puesto desde el que se tira; los demás señuelos quedan en gris como referencia.

## 4. Normativa Usada

La implementación toma como guía normas y tablas oficiales, pero no pretende sustituir una homologación de campo.

- **Foso universal FITASC**: cinco máquinas dentro de la zanja, puestos a 15 m del borde delantero del foso y un plato/señuelo sobre la máquina 3 para indicar la salida a 0 grados. Las máquinas se modelan sobre bases alineadas, separadas 1,10 m, con el pivote aproximadamente 0,50 m bajo el techo del foso y 0,50 m retrasado del borde delantero.
- **Esquemas universal**: se modelan diez esquemas (`fu1` a `fu10`) con ángulos laterales de -45 a +45 grados, alturas de 1,5 a 3,5 m y distancias de 60 a 75 m.
- **Foso olímpico ISSF**: quince máquinas agrupadas en cinco grupos de tres, uno por cada puesto; se modelan nueve esquemas (`issf1` a `issf9`) con distancia objetivo de 76 m.
- **Robot / Wobble / ABT**: se añade como modalidad de entrenamiento no estrictamente federativa. El preset `Robot ABT` usa rangos compatibles con Automatic Ball Trap: alturas de 1,5-3,5 m a 10 m, ángulos amplios y alcance alrededor de 75 m. Los presets populares pueden superar esos márgenes y se etiquetan como `No normativo`.
- **Plato**: se representa como disco naranja macizo con forma escalonada, aproximando el plato real de 110 mm de diámetro y 25-26 mm de altura descrito en reglas técnicas ISSF.

Fuentes consultadas:

- [FITASC, International Rules Universal Trench 2025](https://www.fitasc.com/upload/images/reglements/2025_rglt_fu_eng.pdf)
- [ISSF, Rules](https://www.issf-sports.org/rules)
- [ISSF technical target dimensions, PDF federativo](https://www.asia-shooting.org/wp-content/uploads/2023/01/ISSF_Technical_Rules_Draft_01.01.2023-6.pdf)
- [USA Shooting / ISSF General Technical Rules, referencia de puestos y foso](https://usashooting.org/app/uploads/2022/04/2013_USAS_GTR.pdf)
- [RIO Star Team EVO Training, ficha comercial](https://centerfiresystems.com/collections/ammunition-shotshells/products/rio-ammunition-star-team-evo-training-12-gauge-2-75-1-1-8-oz-7-5-shot-box-or-case)
- [Beretta, DT11 International Trap](https://www.beretta.com/en-us/product/dt11-international-trap-FA0095)
- [Beretta, guia de chokes OptimaChoke HP](https://estore.beretta.com/en-hu/utility/choke-tubes-guide)
- [Beretta, guia de seleccion de choke](https://www.beretta.com/en-us/blog/how-to-choose-the-right-shotgun-choke-tube)
- [Hunter-ed, Shotgun Choke and Shot String](https://www.hunter-ed.com/national/studyGuide/Shotgun-Choke-and-Shot-String/201099_92847/)
- [NRA, Shotshell Ballistics, PDF](https://rangeservices.nra.org/media/4074/shotshell-ballistics.pdf)
- [CPSA, reglas Automatic Ball Trap / Wobble, Booklet 7](https://www.cpsa.co.uk/userfiles/files/CPSA_Booklet_7.pdf)
- [White Flyer, Shotgun Disciplines](https://whiteflyer.com/resources/shotgun-disciplines/)
- [Promatic Super Sporter 8 Wobble](https://www.promaticus.com/product-page/super-sporter-8-wobble)
- [Laporte American Trap](https://www.laporte.biz/en/our-traps/american-trap/)
- [Atlas Tri-Axis Wobble AT-250](https://www.atlastraps.com/Tri-axes-wobble-trap--AT250_p_204.html)
- [Bowman ABT Base](https://bowmantraps.co.uk/product/abt-base/)

## 5. Salida del Plato

Cuando se pide plato, la aplicación:

1. Mantiene el punto rojo en la guardia inicial.
2. Selecciona una máquina del esquema activo.
3. Espera el **Retardo salida** configurado, por defecto muy bajo para que la salida se sienta inmediata.
4. Calcula el vector de salida a partir del ángulo horizontal, la altura exigida a 10 m y la distancia normativa.
5. Lanza el plato desde la boca/rendija del foso en la planta del señuelo activo, con la máquina físicamente retrasada y por debajo.
6. Simula el vuelo con gravedad reducida y viento lateral opcional.

El antiguo concepto de "reacción" del tirador se sustituyó por este retardo de salida porque el simulador ya no mueve automáticamente la escopeta persiguiendo el plato. La reacción real queda en manos del usuario: cuándo localiza el plato, mueve el punto rojo y dispara. El control solo representa el pequeño intervalo entre la orden de pedir plato y la aparición física del objetivo.

En FITASC Universal Trench la salida se define como inmediata tras la llamada, considerando únicamente el tiempo de reacción al sonido, indicado aproximadamente en una décima de segundo. Por eso el valor inicial del simulador es `0,03 s`: deja una latencia técnica mínima sin convertirlo en una espera artificial.

La máquina activa visible bajo el suelo translúcido se coloca sobre la prolongación inversa del vector de lanzamiento. Por tanto, el tramo sólido máquina-boca y la trayectoria inicial del plato son colineales; si la trayectoria se curva después es por la integración de gravedad/viento, no por un quiebro artificial al salir del foso.

La velocidad inicial no se elige al azar. Para cada fila de esquema reglado se resuelve una parábola que cumple simultáneamente:

- altura exigida a 10 m;
- distancia de caída del esquema: 60-75 m en Universal y 76 m en Olímpico.

En modalidad **Robot**, cada fila también se expresa como ángulo, altura a 10 m y alcance. La diferencia es conceptual: `Robot ABT` se trata como compatible con ABT, mientras que `Robot feria circular`, `Robot popular extremo` y `Robot pseudoaleatorio` son intencionadamente no normativos. Sus controles modifican las filas base:

- `Robot fuerza`: multiplica el alcance, como apretar o aflojar el muelle.
- `Robot altura`: modifica la altura a 10 m, como cambiar la inclinación de la lanzadora.
- `Robot lateral`: multiplica el ángulo horizontal, como abrir o cerrar el barrido.

La banda superior muestra `Compatible ABT` o `No normativo` para que quede claro cuándo se está entrenando una situación de pueblo/feria y no una referencia federativa.

En la parte superior de la escena aparece una banda de verificación con velocidad inicial, ángulo, altura real a 10 m, alcance calculado y un check de cumplimiento. Si el viento está activado, la banda indica que la validación corresponde al ajuste base de máquina sin viento.

La posición del plato en el tiempo se calcula como:

```text
x(t) = x0 + vx*t + 0.5*wind*0.28*t^2
y(t) = y0 + vy*t - 0.5*g*0.42*t^2
z(t) = z0 + vz*t
```

El factor de gravedad reducido no intenta afirmar que el plato ignore la gravedad; compensa de forma práctica la sustentación aerodinámica del plato real para obtener una trayectoria visual y entrenable.

## 5.1. Verificación Automática de Esquemas

El repositorio incluye una prueba sin dependencias para auditar todos los esquemas definidos en `index.html`:

```bash
node scripts/verify-schemes.js
```

La prueba recorre 185 lanzamientos teóricos: 50 de Universal y 135 de Olímpico. Falla si alguna fila no reproduce su altura a 10 m o si el alcance se sale de tolerancia: ±5 m para Universal y ±1 m para Olímpico.

Esta prueba es importante porque evita que un cambio visual rompa la física normativa sin que se note. La aplicación muestra arriba los mismos conceptos que audita el test: velocidad inicial, máquina, ángulo, altura a 10 m, alcance y tiempo de vuelo. El texto `Cumple normativa` no es decorativo: sale de recalcular la trayectoria del plato actual contra los valores de su esquema.

Los esquemas están definidos como datos dentro del propio `index.html`. Para añadir o revisar una tabla, el flujo correcto es:

1. modificar las filas de máquinas, ángulos, alturas y distancias;
2. ejecutar `node scripts/verify-schemes.js`;
3. comprobar que la banda superior de la aplicación refleja los mismos valores;
4. solo después ajustar la representación visual si hace falta.

## 6. Adelanto

El área amarilla/translúcida representa la zona a la que conviene apuntar para que la nube de perdigones intercepte el plato. No es un punto mágico: es una estimación física recalculada en cada fotograma.

![Nube de adelanto sobre el plato](docs/screenshots/nube-adelanto.png)

Las ayudas visuales de adelanto se recortan al suelo: si el punto recomendado o la trayectoria futura caerían por debajo del terreno, dejan de pintarse para no sugerir un disparo imposible.

El cálculo parte de dos ideas:

- El plato se sigue moviendo mientras los perdigones viajan.
- Cuanto más lejos está el plato, más tiempo tardan los perdigones y más adelanto suele hacer falta.

La aplicación calcula primero una intersección aproximada entre plato y centro del disparo. Después afina el ángulo con una búsqueda local que minimiza la distancia entre el centro de la nube de perdigones y el plato usando el mismo integrador físico que se utiliza al validar el impacto.

## 7. Cartucho y Perdigones

El cartucho de referencia es RIO Star Team EVO Training. En la versión actual se modela como:

- Velocidad configurable del cartucho.
- Velocidad efectiva inicial de perdigón: `velocidad_cartucho * 0.78`.
- Pérdida de velocidad por distancia mediante una curva exponencial simplificada.
- Energía residual individual por perdigón.
- Umbral mínimo de rotura: si un perdigón toca pero llega por debajo del umbral, no rompe el plato.
- 306 perdigones, aproximación compatible con una carga de 1 1/8 oz de plomo #7.5.
- Dispersión configurable por separado para tiro 1 y tiro 2.
- Patrón de nube no gaussiano, con variación por disparo, para aproximar un flujo de perdigones con anillos, huecos y agrupaciones internas.
- Un perdigón central que representa el núcleo del plomeo, más una nube distribuida alrededor.
- Diferencias leves de velocidad y salida entre perdigones para representar una cuerda de tiro simplificada: la nube no llega como un disco plano perfecto, sino como un volumen corto en movimiento.

La referencia de escopeta es una Beretta DT11 de trap. Beretta documenta el DT11 dentro de la familia de cañones/chokes OptimaChoke HP, y las configuraciones de trap suelen trabajar con chokes cerrados. En el simulador se usan valores iniciales conservadores:

| Disparo | Referencia práctica | Control inicial |
| --- | --- | ---: |
| Tiro 1 | 3/4 / Improved Modified, algo más abierto para plato cercano | 30 |
| Tiro 2 | Full, más cerrado para plato más alejado | 20 |

Estos controles no cambian el número de perdigones; reducen o amplían el radio del cono de plomeo. La fórmula actual es:

```text
radio_patron = 0.22 + apertura*0.0045 + distancia*(0.0035 + apertura*0.00003)
distancia_perdigon(t) = ln(1 + k*v0*t) / k
velocidad_residual(d) = v0 * e^(-k*d)
energia = 0.5 * masa_perdigon * velocidad_residual^2
```

Donde `apertura` es el valor del control correspondiente al tiro actual. Valores bajos representan chokes más cerrados. La constante `k` es una aproximación práctica de arrastre, calibrada para mostrar que la energía cae con la distancia sin afirmar una curva exacta para todos los cartuchos.

### 7.1. Variación Realista del Plomeo

El control **Variación plomeo** añade realismo al patrón sin convertirlo en una lotería. Con valores bajos el patrón se parece más a una diana repetible; con valores altos aparecen microhuecos, pequeñas agrupaciones, periferia más irregular y ligeras diferencias de velocidad entre perdigones.

Esto aproxima el comportamiento real de una carga de escopeta: al salir del cartucho los perdigones no forman un círculo matemático perfecto, sino una nube tridimensional o *shot string*. Hunter-ed describe el *shot string* como la dispersión tridimensional de los perdigones tras abandonar el cañón. En el simulador se modela de forma contenida porque, a distancias de plato, el efecto dominante sigue siendo el adelanto, la apertura del choke y la posición del centro del plomeo.

La implementación usa una semilla distinta por disparo. Esa semilla altera:

- la posición angular de cada perdigón dentro del cono;
- el radio relativo de cada anillo del plomeo;
- pequeñas agrupaciones y huecos;
- una velocidad ligeramente menor en parte de los perdigones periféricos;
- un retraso muy pequeño de algunos perdigones para que la nube tenga profundidad.

El objetivo no es representar una simulación CFD completa del taco, el rozamiento entre perdigones y la deformación del plomo. Es una aproximación práctica: conserva un patrón entrenable y físicamente explicable, pero evita que el panel de plomeo parezca una plantilla sintética perfecta.

### 7.2. Impacto Físico

Cada disparo genera direcciones individuales para todos los perdigones. Para cada perdigón se simula su trayectoria, su pérdida de velocidad y su energía. La comprobación geométrica exige que pase a menos de 7,5 cm del centro del plato:

```text
px(t) = ojo.x + dir.x * distancia_perdigon(t)
py(t) = ojo.y + dir.y * distancia_perdigon(t) - 0.5*g*0.08*t^2
pz(t) = ojo.z + dir.z * distancia_perdigon(t)
```

El plato se rompe solo si algún perdigón intersecta físicamente su volumen simplificado y llega con energía suficiente. Por eso se puede apuntar cerca del área ideal y fallar: la nube tiene dispersión, el plato se mueve, el usuario puede quedar ligeramente retrasado/adelantado/alto/bajo, y además el perdigón puede llegar ya sin fuerza de rotura. Cuando el simulador indica `Roto borde`, significa que el centro del plomeo no iba perfectamente centrado, pero un perdigón periférico alcanzó el plato con energía suficiente. Cuando indica `Toque flojo`, hubo contacto geométrico por debajo del umbral de rotura.

La comprobación de impacto usa un paso temporal fino (`0,0007 s`) para evitar que un perdigón rápido salte de un lado a otro del plato entre dos muestras sin registrar la colisión. El intervalo máximo de evaluación se amplía para permitir tiros más largos, pero la energía residual limita la rotura efectiva.

## 8. Corrección Tras el Tiro

El panel inferior izquierdo de corrección ayuda a entender por qué se ha roto o fallado el plato. Está dividido en **tiro 1** y **tiro 2**. Cada subpanel aparece solo cuando ese disparo existe, para no distraer antes de tiempo.

Cada subpanel representa un plano perpendicular a la trayectoria de los perdigones en la zona del plato. Esta vista es más útil que una simple proyección superior/lateral, porque enseña el patrón real del disparo visto como si hubiera una diana colocada en el punto donde estaba el plato:

- El plato se dibuja en naranja en el centro del plano de referencia.
- Los puntos azul claro son perdigones individuales proyectados sobre ese plano.
- Los puntos verdes son perdigones que han roto el plato.
- El punto rojo indica el centro físico del disparo.
- Las indicaciones de color explican si el disparo quedó alto, bajo, adelantado o retrasado respecto al plato.

El eje de adelanto se calcula siguiendo la dirección real de vuelo del plato. Por eso cambia visualmente cuando el plato va hacia la derecha o hacia la izquierda: "adelantado" siempre significa por delante de la trayectoria del objetivo, no simplemente a la derecha o a la izquierda de la pantalla.

La referencia amarilla es el punto físico recomendado; el punto rojo representa el encare del tirador; el azul claro representa el centro físico del plomeo del tiro actual. El aro amarillo y el aro azul se escalan por separado con su propia distancia 3D al ojo del tirador, porque pueden estar en profundidades distintas.

El control **Analisis** define cuantos segundos quedan visibles los fragmentos y los rastros tras el disparo. La corrección congelada permanece hasta que se aplica el cambio de puesto del tirador, porque pertenece al puesto desde el que se disparó. Es una ayuda visual: no altera la fisica ni cuenta platos. La camara lenta tambien es visual; para probar una tirada a tiempo real hay que subir **Camara lenta** a `1.00x`.

![Ventanas de corrección del primer y segundo tiro](docs/screenshots/correcciones-doble-tiro.png)

## 9. Guardia y Solista

La aplicación distingue dos conceptos:

- **Guardia neutra**: el punto rojo empieza apuntando al señuelo.
- **Guardia alta**: el punto de salida inicial se coloca algo por encima y hacia el lado natural del puesto, como ayuda para no tapar el plato al arrancar.

La **ganancia de solista** modifica el punto efectivo de impacto. Visualmente:

- El punto rojo es donde el tirador apunta.
- El punto traslúcido muestra dónde impactaría el centro del disparo por la elevación de la solista.

Esto permite representar la diferencia entre una escopeta plana, que obliga a tapar más el plato, y una configuración con ganancia, donde se puede apuntar algo por debajo porque el disparo sale más alto que el punto de mira. El rango actual llega hasta `0,96 grados` de elevación balística para que el efecto sea claramente visible durante el entrenamiento.

La representación gráfica de la solista queda desactivada por ahora para no confundir el entrenamiento visual. La ganancia sigue activa como cálculo balístico: no dibuja la escopeta, solo desplaza hacia arriba el punto físico de impacto.

## 10. Tirada de 25 Platos

La tirada se modela como una serie de 25 platos:

- El contador muestra platos tirados y rotos.
- El tirador rota por los puestos 1, 2, 3, 4 y 5.
- El puesto no avanza hasta que termina el efecto de rotura o el análisis visual del fallo.
- El punto de partida puede cambiarse manualmente para comenzar desde otro puesto.

![Vista completa con controles y paneles](docs/screenshots/vista-completa.png)

## 11. Limitaciones

El simulador es una herramienta de entrenamiento visual y experimentación. Las magnitudes físicas están expresadas en metros, segundos y grados, pero algunas constantes son aproximaciones calibradas para una experiencia comprensible en pantalla:

- La aerodinámica del plato se simplifica con gravedad efectiva.
- La pérdida de velocidad de los perdigones se modela con una curva exponencial pedagógica, no con una tabla exacta por tamaño de plomo, temperatura, taco y cañón.
- El umbral de energía de rotura es una aproximación entrenable; debe calibrarse con datos reales si se desea homologación.
- El patrón de plomeo incluye variación por disparo, pero no modela deformación individual completa del plomo, rozamiento interno del taco ni turbulencia real.
- La probabilidad real de rotura depende de cartucho, choke, cañón, viento, calidad del plato y distancia efectiva.

## 12. Ejecución Local

Desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

Luego abrir:

```text
http://localhost:8000/
```

## 13. Estructura

```text
.
├── index.html
├── docs.html
├── README.md
├── docs/
│   ├── assets/       # infografías PNG generativas
│   └── screenshots/
└── auxiliares/        # scripts temporales locales, excluidos de git
```

## 14. Licencia

Este proyecto se publica bajo licencia MIT.

Copyright (c) 2026 Roberto Canales Mora

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentación asociados, para tratar el software sin restricción, incluyendo sin limitación los derechos de uso, copia, modificación, fusión, publicación, distribución, sublicencia y/o venta de copias del software, y para permitir a las personas a quienes se les proporcione el software que hagan lo mismo, sujeto a las siguientes condiciones:

Al usar, copiar, modificar, distribuir o publicar versiones derivadas de este proyecto debe conservarse siempre la referencia al autor original, **Roberto Canales Mora**, junto con el enlace a [www.robertocanales.com](https://robertocanales.com/proyectos#plato). Esta atribución forma parte del aviso de copyright y de permiso que debe acompañar a todas las copias o partes sustanciales del software.

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del software.

EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITÁNDOSE A GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y NO INFRACCIÓN. EN NINGÚN CASO LOS AUTORES O TITULARES DEL COPYRIGHT SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑO U OTRA RESPONSABILIDAD, YA SEA EN UNA ACCIÓN CONTRACTUAL, EXTRACONTRACTUAL O DE OTRO TIPO, QUE SURJA DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O EL USO U OTRAS OPERACIONES EN EL SOFTWARE.
