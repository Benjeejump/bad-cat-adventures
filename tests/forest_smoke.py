"""Multiplication 1–12, supportive retries, six-lantern reward, pause and persistence."""
from playwright.sync_api import sync_playwright
from ui_helpers import tap_tool
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context(viewport={'width':1024,'height':700},reduced_motion='reduce');page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');page.locator('#launch-silent').click();tap_tool(page,'#forest-launch')
 for table in range(1,13):
  page.locator('#forest-table').select_option(str(table));d=page.evaluate('badCatForest.diagnostics()');assert d['a']==table and 1<=d['b']<=12
  values=page.locator('#forest-answers button').all_text_contents();assert len(values)==3 and len(set(values))==3 and str(d['a']*d['b']) in values
 print('PASS All tables 1–12 produce valid questions and three distinct answers including the correct one',flush=True)
 treats=page.evaluate('badCatCampaign.snapshot().supplies');d=page.evaluate('badCatForest.diagnostics()');correct=str(d['a']*d['b']);wrong=next(x for x in page.locator('#forest-answers button').all_text_contents() if x!=correct);page.get_by_role('button',name=wrong,exact=True).click()
 assert page.locator('#forest-groups').is_visible() and page.evaluate('badCatForest.diagnostics().solved')==0 and page.evaluate('badCatCampaign.snapshot().supplies')==treats
 print('PASS Wrong answers show grouped counting and cost no treats or attempts',flush=True)
 frozen=page.evaluate('badCatRoad.diagnostics().elapsed');page.wait_for_timeout(650);assert page.evaluate('badCatRoad.diagnostics().elapsed')==frozen
 for i in range(6):
  d=page.evaluate('badCatForest.diagnostics()');page.get_by_role('button',name=str(d['a']*d['b']),exact=True).click()
  if i<5:page.wait_for_timeout(1500)
 assert page.locator('#forest-lanterns .lit').count()==6 and page.evaluate('badCatForest.diagnostics().trails')==1 and page.evaluate('badCatCampaign.snapshot().supplies')==min(99,treats+5)
 print('PASS Six answers open the gate and award treats once while the base game stays paused',flush=True)
 page.set_viewport_size({'width':390,'height':844});assert page.locator('#forest-dialog').evaluate('(n)=>n.scrollWidth<=n.clientWidth+1');page.screenshot(path='/tmp/forest-phone.png')
 page.locator('#forest-close').click();page.locator('[data-view=hq]').click();page.locator('#forest-launch-hq').click();assert page.locator('#forest-dialog').evaluate('(n)=>n.open');page.locator('#forest-close').click()
 page.evaluate('navigator.serviceWorker.ready');page.wait_for_function('navigator.serviceWorker.controller');c.set_offline(True);page.reload(wait_until='domcontentloaded');page.locator('#launch-silent').click();tap_tool(page,'#forest-launch');assert page.evaluate('badCatForest.diagnostics().trails')==1
 assert not errors,errors
 print('PASS Forest fits phones, opens from Mission HQ and preserves progress offline',flush=True);b.close()
