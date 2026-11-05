"""GPS-first launch, no silent simulation, and the label-free game map style.
Uses synthetic geography to exercise the actual renderer, not real network tiles.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
def check(value,message):
 assert value,message
 print('PASS',message,flush=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--enable-unsafe-swiftshader'])
 context=browser.new_context(service_workers='block',viewport={'width':1280,'height':800},permissions=['geolocation'],geolocation={'latitude':30.478,'longitude':-97.81,'accuracy':8})
 # A local GeoJSON road verifies style rendering independently of blocked third-party tiles.
 style=json.loads((ROOT/'game-map-style.json').read_text())
 style['sources']={'terrain':{'type':'geojson','data':{'type':'FeatureCollection','features':[{'type':'Feature','properties':{'class':'primary'},'geometry':{'type':'LineString','coordinates':[[-97.82,30.478],[-97.80,30.478]]}}]}}}
 for layer in style['layers']:layer.pop('source-layer',None)
 context.route('**/game-map-style.json',lambda r:r.fulfill(json=style))
 context.route('https://nominatim.openstreetmap.org/**',lambda r:r.abort())
 context.route('https://basemaps.cartocdn.com/**',lambda r:r.abort())
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');page.wait_for_function('typeof badCatDiagnostics === "function"')
 check(page.evaluate('badCatDiagnostics().mode')=='waiting','Before launch there is no default Test Drive')
 page.locator('#launch-silent').click();page.wait_for_function('badCatDiagnostics().mode==="gps" && badCatDiagnostics().mapReady')
 check(page.evaluate('badCatDiagnostics().zoom')==20,'Launch centres on tablet GPS at closer zoom 20')
 check('±8 m' in page.locator('#accuracy').inner_text(),'Tablet GPS accuracy is shown')
 check(page.locator('#location-gate').is_hidden(),'Real GPS fix dismisses the waiting screen')
 page.wait_for_function('badCatDiagnostics().mapAppearance.ready',timeout=30000)
 check(page.evaluate('badCatDiagnostics().mapAppearance.renderer')=='game-vector','Custom game map uses the actual vector renderer')
 check(page.locator('.maplibregl-canvas').count()==1,'Game map is drawn in the renderer canvas')
 check(page.evaluate('badCatGameMap.getRenderedStyle().layers.every(l=>l.type!=="symbol" && !l.id.includes("building"))'),'No labels, POI symbols or buildings in the game style')
 page.screenshot(path='/tmp/bad-cat-game-map.png')
 page.evaluate('Math.random=()=>0;badCatLoot.update(7,[30.478,-97.81],"gps",8,0)')
 page.locator('#net-launch').click();parcel=page.locator('.loot-marker').bounding_box();page.locator('.loot-marker').click()
 check(page.evaluate('badCatLoot.diagnostics().captured')==1,'Net catches work on the live vector map overlay')
 check(abs(page.locator('.net-catch-effect').evaluate('(n)=>parseFloat(n.style.left)')-parcel['x'])<2,'Net animation starts at the real map parcel')
 page.locator('.leaflet-control-zoom-out').click();page.wait_for_function('badCatDiagnostics().zoom===19')
 context.set_geolocation({'latitude':30.4781,'longitude':-97.8099,'accuracy':9});page.wait_for_timeout(500)
 check(page.evaluate('badCatDiagnostics().zoom')==19,'New GPS fixes preserve Dylan’s manual zoom')
 check(page.evaluate('badCatDiagnostics().simulationElapsed')==0,'GPS never advances the simulated route')
 page.evaluate('window.headingWatch=navigator.geolocation.watchPosition;navigator.geolocation.watchPosition=(ok)=>{window.turnFix=ok;return 100}')
 page.locator('#gps').evaluate('(n)=>n.click()');page.evaluate('turnFix({coords:{latitude:30.4781,longitude:-97.8099,accuracy:8,heading:90,speed:12}})')
 page.wait_for_function('Math.abs(badCatDiagnostics().mapAppearance.roadBearing-90)<1')
 check(abs(page.evaluate('badCatDiagnostics().mapAppearance.bearing')-90)<1,'Vector roads and geographic overlays turn together')
 page.screenshot(path='/tmp/heading-east-map.png')
 page.locator('.badcat-marker').click();check(page.locator('#npc-speech').is_visible(),'Rotated geographic character remains tappable')
 page.mouse.move(550,500);page.mouse.down();page.mouse.move(650,500,steps=8);page.mouse.up();page.wait_for_timeout(200)
 check(page.locator('#follow').get_attribute('aria-pressed')=='false','Dragging a rotated map releases follow normally')
 check(abs(page.evaluate('badCatDiagnostics().mapAppearance.roadBearing')-90)<1,'Dragging preserves heading-up roads')
 page.locator('#follow').click()
 page.locator('.leaflet-control-zoom-out').click();page.wait_for_function('badCatDiagnostics().zoom===18')
 check(abs(page.evaluate('badCatDiagnostics().mapAppearance.roadBearing')-90)<1,'Zooming preserves heading-up roads')
 # Revoking permission must not start a fake drive.
 context.clear_permissions();page.reload(wait_until='domcontentloaded');page.locator('#launch-silent').click();page.wait_for_function('badCatDiagnostics().mode==="unavailable"')
 check(page.locator('#location-gate').is_visible(),'Permission denial shows a clear GPS choice screen')
 before=page.evaluate('badCatDiagnostics().simulationElapsed');page.wait_for_timeout(600)
 check(page.evaluate('badCatDiagnostics().simulationElapsed')==before==0,'Denied GPS never starts simulation automatically')
 page.locator('#choose-test').click();page.wait_for_timeout(600)
 check(page.evaluate('badCatDiagnostics().mode')=='test' and page.evaluate('badCatDiagnostics().simulationElapsed')>0,'Test Drive runs only after explicitly selecting it')
 # A delayed fix from a cancelled GPS request cannot steal the selected mode.
 page.evaluate('window.originalWatch=navigator.geolocation.watchPosition;navigator.geolocation.watchPosition=(ok,bad)=>{window.lateFix=ok;window.lateError=bad;return 99}')
 page.locator('.journey-settings summary').click();page.locator('#gps').click();page.locator('#choose-test').click()
 page.evaluate('lateFix({coords:{latitude:0,longitude:0,accuracy:1}});lateError({code:1})')
 check(page.evaluate('badCatDiagnostics().mode')=='test','Old GPS callbacks cannot override a later explicit mode choice')
 page.locator('#gps').click();page.evaluate('lateError({code:2})')
 check(page.evaluate('badCatDiagnostics().mode')=='locating','Temporary GPS loss keeps waiting for a real fix, without simulation')
 page.evaluate('lateFix({coords:{latitude:30.478,longitude:-97.81,accuracy:8,heading:0}})')
 check(page.evaluate('badCatDiagnostics().mode')=='gps','The live GPS watch recovers automatically after a transient error')
 page.evaluate('lateFix({coords:{latitude:30.478,longitude:-97.81,accuracy:8,heading:90,speed:10}})')
 page.wait_for_function('Math.abs(badCatDiagnostics().mapAppearance.bearing-90)<1')
 check(True,'Map turns east-up for eastbound travel')
 page.evaluate('lateFix({coords:{latitude:30.478,longitude:-97.81,accuracy:8,heading:220,speed:0}})');page.wait_for_timeout(200)
 check(abs(page.evaluate('badCatDiagnostics().mapAppearance.bearing')-90)<1,'Stopped GPS does not spin the map')
 page.evaluate('lateFix({coords:{latitude:30.478,longitude:-97.809,accuracy:8,heading:null,speed:10}})');page.wait_for_timeout(200)
 check(abs(page.evaluate('badCatDiagnostics().mapAppearance.bearing')-90)<1,'Travel between fixes supplies a missing GPS heading')
 check(not errors,f'No GPS/map JavaScript errors: {errors}')
 browser.close()
