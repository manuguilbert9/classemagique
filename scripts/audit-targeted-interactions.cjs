// Uses only the isolated audit harness; never a deployed app or real persistence.
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({headless: true});
  const page = await browser.newPage({viewport: {width: 390, height: 844}});
  const results = {};
  await page.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
  try {
    await page.goto('http://127.0.0.1:9004/?slug=tables-multiplication&level=B');
    await page.getByRole('checkbox').uncheck();
    await page.getByRole('button', {name: 'Tout sélectionner', exact: true}).click();
    await page.getByRole('button', {name: "C'est parti !"}).click();
    await page.getByTitle('Terminer la session').click();
    await page.waitForTimeout(100);
    results.emptySession = await page.evaluate(() => ({calls: window.__auditCalls, hasNaN: JSON.stringify(window.__auditCalls, (_, v) => Number.isNaN(v) ? '__NaN__' : v).includes('__NaN__')}));
    await page.getByRole('button', {name: 'Rejouer', exact: true}).click();
    for (let i = 0; i < 20; i++) {
      const question = await page.locator('div.text-8xl').innerText();
      const [a, b] = question.split('x').map(Number);
      await page.getByRole('spinbutton').fill(String(a * b));
      await page.waitForTimeout(580);
    }
    await page.getByRole('button', {name: 'Rejouer', exact: true}).click();
    results.replayAfterTwenty = {inputDisabled: await page.getByRole('spinbutton').isDisabled(), value: await page.getByRole('spinbutton').inputValue()};
    fs.mkdirSync('docs/audits/assets', {recursive: true});
    await page.screenshot({path: 'docs/audits/assets/tables-rejouer.png', fullPage: true});
    await page.goto('http://127.0.0.1:9004/?slug=keyboard-copy&level=A');
    await page.getByRole('button', {name: 'Afficher le clavier'}).click();
    await page.screenshot({path: 'docs/audits/assets/clavier-mobile.png', fullPage: true});
    results.keyboard = await page.evaluate(() => ({viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, buttons: [...document.querySelectorAll('button')].filter(e => /^[A-Z]$/.test(e.textContent.trim())).map(e => {const r=e.getBoundingClientRect();return {text:e.textContent, left:r.left, right:r.right}})}));
    fs.writeFileSync('docs/audits/2026-09-16-interactions.json', JSON.stringify(results, null, 2) + '\n');
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(e => {console.error(e);process.exitCode=1});
