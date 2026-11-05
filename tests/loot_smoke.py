"""Inventory drops, net reach, persistent levels and actual upgraded gadget effects."""
from playwright.sync_api import sync_playwright

def check(value,message):
 assert value,message
 print('PASS',message,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 context=b.new_context(viewport={'width':1280,'height':800},permissions=['geolocation'],geolocation={'latitude':30.478,'longitude':-97.81,'accuracy':8},reduced_motion='reduce')
 context.route('https://tiles.openfreemap.org/**',lambda r:r.abort());context.route('https://basemaps.cartocdn.com/**',lambda r:r.abort());context.route('https://nominatim.openstreetmap.org/**',lambda r:r.abort())
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');page.locator('#launch-silent').click();page.wait_for_function('badCatDiagnostics().mode==="gps" && badCatDiagnostics().mapReady')
 page.evaluate('window.realRandom=Math.random;Math.random=()=>0;badCatLoot.update(7,[30.478,-97.81],"gps",8,0)')
 check(page.evaluate('badCatLoot.diagnostics().drop.type')=='net','A fictional upgrade appears near the current GPS car')
 page.locator('.loot-fallback').click()
 check(page.evaluate('badCatLoot.diagnostics().captured')==0,'A drop cannot be grabbed without selecting the net')
 page.locator('#net-launch').click();page.locator('.loot-fallback').click()
 check(page.evaluate('badCatLoot.diagnostics().levels.net')==1,'Net catch awards an actual inventory upgrade')
 check(page.evaluate('badCatLoot.diagnostics().reachMetres')==35,'Long net actually extends reach from 25 to 35 metres')
 check(page.locator('.net-catch-effect').count()==1,'Catching a drop animates the net')
 stored=page.evaluate('JSON.parse(localStorage.getItem("bad-cat-inventory-v1"))')
 check(set(stored)=={'levels','captured'},'Saved inventory includes no drop or player locations')
 page.reload(wait_until='domcontentloaded');page.locator('#launch-silent').click();page.wait_for_function('badCatDiagnostics().mode==="gps" && badCatDiagnostics().mapReady')
 check(page.evaluate('badCatLoot.level("net")')==1,'Net upgrade survives reload')
 # Move the in-memory game source sufficiently to reveal a later drop, then approach it.
 page.evaluate('window.lootRoll=[.2,.8];Math.random=()=>lootRoll.shift()??.2;badCatLoot.update(7,[30.478,-97.81],"gps",8,0)')
 context.set_geolocation({'latitude':30.479,'longitude':-97.81,'accuracy':8});page.wait_for_timeout(400)
 context.set_geolocation({'latitude':30.480,'longitude':-97.81,'accuracy':8});page.wait_for_timeout(400)
 page.wait_for_function('badCatLoot.diagnostics().drop !== null')
 check(page.evaluate('badCatLoot.diagnostics().drop.type')=='bubble','Travel reveals another random upgrade type')
 page.locator('#net-launch').click();page.locator('.loot-fallback').evaluate('(el)=>el.click()')
 check(page.evaluate('badCatLoot.diagnostics().captured')==1,'A parcel outside net reach cannot be caught')
 context.set_geolocation({'latitude':30.4802,'longitude':-97.81,'accuracy':8});page.wait_for_timeout(400)
 page.locator('.loot-fallback').evaluate('(el)=>el.click()')
 check(page.evaluate('badCatLoot.level("bubble")')==1,'Moving nearer makes the drop catchable')
 # The bubble amplifier must change real raid behaviour, not just an inventory label.
 page.evaluate('badCatTargeting.startRaid()');page.wait_for_timeout(150)
 # Use a portrait width so neighbouring stationary physics targets are naturally in range.
 page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(150)
 page.locator('[data-kitten="1"]').evaluate('(el)=>el.click()')
 check(page.evaluate('badCatTargeting.diagnostics().raid.cleared')>=2,'Bubble upgrade actually clears an extra nearby kitten')
 page.locator('#raid-close').click();page.locator('#close-encounter').evaluate('(n)=>n.click()')
 page.locator('[data-view="hq"]').click()
 check('Bubble 1/3' in page.locator('#inventory-readout').inner_text(),'HQ displays the saved arsenal')
 check(not errors,f'No inventory JavaScript errors: {errors}');b.close()
