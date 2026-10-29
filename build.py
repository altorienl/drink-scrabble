#!/usr/bin/env python3
"""Inline css/ and js/ into one self-contained HTML file that runs from file://."""
import re, pathlib, sys

root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text()

css = (root / 'css/style.css').read_text()
html = html.replace('<link rel="stylesheet" href="css/style.css">',
                    '<style>\n' + css + '\n</style>')

def inline(m):
    src = m.group(1)
    code = (root / src).read_text()
    # </script> inside a string literal would close the tag early
    code = code.replace('</script>', '<\\/script>')
    return '<script>\n' + code + '\n</script>'

html = re.sub(r'<script src="([^"]+)"></script>', inline, html)

out = root / 'drink-scrabble.html'
out.write_text(html)
print(f'{out} written: {out.stat().st_size/1024/1024:.2f} MB')
if 'src="js/' in html or 'href="css/' in html:
    sys.exit('ERROR: something was left unlinked')
