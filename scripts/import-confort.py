#!/usr/bin/env python3
"""
Convertit l'export confort_immo_biens.json (scraping confort.immo) au format
de src/data/annonces.json utilisé par le site.

  python3 scripts/import-confort.py [chemin/vers/confort_immo_biens.json]

Les données d'origine sont hétérogènes (type, localisation et adresse parfois
contradictoires) : on recoupe étiquette de localisation, titre puis adresse.
"""
import html
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'confort_immo_biens.json'
OUT = ROOT / 'src/data/annonces.json'
PHONES = ['+21625354558', '+21621160063']
TYPOS = [(r'\bjrdins\b', 'jardins'), (r'\bjardins d carthage', 'jardins de Carthage'), (r'\bhamammet\b', 'Hammamet'),
         (r'\bindistruel\b', 'industrielle'), (r'\bberge du lac', 'berges du lac'), (r'\bplain pied\b', 'plain-pied'),
         (r'\bau berges\b', 'aux berges'), (r'\bmeuble\b', 'meublé'), (r'\bjumelee\b', 'jumelée'),
         (r'\bindependante\b', 'indépendante'), (r'\bsuperieur\b', 'supérieur'), (r'\bcite\b', 'cité'), (r'\bl eau\b', "l'eau"),
         (r'\ba01\b', 'Appartement'), (r'\bentrepot\b', 'entrepôt'), (r'\blac\b', 'Lac'), (r' a (?=\w)', ' à ')]

# mot-clé (sans accents, minuscules) → (gouvernorat, délégation, localité par défaut)
PLACES = [
    ('berges du lac', ('Tunis', 'Les Berges du Lac', 'Les Berges du Lac')),
    ('lac 1', ('Tunis', 'Les Berges du Lac', 'Les Berges du Lac 1')),
    ('lac 2', ('Tunis', 'Les Berges du Lac', 'Les Berges du Lac 2')),
    ('lac 3', ('Tunis', 'Les Berges du Lac', 'Les Berges du Lac 3')),
    ('gammarth', ('Tunis', 'La Marsa', 'Gammarth')),
    ('sidi daoud', ('Tunis', 'La Marsa', 'Sidi Daoud')),
    ('jardins de la soukra', ('Ariana', 'La Soukra', 'Les Jardins de la Soukra')),
    ('jardins de carthage', ('Tunis', 'Carthage', 'Les Jardins de Carthage')),
    ('jardins d carthage', ('Tunis', 'Carthage', 'Les Jardins de Carthage')),
    ('chotrana', ('Ariana', 'La Soukra', 'Chotrana')),
    ('soukra', ('Ariana', 'La Soukra', 'La Soukra')),
    ('mutuelle', ('Tunis', 'Mutuelleville', 'Mutuelleville')),
    ('manar', ('Tunis', 'El Menzah', 'El Manar')),
    ('menzah', ('Tunis', 'El Menzah', 'El Menzah')),
    ('manzah', ('Tunis', 'El Menzah', 'El Menzah')),
    ('aouina', ('Tunis', 'El Aouina', 'El Aouina')),
    ('ain zaghouan', ('Tunis', 'El Aouina', 'Ain Zaghouan')),
    ('urbaine nord', ('Tunis', 'Centre Urbain Nord', 'Centre Urbain Nord')),
    ('khadra', ('Tunis', 'Centre Urbain Nord', 'Centre Urbain Nord')),
    ('carthage', ('Tunis', 'Carthage', 'Carthage')),
    ('kram', ('Tunis', 'Carthage', 'Le Kram')),
    ('marsa', ('Tunis', 'La Marsa', 'La Marsa')),
    ('hammamet', ('Nabeul', 'Hammamet', 'Hammamet')),
    ('kelibia', ('Nabeul', 'Kelibia', 'Kelibia')),
    ('utique', ('Bizerte', 'Utique', 'Utique')),
    ('tunis', ('Tunis', 'Tunis', 'Tunis')),
]


def plain(s: str) -> str:
    s = unicodedata.normalize('NFD', html.unescape(s)).encode('ascii', 'ignore').decode()
    return re.sub(r'\s+', ' ', s.lower().replace('’', "'")).strip()


def place_of(text: str):
    t = plain(text)
    return next((v for k, v in PLACES if k in t), None)


def nice(s: str) -> str:
    small = {'de', 'du', 'des', 'la', 'le', 'les', 'el', 'd'}
    words = s.strip().split()
    out = [w if w.isupper() and len(w) > 2 else (w.lower() if i and w.lower() in small else w[:1].upper() + w[1:].lower()) for i, w in enumerate(words)]
    s = ' '.join(out)
    return s[:1].upper() + s[1:]


def locate(b: dict):
    tag = ' '.join(b['localisation'])
    parts = [p.strip() for p in b['adresse'].split(',') if p.strip() and plain(p) != 'tunisie']
    from_addr = place_of(parts[-1]) if parts else None
    chosen = place_of(tag) if tag and tag != 'Tunis' else None
    # titre et adresse concordants l'emportent sur une étiquette contradictoire
    by_title = place_of(b['titre'])
    if by_title and from_addr and by_title[1] == from_addr[1]:
        chosen = from_addr
    chosen = chosen or place_of(b['titre']) or from_addr or place_of(b['adresse']) or ('Tunis', 'Tunis', 'Tunis')
    gouv, deleg, loc = chosen
    # garde la localité précise de l'adresse quand elle est cohérente avec la zone retenue
    if from_addr and from_addr[1] == deleg and parts:
        loc = nice(parts[-1])
        if plain(loc) in ('la marsa', 'marsa'):
            loc = 'La Marsa'
    return gouv, deleg, loc


