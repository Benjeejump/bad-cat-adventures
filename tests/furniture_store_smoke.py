"""Treat-funded store, 10/20/30/40/50 furnishings, upgrades and preservation."""
from playwright.sync_api import sync_playwright
from ui_helpers import tap_tool
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1280,'height':800},reduced_motion='reduce');errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');page.locator('#launch-silent').click()
 tap_tool(page,'#furniture-store-launch');assert page.locator('#puppy-house-dialog').evaluate('(d)=>d.classList.contains("house-store-mode")')
 cat=page.evaluate('badCatHouse.diagnostics().catalog');assert len(cat)==150 and [sum(i['tier']==t for i in cat) for t in range(5)]==[10,20,30,40,50]
 assert page.locator('#house-shop article').count()==10
 item=cat[0];before=page.evaluate('badCatCampaign.snapshot().supplies');page.locator('[data-buy-item="'+item['id']+'"]').click();assert page.evaluate('badCatCampaign.snapshot().supplies')==before-item['price'];assert item['id'] in page.evaluate('badCatHouse.diagnostics().placed')
 page.locator('#house-home-tab').click();assert page.locator('[data-house-item="'+item['id']+'"]').is_visible();page.locator('#house-store-tab').click()
 print('PASS Furniture store is directly accessible, shows prices, spends treats and places purchases',flush=True)
 page.evaluate('badCatCampaign.spendTreats(badCatCampaign.snapshot().supplies)');page.locator('#house-store-tab').click();assert page.locator('[data-buy-item="'+cat[1]['id']+'"]').is_disabled()
 print('PASS Unaffordable purchases are disabled',flush=True)
 for tier,total in enumerate([10,20,30,40,50]):
  for item in [i for i in cat if i['tier']==tier]:
   page.evaluate('badCatCampaign.awardTreats(99)');page.locator('#house-store-tab').click()
   if item['id'] not in page.evaluate('badCatHouse.diagnostics().owned'):page.locator('[data-buy-item="'+item['id']+'"]').click()
  assert page.evaluate('badCatHouse.diagnostics().furnished')==total
  if tier<4:page.locator('#house-upgrade').click();assert page.evaluate('badCatHouse.diagnostics().tier')==tier+1 and page.evaluate('badCatHouse.diagnostics().furnished')==0
 print('PASS All five furnishing targets and upgrades work; all 150 purchases persist',flush=True)
 assert len(page.evaluate('badCatHouse.diagnostics().owned'))==150
 page.locator('#house-visit').select_option('0');page.locator('#house-home-tab').click();assert page.locator('.house-item').count()==10
 page.locator('#house-close').click();page.reload();page.locator('#launch-silent').click();assert len(page.evaluate('badCatHouse.diagnostics().owned'))==150
 assert not errors,errors
 print('PASS Earlier homes remain visitable and purchases survive reload',flush=True)
 legacy=b.new_context(viewport={'width':1024,'height':600})
 legacy.add_init_script("localStorage.setItem('bad-cat-puppy-house-v1',JSON.stringify({tier:0,owned:Array.from({length:20},(_,i)=>'home-0-'+i),placed:Array.from({length:20},(_,i)=>'home-0-'+i),positions:{}}))")
 old=legacy.new_page();old.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');old.locator('#launch-silent').click();tap_tool(old,'[data-puppy-house]')
 assert old.evaluate('badCatHouse.diagnostics().furnished')==10 and old.locator('.house-item').count()==20
 print('PASS Previously purchased small-house decorations are preserved as bonuses',flush=True)
 b.close()
