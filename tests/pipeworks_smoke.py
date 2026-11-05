"""Original connected pipe puzzles: solvability, relaxed flow, rewards, controls and offline play."""
from playwright.sync_api import sync_playwright

def check(v,m):
 assert v,m
 print('PASS',m,flush=True)
def rot(m):return ((m<<1)&15)|(m>>3)
def solve(d):
 rows,cols=d['rows'],d['cols'];tiles=d['tiles'];choices=[]
 for i,m in enumerate(tiles):
  options=[]
  for _ in range(4):
   if m not in options:options.append(m)
   m=rot(m)
  options=[m for m in options if bool(m&1)==(i>=cols and bool(m&1)) and (i>=cols or not m&1) and (i<(rows-1)*cols or not m&4) and (i%cols!=0 or bool(m&8)==(i==d['start'])) and (i%cols!=cols-1 or bool(m&2)==(i==d['end']))]
  choices.append(options)
 result=[0]*len(tiles)
 def search(i):
  if i==len(tiles):
   seen={d['start']};todo=list(seen)
   while todo:
    j=todo.pop()
    for delta,bit,opp in [(-cols,1,4),(1,2,8),(cols,4,1),(-1,8,2)]:
     n=j+delta
     if not result[j]&bit or n<0 or n>=len(tiles) or (delta==1 and j%cols==cols-1) or (delta==-1 and j%cols==0):continue
     if result[n]&opp and n not in seen:seen.add(n);todo.append(n)
   return len(seen)==len(tiles)
  for m in choices[i]:
   if i%cols and bool(result[i-1]&2)!=bool(m&8):continue
   if i>=cols and bool(result[i-cols]&4)!=bool(m&1):continue
   result[i]=m
   if search(i+1):return True
  return False
 assert search(0),'Generated puzzle must have a complete solution'
 return result
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce')
 for url in ['https://tiles.openfreemap.org/**','https://basemaps.cartocdn.com/**','https://nominatim.openstreetmap.org/**']:c.route(url,lambda r:r.abort())
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000/');page.locator('#launch-silent').click();page.locator('#test-drive').evaluate('(n)=>n.click()');page.locator('#pipe-launch').click()
 d=page.evaluate('badCatPipes.diagnostics()');solution=solve(d)
 check(not page.locator('#pipe-result').is_visible(),'Replay and next-puzzle controls stay hidden until the flow finishes')
 check(d['hasTimeLimit']==False and d['practice'],'Default workshop has no deadline and slow visible flow')
 before=page.evaluate('badCatAdventure.diagnostics().nextSpellingSeconds');page.evaluate('badCatAdventure.tick(500)')
 check(page.evaluate('badCatAdventure.diagnostics().nextSpellingSeconds')==before,'Random encounters pause during Metro’s workshop')
 for i,target in enumerate(solution):
  m=d['tiles'][i]
  while m!=target:page.locator('.pipe-tile').nth(i).click();m=rot(m)
 page.locator('#pipe-fluid').select_option('slime');page.locator('#pipe-start-water').click();page.wait_for_timeout(1300)
 d=page.evaluate('badCatPipes.diagnostics()')
 check(0<d['flowCount']<len(d['tiles']) and not d['done'],'Slime visibly travels through tiles before victory')
 check(page.locator('#pipe-board').get_attribute('data-fluid')=='slime','Chosen liquid styles the flowing pipes')
 page.locator('#pipe-pause').click();before=page.evaluate('badCatPipes.diagnostics().flowCount');page.wait_for_timeout(600)
 check(page.evaluate('badCatPipes.diagnostics().flowCount')==before,'Pause holds the flow so Dylan can think')
 page.locator('#pipe-pause').click();page.wait_for_function('badCatPipes.diagnostics().won',timeout=15000)
 check(page.locator('.pipe-wet').count()==len(solution),'Completed flow reaches every pipe and the outlet')
 check('treat' in page.locator('#pipe-status').inner_text(),'A complete repair earns puppy treats')
 page.screenshot(path='/tmp/metro-pipeworks.png');page.locator('#pipe-next').click();page.locator('#pipe-hint').click()
 check('One pipe fixed' in page.locator('#pipe-status').inner_text(),'Luna supplies a helpful pipe hint without a failure')
 for size in [(1024,600),(390,844)]:
  page.set_viewport_size({'width':size[0],'height':size[1]});box=page.locator('#pipe-board').bounding_box()
  check(box['width']<=size[0] and page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'Workshop fits '+str(size))
 page.locator('#pipe-close').click();page.evaluate('navigator.serviceWorker.ready');page.wait_for_function('navigator.serviceWorker.controller!==null');c.set_offline(True);page.reload();page.locator('#launch-silent').click();page.locator('#pipe-launch').click()
 check(page.evaluate('badCatPipes.diagnostics().record.wins')==1,'Repair record and workshop survive offline reload')
 page.locator('#pipe-close').click();c.set_offline(False)
 page.evaluate('localStorage.setItem("metro-pipeworks-v1",JSON.stringify({wins:4,level:5}))');page.reload();page.locator('#launch-silent').click();page.locator('#pipe-launch').click()
 d=page.evaluate('badCatPipes.diagnostics()');check(len(solve(d))==25,'Larger generated workshop also has a valid full route')
 check(not errors,'No Pipeworks JavaScript errors: '+str(errors));b.close()
