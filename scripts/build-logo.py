#!/usr/bin/env python3
"""
Génère les variantes du logo Confort Immo à partir de logo.png (fond blanc) :
  src/assets/logo.png        logo complet, fond transparent
  src/assets/logo-light.png  idem, « CONFORT » et le cadre en blanc (fonds sombres)
  public/favicon.png         pictogramme seul (carré)

  python3 scripts/build-logo.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
NAVY = (0x15, 0x39, 0x59)
BERRY = (0xA0, 0x29, 0x57)


def recolor(src: Image.Image, navy_to: tuple[int, int, int]) -> Image.Image:
    out = Image.new('RGBA', src.size)
    px, po = src.load(), out.load()
    for y in range(src.height):
        for x in range(src.width):
            r, g, b = px[x, y][:3]
            # le vert est le canal le plus éloigné du blanc pour les deux couleurs
            is_berry = r - b > 20
            target = BERRY if is_berry else NAVY
            a = max(0.0, min(1.0, (255 - g) / (255 - target[1])))
            po[x, y] = (*(target if is_berry else navy_to), round(a * 255))
    return out


def main() -> None:
    src = Image.open(ROOT / 'logo.png').convert('RGBA')
    dark = recolor(src, NAVY)
    box = dark.getbbox()
    dark = dark.crop(box)
    light = recolor(src, (255, 255, 255)).crop(box)
    assets = ROOT / 'src/assets'
    dark.save(assets / 'logo.png', optimize=True)
    light.save(assets / 'logo-light.png', optimize=True)
    # pictogramme : le carré à gauche (aussi haut que le logo)
    icon = dark.crop((0, 0, dark.height, dark.height))
    fav = Image.new('RGBA', (icon.width + 24, icon.height + 24), (255, 255, 255, 255))
    fav.alpha_composite(icon, (12, 12))
    fav.resize((180, 180), Image.LANCZOS).save(ROOT / 'public/favicon.png', optimize=True)
    print('logo', dark.size)


if __name__ == '__main__':
    main()
