"""HQ pauses every base clock; independent bees, visible boosters and dodgeable attacks."""
from playwright.sync_api import sync_playwright
from ui_helpers import tap_tool, line_up_road, fire_road_target

def check(v,m):
 assert v,m
 print('PASS '+m,flush=True)
def clock(page):
 return page.evaluate('({road:badCatRoad.diagnostics().elapsed,field:badCatEncounters.diagnostics(),combat:badCatCombat.diagnostics(),condition:badCatCampaign.snapshot().condition})')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce');page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');page.locator('#launch-silent').click();page.wait_for_timeout(600)
 page.evaluate('badCatEncounters.spawnBees()');a=page.evaluate('badCatEncounters.diagnostics().beePositions');page.wait_for_timeout(800);z=page.evaluate('badCatEncounters.diagnostics().beePositions')
 check(len(a)==5 and len({(round(q['vx']),round(q['vy'])) for q in a})>=3,'Five bees have independently chosen directions and speeds')
 check(len({round(z[i]['y']-a[i]['y']) for i in range(5)})>=2,'Bees do not descend together in a line')
 page.locator('[data-view=hq]').click();page.wait_for_timeout(100);before=clock(page);page.wait_for_timeout(1100);after=clock(page)
 check(before==after,'Mission HQ freezes road, bee movement, combat timers and health')
 check(not page.locator('#field-encounters').is_visible() and not page.locator('#booster-control').is_visible(),'No bees or combat controls appear over Mission HQ')
 page.locator('[data-view=drive]').click();page.wait_for_timeout(150);check(clock(page)['road']>before['road'],'Adventure resumes without running hidden time')
 page.locator('#puppy-hq-launch').click();page.wait_for_timeout(100);before=clock(page);page.wait_for_timeout(650);check(clock(page)==before,'Puppy HQ modal also freezes every base clock');page.locator('#close-puppy-hq').click()
 page.evaluate('badCatEncounters.clear();badCatCombat.clear()');page.wait_for_timeout(100)
 check(page.locator('.booster-pod').count()==2 and page.locator('.vehicle-booster-rig').is_visible(),'Two visible booster pods are attached to the vehicle')
 page.locator('#booster-control').click();page.wait_for_timeout(100);check(page.evaluate('badCatCombat.diagnostics().burst')>0,'Boost button activates a visible speed burst')
 page.locator('[data-view=hq]').click();page.wait_for_timeout(80);before=clock(page);page.wait_for_timeout(650);check(clock(page)==before,'HQ pauses active boost and recharge timers');page.locator('[data-view=drive]').click()
 page.evaluate('badCatAdventure.encounter("heist")');check(not page.evaluate('badCatCombat.diagnostics().owned'),'Booster theft removes the actual booster equipment')
 page.locator('#encounter-actions button').first.click();page.locator('#close-encounter').evaluate('(n)=>n.click()');page.wait_for_timeout(150)
 check(page.evaluate('badCatCombat.diagnostics().owned') and page.locator('.vehicle-booster-rig').is_visible(),'Recovering the stolen boosters restores the pods')
 check('recovered' in page.locator('#booster-control small').inner_text().lower(),'Recovery has visible feedback')
 page.evaluate('badCatCombat.clear();badCatProjectiles.clear();badCatRoad.change(true);badCatRoad.tick(10);badCatRoad.tick(10)')
 for key in ['badcat','metro']:assert page.evaluate('(key)=>badCatCombat.launch(key)',key)
 page.evaluate('badCatRoad.tick(10)');assert page.evaluate('badCatCombat.launch("captain")')
 check(page.locator('.projectile-badcat img').get_attribute('src').endswith('kitten.png') and page.locator('.projectile-metro svg').count()==1 and page.locator('.projectile-captain img').get_attribute('src').endswith('acorns.svg'),'Each villain fires the requested kitten, spanner or acorn while only two villains stay visible')
 page.evaluate('badCatCombat.clear();badCatRoad.change(true);badCatRoad.tick(10);badCatRoad.tick(10)');page.wait_for_timeout(80);line_up_road(page,'.road-metro');page.evaluate('badCatCombat.launch("metro")');page.wait_for_timeout(250);page.locator('[data-slot="1"]').click();page.wait_for_function('badCatCombat.diagnostics().shots.length===0',timeout=2500)
 check(page.locator('.projectile-metro').count()==0,'A forward launcher shot intercepts an incoming spanner')
 page.evaluate('badCatProjectiles.clear()')
 page.evaluate('badCatCombat.clear();badCatCombat.launch("metro")');health=page.evaluate('badCatCampaign.snapshot().condition');page.wait_for_function('(health)=>badCatCampaign.snapshot().condition<health',arg=health,timeout=5000)
 check(page.evaluate('badCatCampaign.snapshot().condition')==health-3,'A real projectile collision causes a small recoverable dent')
 page.evaluate('badCatCombat.clear()');page.wait_for_timeout(1600);page.locator('#booster-control').click();health=page.evaluate('badCatCampaign.snapshot().condition');page.evaluate('badCatCombat.launch("metro")');page.wait_for_timeout(2200);check(page.evaluate('badCatCampaign.snapshot().condition')==health,'Active boosters protect the vehicle from incoming attacks')
 for w,h in [(1024,600),(390,844)]:
  page.set_viewport_size({'width':w,'height':h});r=page.locator('#booster-control').bounding_box();hq=page.locator('#puppy-hq-launch').bounding_box();check(r['x']>=0 and r['x']+r['width']<=w and r['y']+r['height']<hq['y'],f'Boost and HQ buttons fit without overlap at {w}×{h}')
 for mode in ['plane','submarine']:
  tap_tool(page,f'[data-vehicle="{mode}"]');page.evaluate('badCatCombat.clear()')
  visible=page.locator('.world-enemy:visible').count();check(visible<=2,f'Only two villains appear in {mode} mode')
  assert page.evaluate('badCatCombat.launch("metro")')
  check(page.locator('.projectile-metro').count()==1,f'Visible villains can attack in {mode} mode')
  page.evaluate('badCatCombat.clear()')
 page.evaluate('badCatCombat.stealBoosters()');page.reload();page.locator('#launch-silent').click();page.wait_for_timeout(600)
 check(not page.evaluate('badCatCombat.diagnostics().owned'),'Stolen equipment state survives reload')
 page.evaluate('badCatRoad.tick(10)');fire_road_target(page,'badcat',slot=2)
 check(page.evaluate('badCatCombat.diagnostics().owned'),'Sonar recovers stolen boosters after reload without needing the old cutscene')
 check(not errors,'No pause or combat JavaScript errors: '+str(errors));b.close()
