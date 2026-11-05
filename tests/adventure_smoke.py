"""v0.2 integration: scenes, squid mechanics, fixed pins, geofence and updates.
Geocoder responses are synthetic fixtures; this does not verify real business coordinates.
"""
import json
from playwright.sync_api import sync_playwright

URL='http://127.0.0.1:8000/'
BASE=[30.48,-97.81]
PUPPY=[30.481,-97.81]
def check(value,message):
 assert value,message
 print('PASS',message,flush=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce',permissions=['geolocation'],geolocation={'latitude':30.45,'longitude':-97.82,'accuracy':12})
 def geocode(route):
  puppy='2000' in route.request.url
  point=PUPPY if puppy else BASE
  route.fulfill(json=[{'lat':str(point[0]),'lon':str(point[1]),'address':{'house_number':'2000' if puppy else '1900','road':'South Lakeline Boulevard'}}])
 context.route('https://nominatim.openstreetmap.org/**',geocode)
 context.route('https://tile.openstreetmap.org/**',lambda r:r.abort())
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(URL,wait_until='domcontentloaded');page.locator('#launch-silent').click(); page.locator('#test-drive').evaluate('(el)=>el.click()');page.wait_for_function('badCatDiagnostics().mapReady && BAD_CAT_SITES.every(s=>s.coordinates)')
 check(page.locator('#map-stage').bounding_box()=={'x':0,'y':0,'width':1280,'height':800},'Map fills tablet viewport')
 check(page.evaluate('badCatDiagnostics().zoom')==20,'Default map is zoomed in to 20')
 check(page.locator('.carwash-pin').count()==2,'Exactly two fixed site pins: car wash and Puppy Base')
 check(page.locator('.radar-ring').is_hidden(),'Radar clutter removed')
 check(page.locator('#actor-car img').get_attribute('src').endswith('odyssey.svg'),'White Honda Odyssey map marker')
 # Both cats actively affect gameplay; all decisions show lasting result scenes.
 for event,power in [('trap','laser'),('heist','sonar'),('tunnel','bubble')]:
  page.evaluate('(kind)=>badCatAdventure.encounter(kind)',event)
  check(page.evaluate('badCatAdventure.diagnostics().hazard')==event,f'{event} has an active game-state effect')
  page.locator('#close-encounter').click()
  check(page.locator('#map-hazard').evaluate('(n)=>n.childElementCount')>0,f'{event} visible on the map')
  page.locator(f'[data-gadget="{power}"]').click()
  page.locator('#actor-metro').click()
  check(page.evaluate('badCatAdventure.diagnostics().hazard') is None,f'{power} counters {event}')
 for event in ['vacuum','puppy','badcat','amy','tunnel','puppybase']:
  page.evaluate('(kind)=>badCatAdventure.encounter(kind)',event)
  if event=='amy': check('100% imaginary' in page.locator('.amy-home').inner_text(),'Amy’s secret building is explicitly imaginary')
  page.locator('#encounter-actions button').first.click()
  check(page.locator('.story-world.resolved').count()==1,f'{event} decision produces an animated result')
  page.locator('#close-encounter').evaluate('(n)=>n.click()')
 # No automatic carwash in random events. It has its own always-available button.
 page.locator('#carwash-launch').click()
 check(page.locator('.windscreen-squid').count()==1,'Full windscreen squid scene opens')
 page.locator('#wash-boosters').click()
 check(not page.evaluate('badCatAdventure.diagnostics().round.won'),'Boosters alone do not instantly win')
 page.locator('#wash-wipers').click()
 check('clear-glass' in page.locator('.windscreen').get_attribute('class'),'Wipers clear the windscreen soap')
 for _ in range(3):page.locator('#wash-bubbles').click()
 check(page.evaluate('badCatAdventure.diagnostics().round.bubbles')==3,'Three bubble bursts loosen the squid')
 page.locator('#wash-boosters').click()
 check('squid-free' in page.locator('.windscreen').get_attribute('class'),'Wipers + bubbles + boosters free the squid in an animated escape')
 page.screenshot(path='/tmp/bad-cat-v2-wash-win.png')
 page.locator('#encounter-actions button').first.click()
 check(page.evaluate('badCatAdventure.diagnostics().round.bubbles')==0,'Replay resets the squid game')
 box=page.locator('.windscreen').bounding_box()
 page.mouse.move(box['x']+150,box['y']+150);page.mouse.down();page.mouse.move(box['x']+350,box['y']+150,steps=8);page.mouse.up()
 check(page.evaluate('badCatAdventure.diagnostics().round.wipers')==1,'Swiping the windscreen moves the wipers')
 page.locator('#close-encounter').click()
 # Accuracy + dwell + leave/re-enter prevent prompt spam and inaccurate drive-by triggers.
 def fix(point,accuracy,t):page.evaluate('(a)=>badCatAdventure.onFix(a.point,a.accuracy,a.time)',{'point':point,'accuracy':accuracy,'time':t})
 fix(BASE,200,1000);fix(BASE,200,10000)
 check(not page.locator('#encounter-dialog').evaluate('(n)=>n.open'),'Poor GPS accuracy does not trigger arrival')
 fix(BASE,12,20000);fix(BASE,12,25000)
 check(not page.locator('#encounter-dialog').evaluate('(n)=>n.open'),'Brief drive-by does not trigger arrival')
 fix(BASE,12,29000)
 check('Ready for the squid wash' in page.locator('#encounter-title').inner_text(),'Accurate dwell near fixed GO address offers car wash')
 page.locator('#close-encounter').evaluate('(n)=>n.click()');fix(BASE,12,39000)
 check(not page.locator('#encounter-dialog').evaluate('(n)=>n.open'),'Declined arrival does not keep interrupting')
 fix([30.49,-97.81],12,40000);fix(BASE,12,50000);fix(BASE,12,59000)
 check(page.locator('#encounter-dialog').evaluate('(n)=>n.open'),'Leaving and returning re-arms arrival')
 page.locator('#close-encounter').click()
 # User zoom survives live fixes, and fixed business pins never move with GPS.
 page.locator('.journey-settings summary').click();page.on('dialog',lambda d:d.accept());page.locator('#gps').click();page.wait_for_function('badCatDiagnostics().mode==="gps"')
 page.locator('.leaflet-control-zoom-out').click();page.wait_for_function('badCatDiagnostics().zoom===19');zoom=page.evaluate('badCatDiagnostics().zoom');context.set_geolocation({'latitude':30.451,'longitude':-97.82,'accuracy':12});page.wait_for_timeout(500)
 check(page.evaluate('badCatDiagnostics().zoom')==zoom,'GPS updates preserve manual zoom')
 check(page.evaluate('BAD_CAT_SITES.map(s=>s.coordinates)')==[BASE,PUPPY],'Site pins remain fixed while GPS moves')
 for w,h in [(1280,800),(1024,600),(800,1280),(390,844)]:
  page.set_viewport_size({'width':w,'height':h})
  check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'No horizontal overflow at '+str((w,h)))
  check(page.locator('#map-stage').bounding_box()['height']==h,'Map remains full-height at '+str((w,h)))
 page.set_viewport_size({'width':1280,'height':800});page.screenshot(path='/tmp/bad-cat-v2-map-final.png')
 page.evaluate('navigator.serviceWorker.ready');page.wait_for_function('navigator.serviceWorker.controller')
 context.set_offline(True);page.reload(wait_until='domcontentloaded');page.locator('#launch-silent').click(); page.locator('#test-drive').evaluate('(el)=>el.click()');page.locator('#carwash-launch').click();page.locator('#wash-wipers').click()
 check(page.evaluate('badCatAdventure.diagnostics().round.wipers')==1,'New car wash works after offline reload')
 page.locator('#close-encounter').click();page.evaluate('badCatAdventure.encounter("amy")');page.locator('#encounter-actions button').first.click()
 check(page.locator('.story-world.resolved').count()==1,'Amy decision and animated result work offline')
 check(not errors,f'No uncaught JavaScript errors: {errors}')
 browser.close()
