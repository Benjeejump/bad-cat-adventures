"""Parent access must have its own space, clear of every visible control."""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page()
 page.goto('http://127.0.0.1:8000/')
 def overlap(label):
  hits=page.evaluate('''()=>{const dialog=[...document.querySelectorAll('dialog[open]')].at(-1);const scope=dialog||document;const badge=scope.querySelector(dialog?':scope > .parent-logo':'body > .parent-logo');const a=badge.getBoundingClientRect();return [...scope.querySelectorAll('button,input,select,textarea,a,summary')].filter(n=>!n.classList.contains('parent-logo')&&n.getBoundingClientRect().width&&getComputedStyle(n).visibility!=='hidden').filter(n=>{const r=n.getBoundingClientRect();const left=Math.max(a.left,r.left),right=Math.min(a.right,r.right),top=Math.max(a.top,r.top),bottom=Math.min(a.bottom,r.bottom);return right-left>1&&bottom-top>1&&document.elementsFromPoint((left+right)/2,(top+bottom)/2).some(el=>el===n||n.contains(el))}).map(n=>n.id||n.textContent.slice(0,40))}''')
  assert not hits, f'{label}: parent logo overlaps {hits}'
  print('PASS '+label+' parent logo clears controls',flush=True)
 overlap('Intro')
 page.locator('#launch-silent').click();page.locator('#test-drive').evaluate('(n)=>n.click()');page.wait_for_timeout(600)
 for w,h in [(1280,800),(1024,600),(800,1280),(390,844)]:
  page.set_viewport_size({'width':w,'height':h});overlap(f'{w} drive')
  page.evaluate('badCatAdventure.encounter("spelling")');overlap(f'{w} spelling');page.evaluate('badCatSpelling.parentExit()')
  page.evaluate('badCatAdventure.encounter("pipeworks")');overlap(f'{w} pipes');page.evaluate('document.querySelectorAll("dialog[open]").forEach(d=>d.close())')
  page.evaluate('badCatHandwriting.open()');overlap(f'{w} pencil');page.evaluate('document.querySelectorAll("dialog[open]").forEach(d=>d.close())')
  page.evaluate('badCatHouse.open()');overlap(f'{w} puppy house');page.evaluate('document.querySelectorAll("dialog[open]").forEach(d=>d.close())')
  page.evaluate('badCatAdventure.encounter("puppy")');overlap(f'{w} surprise');page.evaluate('document.querySelectorAll("dialog[open]").forEach(d=>d.close())')
  page.locator('#edit-arsenal').evaluate('(n)=>n.click()');overlap(f'{w} arsenal');page.evaluate('document.querySelectorAll("dialog[open]").forEach(d=>d.close())')
  page.locator('#parent-controls').evaluate('(d)=>d.showModal()');overlap(f'{w} parent controls');page.locator('#parent-controls').evaluate('(d)=>d.close()')
  page.evaluate('badCatTargeting.startRaid()');overlap(f'{w} kittens');page.evaluate('badCatTargeting.abortRaid()')
  page.locator('[data-view="hq"]').first.click();overlap(f'{w} HQ');page.locator('[data-view="drive"]').first.click()
 b.close()
