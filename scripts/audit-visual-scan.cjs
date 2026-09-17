// Initial-view/first-activity inspection of the isolated harness, NOT a production E2E test.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const inventory = require('../docs/audits/2026-09-16-catalogue.json');
const dir = path.join(root, '.next/audit-integrity/screens');
fs.mkdirSync(dir, { recursive: true });
async function inspect(page) {
  return page.evaluate(() => {
    const visible = e => { const r=e.getBoundingClientRect(), s=getComputedStyle(e);return r.width>0 && r.height>0 && s.visibility!=='hidden' && s.display!=='none'; };
    const controls=[...document.querySelectorAll('main button, main input, main select, main textarea, main [role="button"]')].filter(visible);
    const name=e=>(e.getAttribute('aria-label')||e.textContent||e.getAttribute('placeholder')||'').trim().replace(/\s+/g,' ').slice(0,90);
    return {
      viewport:innerWidth, documentWidth:document.documentElement.scrollWidth, overflow:document.documentElement.scrollWidth>innerWidth+1,
      title:document.querySelector('h1')?.textContent, text:document.body.innerText.slice(0,6500),
      controls:controls.map(e=>{const r=e.getBoundingClientRect();return{tag:e.tagName,name:name(e),width:Math.round(r.width),height:Math.round(r.height),disabled:!!e.disabled}}),
      tinyTargets:controls.filter(e=>{const r=e.getBoundingClientRect();return !e.disabled&&(r.width<24||r.height<24)}).map(name),
      undersizedTeachingTargets:controls.filter(e=>{const r=e.getBoundingClientRect();return !e.disabled&&(r.width<44||r.height<44)}).map(name),
      missingAccessibleButtonNames:controls.filter(e=>e.tagName==='BUTTON'&&!e.getAttribute('aria-label')&&!e.textContent?.trim()).map(e=>e.outerHTML.slice(0,300)),
      horizontallyClippedControls:controls.filter(e=>{const r=e.getBoundingClientRect();let p=e.parentElement;while(p){const s=getComputedStyle(p),a=p.getBoundingClientRect();if(['hidden','clip'].includes(s.overflowX)&&(r.left<a.left-1||r.right>a.right+1))return true;p=p.parentElement;}return false}).map(name),
      images:[...document.images].map(e=>({src:e.getAttribute('src'),alt:e.alt,loaded:e.complete&&e.naturalWidth>0})),
      calls:window.__auditCalls||[],
    };
  });
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1280,height:1000}});
  await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  const rows=[];
  try {
    for(const item of inventory.catalog.filter(x=>!process.env.EXERCISE_SLUG||x.slug===process.env.EXERCISE_SLUG)) {
      for(const [index,level] of (item.isTool?['libre']:item.declaredLevels).entries()) {
        const page=await context.newPage();page.setDefaultTimeout(4000);
        const errors=[];page.on('pageerror',e=>errors.push(e.message));
        await page.goto(`http://127.0.0.1:9004/?slug=${item.slug}&level=${level}`);
        await page.waitForTimeout(550);
        await page.evaluate(()=>document.fonts.ready);
        const row={slug:item.slug,level,errors,initial:await inspect(page)};
        // Start only directly offered main exercises; no backend calls can escape the harness.
        const start=page.getByRole('button',{name:/^(Commencer(?: l.exercice| la séance| le jeu| le défi| la session)?|Démarrer(?: l.exercice| le jeu| la partie)?|C.est parti\s*!?)$/i}).first();
        if(await start.count() && await start.isEnabled()) {
          await start.click();await page.waitForTimeout(400);row.started=await inspect(page);
        }
        if(index===0) {
          await page.screenshot({path:path.join(dir,`${item.slug}-desktop.png`),fullPage:true});
          await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
          row.mobile=await inspect(page);await page.screenshot({path:path.join(dir,`${item.slug}-mobile.png`),fullPage:true});
        }
        rows.push(row);await page.close();
      }
      console.log(`${item.slug}: ${rows.filter(x=>x.slug===item.slug).length} view(s)`);
    }
  } finally { await browser.close(); }
  const summary={method:'Isolated actual React rendering, real local generators; synthetic profile; Firebase/persistence/AI replaced. External images and API blocked. Initial/first view only, not complete sessions.',
    counts:{views:rows.length,exercises:new Set(rows.map(x=>x.slug)).size},
    mobileOverflow:rows.filter(x=>x.mobile?.overflow).map(x=>({slug:x.slug,width:x.mobile.documentWidth})),
    renderedErrors:rows.filter(x=>x.errors.length).map(x=>({slug:x.slug,level:x.level,errors:x.errors})),rows};
  fs.writeFileSync(path.join(root,process.env.AUDIT_REPORT || 'docs/audits/2026-09-16-visuel.json'),JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify({counts:summary.counts,mobileOverflow:summary.mobileOverflow,renderedErrors:summary.renderedErrors},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
