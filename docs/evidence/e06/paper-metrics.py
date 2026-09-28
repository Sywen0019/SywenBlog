"""Measure native-size screenshot pixels, without modifying artwork or screenshots."""
from pathlib import Path
from PIL import Image, ImageStat, ImageChops, ImageFilter
import json

root = Path(__file__).resolve().parent
result = {'checks': [], 'samples': []}
for theme in ['light', 'dark']:
  measurements = []
  for stage in ['before', 'after']:
    p = root / stage / f'home-paper-{theme}.png'
    im = Image.open(p).convert('RGB')
    stat = ImageStat.Stat(im)
    high = ImageChops.difference(im, im.filter(ImageFilter.GaussianBlur(2)))
    details = {'stage': stage, 'theme': theme, 'meanRGB': stat.mean, 'localDetailRms': ImageStat.Stat(high).rms,
               'pixelRange': im.getextrema()}
    measurements.append(details)
    result['samples'].append(details)
  old, new = measurements
  if theme == 'light':
    shift = max(abs(a-b) for a,b in zip(old['meanRGB'], new['meanRGB']))
    gain = new['localDetailRms'][0] / old['localDetailRms'][0]
    result['checks'].append({'name': 'Light rendered mean tone shift <=1.5/255', 'pass': shift <= 1.5, 'value': shift})
    result['checks'].append({'name': 'Light local texture detail increases >=20%', 'pass': gain >= 1.2, 'value': gain})
  else:
    same = (root/'before/home-paper-dark.png').read_bytes() == (root/'after/home-paper-dark.png').read_bytes()
    result['checks'].append({'name': 'Dark background crop unchanged byte for byte', 'pass': same})
result['passed'] = sum(x['pass'] for x in result['checks'])
result['failed'] = len(result['checks']) - result['passed']
(root/'paper-metrics.json').write_text(json.dumps(result, indent=2)+'\n',encoding='utf-8')
print(json.dumps(result, indent=2))
raise SystemExit(1 if result['failed'] else 0)
