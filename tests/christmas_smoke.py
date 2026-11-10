"""Whole-game Christmas switch preserves progress, themes every activity and works offline."""
from playwright.sync_api import sync_playwright
from ui_helpers import tap_tool

def close(q):
 q.evaluate('''()=>{if(badCatSpelling.isOpen())badCatSpelling.parentExit();document.querySelectorAll('dialog[open]').forEach(d=>d.close());badCatTargeting.abortRaid();badCatEncounters.clear();badCatCombat.clear();}''');q.wait_for_timeout(120)
def parents(q):
 badge=q.locator('body > .parent-logo')
 for _ in range(5):badge.click()
 q.locator('#parent-controls').wait_for(state='visible')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce')
 c.add_init_script('''if(!localStorage.getItem('winter-seeded')){localStorage.setItem('winter-seeded','1');localStorage.setItem('bad-cat-puppy-house-v1',JSON.stringify({tier:0,owned:['home-0-0'],placed:['home-0-0'],positions:{'home-0-0':{x:50,y:50}},unlockedFriends:['golden'],visitors:{0:['golden']}}));localStorage.setItem('bad-cat-progress-v1',JSON.stringify({inventions:[{name:'Dylan’s Acorn Slide',launcher:'catapult',item:'acorns',feature:'sparkly',power:'laser'}]}));}''')
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');q.locator('#launch-silent').click();q.wait_for_timeout(600);q.locator('[data-view=hq]').click()
 before=q.evaluate('Object.fromEntries(["bad-cat-progress-v1","bad-cat-puppy-house-v1","bad-cat-campaign-v1","bad-cat-arsenal-v1"].map(k=>[k,localStorage.getItem(k)]))')
 parents(q);q.locator('#christmas-mode').check();q.wait_for_timeout(200)
 assert q.evaluate('badCatSeason.active()') and q.locator('html').get_attribute('class').find('christmas-mode')>=0
 after=q.evaluate('Object.fromEntries(["bad-cat-progress-v1","bad-cat-puppy-house-v1","bad-cat-campaign-v1","bad-cat-arsenal-v1"].map(k=>[k,localStorage.getItem(k)]))');assert before==after
 q.locator('#parent-close').click();q.locator('[data-view=drive]').click();q.wait_for_timeout(150)
 assert 'christmas/road-odyssey' in q.locator('#road-player img').get_attribute('src');assert 'Candy' in q.locator('[data-slot="1"]').inner_text()
 q.evaluate('badCatRoad.tick(10);badCatRoad.tick(10);badCatRoad.tick(10)');q.wait_for_timeout(150)
 assert 'christmas/metro-bus' in q.locator('.road-metro img').get_attribute('src') and 'christmas/bad-cat-balloon' in q.locator('.road-badcat img').get_attribute('src')
 print('PASS Real parent switch enables winter characters, vehicles, scenery and launchers without changing saved progress',flush=True)
 tap_tool(q,'[data-puppy-house]');assert 'Gingerbread' in q.locator('#house-title').inner_text();assert q.evaluate('badCatHouse.diagnostics().owned')==['home-0-0'];assert q.evaluate('badCatHouse.diagnostics().visitors')==['golden']
 q.locator('#house-store-tab').click();assert any('Christmas' in s or 'Candy' in s or 'Santa' in s for s in q.locator('#house-shop article b').all_text_contents());q.locator('#house-home-tab').click();q.wait_for_timeout(150);assert q.locator('.christmas-hat').filter(visible=True).count()>0
 q.screenshot(path='/tmp/christmas-home.png');close(q)
 tap_tool(q,'#pipe-launch');assert 'Warm cocoa' in q.locator('#pipe-fluid').inner_text();assert 'North Pole' in q.locator('#pipe-title').inner_text();q.screenshot(path='/tmp/christmas-pipes.png');close(q)
 tap_tool(q,'#pencil-launch');curr=q.evaluate('badCatHandwriting.diagnostics().curriculum');assert all(t not in ['You are kind. I like your hugs.'] for t in curr)
 assert len(set(''.join(curr).lower())&set('abcdefghijklmnopqrstuvwxyz'))==26
 q.locator('#pencil-begin').click();q.screenshot(path='/tmp/christmas-writing.png');close(q)
 q.evaluate('badCatSpelling.open()');word=q.evaluate('badCatSpelling.diagnostics().word');assert q.evaluate('(word)=>badCatSeason.holidayWords.some(w=>w.word===word)',word);q.screenshot(path='/tmp/christmas-spelling.png');close(q)
 tap_tool(q,'#forest-launch');assert 'North Pole' in q.locator('#forest-title').inner_text();assert 'Christmas trees' in q.locator('#forest-context').inner_text();assert '🎁' in q.locator('#forest-lanterns').inner_text();q.screenshot(path='/tmp/christmas-forest.png');close(q)
 tap_tool(q,'#carwash-launch');q.wait_for_timeout(100);assert 'christmas/carwash-squid' in q.locator('.windscreen-squid').get_attribute('src');q.screenshot(path='/tmp/christmas-carwash.png');close(q)
 q.locator('[data-view=hq]').click();assert 'Candy' in q.locator('#invention-launcher-choices').inner_text() and 'Stockings' in q.locator('#invention-item-choices').inner_text()
 q.locator('#inventions .use-invention').first.click();q.mouse.click(180,380);assert q.locator('.recipe-launch[data-item=acorns] .recipe-projectile').first.inner_text()=='🎁';q.locator('[data-view=hq]').click()
 print('PASS Homes, furniture, friends, Pipes, handwriting, spelling, forest, squid wash and actual launched inventory items have festive content',flush=True)
 parents(q);q.locator('#christmas-mode').uncheck();q.locator('#parent-close').click();q.locator('[data-view=drive]').click();q.wait_for_timeout(100);assert q.locator('#road-player img').get_attribute('src')=='assets/road-odyssey.png';assert 'Confetti' in q.locator('[data-slot="1"]').inner_text();assert q.evaluate('badCatHouse.diagnostics().homes[0]')=='Dog house';assert 'Yarn' in q.locator('#invention-item-choices').inner_text()
 q.locator('[data-view=hq]').click();parents(q);q.locator('#christmas-mode').check();q.locator('#parent-close').click();q.evaluate('navigator.serviceWorker.ready');q.wait_for_function('navigator.serviceWorker.controller');c.set_offline(True);q.reload(wait_until='domcontentloaded');q.locator('#launch-silent').click();q.wait_for_function('document.querySelector("#road-player img").naturalWidth>0');assert q.evaluate('badCatSeason.active()');assert 'christmas/' in q.locator('#road-player img').get_attribute('src')
 assert q.evaluate('badCatHouse.diagnostics().owned')==['home-0-0'] and q.evaluate('badCatHouse.diagnostics().visitors')==['golden'];assert not errors,errors
 print('PASS Mode turns off cleanly, survives offline reload and preserves furniture and chosen friends',flush=True);b.close()
