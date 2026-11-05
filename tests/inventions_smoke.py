"""Picture recipes persist and launch their actual chosen item; puppy walking uses GPS roads."""
from playwright.sync_api import sync_playwright

def check(v,m):
 assert v,m
 print('PASS',m,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce')
 for url in ['https://tiles.openfreemap.org/**','https://basemaps.cartocdn.com/**','https://nominatim.openstreetmap.org/**']:c.route(url,lambda r:r.abort())
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000/');page.locator('#launch-silent').click();page.locator('#test-drive').evaluate('(n)=>n.click()');page.locator('[data-view=hq]').click()
 check(page.evaluate('badCatInventions.counts()')=={'launchers':20,'items':40,'features':24},'Large picture catalog has 19,200 combinations')
 for group,value in [('launcher','catapult'),('item','acorns'),('feature','stinky')]:page.locator('#invention-'+group+'-choices [data-recipe='+value+']').click()
 check('Stinky acorns' in page.locator('#invention-preview').inner_text(),'Preview describes the selected recipe')
 page.locator('#preview-invention').click();check(page.locator('.recipe-launch[data-item=acorns][data-launcher=catapult]').count()==1,'Testing the invention launches acorns from the catapult')
 page.locator('#invention-name').fill('Dylan’s Acorn Surprise');page.locator('#invention-form [type=submit]').click()
 saved=page.evaluate('JSON.parse(localStorage.getItem("bad-cat-progress-v1")).inventions[0]')
 check(saved['item']=='acorns' and saved['launcher']=='catapult' and saved['feature']=='stinky','Actual recipe is saved with its name')
 page.locator('#inventions .use-invention').first.click();check(page.locator('#drive-view').is_visible(),'Deploy returns to the adventure')
 page.locator('#actor-badcat').click();check(page.locator('.recipe-launch[data-item=acorns][data-feature=stinky]').count()>0,'Targeted invention fires the selected item and special feature')
 check(page.evaluate('badCatCharacters.diagnostics().badcat.shield')==2,'Custom invention wears down the enemy forcefield')
 page.locator('#cancel-target').click();page.locator('[data-vehicle=walking]').first.click()
 check(page.evaluate('badCatVehicle.mode()')=='walking' and not page.evaluate('badCatVehicle.worldActive()'),'Walking stays in the GPS road world')
 check('dylan.png' in page.locator('#actor-car img').get_attribute('src'),'Walking replaces the car with an animated puppy')
 page.reload();page.locator('#launch-silent').click();page.locator('#test-drive').evaluate('(n)=>n.click()');page.locator('#arsenal-launch').click()
 check('Dylan’s Acorn Surprise' in page.locator('#field-inventions').inner_text(),'Saved recipe remains accessible from the map after reload')
 page.locator('#field-inventions button').first.click();check('Dylan’s Acorn Surprise' in page.locator('#target-instruction').inner_text(),'Map arsenal arms the named invention')
 page.locator('#cancel-target').click();page.evaluate('badCatTargeting.startRaid()')
 page.locator('#arsenal-launch').click();page.locator('#field-inventions button').first.click()
 page.locator('[data-kitten="1"]').click()
 check(page.evaluate('badCatTargeting.diagnostics().raid.remaining')==19,'Saved invention works against the kitten raid')
 check(page.locator('.recipe-launch[data-item=acorns]').count()>0,'Kitten hit shows the selected custom projectile')
 page.locator('#raid-close').click();page.locator('#close-encounter').evaluate('(n)=>n.click()')
 for size in [(1024,600),(390,844)]:
  page.set_viewport_size({'width':size[0],'height':size[1]});page.locator('[data-view=hq]').click()
  check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'Builder fits viewport '+str(size))
 page.screenshot(path='/tmp/invention-builder.png');check(not errors,'No invention/walking errors: '+str(errors));b.close()
