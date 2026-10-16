"""Encode generated, complete 3x3 icon sheets without changing their artwork."""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('sources', type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    destination = root / 'src/images/space/theme-icons/full'
    destination.mkdir(parents=True, exist_ok=True)
    report = []
    for item in json.loads(args.sources.read_text(encoding='utf-8')):
        image = Image.open(item['path'])
        if image.mode != 'RGBA' or image.width != image.height:
            raise ValueError(f"Expected square transparent sheet: {item['id']}")
        if image.getchannel('A').getextrema()[0] != 0:
            raise ValueError(f"Sheet has no transparent margin: {item['id']}")
        occupancies = []
        for row in range(3):
            for column in range(3):
                tile = image.getchannel('A').crop((column * image.width // 3, row * image.height // 3,
                                                  (column + 1) * image.width // 3, (row + 1) * image.height // 3))
                opaque = sum(count for alpha, count in enumerate(tile.histogram()) if alpha > 127)
                occupancy = opaque / (tile.width * tile.height)
                if not .05 < occupancy < .95:
                    raise ValueError(f"Empty or opaque-background cell: {item['id']} {row},{column}")
                occupancies.append(round(occupancy, 3))
        output = destination / f"skin-{item['id']}.webp"
        image.save(output, 'WEBP', quality=88, method=4)
        report.append({'id': item['id'], 'file': str(output.relative_to(root)).replace('\\', '/'),
                       'bytes': output.stat().st_size, 'width': image.width, 'height': image.height,
                       'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'cell_occupancy': occupancies})
    report.sort(key=lambda item: item['id'])
    (root / 'assets/space/theme-icons/full-icon-assets.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'packs': len(report), 'bytes': sum(item['bytes'] for item in report)}))


if __name__ == '__main__':
    main()
