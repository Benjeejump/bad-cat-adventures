"""New original environments, common sprite scale and random surprise Pipeworks."""
from playwright.sync_api import sync_playwright

def check(v,m):
 assert v,m
 print('PASS',m,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce')
 for url in ['https://tiles.openfreemap.org/**','https://basemaps.cartocdn.com/**','https://nominatim.openstreetmap.org/**']:c.route(url,lambda r:r.abort())
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000/');page.locator('#launch-silent').click();page.locator('#test-drive').evaluate('(n)=>n.click()')
 page.evaluate('const pool=badCatAdventure.diagnostics().surprisePool;window.originalRandom=Math.random;Math.random=()=>(pool.indexOf("pipeworks")+.01)/pool.length;badCatAdventure.tick(50);Math.random=originalRandom')
 check(page.evaluate('badCatPipes.isOpen()'),'Foreground timer randomly deploys Pipeworks as a surprise')
 check('underfloor-world.png' in page.locator('#pipe-board').evaluate('(n)=>getComputedStyle(n).backgroundImage'),'Pipe puzzle sits under lifted floorboards')
 page.screenshot(path='/tmp/underfloor-pipeworks.png');page.locator('#pipe-close').click()
 page.locator('[data-vehicle=walking]').first.click()
 for selector in ['#actor-car','#actor-badcat','#actor-metro']:
  box=page.locator(selector).bounding_box();check(box['width']==80 and box['height']==80,selector+' has the common 80px sprite frame')
 for mode,bg in [('plane','sky-world'),('submarine','sea-world')]:
  page.locator('[data-vehicle='+mode+']').first.click();box=page.locator('#world-vehicle').bounding_box()
  check(abs(box['width']-80)<1 and abs(box['height']-80)<1,mode+' matches Dylan’s map sprite size')
  check(bg+'.png' in page.locator('.world-scenery').evaluate('(n)=>getComputedStyle(n).backgroundImage'),mode+' has its own original full background')
  page.screenshot(path='/tmp/'+mode+'-scaled-world.png')
 page.locator('[data-vehicle=car]').first.click();page.evaluate('badCatAdventure.encounter("badcat")')
 check('surprise-world.png' in page.locator('.story-world').evaluate('(n)=>getComputedStyle(n).backgroundImage'),'Story surprise uses the modern town environment')
 page.screenshot(path='/tmp/modern-surprise.png');page.locator('#close-encounter').click();page.locator('#carwash-launch').click()
 check(page.locator('.windscreen-squid').get_attribute('src')=='assets/carwash-squid.png','Windscreen uses the big tentacled squid asset')
 page.screenshot(path='/tmp/tentacled-squid-windscreen.png');check(not errors,'No scene-scale JavaScript errors: '+str(errors));b.close()
