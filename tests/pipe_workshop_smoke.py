"""Riveted full-screen water workshop: place around rocks, pause, finish without a clock."""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce');c.add_init_script('localStorage.setItem("metro-pipeworks-v1",JSON.stringify({wins:2,level:3}))');q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto('http://127.0.0.1:8000/');q.locator('#launch-silent').click();q.wait_for_timeout(600);q.evaluate('badCatPipes.open()')
 d=q.evaluate('badCatPipes.diagnostics()');assert d['placement'] and d['obstacles'] and not d['hasTimeLimit'];assert q.locator('#pipe-piece-tray').is_visible() and q.locator('.pipe-collar').count()>0
 board=q.locator('#pipe-board').bounding_box();assert board['width']>1000 and board['height']>400
 i=next(i for i,m in enumerate(d['tiles']) if m==0 and i not in d['obstacles']);q.locator('[data-pipe-piece="10"]').click();q.locator('#pipe-board button').nth(i).click();assert q.evaluate('badCatPipes.diagnostics().tiles')[i]==10;q.locator('#pipe-board button').nth(i).click();assert q.evaluate('badCatPipes.diagnostics().tiles')[i]==5
 q.locator('[data-pipe-piece="3"]').click();q.locator('#pipe-board button').nth(i).click();assert q.evaluate('badCatPipes.diagnostics().tiles')[i]==3
 assert all(q.locator('#pipe-board button').nth(i).is_disabled() for i in d['obstacles'])
 print('PASS Large silver pipes, riveted joints, parts rack and blocked cells form a full-screen placement puzzle',flush=True)
 for _ in range(50):q.locator('#pipe-hint').click()
 treats=q.evaluate('badCatCampaign.snapshot().supplies');q.locator('#pipe-start-water').click();q.wait_for_timeout(850);assert 0<q.evaluate('badCatPipes.diagnostics().flowCount')<q.evaluate('badCatPipes.diagnostics().connected');assert q.locator('.pipe-wet').count()>0
 q.screenshot(path='/tmp/v14-pipes-flow.png');q.locator('#pipe-pause').click();flow=q.evaluate('badCatPipes.diagnostics().flowCount');q.wait_for_timeout(500);assert q.evaluate('badCatPipes.diagnostics().flowCount')==flow;q.locator('#pipe-pause').click();q.wait_for_function('badCatPipes.diagnostics().won',timeout=30000);assert q.evaluate('badCatCampaign.snapshot().supplies')==treats+5;assert q.locator('#pipe-receiver-fill').evaluate('(n)=>n.value')==100
 print('PASS Slower visible flow pauses, reaches the outlet and fills the puppy tank with a five-treat reward',flush=True)
 for w,h in [(1024,600),(390,844)]:
  q.set_viewport_size({'width':w,'height':h});q.locator('#pipe-close').click();q.wait_for_timeout(80);q.evaluate('badCatPipes.open()');q.wait_for_timeout(100);q.screenshot(path=f'/tmp/v14-pipes-{w}.png');r=q.locator('#pipe-board').bounding_box();assert r['x']>=0 and r['x']+r['width']<=w and r['height']>=300
  q.locator('#pipe-start-water').scroll_into_view_if_needed();assert q.locator('#pipe-start-water').is_visible();q.locator('#pipe-close').scroll_into_view_if_needed()
 assert not errors,errors
 print('PASS Tablet and phone grids fit, controls remain reachable, and no JavaScript errors',flush=True);b.close()
