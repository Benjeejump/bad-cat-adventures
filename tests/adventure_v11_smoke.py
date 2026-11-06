"""Road-only adventure: five launchers, D-pad, collision games and large learning surfaces."""
from playwright.sync_api import sync_playwright
from ui_helpers import tap_tool

def check(v,m):
 assert v,m
 print('PASS '+m,flush=True)
def leave(page):
 page.evaluate('''()=>{if(badCatSpelling.isOpen())badCatSpelling.parentExit();document.querySelectorAll('dialog[open]').forEach(d=>d.close());badCatTargeting.abortRaid();badCatEncounters.clear();badCatCharacters.clearPlans();}''');page.wait_for_timeout(120)
def hold(page, direction, ms=400):
 button=page.locator(f'#movement-pad [data-move={direction}]');r=button.bounding_box();page.mouse.move(r['x']+r['width']/2,r['y']+r['height']/2);page.mouse.down();page.wait_for_timeout(ms);page.mouse.up()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce',has_touch=True)
 c.add_init_script('''localStorage.getItem('five-migrated') || (localStorage.setItem('bad-cat-arsenal-v1',JSON.stringify(['shield','laser','sonar','bubble'])),localStorage.setItem('five-migrated','1'));window.gpsCalls=0;navigator.geolocation.watchPosition=()=>{gpsCalls++;return 1};navigator.geolocation.getCurrentPosition=()=>{gpsCalls++};''')
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');page.locator('#launch-silent').click();page.wait_for_timeout(600)
 check(page.evaluate('badCatDiagnostics().mode==="road" && gpsCalls===0'),'Only Road Adventure starts; no location permission is requested')
 before=page.evaluate('badCatCampaign.snapshot().supplies');page.evaluate('badCatCampaign.resupply();badCatCampaign.resupply()');check(page.evaluate('badCatCampaign.snapshot().supplies')==before,'Emergency snacks cannot endlessly create treats')
 check(page.locator('.action-rail [data-slot]').count()==5,'All five paw pads are launchers')
 check(page.evaluate('badCatArsenal.diagnostics().length===5 && badCatArsenal.diagnostics()[4]==="puppy"'),'Existing four-slot saves retain their choices and gain the fifth launcher')
 box=page.locator('#puppy-hq-launch').bounding_box();check(box['x']>1150 and box['y']>690,'HQ house is separate at the bottom right')
 x=page.evaluate('badCatRoad.diagnostics().x');y=page.evaluate('badCatRoad.diagnostics().y');hold(page,'left');hold(page,'up');check(page.evaluate('badCatRoad.diagnostics().x')<x and page.evaluate('badCatRoad.diagnostics().y')<y,'D-pad moves the car on both axes')
 for mode in ['plane','submarine','walking']:
  tap_tool(page,f'[data-vehicle="{mode}"]');page.wait_for_timeout(100)
  target='#road-player' if mode=='walking' else '#world-vehicle'
  before=page.locator(target).bounding_box();hold(page,'right');after=page.locator(target).bounding_box();check(after['x']>before['x'],mode+' responds to the same D-pad')
 tap_tool(page,'[data-vehicle="car"]');page.evaluate('badCatEncounters.clear()')
 page.evaluate('badCatAdventure.tick(10000)');check(not page.locator('dialog[open]').count(),'Old surprise timers do not interrupt play')
 check('tunnel' not in page.evaluate('badCatAdventure.diagnostics().surprisePool'),'Tunnel surprises are removed')
 page.evaluate('badCatEncounters.spawnBees()');page.wait_for_timeout(100)
 check(page.locator('.field-bee').count()==5,'A swarm has exactly five recognizable bees')
 page.locator('[data-slot="1"]').click();r=page.locator('.field-bee').first.bounding_box();page.mouse.click(r['x']+r['width']/2,r['y']+r['height']/2);check(page.locator('.field-bee').count()==4,'A launcher can shoot a bee before it touches Dylan')
 page.wait_for_timeout(5200)
 page.evaluate('''()=>{const r=document.querySelector('.field-bee').getBoundingClientRect(),p=document.querySelector('#road-player').getBoundingClientRect(),s=document.querySelector('#road-world').getBoundingClientRect();badCatRoad.steer(((r.x+r.width/2)-(p.x+p.width/2))/s.width*100,((r.y+r.height/2)-(p.y+p.height/2))/s.height*100);}''')
 page.wait_for_function('badCatSpelling.isOpen()',timeout=6000);check(page.locator('.field-bee').count()==0,'Actual bee-to-player contact launches one spelling game and clears the swarm')
 leave(page)
 page.evaluate('badCatEncounters.spawnBottle()');page.wait_for_timeout(100);r=page.locator('.message-bottle').bounding_box();page.mouse.click(r['x']+r['width']/2,r['y']+r['height']/2);check(not page.evaluate('badCatHandwriting.isOpen()'),'A bottle needs the net, rather than a plain tap')
 tap_tool(page,'#net-launch');page.locator('.message-bottle').wait_for(state='visible');r=page.locator('.message-bottle').bounding_box();page.mouse.click(r['x']+r['width']/2,r['y']+r['height']/2);check(page.evaluate('badCatHandwriting.isOpen()'),'Netting the message bottle opens handwriting')
 check(page.locator('#pencil-work').is_visible(),'Bottle note begins directly on the writing page')
 pad=page.locator('#writing-pad').bounding_box();check(pad['width']>1100 and pad['height']>420,'Tracing uses the whole working screen')
 page.screenshot(path='/tmp/v11-writing.png')
 glyph=page.locator('.letter-active').bounding_box();check(glyph['height']>180,'The active letter is large enough for finger formation')
 page.locator('#pencil-zoom').click();check(page.locator('#writing-pad').get_attribute('viewBox')=='0 0 1000 380','Full two-sentence note remains available')
 leave(page)
 tap_tool(page,'#pipe-launch');d=page.evaluate('badCatPipes.diagnostics()');check(d['rows']*d['cols']>=24,'Rebuilt Pipes begins with at least 24 tiles')
 grid=page.locator('#pipe-board').bounding_box();check(grid['width']>1150 and grid['height']>400,'Pipe tiles occupy the full workshop floor')
 page.screenshot(path='/tmp/v11-pipes.png')
 for _ in range(30):page.locator('#pipe-hint').click()
 page.locator('#pipe-start-water').click();page.wait_for_function('badCatPipes.diagnostics().won',timeout=30000);check(True,'A connected large puzzle visibly fills and reaches its outlet without a deadline')
 leave(page)
 page.locator('[data-slot="1"]').click()
 page.evaluate('''()=>{for(let i=0;i<3;i++)badCatTargeting.target('badcat',badCatTargeting.targetNode('badcat'));}''')
 check(page.locator('#encounter-dialog').evaluate('(d)=>d.open'),'Defeating a villain with launchers launches a decision encounter')
 leave(page)
 for w,h in [(1024,600),(800,1280),(390,844)]:
  page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(100)
  for selector in ['#movement-pad','#puppy-hq-launch','.action-rail']:
   r=page.locator(selector).bounding_box();check(r['x']>=0 and r['y']>=0 and r['x']+r['width']<=w+1 and r['y']+r['height']<=h+1,f'{selector} fits {w}×{h}')
 check(not errors,'No game JavaScript errors: '+str(errors));b.close()
