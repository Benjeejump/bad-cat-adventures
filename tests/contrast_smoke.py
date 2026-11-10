"""Visible launcher and option text must contrast with its actual control backplate."""
from playwright.sync_api import sync_playwright
from ui_helpers import tap_tool
AUDIT='''()=>{
const rgba=s=>{const n=s.match(/[\\d.]+/g);return n?n.map(Number):[0,0,0,0]};
const lum=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const background=n=>{for(let p=n;p;p=p.parentElement){const s=getComputedStyle(p),c=rgba(s.backgroundColor);if(c.length===3||c[3]>.95)return[c];if(s.backgroundImage.startsWith('linear-gradient')){const colors=[...s.backgroundImage.matchAll(/rgba?\\([^)]+\\)/g)].map(m=>rgba(m[0])).filter(c=>c.length===3||c[3]>.95);if(colors.length)return colors;}}return[[255,255,255]]};
return [...document.querySelectorAll('button,button b,button small,button span,button i,select,summary')].filter(n=>{
const r=n.getBoundingClientRect(),s=getComputedStyle(n);return r.width>0&&r.height>0&&r.x<innerWidth&&r.y<innerHeight&&r.right>0&&r.bottom>0&&s.visibility!=='hidden'&&s.opacity!=='0'&&/[A-Za-z0-9]/.test(n.innerText||'')&&!n.closest('.road-enemy,.world-enemy,.kitten-target,.field-bee,.villain-projectile,.message-bottle,.house-item,.parent-logo,[data-retired]');
}).map(n=>{const s=getComputedStyle(n),fg=rgba(s.color),bg=background(n),score=Math.min(...bg.map(c=>ratio(fg,c)));return{id:n.id||n.className,text:(n.innerText||'').slice(0,60),fg:s.color,bg:bg.map(c=>c.join(',')),ratio:Math.round(score*100)/100}}).filter(n=>n.ratio<4.5);
}'''
def audit(q,label):
 failures=q.evaluate(AUDIT)
 assert not failures,(label,failures)
 print('PASS '+label+' option and launcher text contrast',flush=True)
def close(q):
 q.evaluate('''()=>{if(badCatSpelling.isOpen())badCatSpelling.parentExit();document.querySelectorAll('dialog[open]').forEach(d=>d.close());badCatTargeting.abortRaid();badCatEncounters.clear();badCatCombat.clear();}''');q.wait_for_timeout(100)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);q=b.new_page(viewport={'width':1024,'height':700},reduced_motion='reduce');q.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded');q.locator('#launch-silent').click();q.wait_for_timeout(600)
 for christmas in [False,True]:
  q.evaluate('(on)=>badCatSeason.set(on)',christmas)
  for theme in ['day','night']:
   q.evaluate('(theme)=>badCatTheme.set(theme)',theme);audit(q,f'{christmas=} {theme} play')
   q.locator('#puppy-hq-launch').click();audit(q,f'{christmas=} {theme} HQ');q.locator('#close-puppy-hq').click()
   tap_tool(q,'#edit-arsenal');audit(q,f'{christmas=} {theme} loadout');close(q)
   q.locator('[data-view=hq]').click();audit(q,f'{christmas=} {theme} invention builder');q.locator('[data-view=drive]').click()
   for selector,label in [('#furniture-store-launch','store'),('#forest-launch','forest'),('#pipe-launch','pipes'),('#pencil-launch','handwriting'),('#spelling-launch','spelling'),('#carwash-launch','squid wash')]:
    tap_tool(q,selector);q.wait_for_timeout(100);audit(q,f'{christmas=} {theme} {label}');close(q)
   q.set_viewport_size({'width':390,'height':844});audit(q,f'{christmas=} {theme} phone pads');q.set_viewport_size({'width':1024,'height':700})
 b.close()
