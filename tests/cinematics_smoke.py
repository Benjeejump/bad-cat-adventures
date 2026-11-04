"""Full-screen clouds/puppy and a real animated kitten tornado, not a car poster."""
from playwright.sync_api import sync_playwright

def check(value,message):
 assert value,message
 print('PASS',message,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);context=b.new_context(viewport={'width':1280,'height':800});context.route('https://tiles.openfreemap.org/**',lambda r:r.abort());context.route('https://basemaps.cartocdn.com/**',lambda r:r.abort());context.route('https://nominatim.openstreetmap.org/**',lambda r:r.abort());page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:8000/');page.locator('#launch-silent').click();page.locator('#test-drive').evaluate('(n)=>n.click()')
 page.evaluate('badCatAdventure.encounter("puppy")');box=page.locator('#scene-stage').bounding_box()
 check(box=={'x':0,'y':0,'width':1280,'height':800},'Puppy animation fills the screen behind floating decisions')
 puppy=page.locator('.scene-character').bounding_box();check(abs(puppy['x']+puppy['width']/2-640)<10,'Cartoon puppy is centred horizontally')
 check(page.locator('.scene-car').count()==0,'Puppy scene has no small car-at-the-bottom layout')
 cloud=page.locator('.rising-cloud').nth(3).bounding_box();page.wait_for_timeout(350);moved=page.locator('.rising-cloud').nth(3).bounding_box()
 check(moved['y']<cloud['y'],'Clouds perpetually move up behind the falling puppy')
 page.screenshot(path='/tmp/puppy-cinematic-final.png');page.locator('#close-encounter').click()
 page.evaluate('window.realSample=badCatPuppyOptions.sample')
 for effect in ['bubbles','badcat','treats']:
  page.evaluate('''effect=>{let option;for(let i=0;i<200&&!option;i++)option=realSample().find(o=>o.effect===effect);badCatPuppyOptions.sample=()=>[{...option,success:true},{...option,success:false}];}''',effect)
  page.evaluate('badCatAdventure.encounter("puppy")');page.locator('#encounter-actions button').first.click();page.wait_for_timeout(2150)
  check(page.locator('.puppy-prop svg' if effect!='badcat' else '.puppy-prop img').count()==1,effect+' landing object is illustrated rather than an emoji')
  check(page.locator('.puppy-success').count()==1,effect+' catch has its own landing animation')
  if effect=='bubbles':page.screenshot(path='/tmp/puppy-bubble-landing.png')
  page.locator('#encounter-actions button').last.click()
 page.evaluate('badCatPuppyOptions.sample=realSample;badCatAdventure.encounter("tornado")')
 check(page.locator('.scene-car').count()==0,'Tornado scene removes the old car poster')
 check(page.locator('.cyclone-cat').count()==24,'Tornado contains 24 orbiting illustrated kittens')
 kitten=page.locator('.cyclone-cat image').first.bounding_box();page.wait_for_timeout(400);later=page.locator('.cyclone-cat image').first.bounding_box()
 check(abs(later['x']-kitten['x'])+abs(later['y']-kitten['y'])>10,'Kittens actually spin around the scene')
 page.screenshot(path='/tmp/kitten-tornado-cinematic.png');page.locator('#close-encounter').click()
 check(not errors,f'No cinematic JavaScript errors: {errors}');b.close()
