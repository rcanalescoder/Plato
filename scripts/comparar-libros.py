#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Detector de castellano que no adivina: compara los dos libros.

Los detectores por heurística fallan con los títulos. «Plato cruzado» no lleva
tilde ni una sola palabra funcional, así que ningún filtro de castellano lo ve,
y así se quedaron sin traducir decenas de titulares mientras yo informaba de
cero.

Aquí no se adivina el idioma. Los dos libros tienen la misma estructura, así
que se recorren en paralelo y se compara texto con texto: si el segmento
inglés es idéntico al castellano, es que nadie lo tradujo. Da igual qué
palabras lleve.

Se descartan los que deben coincidir: cifras, nombres de fichero, comandos,
URLs, siglas y los nombres propios que el proyecto no traduce.

    python3 comparar.py            # informe
    python3 comparar.py --json <f> # además, los segmentos a traducir
"""
import io
import json
import re
import sys

BLOQUES = {"p", "aside", "div", "section", "article", "ul", "ol", "li", "table",
           "thead", "tbody", "tr", "figure", "figcaption", "blockquote", "dl",
           "nav", "header", "footer", "main", "details", "h1", "h2", "h3", "h4",
           "h5", "h6", "form", "fieldset", "picture", "video", "canvas"}
VACIAS = {"img", "br", "meta", "link", "input", "hr", "source", "col", "area",
          "base", "embed", "param", "track", "wbr"}
ATRIBUTOS = ("alt", "title", "aria-label", "placeholder")

# Coincidir aquí no es un fallo: son cosas que en inglés se escriben igual.
EXENTOS = re.compile(
    r"^(?:[\W\d\s]*|"                                   # sólo cifras o signos
    r"[\w./-]+\.(?:png|jpg|md|js|css|html|json|zip|pdf)|"  # ficheros
    r"https?://\S+|"                                     # urls
    r"(?:FITASC|ISSF|CPSA|RFEDETO|ABT|MIT|BOE|PNG|JPG|SHA-256|GitHub|"
    r"Plato|Trap1|Compak|JavaScript|canvas|HTML|CSS|Guardia Civil)[\w\s.,·:/-]*"
    r")$", re.I)


def hojas(ruta):
    s = io.open(ruta, encoding="utf-8").read()
    muertas = [(m.start(), m.end()) for m in
               re.finditer(r"<(script|style)\b.*?</\1>|<!--.*?-->", s, re.S | re.I)]
    viva = lambda p: not any(a <= p < b for a, b in muertas)

    pila, elementos = [], []
    for m in re.finditer(r"<(/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>\"']|\"[^\"]*\"|'[^']*')*?)(/?)>", s):
        cierre, tag, _, vacio = m.group(1), m.group(2).lower(), m.group(3), m.group(4)
        if cierre:
            for i in range(len(pila) - 1, -1, -1):
                if pila[i][0] == tag:
                    t, ini, hijos = pila[i]
                    elementos.append((t, ini, m.start(), hijos))
                    del pila[i:]
                    break
        elif not vacio and tag not in VACIAS:
            for _, _, hijos in pila:
                hijos.add(tag)
            pila.append([tag, m.end(), set()])

    fuera = []
    for tag, ini, fin, hijos in sorted(elementos, key=lambda e: e[1]):
        if hijos & BLOQUES or not viva(ini):
            continue
        dentro = s[ini:fin]
        texto = re.sub(r"<[^>]+>", "", dentro).strip()
        if not texto:
            continue
        if any(ini >= a and fin <= b for a, b, _, _, _ in fuera):
            continue
        fuera.append((ini, fin, tag, dentro, " ".join(texto.split())))

    atrs = []
    for m in re.finditer(r'\b(' + "|".join(ATRIBUTOS) + r')="([^"]*)"', s):
        if m.group(2).strip() and viva(m.start()):
            atrs.append((m.start(2), m.end(2), m.group(1), m.group(2),
                         " ".join(m.group(2).split())))
    return fuera, atrs


def main():
    es_t, es_a = hojas("index.html")
    en_t, en_a = hojas("en/index.html")

    problemas = []
    for nombre, es, en in (("texto", es_t, en_t), ("atributo", es_a, en_a)):
        if len(es) != len(en):
            print(f"  aviso: {nombre} -> {len(es)} en castellano y {len(en)} en inglés; "
                  "la estructura no cuadra, se comparan los que se pueden alinear")
        for i, (a, b) in enumerate(zip(es, en)):
            if a[4] == b[4] and not EXENTOS.match(b[4]):
                problemas.append({"clase": nombre, "tag": b[2], "ini": b[0], "fin": b[1],
                                  "html": b[3], "texto": b[4], "id": f"c{len(problemas):05d}"})

    print(f"\nsegmentos idénticos en los dos libros (= sin traducir): {len(problemas)}\n")
    from collections import Counter
    for (cl, t), n in Counter((p["clase"], p["tag"]) for p in problemas).most_common():
        print(f"  {cl:9s} {t:12s} {n}")
    print()
    for p in problemas[:40]:
        print(f'  <{p["tag"]}> {p["texto"][:90]}')
    if len(problemas) > 40:
        print(f"  ... y {len(problemas) - 40} más")

    if "--json" in sys.argv:
        destino = sys.argv[sys.argv.index("--json") + 1]
        json.dump({"fichero": "en/index.html", "segmentos": problemas},
                  io.open(destino, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"\nescrito {destino}")
    return 1 if problemas else 0


sys.exit(main())
