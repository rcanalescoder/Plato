/*
  Auditor de maquetación de idiomas · proyecto Plato
  ===========================================================================

  Mide, en todos los idiomas a la vez, lo que el ojo tarda en ver y sólo
  descubre generando veintiocho páginas de PDF: rótulos que no caben en su
  caja, texto que el navegador tiene que comprimir para que entre, y columnas
  del cuaderno que se salen de la página por abajo.

  Existe porque el alemán rompió la portada del cuaderno y al medirlo salió
  que el inglés estaba a un píxel de romperla también. Añadir un idioma sin
  esto es enterarse de los desbordes en producción.

  Cómo se usa:

    1. Abre app.html en el navegador (sirve el repo, no vale file://).
    2. Pega este fichero entero en la consola.
    3. Escribe __auditar() y mira lo que devuelve.

  Qué devuelve, por idioma:

    problemas  Rótulos que se salen de su caja. Cualquier cosa aquí hay que
               arreglarla, casi siempre acortando el rótulo.
    aprieta    Texto que cabe pero comprimido, con el porcentaje. Hasta un
               5 % no se nota; a partir de un 10 % conviene acortar.
    alto       Columnas del cuaderno que no caben a escala 1. No es un fallo:
               el generador prueba escalas menores y se queda con la que cabe.
               Sirve para saber qué idiomas salen con la letra más pequeña.
    holgura    Píxeles que sobran por debajo en portada y cierre, por columna.

  Reproduce la aritmética de renderCoverPage y renderClosingPage sin dibujar
  nada: cuenta las líneas que ocupa cada párrafo con measureText y suma las
  mismas alturas que suma el generador. Si se cambia la maquetación del
  cuaderno, hay que cambiarla aquí también o el auditor mentirá.
*/

