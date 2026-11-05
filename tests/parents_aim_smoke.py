"""Exercise hidden parent gestures and free aiming in a real browser."""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce')
 page=c.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded')
 page.locator('#launch-silent').click();page.locator('#test-drive').evaluate('(n)=>n.click()');page.wait_for_timeout(600)
 page.locator('[data-gadget="laser"]').click()
 before=page.evaluate('badCatCharacters.diagnostics()')
 page.mouse.click(200,500)
 assert page.locator('.free-shot').count()==1
 assert page.evaluate('badCatCharacters.diagnostics()')==before
 assert page.evaluate('badCatTargeting.diagnostics().armed')=='laser'
 page.locator('#actor-metro').click()
 assert page.evaluate('badCatCharacters.diagnostics().metro.shield')==2
 print('PASS Free shot can miss; a cat hit damages its forcefield; launcher stays armed')
 page.evaluate('badCatAdventure.encounter("spelling")')
 treats=page.evaluate('badCatCampaign.snapshot().supplies')
 badge=page.locator('#spelling-dialog > .parent-logo');badge.wait_for()
 r=badge.bounding_box();page.mouse.move(r['x']+20,r['y']+20);page.mouse.down();page.wait_for_timeout(5150);page.mouse.up()
 assert not page.locator('#spelling-dialog').evaluate('(n)=>n.open')
 assert page.evaluate('badCatCampaign.snapshot().supplies')==treats
 assert page.evaluate('JSON.parse(localStorage.getItem("bad-cat-wordbook-v1")).pending') is None
 print('PASS Five-second hold leaves locked spelling without rewards, penalty or pending restart')
 page.evaluate('badCatTargeting.startRaid()')
 campaign=page.evaluate('badCatCampaign.snapshot()')
 badge=page.locator('body > .parent-logo');r=badge.bounding_box()
 page.mouse.move(r['x']+20,r['y']+20);page.mouse.down();page.wait_for_timeout(5150);page.mouse.up()
 assert not page.evaluate('badCatTargeting.raidActive()')
 assert page.evaluate('badCatCampaign.snapshot()')==campaign
 print('PASS Parent hold aborts kitten raid without recording a loss')
 badge=page.locator('body > .parent-logo')
 for _ in range(4):badge.click()
 assert not page.locator('#parent-controls').evaluate('(n)=>n.open')
 badge.click();assert page.locator('#parent-controls').evaluate('(n)=>n.open')
 page.locator('#parent-zero').click();assert page.evaluate('badCatCampaign.snapshot().supplies')==0
 page.locator('#parent-reset').click();page.locator('#parent-keep').click()
 assert not page.locator('#parent-confirm').is_visible()
 page.evaluate('localStorage.setItem("unrelated-app", "keep")')
 page.locator('#parent-reset').click();page.locator('#parent-erase').click();page.wait_for_load_state('domcontentloaded')
 page.locator('#launch-silent').wait_for()
 assert page.evaluate('localStorage.getItem("unrelated-app")')=='keep'
 assert page.evaluate('badCatCampaign.snapshot().supplies')==6
 assert page.evaluate('badCatSpelling.diagnostics().collected.length')==0
 print('PASS Five taps open parent controls; zero treats and confirmed game reset preserve unrelated data')
 assert not errors,errors
 b.close()
