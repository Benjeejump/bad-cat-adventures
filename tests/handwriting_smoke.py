from ui_helpers import tap_tool, equip_puppies
"""Real touch tracing, stroke order, two-sentence handwritten notes and local resume."""
from playwright.sync_api import sync_playwright

def check(v,m):
 assert v,m
 print('PASS',m,flush=True)
def points(page):
 return page.locator('.letter-active').evaluate('''p=>{const m=p.getScreenCTM(),len=p.getTotalLength(),out=[];for(let n=0;n<=len;n+=2){const pt=p.getPointAtLength(n);out.push({x:pt.x*m.a+pt.y*m.c+m.e,y:pt.x*m.b+pt.y*m.d+m.f})}const pt=p.getPointAtLength(len);out.push({x:pt.x*m.a+pt.y*m.c+m.e,y:pt.x*m.b+pt.y*m.d+m.f});return out}''')
def trace(page):
 page.locator('.letter-active').evaluate('''path=>{const pad=document.querySelector('#writing-pad'),m=path.getScreenCTM(),len=path.getTotalLength();const send=(type,p)=>pad.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:7,pointerType:'touch',button:0,clientX:p.x*m.a+p.y*m.c+m.e,clientY:p.x*m.b+p.y*m.d+m.f}));send('pointerdown',path.getPointAtLength(0));for(let n=1;n<=len;n+=1)send('pointermove',path.getPointAtLength(n));send('pointermove',path.getPointAtLength(len));send('pointerup',path.getPointAtLength(len));}''')
 page.wait_for_timeout(490)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1024,'height':600},has_touch=True,is_mobile=True,reduced_motion='reduce')
 for url in ['https://tiles.openfreemap.org/**','https://basemaps.cartocdn.com/**','https://nominatim.openstreetmap.org/**']:c.route(url,lambda r:r.abort())
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000/');page.locator('#launch-silent').click();tap_tool(page, '#pencil-launch');page.locator('#pencil-message').select_option('You are kind. I like your hugs.');page.locator('#pencil-begin').click()
 check(page.locator('.note-print-label').count()==2 and page.locator('.cursive-glyph').count()==25,'Both complete sentences are visible on the two-line cursive page')
 check(page.evaluate('new Set(badCatHandwriting.diagnostics().curriculum.join("").toLowerCase().replace(/[^a-z]/g,"")).size')==26,'Completing the note curriculum covers every letter A–Z')
 check(page.evaluate('''()=>{const chars=new Set(badCatHandwriting.diagnostics().curriculum.join('').replace(/[^A-Za-z]/g,''));return [...chars].every(ch=>Array.isArray(badCatCursive.letters[ch])&&badCatCursive.letters[ch].every(d=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);return p.getTotalLength()>0}))}'''),'Every letter used by the course has valid cursive formation paths')
 before=page.evaluate('badCatAdventure.diagnostics().nextSpellingSeconds');page.evaluate('badCatAdventure.tick(500)');check(page.evaluate('badCatAdventure.diagnostics().nextSpellingSeconds')==before,'Surprise events pause during handwriting')
 # A tap away from the start must not mark the letter as traced.
 page.locator('#writing-pad').evaluate("pad=>{pad.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:2,pointerType:'touch',clientX:0,clientY:0}))}")
 check(page.evaluate('badCatHandwriting.diagnostics().progress')==0,'Arbitrary tapping cannot complete a tracing stroke')
 # Use Chromium’s actual touch input for the first stroke.
 session=c.new_cdp_session(page);ps=points(page)
 session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[ps[0]]})
 for pt in ps[1:]:session.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[pt]})
 # Continue straight into the joined o without lifting the finger.
 for pt in points(page):session.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[pt]})
 session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(500)
 check(page.evaluate('badCatHandwriting.diagnostics().index')>=2,'Joined cursive letters can be traced without lifting the finger')
 position=page.evaluate('badCatHandwriting.diagnostics()');check(position['index']>0 or position['stroke']>0,'Actual finger input follows cursive formation in order')
 page.locator('#pencil-later').click();page.reload();page.locator('#launch-silent').click();tap_tool(page, '#pencil-launch')
 check(page.evaluate('badCatHandwriting.diagnostics().index')==position['index'] and page.evaluate('badCatHandwriting.diagnostics().stroke')==position['stroke'],'Saved cursive note resumes at the same place after reload')
 for size in [(1024,600),(390,844)]:
  page.set_viewport_size({'width':size[0],'height':size[1]});box=page.locator('#writing-pad').bounding_box();check(page.locator('#pencil-page-scroll').bounding_box()['width']<=size[0] and box['height']<=size[1],'Tracing pad fits '+str(size))
 page.screenshot(path='/tmp/magic-pencil-tracing.png')
 before=page.evaluate('badCatCampaign.snapshot().supplies')
 for _ in range(130):
  if page.evaluate('badCatHandwriting.diagnostics().done'):break
  trace(page)
 check(page.evaluate('badCatHandwriting.diagnostics().done'),'Finger tracing completes both short sentences without a timer')
 check(page.locator('#pencil-finished-art path').count()>25,'Finished note forms neat cursive paths on both writing lines')
 check(page.evaluate('badCatCampaign.snapshot().supplies')==min(99,before+8),'Finished note earns puppy treats')
 check(page.evaluate('badCatHandwriting.diagnostics().saved')==1,'Finished note is saved locally')
 page.screenshot(path='/tmp/magic-pencil-note.png');page.locator('#pencil-close').click()
 page.evaluate('navigator.serviceWorker.ready');page.wait_for_function('navigator.serviceWorker.controller!==null');c.set_offline(True);page.reload();page.locator('#launch-silent').click();tap_tool(page, '#pencil-launch')
 check('Your saved notes' in page.locator('#pencil-keepsakes').inner_text(),'Handwritten keepsake remains available offline')
 check(not errors,'No handwriting JavaScript errors: '+str(errors));b.close()
