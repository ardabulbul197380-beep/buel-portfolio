"""Check the artifact users receive, including unchanged case-study bodies."""
from pathlib import Path
from html.parser import HTMLParser
import base64
import io
import json
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '_site'
ORIGIN = json.loads((ROOT / 'site-config.json').read_text())['origin']
class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.links = {}
        self.resources = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta':
            key = a.get('property', a.get('name'))
            if key:
                assert key not in self.meta, f'Duplicate metadata: {key}'
                self.meta[key] = a.get('content')
        if tag == 'link':
            self.links.setdefault(a.get('rel'), []).append(a.get('href'))
            if a.get('rel') in ['icon', 'manifest', 'apple-touch-icon', 'stylesheet']:
                self.resources.append(a['href'])
        if tag == 'script' and a.get('src'):
            self.resources.append(a['src'])
archive = base64.b64decode(''.join((ROOT / 'source' / f'v5.part{x}').read_text() for x in ['1a','1b','2a','2b','3','4']))
with zipfile.ZipFile(io.BytesIO(archive)) as z:
    for path in OUT.rglob('*.html'):
        rel = path.relative_to(OUT).as_posix()
        content = path.read_text()
        head = Head()
        head.feed(content.split('</head>')[0])
        url = ORIGIN + ('/' if rel == 'index.html' else '/' + rel)
        assert head.links['canonical'] == [url]
        assert head.meta['og:url'] == url
        for key in ['og:title','og:description','og:type','og:image','og:image:alt','twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt']:
            assert head.meta[key], (rel, key)
        assert head.meta['og:image'] == ORIGIN + '/assets/og-cover.png'
        for resource in head.resources:
            if resource.startswith('https:'):
                continue
            target = OUT / resource.lstrip('/') if resource.startswith('/') else path.parent / resource
            assert target.is_file(), (rel, resource)
        if rel.startswith('work/'):
            baseline = z.read('buel-portfolio/' + rel).decode()
            assert content.split('</head>', 1)[1] == baseline.split('</head>', 1)[1], f'Case body changed: {rel}'
        if rel == '404.html':
            assert head.meta['robots'] == 'noindex, follow'
urls = [el.text for el in ET.parse(OUT / 'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(urls) == 5 and len(set(urls)) == 5
assert ORIGIN + '/' in urls and not any('404' in url for url in urls)
assert (OUT / 'CNAME').read_bytes() == (ROOT / 'CNAME').read_bytes()
assert 'Sitemap: ' + ORIGIN + '/sitemap.xml' in (OUT / 'robots.txt').read_text()
manifest = json.loads((OUT / 'site.webmanifest').read_text())
for icon in manifest['icons']:
    assert (OUT / icon['src'].lstrip('/')).is_file()
assert (OUT / 'assets/og-cover.png').read_bytes()[:8] == b'\x89PNG\r\n\x1a\n'
print('PASS: canonical/social metadata, sitemap, robots, manifest, assets, CNAME and three unchanged case-study bodies.')
