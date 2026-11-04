"""Drifting emoji bubbles, lasting setbacks and every Giant Puppy option/outcome."""
from playwright.sync_api import sync_playwright

def check(value,message):
 assert value,message
 print('PASS',message,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 context=b.new_context(viewport={'width':1280,'height':800})
 context.route('https://tile.openstreetmap.org/**',lambda r:r.abort());context.route('https://nominatim.openstreetmap.org/**',lambda r:r.abort())
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');page.locator('#launch-silent').click(); page.locator('#test-drive').evaluate('(el)=>el.click()');page.wait_for_timeout(500)
 # The pool has ten different dual-outcome options; each drawn pair has one success.
 seen=page.evaluate('''()=>{const ids=new Set();for(let i=0;i<250;i++){const pair=badCatPuppyOptions.sample();if(pair.length!==2||pair[0].id===pair[1].id||pair.filter(p=>p.success).length!==1)throw Error('Bad pair');pair.forEach(p=>ids.add(p.id));}return ids.size;}''')
 check(seen==10,'Ten different puppy choices; every pair contains exactly one hidden success and one failure')
 page.evaluate('badCatAdventure.encounter("puppy")')
 check(page.locator('#encounter-actions button').count()==2,'Dylan sees exactly two puppy choices')
 check('puppy-sky-fall' in page.locator('.scene-character').evaluate('(n)=>getComputedStyle(n).animationName'),'Giant Puppy actually falls through the sky')
 page.screenshot(path='/tmp/giant-puppy-falling.png')
 page.locator('#close-encounter').click()
 # Force each branch in test code only; the shipped game still samples at encounter open.
 page.evaluate('window.realPuppySample=badCatPuppyOptions.sample')
 for option in ['bubbles','badcat','treats','parachute','hammock','trampoline','vacuum','blanket','cloud','slide']:
  for success in [True,False]:
   page.evaluate('''a=>{let candidate;for(let i=0;i<500&&!candidate;i++)candidate=realPuppySample().find(o=>o.id===a.id);if(!candidate)throw Error('Missing option');badCatPuppyOptions.sample=()=>[{...candidate,success:a.good},{...candidate,id:'other',success:!a.good}];}''',{'id':option,'good':success})
   page.evaluate('badCatAdventure.encounter("puppy")');before=page.evaluate('badCatCampaign.snapshot()');page.locator('#encounter-actions button').first.click()
   check(page.locator('.puppy-success' if success else '.puppy-failure').count()==1,f'{option}: distinct '+('success' if success else 'failure')+' animation')
   after=page.evaluate('badCatCampaign.snapshot()')
   check(after['condition']>=before['condition'] if success else after['condition']<before['condition'] or before['condition']==0,f'{option}: outcome changes the lasting crew state')
   page.locator('#encounter-actions button').last.click()
 page.evaluate('badCatPuppyOptions.sample=realPuppySample;badCatCampaign.repair();badCatCampaign.repair();badCatCampaign.repair();badCatCampaign.repair();badCatCampaign.resupply()')
 page.locator('#kitten-launch').click();page.locator('#encounter-actions button').first.click()
 page.wait_for_timeout(300)
 check(page.locator('.kitten-target .kitten-emoji').count()==20,'Twenty kitten emojis are inside forcefield bubbles')
 before=page.locator('[data-kitten="1"]').bounding_box();page.wait_for_timeout(600);after=page.locator('[data-kitten="1"]').bounding_box()
 check(abs(after['x']-before['x'])+abs(after['y']-before['y'])>3,'Kitten bubbles drift across the playfield')
 style=page.locator('.kitten-target').first.evaluate('(n)=>({radius:getComputedStyle(n).borderRadius,border:getComputedStyle(n).borderTopWidth})')
 check(style['radius']=='50%' and style['border']=='3px','Targets render as circular forcefield bubbles')
 # A real pointer hit follows a moving bubble, not just a synthetic DOM click.
 rect=page.locator('[data-kitten="1"]').bounding_box();page.mouse.click(rect['x']+rect['width']/2,rect['y']+rect['height']/2)
 check(page.evaluate('badCatTargeting.diagnostics().raid.cleared')==1,'A real tap can pop a drifting kitten bubble')
 state_before=page.evaluate('badCatCampaign.snapshot()');page.evaluate('badCatTargeting.tick(60)');state_after=page.evaluate('badCatCampaign.snapshot()')
 check(state_after['condition']<state_before['condition'],'Escaped kittens damage the car')
 check(state_after['heat']>state_before['heat'],'Escaped kittens increase future cat pressure')
 check(state_after['jams']['shield']==2,'Failed round jams the forcefield for later attempts')
 check(page.locator('.result-mishap').count()==1,'Failure displays a setback animation, not a happy rescue')
 page.reload(wait_until='domcontentloaded');page.locator('#launch-silent').click(); page.locator('#test-drive').evaluate('(el)=>el.click()')
 check(page.evaluate('badCatCampaign.snapshot()')==state_after,'Consequences survive a reload')
 check(page.evaluate('badCatCampaign.raidSeconds()')<45,'Cat advantage makes the next kitten attack harder')
 page.evaluate('badCatTargeting.startRaid()')
 check(page.evaluate('badCatCampaign.snapshot()')==state_after,'Starting another round does not erase the setbacks')
 page.locator('[data-gadget="shield"]').click()
 page.locator('[data-kitten="1"]').evaluate('(el)=>el.click()');page.locator('[data-kitten="1"]').evaluate('(el)=>el.click()')
 check(page.evaluate('badCatTargeting.diagnostics().raid.cleared')==0,'Jammed forcefield actually fails on its next two uses')
 page.locator('[data-kitten="1"]').evaluate('(el)=>el.click()')
 check(page.evaluate('badCatTargeting.diagnostics().raid.cleared')==1,'Forcefield works again once its two jams have cleared')
 page.locator('#raid-close').click();page.locator('#encounter-actions button').last.click()
 page.locator('[data-view="hq"]').click();before_repair=page.evaluate('badCatCampaign.snapshot()');page.locator('#repair-crew').click();repaired=page.evaluate('badCatCampaign.snapshot()')
 check(repaired['condition']==min(100,before_repair['condition']+25) and all(n==0 for n in repaired['jams'].values()),'HQ workshop repairs the car and clears jams explicitly')
 check(not errors,f'No consequence or puppy JavaScript errors: {errors}');b.close()
