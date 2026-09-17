// Integration checks on actual React components with synthetic services only.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
 const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
 });
 const page = await browser.newPage({viewport:{width:390,height:844}});
 page.setDefaultTimeout(7000);
 await page.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
 await page.clock.install();
 const results = [];
 const calls = () => page.evaluate(() => window.__auditCalls.filter(c => /^(addScore|saveHomeworkResult)$/.test(c.name)));
 const open = async (slug,level='B',extra='') => { await page.goto(`http://127.0.0.1:9004/?slug=${slug}&level=${level}${extra}`); await page.waitForTimeout(250); };
 fs.mkdirSync('docs/audits/assets/fixes',{recursive:true});
 try {
  await open('tables-multiplication');
  await page.getByRole('checkbox').uncheck();
  await page.getByRole('button',{name:'Tout sélectionner',exact:true}).click();
  await page.getByRole('button',{name:"C'est parti !"}).click();
  await page.getByTitle('Terminer la session').click();
  assert.equal((await calls()).length,0,'empty session must not write NaN');
  await page.getByRole('button',{name:'Rejouer',exact:true}).click();
  for(let i=0;i<20;i++) {
   const text = await page.locator('div').filter({hasText:/^\d+ x \d+$/}).last().innerText();
   const [a,b] = text.split('x').map(Number);
   await page.locator('input').fill(String(a*b));
   await page.clock.runFor(600);
  }
  assert.equal((await calls()).at(-1).args[0].score,100);
  await page.getByRole('button',{name:'Rejouer',exact:true}).click();
  assert.equal(await page.locator('input').isDisabled(),false);
  assert.equal(await page.locator('input').inputValue(),'');
  results.push('tables: empty session, twenty answers, detailed 100%, replay enabled');

  await open('keyboard-copy','A','&from=devoirs&date=2026-09-16');
  await page.getByRole('button',{name:'Afficher le clavier'}).click();
  const geometry = await page.evaluate(() => ({width:innerWidth,document:document.documentElement.scrollWidth,letters:[...document.querySelectorAll('button')].filter(b=>/^[A-ZÉÈÊÀÂÎÔÙÛÇËÏÜŒ]$/.test(b.textContent.trim())).map(b=>{const r=b.getBoundingClientRect();return {text:b.textContent,left:r.left,right:r.right}})}));
  assert.ok(geometry.document <= geometry.width + 1,JSON.stringify(geometry));
  assert.ok(geometry.letters.every(b=>b.left>=0 && b.right<=geometry.width));
  assert.ok(geometry.letters.some(b=>b.text==='É'));
  await page.screenshot({path:'docs/audits/assets/fixes/clavier-mobile.png',fullPage:true});
  for(let i=0;i<10;i++) {
   const target=await page.locator('div.order-first').innerText();
   await page.getByRole('textbox',{name:'Recopier le mot'}).fill(target);
   await page.clock.runFor(1100);
  }
  assert.equal((await calls()).at(-1).args[0].details.length,10);
  assert.equal((await calls()).at(-1).name,'saveHomeworkResult');
  results.push('copy: all accent keys visible at 390px, ten Unicode words completed, homework details retained');

  await open('complement-dix');
  await page.getByRole('button',{name:'Démarrer !'}).click();
  for(let i=0;i<20;i++) {
   const text=await page.locator('p').filter({hasText:/^\d+ \+ \? = 10$/}).innerText();
   await page.getByRole('button',{name:String(10-Number(text.split(' ')[0])),exact:true}).click();
   await page.clock.runFor(450);
  }
  assert.equal((await calls()).at(-1).args[0].metadata.unit,'percent');
  assert.equal((await calls()).at(-1).args[0].score,100);
  results.push('complements: twenty touch-only answers without timer, 100 percent');
  await page.getByRole('button',{name:'Changer le mode'}).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:'Démarrer !'}).click();
  const complement = await page.locator('p').filter({hasText:/^\d+ \+ \? = 10$/}).innerText();
  await page.getByRole('button',{name:String(10-Number(complement.split(' ')[0])),exact:true}).click();
  await page.clock.runFor(5000);
  await page.getByRole('button',{name:'Terminer la séance'}).click();
  const timedComplement = (await calls()).at(-1).args[0];
  assert.equal(timedComplement.metadata.unit,'count');
  assert.ok(timedComplement.metadata.durationSeconds >= 5 && timedComplement.metadata.durationSeconds < 10);
  results.push('complements: early timed exit records actual duration, not sixty seconds');

  await open('soustraction-mentale');
  await page.getByRole('button',{name:/Niveau A/}).click();
  for(let i=0;i<20;i++) {
   const text=await page.locator('div').filter({hasText:/^\d+ - \d+$/}).last().innerText();
   const [a,b]=text.split('-').map(Number);
   await page.getByRole('textbox',{name:'Résultat de la soustraction'}).fill(String(a-b));
   await page.clock.runFor(600);
  }
  assert.equal((await calls()).at(-1).args[0].score,100);
  assert.equal((await calls()).at(-1).args[0].numberLevelSettings.level,'A');
  await page.getByRole('button',{name:'Rejouer ce niveau'}).click();
  assert.equal(await page.getByRole('textbox').isDisabled(),false);
  results.push('subtraction: twenty untimed answers, actual A saved, clean replay');

  await open('place-value-table','B');
  await page.getByRole('textbox').first().waitFor();
  assert.ok(await page.getByRole('textbox').evaluateAll(inputs=>inputs.every(e=>{const r=e.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth})));
  await page.screenshot({path:'docs/audits/assets/fixes/numeration-mobile.png',fullPage:true});
  results.push('place value B: all four entry columns visible on 390px');

  await open('calendar','A');
  await page.getByRole('grid').first().waitFor();
  const weekdayChoices = page.getByRole('button', { name: /^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)$/i });
  assert.ok((await weekdayChoices.count()) >= 3, 'calendar A must offer at least three weekday choices');
  assert.ok(await weekdayChoices.evaluateAll(buttons => buttons.every(button => {
    const rect = button.getBoundingClientRect();
    let parent = button.parentElement;
    while (parent) {
      const style = getComputedStyle(parent);
      const parentRect = parent.getBoundingClientRect();
      if (['hidden', 'clip'].includes(style.overflowX) && (rect.left < parentRect.left - 1 || rect.right > parentRect.right + 1)) {
        return false;
      }
      parent = parent.parentElement;
    }
    return rect.left >= 0 && rect.right <= innerWidth;
  })), 'calendar weekday choices must not be clipped on 390px');
  results.push('calendar A: calendar support and all weekday choices visible on 390px');
  await open('fluence');
  await page.getByRole('button',{name:'Niveau B',exact:true}).click();
  await page.getByRole('button',{name:'Sons simples',exact:true}).click();
  await page.getByRole('button',{name:/^Texte 1\s/}).first().click();
  await page.getByRole('button',{name:/Démarrer/}).click();
  await page.clock.runFor(60000);
  await page.getByRole('button',{name:'Stop',exact:true}).click();
  await page.getByRole('button',{name:'Calculer',exact:true}).click();
  assert.equal((await calls()).length,0,'stopping reading must not save before adult correction');
  await page.getByLabel('Mots réellement lus (numéro du dernier mot)').fill('20');
  await page.getByLabel('Erreurs',{exact:true}).fill('5');
  await page.getByRole('button',{name:'Valider le résultat final (adulte)'}).click();
  const fluence = (await calls()).at(-1).args[0];
  assert.equal(fluence.score,15);
  assert.equal(fluence.metadata.wordsRead,20);
  assert.equal(fluence.metadata.errors,5);
  assert.equal(fluence.readingRaceSettings.level,'Niveau B');
  assert.equal(await page.getByLabel('Erreurs',{exact:true}).isDisabled(),true);
  results.push('fluence: no premature save, partial text and final five errors produce 15 MCLM in sixty seconds');
  fs.writeFileSync('docs/audits/fixes-browser.json',JSON.stringify({results,geometry},null,2)+'\n');
  console.log(JSON.stringify(results,null,2));
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
