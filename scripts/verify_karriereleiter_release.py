#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, base64, gzip, sys
root=Path(__file__).resolve().parents[1]
mod=root/'academy'/'karriereleiter'
m=json.loads((mod/'BUILD_MANIFEST.json').read_text(encoding='utf-8'))
errors=[]
if m.get('schema')!='KC_FUTURA_KARRIERELEITER_RELEASE_V1': errors.append('schema')
if m.get('version')!='1.3.1': errors.append('version')
encoded=''
for part in m['deployment']['payload_parts']:
    p=mod/part['file']
    if not p.exists(): errors.append('missing:'+part['file']); continue
    text=p.read_text(encoding='ascii')
    if hashlib.sha256(text.encode('ascii')).hexdigest()!=part['sha256']: errors.append('sha:'+part['file'])
    encoded+=text.strip()
try:
    html=gzip.decompress(base64.b64decode(encoded))
except Exception as e:
    errors.append('decompress:'+str(e)); html=b''
if html and hashlib.sha256(html).hexdigest()!=m['deployment']['html_sha256']: errors.append('html-sha')
text=html.decode('utf-8','replace')
for marker in m.get('required_markers',[]):
    if marker not in text: errors.append('marker:'+marker)
if m['regression'].get('automated_passed')!=243 or m['regression'].get('question_catalog_unique')!='400/400':
    errors.append('regression-metadata')
loader=(mod/'index.html').read_text(encoding='utf-8')
if m['deployment']['html_sha256'] not in loader: errors.append('loader-hash')
dep=(root/'academy'/'deployment-config.js').read_text(encoding='utf-8')
if 'karriereleiter/academy-launcher.js?v=1.3.1' not in dep: errors.append('deployment-hook')
if errors:
    print('KC FUTURA Karriereleiter Release Gate: FAIL')
    for e in errors: print('-',e)
    sys.exit(1)
print('KC FUTURA Karriereleiter Release Gate: PASS')
print('Version:',m['version'])
print('Source ZIP SHA256:',m['source']['sha256'])
print('Deployment HTML SHA256:',m['deployment']['html_sha256'])
print('Payload parts:',len(m['deployment']['payload_parts']))
print('Regression:',m['regression']['automated_passed'],'/',m['regression']['automated_total'])
