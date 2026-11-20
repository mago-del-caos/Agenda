#!/usr/bin/env python3
"""Genera noticias.json para la banda de noticias de Ag Lucem (Novedades).

Se ejecuta cada día a las 7:00 (America/Mexico_City) vía GitHub Actions.
Lee los titulares principales de Google News (RSS, español/México) para
15 temas y para la portada general. Si un tema falla, conserva sus datos
anteriores. Solo usa la biblioteca estándar de Python.
"""
import json
import os
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo("America/Mexico_City")
BASE = "https://news.google.com/rss"
PARAMS = "hl=es-419&gl=MX&ceid=MX:es-419"

TEMAS = {
    "educacion":   ("Educación", "educación México SEP escuelas universidades"),
    "tecnologia":  ("Tecnología e IA", "inteligencia artificial tecnología"),
    "ciencia":     ("Ciencia", "ciencia investigación descubrimiento estudio"),
    "filosofia":   ("Filosofía y humanidades", "filosofía humanidades pensamiento"),
    "politica":    ("Política de México", "política México gobierno"),
    "economia":    ("Economía y negocios", "economía México finanzas negocios"),
    "salud":       ("Salud y bienestar", "salud medicina bienestar"),
    "cultura":     ("Cultura y arte", "cultura arte México"),
    "literatura":  ("Libros y literatura", "libros literatura escritores"),
    "mundo":       ("Mundo", "noticias internacionales mundo"),
    "ambiente":    ("Medio ambiente", "medio ambiente cambio climático"),
    "deportes":    ("Deportes", "deportes México fútbol"),
    "videojuegos": ("Videojuegos", "videojuegos gaming industria"),
    "religion":    ("Religión", "religión espiritualidad México"),
    "seguridad":   ("Seguridad y justicia", "seguridad justicia México"),
}

POR_TEMA = 4
PORTADA_N = 8


def leer_feed(url, maximo):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (AgLucem Noticias)"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        datos = resp.read()
    raiz = ET.fromstring(datos)
    items = []
    vistos = set()
    for item in raiz.iter("item"):
        titulo = (item.findtext("title") or "").strip()
        enlace = (item.findtext("link") or "").strip()
        if not titulo or not enlace or enlace in vistos:
            continue
        vistos.add(enlace)
        fuente_el = item.find("source")
        fuente = (fuente_el.text or "").strip() if fuente_el is not None and fuente_el.text else ""
        if " - " in titulo and fuente and titulo.endswith(" - " + fuente):
            titulo = titulo[: -len(" - " + fuente)]
        hora = ""
        pub = item.findtext("pubDate")
        if pub:
            try:
                dt = parsedate_to_datetime(pub).astimezone(TZ)
                hora = dt.strftime("%H:%M")
            except Exception:
                hora = ""
        items.append({"titulo": titulo, "enlace": enlace, "fuente": fuente, "hora": hora})
        if len(items) >= maximo:
            break
    return items


def url_busqueda(consulta):
    return f"{BASE}/search?q={urllib.parse.quote(consulta)}&{PARAMS}"


def main():
    raiz_repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ruta_json = os.path.join(raiz_repo, "noticias.json")

    anterior = {}
    if os.path.exists(ruta_json):
        try:
            with open(ruta_json, encoding="utf-8") as f:
                anterior = json.load(f)
        except Exception:
            anterior = {}

    salida = {
        "actualizado": datetime.now(TZ).strftime("%Y-%m-%d %H:%M"),
        "portada": [],
        "temas": {},
    }

    try:
        salida["portada"] = leer_feed(f"{BASE}?{PARAMS}", PORTADA_N)
        print(f"portada: {len(salida['portada'])} titulares")
    except Exception as e:
        print(f"portada falló ({e}); se conserva la anterior", file=sys.stderr)
        salida["portada"] = anterior.get("portada", [])

    for clave, (nombre, consulta) in TEMAS.items():
        try:
            noticias = leer_feed(url_busqueda(consulta), POR_TEMA)
            if not noticias:
                raise ValueError("feed vacío")
            salida["temas"][clave] = {"nombre": nombre, "noticias": noticias}
            print(f"{clave}: {len(noticias)} titulares")
        except Exception as e:
            print(f"{clave} falló ({e}); se conserva el anterior", file=sys.stderr)
            previo = anterior.get("temas", {}).get(clave)
            salida["temas"][clave] = previo if previo else {"nombre": nombre, "noticias": []}

    with open(ruta_json, "w", encoding="utf-8") as f:
        json.dump(salida, f, ensure_ascii=False, indent=1)
    print("noticias.json escrito:", ruta_json)


if __name__ == "__main__":
    main()
