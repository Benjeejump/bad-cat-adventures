"""Four saved launcher pads, an HQ heel, and no aiming/notification overlays."""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce')
 c.add_init_script('''localStorage.getItem('paw-seeded') || (localStorage.setItem('bad-cat-arsenal-v1',JSON.stringify(['laser','bubble','sonar','puppy','shield'])), localStorage.setItem('paw-seeded','yes'));''')
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');page.locator('#launch-journey').select_option('road');page.locator('#launch-silent').click();page.wait_for_timeout(600)
 assert page.locator('.action-rail button').count()==5
 assert page.locator('.action-rail [data-slot]').count()==4
 assert page.evaluate('badCatArsenal.diagnostics()')==['laser','bubble','sonar','puppy']
 assert len(page.evaluate('JSON.parse(localStorage.getItem("bad-cat-arsenal-v1"))'))==4
 page.evaluate('badCatCampaign.awardTreats(1)')
 assert '7' in page.locator('#paw-treat-balance').inner_text()
 print('PASS Four launchers and one HQ heel; previous five-slot saves migrate; treat balance updates')
 page.locator('[data-slot="0"]').click();page.mouse.click(200,400)
 assert page.evaluate('badCatTargeting.diagnostics().armed')=='laser'
 assert not page.locator('#target-bar').is_visible()
 assert not page.locator('#toast').is_visible()
 assert not page.locator('.journey-story').is_visible()
 page.locator('#puppy-hq-launch').click()
 for selector in ['#edit-arsenal','#arsenal-launch','#carwash-launch','#spelling-launch','#kitten-launch','#pipe-launch','#pencil-launch','[data-puppy-house]','#net-launch','[data-vehicle="plane"]']:
  assert page.locator('#puppy-hq-menu '+selector).is_visible(),selector
 page.locator('#edit-arsenal').click()
 assert not page.locator('#puppy-hq-menu').evaluate('(n)=>n.open')
 assert page.locator('#arsenal-slots button').count()==4
 page.locator('#arsenal-slots button').nth(3).click();page.locator('#arsenal-choices button').filter(has_text='Forcefield').click();page.locator('#close-loadout').click()
 assert page.evaluate('badCatArsenal.diagnostics()[3]')=='shield'
 page.locator('#puppy-hq-launch').click();page.locator('#pipe-launch').click()
 assert page.locator('#pipeworks-dialog').evaluate('(n)=>n.open')
 assert not page.locator('#puppy-hq-menu').evaluate('(n)=>n.open')
 page.locator('#pipe-close').click()
 page.locator('#puppy-hq-launch').click();page.locator('#puppy-hq-menu [data-vehicle="plane"]').click()
 assert page.evaluate('badCatDiagnostics().vehicle')=='plane'
 assert not page.locator('#puppy-hq-menu').evaluate('(n)=>n.open')
 print('PASS HQ contains all former rail tools; choosing a game or vehicle closes the menu')
 for w,h in [(1280,800),(1024,600),(800,1280),(390,844)]:
  page.set_viewport_size({'width':w,'height':h})
  pads=page.locator('.action-rail button')
  for i in range(5):
   r=pads.nth(i).bounding_box();assert r['x']>=0 and r['y']>=0 and r['x']+r['width']<=w and r['y']+r['height']<=h,(w,h,r)
  page.locator('#puppy-hq-launch').click()
  assert page.locator('#puppy-hq-menu').evaluate('(n)=>n.scrollWidth<=n.clientWidth+1')
  page.locator('#close-puppy-hq').click()
 print('PASS Paw pads and HQ fit phone, portrait and landscape screens')
 page.reload();page.locator('#launch-journey').select_option('road');page.locator('#launch-silent').click()
 assert page.evaluate('badCatArsenal.diagnostics()')==['laser','bubble','sonar','shield']
 page.keyboard.press('4');assert page.evaluate('badCatTargeting.diagnostics().armed')=='shield'
 page.keyboard.press('5');assert page.evaluate('badCatTargeting.diagnostics().armed')=='shield'
 assert not errors,errors
 print('PASS Four-slot loadout persists, keys 1–4 work, and no JavaScript errors')
 b.close()
