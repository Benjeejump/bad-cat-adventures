from ui_helpers import tap_tool, equip_puppies
"""Illustrated cast and cohesive UI remain usable across views and display themes."""
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
 tap_tool(page, '[data-vehicle=walking]');page.screenshot(path='/tmp/style-walking.png')
 check('dylan.png' in page.locator('#actor-car img').get_attribute('src'),'Walking uses Dylan the Dalmatian hero')
 page.locator('[data-view=hq]').click()
 check(page.locator('.puppy-roster .puppy-portrait').count()==3,'All three HQ puppies have matching illustrated portraits')
 check(page.locator('.puppy-roster img').evaluate_all('(nodes)=>nodes.every(n=>n.complete&&n.naturalWidth>0)'),'Puppy artwork loads')
 page.locator('.puppy-roster').scroll_into_view_if_needed();page.screenshot(path='/tmp/style-puppy-hq.png')
 for size in [(1024,600),(390,844)]:
  page.set_viewport_size({'width':size[0],'height':size[1]})
  check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'Illustrated HQ fits '+str(size))
 page.set_viewport_size({'width':1280,'height':800});page.locator('#theme-toggle').click();page.screenshot(path='/tmp/style-night-hq.png')
 page.locator('[data-view=drive]').click();tap_tool(page, '#carwash-launch')
 check(page.locator('.windscreen-squid').get_attribute('src')=='assets/carwash-squid.png','Squid animation uses the illustrated character')
 page.screenshot(path='/tmp/style-carwash.png');page.locator('#close-encounter').click()
 page.evaluate('badCatSpelling.open("puppy")');page.screenshot(path='/tmp/style-spelling.png')
 check(page.locator('#hear-word').is_visible() and page.locator('#look-word').is_visible(),'Restyled spelling instructions and help stay available')
 check(not errors,'No illustrated-style JavaScript errors: '+str(errors));b.close()
