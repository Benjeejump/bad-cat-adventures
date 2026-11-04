"""Verify GitHub Pages-style project paths without publishing anything."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import tempfile
import threading
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as temp:
    project = Path(temp) / 'bad-cat-adventures'
    project.mkdir()
    for name in ['index.html','app.js','cinematics.js','word-bank.js','spelling.js','learning.css','loot.js','game-map.js','game-map-style.json','styles.css','sw.js','manifest.webmanifest','adventure.js','puppy-options.js','campaign.js','targeting.js','site-config.js','map-mode.css']:
        shutil.copy(root / name, project / name)
    shutil.copytree(root / 'assets', project / 'assets')
    handler = partial(SimpleHTTPRequestHandler, directory=temp)
    server = ThreadingHTTPServer(('127.0.0.1',0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        context=browser.new_context(viewport={'width':1280,'height':800})
        page=context.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{server.server_port}/bad-cat-adventures/',wait_until='domcontentloaded')
        page.locator('#launch-silent').click(); page.locator('#test-drive').evaluate('(el)=>el.click()')
        page.wait_for_function('typeof badCatDiagnostics === "function" && badCatDiagnostics().mapReady')
        assert page.locator('.leaflet-control-attribution').inner_text().find('OpenStreetMap')>=0
        print('PASS Leaflet and OpenStreetMap attribution initialise at project subpath')
        page.evaluate('navigator.serviceWorker.ready')
        page.wait_for_function('navigator.serviceWorker.controller !== null')
        assert page.evaluate('navigator.serviceWorker.controller.scriptURL').endswith('/bad-cat-adventures/sw.js')
        print('PASS Service worker uses project scope')
        context.set_offline(True)
        page.reload(wait_until='domcontentloaded')
        page.locator('#launch-silent').click(); page.locator('#test-drive').evaluate('(el)=>el.click()')
        page.locator('[data-view="hq"]').click()
        page.locator('#invention-name').fill('Subpath Super Gadget')
        page.locator('#invention-form button').click()
        assert page.locator('.use-invention').count()==1
        print('PASS Offline HQ and invention creation at project subpath')
        assert not errors, errors
        print('PASS No subpath JavaScript errors')
        browser.close()
    server.shutdown()
