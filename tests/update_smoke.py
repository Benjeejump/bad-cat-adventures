"""Ensure an existing v0.1 installed shell upgrades without trapping the launch UI."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import io, shutil, subprocess, tarfile, tempfile, threading
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
with tempfile.TemporaryDirectory() as temp:
 archive=subprocess.check_output(['git','archive','6ba42fd'],cwd=root)
 with tarfile.open(fileobj=io.BytesIO(archive)) as tar:tar.extractall(temp,filter='data')
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=temp))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  ctx=b.new_context()
  ctx.route('https://tile.openstreetmap.org/**',lambda r:r.abort())
  ctx.route('https://nominatim.openstreetmap.org/**',lambda r:r.abort())
  page=ctx.new_page();page.goto(f'http://127.0.0.1:{server.server_port}/',wait_until='domcontentloaded')
  page.evaluate('navigator.serviceWorker.ready');page.wait_for_function('navigator.serviceWorker.controller')
  assert page.evaluate('caches.keys()')==['bad-cat-shell-v2']
  print('PASS Existing v0.1 service worker is installed',flush=True)
  page.evaluate('localStorage.setItem("bad-cat-progress-v1", JSON.stringify({inventions:[{name:"Original gadget",power:"bubble"}]}))')
  for name in ['index.html','styles.css','team-style.css','pipeworks.js','cursive.js','handwriting.js','handwriting.css','pipeworks.css','app.js','parents.js','road.js','arsenal.js','puppy-house.js','road-home.css','inventions.js','inventions.css','vehicle-world.js','characters.js','theme.js','character-style.css','cinematics.js','word-bank.js','spelling.js','learning.css','loot.js','game-map.js','game-map-style.json','sw.js','manifest.webmanifest','adventure.js','puppy-options.js','campaign.js','targeting.js','site-config.js','map-mode.css']:
   shutil.copy(root/name,Path(temp)/name)
  shutil.copytree(root/'assets',Path(temp)/'assets',dirs_exist_ok=True)
  page.reload(wait_until='domcontentloaded')
  page.wait_for_function('typeof badCatDiagnostics === "function" && !!badCatDiagnostics().adventure',timeout=30000)
  page.wait_for_function('caches.keys().then(keys=>keys.includes("bad-cat-shell-v14"))')
  page.locator('#launch-silent').click(); page.locator('#test-drive').evaluate('(el)=>el.click()');page.wait_for_timeout(600)
  assert page.evaluate('!badCatDiagnostics().adventure.launching')
  print('PASS Existing installation upgrades and its launch button works',flush=True)
  page.locator('[data-view="hq"]').click()
  assert 'Original gadget' in page.locator('.use-invention').inner_text()
  print('PASS Existing inventions survive the upgrade',flush=True)
  b.close()
 server.shutdown()
