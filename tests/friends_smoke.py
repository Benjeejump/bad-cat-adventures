"""Persistent breed invitations, per-home capacity, live pets and offline play."""
from playwright.sync_api import sync_playwright
from ui_helpers import tap_tool

def check(v,m):
 assert v,m
 print('PASS '+m,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context(viewport={'width':1024,'height':700},reduced_motion='reduce')
 c.add_init_script('''if(!localStorage.getItem('pet-seeded')){localStorage.setItem('pet-seeded','yes');localStorage.setItem('bad-cat-puppy-house-v1',JSON.stringify({tier:0,owned:['home-0-0','home-0-1'],placed:['home-0-0','home-0-1'],positions:{'home-0-0':{x:50,y:55},'home-0-1':{x:62,y:55}}}));}''')
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');page.locator('#launch-silent').click();tap_tool(page,'[data-puppy-house]')
 before=page.evaluate('badCatHouse.diagnostics().pet');page.wait_for_timeout(700);after=page.evaluate('badCatHouse.diagnostics().pet');check(before['x']!=after['x'] or before['y']!=after['y'],'Dylan walks autonomously instead of staying still')
 page.wait_for_function('!['+'"idle","walking"'+'].includes(badCatHouse.diagnostics().pet.phase)',timeout=9000);check(page.evaluate('badCatHouse.diagnostics().pet.phase') in ['napping','snacking'],'Dylan actually uses a bed or bowl')
 frozen=page.evaluate('badCatRoad.diagnostics().elapsed');page.wait_for_timeout(500);check(page.evaluate('badCatRoad.diagnostics().elapsed')==frozen,'House pets animate while the base adventure stays paused')
 page.evaluate('badCatCampaign.awardTreats(99)');page.locator('#house-friends-tab').click();balance=page.evaluate('badCatCampaign.snapshot().supplies');page.locator('#house-friends [data-friend=golden]').click()
 check(page.evaluate('badCatCampaign.snapshot().supplies')==balance-12 and page.locator('.house-friend').count()==1,'A treat-funded invitation brings Buddy the Golden Retriever into the home')
 page.locator('#house-friends-tab').click();check(page.locator('#house-friends [data-friend=corgi]').is_disabled(),'The dog house has room for only one visiting friend')
 page.locator('#house-friends [data-friend=golden]').click();balance=page.evaluate('badCatCampaign.snapshot().supplies');page.locator('#house-friends [data-friend=golden]').click();check(page.evaluate('badCatCampaign.snapshot().supplies')==balance,'Unlocked friends can return without a second charge')
 page.locator('#house-store-tab').click();a=page.evaluate('badCatHouse.diagnostics().friendActivity');page.wait_for_timeout(500);check(page.evaluate('badCatHouse.diagnostics().friendActivity')==a,'Pets pause while their room is hidden by the store')
 page.locator('#house-home-tab').click();page.wait_for_function('badCatHouse.diagnostics().friendActivity.some(f=>f.visits>0||!["idle","walking"].includes(f.phase))',timeout=12000)
 check(True,'The invited puppy independently uses the furnishings too')
 page.locator('#house-close').click();page.evaluate('navigator.serviceWorker.ready');page.wait_for_function('navigator.serviceWorker.controller');c.set_offline(True);page.reload(wait_until='domcontentloaded');page.locator('#launch-silent').click();tap_tool(page,'[data-puppy-house]');page.wait_for_function('document.querySelector(".house-friend").naturalWidth>0')
 check(page.evaluate('badCatHouse.diagnostics().visitors')==['golden'],'Invitations, chosen visitor and breed artwork survive offline reload')
 check(not errors,'No puppy-home JavaScript errors: '+str(errors))
 big=b.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce');big.add_init_script('''if(!localStorage.getItem('big-seeded')){localStorage.setItem('big-seeded','yes');localStorage.setItem('bad-cat-puppy-house-v1',JSON.stringify({tier:4,owned:Array.from({length:6},(_,i)=>'home-4-'+i),placed:Array.from({length:6},(_,i)=>'home-4-'+i),positions:Object.fromEntries(Array.from({length:6},(_,i)=>['home-4-'+i,{x:42+i*5,y:55}]))}));}''')
 q=big.new_page();q.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');q.locator('#launch-silent').click();tap_tool(q,'[data-puppy-house]')
 for tier in range(5):q.locator('#house-visit').select_option(str(tier));check(q.evaluate('badCatHouse.diagnostics().friendCapacity')==tier+1,f'Home {tier+1} supports {tier+1} friends')
 q.evaluate('badCatCampaign.awardTreats(99)')
 for id in ['golden','corgi','pug','husky','dachshund']:
  q.locator('#house-friends-tab').click();q.locator('#house-friends [data-friend='+id+']').click()
 check(q.locator('.house-friend').count()==5 and len(set(q.locator('.house-friend').evaluate_all('(ns)=>ns.map(n=>n.src)')))==5,'Five different breeds can visit the mansion together')
 q.locator('#house-friends-tab').click();check(q.locator('#house-friends [data-friend=beagle]').is_disabled(),'A sixth mansion guest cannot exceed the room limit')
 q.locator('#house-home-tab').click();q.wait_for_function('badCatHouse.diagnostics().friendActivity.every(f=>f.visits>0||!["idle","walking"].includes(f.phase))',timeout=20000)
 check(True,'All five visiting breeds use household items, rather than only appearing as decorations');q.screenshot(path='/tmp/puppy-friends.png');b.close()
