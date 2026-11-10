"""Drive-over messages and physically aimed, intercepting paw-pad projectiles."""
from playwright.sync_api import sync_playwright
from ui_helpers import tap_tool

def check(value, label):
 assert value,label
 print('PASS '+label,flush=True)
def cleanup(q):
 q.evaluate('''()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());badCatProjectiles.clear();badCatEncounters.clear();badCatCombat.clear();}''')
def line_up(q, selector, edge=0):
 q.evaluate('''({selector,edge})=>{const t=document.querySelector(selector).getBoundingClientRect(),p=document.querySelector('#road-player').getBoundingClientRect(),w=document.querySelector('#road-world').getBoundingClientRect();badCatRoad.steer((t.x+t.width/2+edge-p.x-p.width/2)/w.width*100,0);}''',{'selector':selector,'edge':edge})
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce',has_touch=True);q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');q.locator('#launch-silent').click();q.wait_for_timeout(600)
 q.evaluate('badCatEncounters.spawnBottle()');q.wait_for_timeout(100)
 check(not q.evaluate('badCatLoot.diagnostics().armed'),'Bottle pickup starts without the net selected')
 q.locator('#puppy-hq-launch').click();before=q.evaluate('badCatEncounters.diagnostics()');q.wait_for_timeout(400);check(q.evaluate('badCatEncounters.diagnostics()')==before,'A bottle stays paused while HQ is open');q.locator('#close-puppy-hq').click();q.wait_for_timeout(100)
 q.evaluate('''()=>{const b=document.querySelector('.message-bottle').getBoundingClientRect(),p=document.querySelector('#road-player').getBoundingClientRect(),w=document.querySelector('#road-world').getBoundingClientRect();badCatRoad.steer((b.x+b.width/2-p.x-p.width/2)/w.width*100,(b.y+b.height/2-p.y-p.height/2)/w.height*100);}''')
 q.wait_for_function('badCatHandwriting.isOpen()');check(q.locator('#pencil-work').is_visible() and not q.evaluate('badCatEncounters.diagnostics().bottle'),'Driving over the bottle consumes it once and starts the large handwriting page')
 cleanup(q);q.evaluate('badCatRoad.change(true);badCatRoad.tick(10);badCatRoad.tick(10)');q.wait_for_timeout(80)
 before=q.evaluate('badCatCharacters.diagnostics().metro.shield');q.locator('.road-metro').click(force=True);q.mouse.click(50,500)
 check(q.evaluate('badCatCharacters.diagnostics().metro.shield')==before and q.evaluate('badCatTargeting.diagnostics().selected') is None,'Tapping an enemy or scenery cannot auto-aim or damage a forcefield')
 q.evaluate('badCatRoad.steer(-26,0)');q.locator('[data-slot="1"]').click();shots=q.evaluate('badCatProjectiles.diagnostics()');check(len(shots)==1 and shots[0]['power']=='laser','One paw-pad press immediately launches one moving shot')
 x=shots[0]['x'];q.wait_for_timeout(100);z=q.evaluate('badCatProjectiles.diagnostics()');check(z and abs(z[0]['x']-x)<.01 and z[0]['y']<shots[0]['y'],'A shot moves straight up without following the enemy')
 q.evaluate('badCatProjectiles.clear()');q.wait_for_timeout(250);line_up(q,'.road-metro');q.locator('[data-slot="1"]').click();q.wait_for_function('(n)=>badCatCharacters.diagnostics().metro.shield===n-2',arg=before,timeout=2500);check(True,'Lining up and firing physically hits the bus forcefield')
 q.wait_for_timeout(260);line_up(q,'.road-metro');treats=q.evaluate('badCatCampaign.snapshot().supplies');q.locator('[data-slot="4"]').click();q.wait_for_function('badCatCharacters.diagnostics().metro.shield===1',timeout=2000);check(q.evaluate('badCatCampaign.snapshot().supplies')==treats-1,'A puppy launcher pays for its shot once, without charging again on impact')
 q.evaluate('badCatProjectiles.clear();badCatCombat.clear();badCatRoad.steer(0,-40)');before=q.evaluate('badCatCharacters.diagnostics().metro.shield');q.wait_for_timeout(250);q.locator('[data-slot="2"]').click();q.wait_for_timeout(350);check(q.evaluate('badCatCharacters.diagnostics().metro.shield')==before,'Shots cannot hit an enemy behind the player')
 cleanup(q);q.evaluate('badCatRoad.change(true);badCatRoad.tick(10);badCatRoad.tick(10)');q.wait_for_timeout(100);line_up(q,'.road-metro');q.evaluate('badCatCombat.launch("metro")');health=q.evaluate('badCatCampaign.snapshot().condition');q.wait_for_timeout(250);q.locator('[data-slot="3"]').click();q.wait_for_function('badCatCombat.diagnostics().shots.length===0',timeout=2000)
 check(q.evaluate('badCatCampaign.snapshot().condition')==health and q.locator('.projectile-metro').count()==0,'A real outgoing bubble intercepts and deletes an incoming spanner before it reaches Dylan')
 for key, ticks in [('badcat',1),('captain',3)]:
  cleanup(q);q.evaluate('(ticks)=>{badCatRoad.change(true);for(let i=0;i<ticks;i++)badCatRoad.tick(10)}',ticks);q.wait_for_timeout(80);line_up(q,'.road-'+key);q.evaluate('(key)=>badCatCombat.launch(key)',key);health=q.evaluate('badCatCampaign.snapshot().condition');q.wait_for_timeout(250);q.locator('[data-slot="1"]').click();q.wait_for_function('badCatCombat.diagnostics().shots.length===0',timeout=2000);check(q.evaluate('badCatCampaign.snapshot().condition')==health,f'Forward shots also intercept {key} attacks without damaging Dylan')
 cleanup(q);q.evaluate('badCatRoad.change(true)');q.wait_for_timeout(250)
 pad=q.locator('[data-slot="1"]').bounding_box();right=q.locator('#movement-pad [data-move="right"]').bounding_box();x=q.evaluate('badCatRoad.diagnostics().x');touch=c.new_cdp_session(q)
 touch.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':1,'x':right['x']+right['width']/2,'y':right['y']+right['height']/2},{'id':2,'x':pad['x']+pad['width']/2,'y':pad['y']+pad['height']/2}]});q.wait_for_timeout(600);touch.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 check(q.evaluate('badCatRoad.diagnostics().x')>x+10 and len(q.evaluate('badCatProjectiles.diagnostics()'))>=2,'Two simultaneous tablet touches can steer and hold a firing paw pad')
 cleanup(q);q.evaluate('badCatRoad.steer(-30,0)');q.wait_for_timeout(250)
 pad=q.locator('[data-slot="1"]');r=pad.bounding_box();q.mouse.move(r['x']+r['width']/2,r['y']+r['height']/2);q.mouse.down();q.wait_for_timeout(650);q.mouse.up();check(len(q.evaluate('badCatProjectiles.diagnostics()'))>=2,'Holding a paw pad repeats fire');q.wait_for_timeout(200);count=len(q.evaluate('badCatProjectiles.diagnostics()'));q.wait_for_timeout(300);check(len(q.evaluate('badCatProjectiles.diagnostics()'))<=count,'Releasing the pad stops repeating fire')
 q.locator('#puppy-hq-launch').click();q.wait_for_timeout(80);before=q.evaluate('badCatProjectiles.diagnostics()');q.wait_for_timeout(400);check(q.evaluate('badCatProjectiles.diagnostics()')==before,'Outgoing projectiles pause in HQ');q.locator('#close-puppy-hq').click();q.wait_for_timeout(100);cleanup(q)
 for _ in range(9):
  q.evaluate('badCatRoad.tick(10)');check(q.locator('.road-enemy:visible').count()<=2,'Road never shows more than two villains')
 for mode in ['plane','submarine','walking']:
  tap_tool(q,f'[data-vehicle="{mode}"]');cleanup(q);q.wait_for_timeout(250);q.locator('[data-slot="1"]').click();check(len(q.evaluate('badCatProjectiles.diagnostics()'))==1,f'Paw pads launch forward shots in {mode} mode')
  check(q.locator('.world-enemy:visible,.road-enemy:visible').count()<=2,f'At most two villains are visible in {mode} mode')
 q.screenshot(path='/tmp/v14-forward-play.png');check(not errors,'No JavaScript errors: '+str(errors));b.close()
