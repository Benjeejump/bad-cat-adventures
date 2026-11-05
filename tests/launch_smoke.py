"""Opening sequence, real animation timings, sound gesture and automatic mischief."""
from playwright.sync_api import sync_playwright

def check(value,message):
 assert value,message
 print('PASS',message,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 context=b.new_context(viewport={'width':1280,'height':800})
 context.route('https://nominatim.openstreetmap.org/**',lambda r:r.abort())
 context.route('https://tile.openstreetmap.org/**',lambda r:r.abort())
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded')
 page.wait_for_function('typeof badCatDiagnostics === "function"')
 check(page.locator('#game-launch').is_visible(),'Game launch appears when address opens')
 check(page.evaluate('badCatDiagnostics().audioState')=='not-started','Opening is silent before a gesture')
 check(page.locator('.launch-car').evaluate('(el)=>getComputedStyle(el).animationName')=='car-intro','Opening contains an animated Odyssey chase')
 page.wait_for_timeout(500)
 check(page.evaluate('badCatDiagnostics().simulationElapsed')==0,'Journey waits for the launch button')
 page.screenshot(path='/tmp/bad-cat-opening.png')
 page.locator('#launch-play').click();page.locator('#test-drive').evaluate('(el)=>el.click()');page.wait_for_function('!badCatDiagnostics().adventure.launching')
 check(page.evaluate('badCatDiagnostics().audioState')=='running','Let’s ride starts synthesised game sound after a gesture')
 page.wait_for_timeout(700)
 check(page.locator('#game-launch').is_hidden(),'Opening transitions into the map')
 # Advance the game's own foreground timer to check scheduled attacks and decisions.
 page.evaluate('badCatAdventure.tick(20)')
 check(page.evaluate('badCatAdventure.diagnostics().hazard') in ['trap','heist','tunnel'],'Cats autonomously cause actual mischief')
 page.evaluate('badCatAdventure.tick(30)')
 if page.evaluate('badCatPipes.isOpen()'):
  check(True,'Metro Pipeworks can deploy as a random surprise');page.locator('#pipe-close').click()
 elif page.evaluate('badCatSpelling.isOpen()'):
  check(True,'A random spelling trap appears automatically')
  info=page.evaluate('badCatSpelling.diagnostics()')
  for letter in info['word'].upper():page.locator(f'.letter-bee[data-letter="{letter}"]:not([disabled])').first.evaluate('(n)=>n.click()')
  page.locator('#spell-close').click()
 else:
  check(page.locator('#encounter-dialog').evaluate('(el)=>el.open'),'A random big decision appears automatically')
  page.locator('#encounter-actions button').first.click()
  if page.evaluate('badCatTargeting.raidActive()'):
   check(page.locator('.kitten-target').count()==20,'Automatic event decision starts the interactive kitten scene')
   page.evaluate('badCatTargeting.tick(46)')
  else:check(page.locator('.story-world.resolved').count()==1,'Automatic event decision starts its animated result')
  page.locator('#close-encounter').evaluate('(n)=>n.click()')
 page.locator('#carwash-launch').click();page.locator('#wash-wipers').click()
 check(page.locator('.wiper').first.evaluate('(el)=>getComputedStyle(el).animationName')=='wiper-sweep','Wiper animation runs without reduced-motion emulation')
 for _ in range(3):page.locator('#wash-bubbles').click()
 page.locator('#wash-boosters').click();page.wait_for_timeout(300)
 check('matrix' in page.locator('.windscreen-squid').evaluate('(el)=>getComputedStyle(el).transform'),'Squid escape changes its rendered transform')
 page.locator('#close-encounter').click()
 for w,h in [(1024,600),(390,844)]:
  page.set_viewport_size({'width':w,'height':h});page.reload(wait_until='domcontentloaded')
  check(page.locator('#launch-play').is_visible(),'Launch button visible at '+str((w,h)))
  rect=page.locator('#launch-play').bounding_box()
  check(rect['x']>=0 and rect['x']+rect['width']<=w and rect['y']+rect['height']<=h,'Launch button fits viewport at '+str((w,h)))
  page.locator('#launch-skip').click();page.wait_for_timeout(500)
  check(page.evaluate('badCatDiagnostics().audioState')=='not-started','Quiet skip does not start sound at '+str((w,h)))
 check(not errors,f'No launch JavaScript errors: {errors}')
 b.close()