def category(b: dict) -> str:
    t = plain(b['titre'])
    if re.search(r'bureau|local|entrepot|fonds de commerce|immeuble', t):
        return 'Bureau et local...'
    if re.search(r'appartement|duplex|triplex|penthouse|studio|\bs\+?\d', t) and 'villa' not in t:
        return 'Appartement'
    if 'villa' in t:
        return 'Maison / Villa'
    if 'terrain' in t:
        return 'Terrain'
    typ = plain(' '.join(b['type']))
    if 'bureau' in typ:
        return 'Bureau et local...'
    if 'terrain' in typ:
        return 'Terrain'
    if 'appartement' in typ:
        return 'Appartement'
    return 'Maison / Villa'


def sub_type(b: dict, cat: str) -> str:
    t = plain(b['titre'])
    for k, v in [('penthouse', 'Penthouse'), ('triplex', 'Triplex'), ('duplex', 'Duplex'), ('jumele', 'Villa jumelée'),
                 ('entrepot', 'Entrepôt'), ('fonds de commerce', 'Fonds de commerce'), ('immeuble', 'Immeuble de bureaux'),
                 ('local', 'Local commercial'), ('bureau', 'Bureau'), ('estivale', 'Location saisonnière'), ('vacances', 'Location saisonnière')]:
        if k in t:
            return v
    return ''


def num(s: str | None) -> float | None:
    if not s:
        return None
    m = re.search(r'[\d.,]+', s)
    if not m:
        return None
    v = float(m.group().replace(',', '.'))
    return int(v) if v == int(v) else round(v, 1)


def title_of(b: dict) -> str:
    t = html.unescape(b['titre']).strip()
    t = re.sub(r'^(vente|location|a louer|a vendre)\s+(?=(villa|appartement|penthouse|triplex|duplex|immeuble|s\s*\+?\d)\b)', '', t, flags=re.I)
    if sum(c.isupper() for c in t) > sum(c.islower() for c in t):
        t = t.lower()
    for bad, good in TYPOS:
        t = re.sub(bad, good, t, flags=re.I)
    return t


def convert(b: dict, transaction: str) -> dict:
    gouv, deleg, loc = locate(b)
    cat = category(b)
    sub = sub_type(b, cat)
    d = b['details']
    prix = num(b['prix'])
    prix = int(prix) if prix and prix > 1 else None  # « 1 DT » = prix sur demande
    surface = num(d.get('Surface habitable'))
    is_terrain = cat == 'Terrain'
    is_bureau = cat.startswith('Bureau')
    rub = ['acheter' if transaction == 'Vente' else 'louer'] + (['bureaux-et-commerces'] if is_bureau else [])
    autres = {'Statut': ', '.join(b['statut'])} if b['statut'] else {}
    if d.get('Année de construction'):
        autres['Année de construction'] = d['Année de construction']
    desc = re.sub(r'\n{2,}', '\n\n', html.unescape(b['description']).strip())
    return {
        'id': str(b['id']),
        'reference': f"CI{b['id']}",
        'titre': title_of(b),
        'transaction': transaction,
        'disponibilite': 'disponible',
        'type_bien': f'{cat} | {sub}' if sub else cat,
        'prix': prix,
        'devise': 'TND',
        'prix_texte': f"{prix:,} DT".replace(',', ' ') if prix else 'Prix sur demande',
        'surface_habitable_m2': None if is_terrain else surface,
        'surface_terrain_m2': surface if is_terrain else None,
        'surface_m2': surface,
        'chambres': None if is_bureau or is_terrain else num(d.get('Chambres à coucher')),
        'suites': None,
        'sdb': num(d.get('Salle de bain')),
        'pays': 'Tunisie',
        'gouvernorat': gouv,
        'delegation': deleg,
        'localite': loc,
        'adresse_complete': ', '.join(dict.fromkeys([loc, deleg, gouv, 'Tunisie'])),
        'description': desc,
        'agence': 'confort immo',
        'telephones': PHONES,
        'rubriques': rub,
        'photos': list(dict.fromkeys(b['photos'])),
        'nb_photos': len(set(b['photos'])),
        'url': b['url'],
        'autres_champs': autres,
        'statut_annonce': None,
        'date_publication': b['date_publication'],
    }


def main() -> None:
    src = json.loads(SRC.read_text())
    annonces = [convert(b, 'Vente') for b in src['vente']] + [convert(b, 'Location') for b in src['location']]
    out = {
        'source': src['source'],
        'rubriques': ['acheter', 'louer', 'bureaux-et-commerces'],
        'date_extraction': src['date_extraction'],
        'nb_annonces': len(annonces),
        'annonces': annonces,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2))
    print(f'→ {OUT.relative_to(ROOT)} ({len(annonces)} annonces)')


if __name__ == '__main__':
    main()