window.__auditar = function () {
  const c = document.createElement("canvas").getContext("2d");
  const PAGE_H = 1240;
  const salida = {};

  function lineas(value, maxWidth, size, weight) {
    c.font = `${weight || 400} ${size}px ${FONT_STACK}`;
    const porChar = t("nbk.wordBreak") === "char";
    const units = porChar ? Array.from(String(value)) : String(value).split(" ");
    const join = porChar ? "" : " ";
    let line = "";
    let n = 1;
    units.forEach(u => {
      const a = line ? line + join + u : u;
      if (c.measureText(a).width > maxWidth && line) { n++; line = u; } else { line = a; }
    });
    return n;
  }

  const par = (v, w, size = 17, weight) => lineas(v, w, size, weight) * Math.round(size * 1.6);
  const bul = (v, w, size = 17) => par(v, w - 18, size) + 6;
  const head = 52;

  function portada() {
    const colW = 740;
    const rightW = 760;
    let y = 348 + head;
    y += par(t("nbk.cover.5"), colW);
    y += 10 + par(t("nbk.cover.6"), colW);
    y += 26 + head;
    y += bul(t("nbk.cover.8"), colW) + bul(t("nbk.cover.9"), colW) + bul(t("nbk.cover.10"), colW) + bul(t("nbk.cover.11"), colW);
    y += 26 + head;
    y += bul(t("nbk.cover.13"), colW) + bul(t("nbk.cover.14"), colW) + bul(t("nbk.cover.15"), colW);

    let ry = 348 + head;
    // paramsLine() vive dentro del bloque del cuaderno; aquí se reconstruye
    // con las mismas claves, que es lo que determina el largo.
    const ajustes = [
      `${t("nbk.p.cartridge")} 400 m/s`, `${t("nbk.p.rib")} 0% (0,00°)`,
      `${t("nbk.p.wind")} 0,0 m/s`, `${t("nbk.p.delay")} 0,03 s`,
      `${t("nbk.p.pattern1")} 1 3/4`, `${t("nbk.p.hold")} ${t("guard.neutral").toLowerCase()}`
    ].join("   ·   ");
    ry += 12 + par(ajustes, rightW - 36, 16);
    ry += 26 + par(t("nbk.cover.18"), rightW, 16, 600);
    ry += 8 + par(t("nbk.cover.19"), rightW, 16);
    ry += 26 + head;
    ry += par(t("nbk.cover.21"), rightW);
    ry += 10 + par(t("nbk.cover.22"), rightW, 16);
    ry += 88 + head;
    ry += bul(t("nbk.cover.26"), rightW) + bul(t("nbk.cover.17").replace("{n}", 25), rightW) + bul(t("nbk.cover.27"), rightW);
    return { izquierda: y, derecha: ry, tope: PAGE_H - 118 };
  }

  function cierre() {
    const colW = 740;
    const rightW = 760;
    let y = 214 + head;
    y += par(t("nbk.close.4"), colW);
    y += 10 + par(t("nbk.close.5"), colW);
    y += 26 + head;
    y += par(t("nbk.close.7"), colW);
    y += 10 + par(t("nbk.close.8"), colW);
    y += 26 + head;
    y += bul(t("nbk.close.10"), colW) + bul(t("nbk.close.11"), colW) + bul(t("nbk.close.12"), colW);

    let ry = 214 + head;
    ry += par(t("nbk.close.14"), rightW, 17, 700);
    ry += 8 + par(t("nbk.close.15"), rightW, 16);
    ry += 10 + par(t("nbk.close.16"), rightW, 14, caseless() ? 600 : 400);
    ry += 26 + head;
    ry += par(t("nbk.close.18"), rightW, 16);
    ry += 122 + head;
    ry += par(t("nbk.close.23"), rightW, 16);
    return { izquierda: y, derecha: ry, tope: PAGE_H - 76 };
  }

  LANGS.forEach(({ code }) => {
    applyLanguage(code);
    if (typeof relocalizeSimulator === "function") relocalizeSimulator();
    const problemas = [];

    document.querySelectorAll("[data-i18n]").forEach(n => {
      if (n.scrollWidth > n.clientWidth + 1) problemas.push("html " + n.dataset.i18n + " :: " + n.textContent);
    });
    document.querySelectorAll(".control, .stat, .switch-row label, .button-row").forEach(n => {
      if (n.scrollWidth > n.clientWidth + 3) problemas.push("caja «" + n.textContent.trim().slice(0, 26) + "» " + n.scrollWidth + "/" + n.clientWidth);
    });
    if (document.body.scrollWidth > window.innerWidth) problemas.push("SCROLL horizontal " + document.body.scrollWidth + ">" + window.innerWidth);
    const tb = document.querySelector(".toolbar");
    if (tb.scrollWidth > tb.clientWidth + 2) problemas.push("barra superior " + tb.scrollWidth + "/" + tb.clientWidth);

    c.font = "500 11px " + FONT_STACK;
    [["cv.legend.clay", 276], ["cv.legend.lead", 276], ["cv.legend.pattern", 276], ["cv.legend.aim", 276],
     ["cv.legend.shotCentre", 276], ["cv.legend.hit", 276], ["cv.legend.path", 276],
     ["cv.mouse.right", 103], ["cv.mouse.left", 103], ["cv.mouse.move", 103]].forEach(([k, max]) => {
      const w = c.measureText(t(k)).width;
      if (w > max) problemas.push("canvas " + k + " " + Math.round(w) + ">" + max + " «" + t(k) + "»");
    });

    // Comprimido: cabe, pero el navegador tiene que estrecharlo. Más de un 12 % se nota.
    const aprieta = [];
    const mide = (texto, size, max, weight, etiqueta) => {
      c.font = `${weight || 500} ${size}px ${FONT_STACK}`;
      const w = c.measureText(texto).width;
      if (w > max) aprieta.push(etiqueta + " " + Math.round(100 * w / max - 100) + "%");
    };
    mide(`${t("nbk.strip.clayAt")} 60 m · ${t("nbk.strip.heightAt")} 2,7 m · ${t("nbk.strip.realSep")} 8,9 m`, 13, 292, 500, "tira");
    mide(`${t("nbk.moment.muy-tarde")}`, 17, 260, 700, "tira-titulo");
    mide(`${t("nbk.note.muy-tarde")} · ${t("nbk.range.out")}`, 13, 292, 700, "tira-nota");
    mide(`195 cm  ·  17,7 ${t("nbk.strip.clays")}  ·  0,88 s`, 14, 200, 400, "indice-celda");
    mide(t("nbk.index.h.lead"), 13, 200, 700, "indice-cabecera");
    mide(t("nbk.card.warnOwn"), caseless() ? 14 : 12, 700, 700, "aviso-ficha");

    const port = portada();
    const cie = cierre();
    const alto = [];
    if (port.izquierda > port.tope) alto.push("portada izquierda " + port.izquierda + ">" + port.tope);
    if (port.derecha > port.tope) alto.push("portada derecha " + port.derecha + ">" + port.tope);
    if (cie.izquierda > cie.tope) alto.push("cierre izquierda " + cie.izquierda + ">" + cie.tope);
    if (cie.derecha > cie.tope) alto.push("cierre derecha " + cie.derecha + ">" + cie.tope);

    salida[code] = {
      problemas,
      aprieta,
      alto,
      holgura: {
        portada: [port.tope - port.izquierda, port.tope - port.derecha],
        cierre: [cie.tope - cie.izquierda, cie.tope - cie.derecha]
      }
    };
  });

  applyLanguage(pickLanguage());
  if (typeof relocalizeSimulator === "function") relocalizeSimulator();
  return salida;
};
"cargado";
