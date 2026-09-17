// Focused interaction regressions. Fresh browser context, no student profile or writes.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { proofs } from '../src/lib/progressive/french-data.ts';
import { midpoints } from '../src/lib/progressive/math-data.ts';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = process.env.BASE_URL || 'http://localhost:9005';
const click = name => page.getByRole('button', { name, exact: true }).click();
const fill = (name, value) => page.getByLabel(name, { exact: true }).fill(String(value));
const open = async slug => { await page.goto(`${base}/exercise/${slug}`); await page.locator('main section[aria-busy="false"]').waitFor(); };
await mkdir('.next/progressive-qa', { recursive: true });
try {
  await open('objet-utile'); await click('tasse');
  const explanation = page.getByRole('button', { name: /Écouter : La tasse contient/ });
  assert.equal(await explanation.isEnabled(), true, 'explanation audio remains available after the answer is locked');
  await explanation.focus(); await page.keyboard.press('Enter');

  await open('reparer-message');
  const firstWord = page.getByRole('group', { name: 'Phrase à réparer' }).getByRole('button').first();
  await firstWord.focus(); await page.keyboard.press('Enter');
  assert.equal(await firstWord.getAttribute('aria-pressed'), 'true');
  await page.keyboard.press('Enter');
  assert.equal(await firstWord.getAttribute('aria-pressed'), 'false', 'capital can be removed using the keyboard');

  await open('accord-reparer');
  assert.equal(await page.getByRole('button', { name: 'Les', exact: true }).isEnabled(), true, 'a correct word is not revealed by disabling it');

  await open('preuves-texte'); await click(proofs[0].answer);
  const text = page.getByRole('group', { name: 'Texte à lire' });
  await text.getByRole('button', { name: proofs[0].sentences[1], exact: true }).focus(); await page.keyboard.press('Enter');
  await click(proofs[0].sentences[2]); await click('Vérifier mes preuves');
  await page.getByRole('button', { name: 'Terminer ma réponse', exact: true }).waitFor();
  assert.equal(await text.locator('[aria-pressed="true"]').count(), 2, 'both relevant sentences remain highlighted');
  assert.equal(await page.locator('main').getByRole('alert').count(), 0);

  await open('erreur-soustraction'); await click('Unités du résultat : 7');
  await fill('Corriger : Unités du résultat', 9); await page.getByLabel('Corriger : Unités du résultat').press('Enter');
  await page.locator('main').getByRole('alert').waitFor();
  await fill('Corriger : Unités du résultat', 5); await page.getByLabel('Corriger : Unités du résultat').press('Enter');
  await page.getByRole('button', { name: 'J’ai corrigé l’emprunt', exact: true }).waitFor();
  assert.equal(await page.locator('main input').count(), 0, 'no redundant result copying');

  await open('mesure-vrai-faux'); await click('Vrai'); await click('Le zéro est au début');
  await fill('Longueur en cm', 7); await click('Vérifier la longueur'); await click('Vrai'); await click('Continuer');
  await click('Vrai'); // The next claim says 7 cm but the segment is 5 cm long.
  await click('Le zéro est au début'); await page.locator('main').getByRole('alert').waitFor();
  const right = page.getByRole('button', { name: 'Déplacer la règle à droite', exact: true });
  await right.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Enter');
  await click('Le zéro est au début'); await fill('Longueur en cm', 5); await click('Vérifier la longueur');
  assert.match(await page.locator('main').getByRole('alert').innerText(), /Ta mesure est correcte/);
  await click('Faux'); await page.getByRole('button', { name: 'Continuer', exact: true }).waitFor();

  await open('point-milieu');
  for (let r = 0; r < 4; r++) {
    const q = midpoints[r]; const p = q.points.find(x => x.position === q.length / 2);
    const controls = page.getByRole('group', { name: 'Segment AB : touche un point' }).getByRole('button');
    const boxes = await controls.evaluateAll(elements => elements.map(el => { const b = el.getBoundingClientRect(); return { left: b.left, top: b.top, right: b.right, bottom: b.bottom }; }));
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      assert.ok(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top, 'point hit targets must not overlap on mobile');
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    if (r === 3) await page.screenshot({ path: '.next/progressive-qa/milieu-50mm-mobile.png', fullPage: true });
    const target = page.getByRole('button', { name: `Point ${p.name}, à ${p.position} ${q.unit} de A`, exact: true });
    await target.focus(); await page.keyboard.press('Enter');
    await fill(`A${p.name} en ${q.unit}`, q.length / 2); await fill(`${p.name}B en ${q.unit}`, q.length / 2);
    await click('Vérifier'); await click('J’ai vérifié les deux parties');
    await click(r === 3 ? 'Voir mon bilan' : 'Continuer');
  }
  assert.deepEqual(errors, []);
  console.log('PASS: audio after completion, reversible keyboard editing, unbiased agreement controls, multiple evidence, borrowing retry, ruler correction feedback, all midpoint mobile targets.');
} finally { await browser.close(); }
