"""Rebuild the published V5 baseline, then apply reviewed production enhancements."""
from pathlib import Path
import base64
import hashlib
import html
import io
import json
import re
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '_site'
config = json.loads((ROOT / 'site-config.json').read_text())
origin = config['origin']
assert origin == 'https://www.buelstudio.com', 'Canonical must match the live Pages redirect'
assert (ROOT / 'CNAME').read_text().strip() == 'buelstudio.com', 'Preserve existing CNAME'
contact = config['contact']
assert contact['endpoint'] is None or (contact['inboxVerified'] is True and contact['endpoint'].startswith('https://')), 'Direct delivery requires a verified inbox and HTTPS endpoint'
tracker = config['analytics']['plausibleScriptUrl']
assert tracker is None or re.fullmatch(r'https://plausible\.io/js/pa-[A-Za-z0-9_-]+\.js', tracker), 'Use the real Plausible dashboard script URL'
archive = base64.b64decode(''.join((ROOT / 'source' / f'v5.part{x}').read_text() for x in ['1a', '1b', '2a', '2b', '3', '4']))
assert hashlib.sha256(archive).hexdigest() == '56a93e0f2357436a0d304d68cfda4602602c7777d8572b7f8713ee1cee6e659e'
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()
with zipfile.ZipFile(io.BytesIO(archive)) as z:
    for name in z.namelist():
        path = Path(name)
        assert '..' not in path.parts and not path.is_absolute()
        relative = path.relative_to('buel-portfolio')
        if name.endswith('/') or name.endswith('README.md'):
            continue
        target = OUT / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(z.read(name))

shutil.copytree(ROOT / 'assets', OUT / 'assets', dirs_exist_ok=True)
for p in (ROOT / 'overrides').iterdir():
    shutil.copy2(p, OUT / p.name)
shutil.copy2(ROOT / 'CNAME', OUT / 'CNAME')
(OUT / '.nojekyll').touch()
(OUT / 'site-config.js').write_text('window.BUEL_CONFIG = Object.freeze(' + json.dumps(config) + ');\n')

pages = sorted(OUT.rglob('*.html'))
for path in pages:
    source = path.read_text()
    head, body = source.split('</head>', 1)
    title = re.search(r'<title>(.*?)</title>', head).group(1)
    description = re.search(r'<meta name="description" content="(.*?)"', head)
    desc = description.group(1) if description else 'Page not found — BUEL.'
    if not description:
        head += f'\n  <meta name="description" content="{desc}" />'
    head = re.sub(r'\s*<meta (?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*>', '', head)
    head = re.sub(r'\s*<link rel="icon"[^>]*>', '', head)
    rel = path.relative_to(OUT).as_posix()
    url = origin + ('/' if rel == 'index.html' else '/' + rel)
    tags = [
        f'<link rel="canonical" href="{url}" />',
        f'<meta property="og:url" content="{url}" />',
        '<meta property="og:type" content="website" />',
        '<meta property="og:site_name" content="BUEL Studio" />',
        '<meta property="og:locale" content="en_US" />',
        '<meta property="og:locale:alternate" content="tr_TR" />',
        f'<meta property="og:title" content="{html.escape(html.unescape(title), quote=True)}" />',
        f'<meta property="og:description" content="{desc}" />',
        f'<meta property="og:image" content="{origin}/assets/og-cover.png" />',
        '<meta property="og:image:width" content="1200" />',
        '<meta property="og:image:height" content="630" />',
        '<meta property="og:image:type" content="image/png" />',
        '<meta property="og:image:alt" content="BUEL — Independent digital design studio. Web · Brand · Digital." />',
        '<meta name="twitter:card" content="summary_large_image" />',
        f'<meta name="twitter:title" content="{html.escape(html.unescape(title), quote=True)}" />',
        f'<meta name="twitter:description" content="{desc}" />',
        f'<meta name="twitter:image" content="{origin}/assets/og-cover.png" />',
        '<meta name="twitter:image:alt" content="BUEL — Web · Brand · Digital" />',
        '<meta name="application-name" content="BUEL Studio" />',
        '<meta name="apple-mobile-web-app-title" content="BUEL" />',
        '<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />',
        '<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png" />',
        '<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />',
        '<link rel="manifest" href="/site.webmanifest" />',
        '<script defer src="/site-config.js"></script>',
        '<script defer src="/production.js"></script>',
    ]
    if rel == '404.html':
        tags.append('<meta name="robots" content="noindex, follow" />')
    if rel in ['index.html', 'lab.html']:
        tags += ['<link rel="stylesheet" href="/form-enhancements.css" />', '<script defer src="/form-enhancements.js"></script>']
    if rel == 'index.html':
        tags.append('<link rel="stylesheet" href="/home-polish.css" />')
        body = body.replace('hello@buel.studio', contact['email'])
        body = body.replace('<a href="mailto:', '<a href="https://wa.me/905462149022" target="_blank" rel="noopener noreferrer">WhatsApp · +90 546 214 90 22 ↗</a><a href="mailto:', 1)
        body = body.replace('<a href="#">Instagram</a><a href="#">LinkedIn</a>', '<a href="https://www.instagram.com/buelstudio2/" target="_blank" rel="noopener noreferrer">Instagram ↗</a>')
        body = body.replace('<form id="inquiryForm">', '<form id="inquiryForm" action="mailto:hello@buelstudio.com" method="post" enctype="text/plain">')
        fallback_note = 'This prepares an email draft in your mail app; complete sending there. Direct form delivery is not enabled yet.' if contact['inboxVerified'] else 'This opens your mail app; it does not send a message. This inbox is not yet confirmed active. Please use WhatsApp for now.'
        body = body.replace('This prepares an email in your mail app. No form data is stored on this site.', fallback_note)
        tags.append('<noscript><style>.reveal{opacity:1;transform:none}.intro{display:none}</style></noscript>')
    # Case-study bodies are deliberately unchanged, including their scripts and copy.
    path.write_text(head + '\n  ' + '\n  '.join(tags) + '\n</head>' + body)

urls = [origin + ('/' if p.name == 'index.html' else '/' + p.relative_to(OUT).as_posix()) for p in pages if p.name != '404.html']
(OUT / 'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: ' + origin + '/sitemap.xml\n')
(OUT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{u}</loc></url>\n' for u in urls) + '</urlset>\n')
(OUT / 'site.webmanifest').write_text(json.dumps({'id':'/', 'name':'BUEL Studio', 'short_name':'BUEL', 'start_url':'/', 'scope':'/', 'display':'browser', 'background_color':'#f8f7f4', 'theme_color':'#f8f7f4', 'icons':[{'src':f'/assets/icon-{n}.png','sizes':f'{n}x{n}','type':'image/png','purpose':'any'} for n in [192,512]]}, indent=2) + '\n')
print('Built six pages with production metadata; preserved all case-study bodies.')
