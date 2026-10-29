"""Read-only acceptance check for an already prepared isolated target environment."""
import importlib.metadata as metadata
import json
import platform
import sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]
expected={}
for line in (root/'requirements-render-constraints.txt').read_text().splitlines():
    if '==' in line and not line.startswith('#'):
        name,version=line.split('==');expected[name]=version
expected.update(pip='26.2.2',setuptools='84.2.1')
def installed(name):
    try:return metadata.version(name)
    except metadata.PackageNotFoundError:return None
os_release=platform.freedesktop_os_release() if platform.system()=='Linux' else {}
actual={'os':platform.system(),'architecture':platform.machine(),'libc':list(platform.libc_ver()),'python':platform.python_version(),'distribution_id':os_release.get('ID'),'distribution_version':os_release.get('VERSION_ID')}
target={'os':'Linux','architecture':'x86_64','libc':['glibc','2.36'],'python':'3.11.11','distribution_id':'debian','distribution_version':'12'}
errors={k:{'expected':v,'actual':actual[k]} for k,v in target.items() if actual[k]!=v}
packages={k:{'expected':v,'actual':installed(k)} for k,v in expected.items() if installed(k)!=v}
print(json.dumps({'platform':actual,'platform_mismatches':errors,'package_mismatches':packages,'pass':not errors and not packages},indent=2))
sys.exit(bool(errors or packages))
