#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Reduce el peso de las infografías sin que se note en pantalla.

Las láminas salen del modelo de imagen como PNG de color verdadero de 1,3-1,7
MB cada una, y hay casi 500 entre las castellanas y las inglesas: más de 700 MB
en un repositorio que se sirve por GitHub Pages. Son ilustraciones de tinta
plana con texto: una paleta de 256 colores las representa sin banding visible y
pesa alrededor de un 22 % de lo que pesaban.

Es una conversión con pérdida, así que no se toca nada por debajo del umbral
(ya comprimido) ni nada que crezca al convertirlo.

    python3 scripts/comprimir-infografias.py --dry-run
    python3 scripts/comprimir-infografias.py
    python3 scripts/comprimir-infografias.py docs/.../infografias/en

El tercer uso limita la pasada a una subcarpeta, que hace falta cuando hay
agentes leyendo el resto y no conviene tocárselo a mitad de comparación.
"""
import os
import sys

from PIL import Image

RAIZ = os.path.join("docs", "manual-libro", "assets", "images", "infografias")
COLORES = 256
MINIMO = 400_000  # por debajo de esto ya está comprimida


def main():
    seco = "--dry-run" in sys.argv
    sueltos = [a for a in sys.argv[1:] if not a.startswith("--")]
    raiz = sueltos[0] if sueltos else RAIZ
    antes = despues = 0
    tocadas = saltadas = crecidas = 0

    for base, _, ficheros in os.walk(raiz):
        for f in sorted(ficheros):
            if not f.endswith(".png"):
                continue
            ruta = os.path.join(base, f)
            tam = os.path.getsize(ruta)
            antes += tam
            if tam < MINIMO:
                despues += tam
                saltadas += 1
                continue

            im = Image.open(ruta)
            modo = im.mode
            pal = im.convert("RGB").quantize(
                colors=COLORES, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG)
            tmp = ruta + ".tmp.png"
            pal.save(tmp, format="PNG", optimize=True)
            nuevo = os.path.getsize(tmp)

            # Si no gana nada, se deja el original: la pérdida sale gratis sólo
            # cuando compensa.
            if nuevo >= tam * 0.9:
                os.remove(tmp)
                despues += tam
                crecidas += 1
                continue

            if seco:
                os.remove(tmp)
            else:
                os.replace(tmp, ruta)
            despues += nuevo
            tocadas += 1
            if modo not in ("RGB", "RGBA", "P"):
                print(f"  aviso: {ruta} venía en modo {modo}")

    mb = lambda n: f"{n / 1e6:,.0f} MB".replace(",", ".")
    print(f"convertidas : {tocadas}")
    print(f"ya pequeñas : {saltadas}")
    print(f"sin ganancia: {crecidas}")
    print(f"antes       : {mb(antes)}")
    print(f"después     : {mb(despues)}  ({despues * 100 // max(1, antes)} %)")
    if seco:
        print("\n--dry-run: no se ha escrito nada.")


main()
