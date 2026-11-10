"""Villain vehicles are actual targets with matching projectile collision bounds."""
from playwright.sync_api import sync_playwright
from ui_helpers import tap_tool, line_up_road
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce');q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');q.locator('#launch-silent').click();q.wait_for_timeout(600);q.evaluate('badCatRoad.tick(10);badCatRoad.tick(10)')
 for selector,asset in [('.road-metro','metro-bus.png'),('.road-badcat','bad-cat-balloon.png')]:
  q.wait_for_function('(s)=>document.querySelector(s+" img").naturalWidth>0',arg=selector)
  assert q.locator(selector+' img').get_attribute('src').endswith(asset)
  r=q.locator(selector).bounding_box();f=q.locator(selector+' .enemy-forcefield').bounding_box();assert f['width']>=r['width'] and f['height']>=r['height']
 print('PASS Metro’s bus and Bad Cat’s balloon load with forcefields around their full vehicle shapes',flush=True)
 before=q.evaluate('badCatCharacters.diagnostics().metro.shield');q.locator('.road-metro').click(force=True);assert q.evaluate('badCatCharacters.diagnostics().metro.shield')==before
 r=q.locator('.road-metro').bounding_box();line_up_road(q,'.road-metro',edge=-r['width']/2+35);q.locator('[data-slot="1"]').click();q.wait_for_function('(n)=>badCatCharacters.diagnostics().metro.shield===n-2',arg=before,timeout=3000)
 print('PASS Tapping the bus does not attack; a real forward shot at its outer body registers a hit',flush=True)
 q.evaluate('badCatCombat.clear();badCatCombat.launch("badcat")');r=q.locator('.road-badcat').bounding_box();shot=q.evaluate('badCatCombat.diagnostics().shots.find(s=>s.key==="badcat")');assert shot['y']>=r['y']+r['height']*.7
 print('PASS Bad Cat throws kittens from his basket rather than the top of the balloon',flush=True)
 q.evaluate('badCatCombat.clear()');q.screenshot(path='/tmp/villain-vehicles-desktop.png')
 for mode in ['plane','submarine']:
  tap_tool(q,f'[data-vehicle="{mode}"]');assert q.locator('.world-metro img').get_attribute('src').endswith('metro-bus.png');assert q.locator('.world-badcat img').get_attribute('src').endswith('bad-cat-balloon.png')
  q.evaluate('badCatCombat.clear()')
 print('PASS The new villain vehicles appear in flight and undersea modes too',flush=True)
 tap_tool(q,'[data-vehicle="car"]');q.wait_for_timeout(100);q.evaluate('badCatRoad.change(true);badCatRoad.tick(10);badCatRoad.tick(10)');q.set_viewport_size({'width':390,'height':844});q.wait_for_timeout(100)
 for selector in ['.road-metro','.road-badcat']:
  r=q.locator(selector).bounding_box();assert r['x']>=-1 and r['x']+r['width']<=391
 q.screenshot(path='/tmp/villain-vehicles-phone.png');assert not errors,errors
 print('PASS Vehicles fit phone layouts with no game JavaScript errors',flush=True);b.close()
