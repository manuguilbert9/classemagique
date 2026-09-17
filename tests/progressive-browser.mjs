// Run against a local Next server; requires Playwright installed in the environment.
// BASE_URL=http://localhost:9003 PLAYWRIGHT_MODULE=/path/to/playwright node --experimental-strip-types tests/progressive-browser.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { PROGRESSIVE_EXERCISES } from '../src/lib/progressive-exercises.ts';
import * as early from '../src/lib/progressive/early-data.ts';
import * as french from '../src/lib/progressive/french-data.ts';
import * as math from '../src/lib/progressive/math-data.ts';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://localhost:9003';
const output = '.next/progressive-qa';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
page.setDefaultTimeout(15000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const click = name => page.getByRole('button', { name, exact: true }).click();
const fill = (label, value) => page.getByLabel(label, { exact: true }).fill(String(value));
const validate = () => click('Vérifier');
let completed = 0;
try {
  for (const exercise of PROGRESSIVE_EXERCISES.filter((e, i) => (!process.env.EXERCISE_SLUG || e.slug === process.env.EXERCISE_SLUG) && (!process.env.EXERCISE_FROM_SLUG || i >= PROGRESSIVE_EXERCISES.findIndex(x => x.slug === process.env.EXERCISE_FROM_SLUG)))) {
    console.log(`Testing ${exercise.slug}`);
    await page.goto(`${base}/exercise/${exercise.slug}`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: exercise.name, exact: true }).waitFor();
    for (let round = 0; round < 4; round++) {
      const slug = exercise.slug;
      await page.getByText(`Question ${round + 1} sur 4`, { exact: true }).waitFor();
      if (round === 0) {
        await page.locator('main section[aria-busy="false"]').waitFor();
        await page.setViewportSize({ width: 390, height: 844 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${slug}: mobile overflow`);
        await page.screenshot({ path: `${output}/${slug}-mobile.png`, fullPage: true });
        await page.setViewportSize({ width: 1200, height: 1000 });
      }
      if (slug === 'objet-utile') await click(early.usefulObject(round).expected);
      else if (slug === 'deux-actions') {
        const pair = early.actionPair(round);
        if (round === 0) {
          await click(pair[1]);
          await page.locator('main').getByRole('alert').waitFor();
          assert.equal(await page.getByRole('button', { name: 'Continuer', exact: true }).count(), 0);
        }
        await click(pair[0]); await click(pair[1]);
      } else if (slug === 'donne-a-chacun') {
        if (round === 0) { await click('Lapin 1'); assert.equal(await page.locator('main').getByRole('alert').count(), 0, 'navigation guidance does not count as a learning error'); }
        for (let n = 1; n <= early.pairingCount(round); n++) {
          await click(`Fleur ${n}`); await click(`Lapin ${n}`);
          assert.equal(await page.locator('main').getByRole('alert').count(), 0, 'a valid pair clears the retry message');
        }
        await click('J’ai terminé');
      } else if (slug === 'comparer-collections') {
        await click({ gauche: 'À gauche', droite: 'À droite', autant: 'Autant' }[early.compareCollections(round).expected]);
        await click('J’ai compris');
      } else if (slug === 'mot-correct') await click(early.wordChoice(round).expected);
      else if (slug === 'phrase-image') await click(early.sceneChoice(round).expected);
      else if (slug === 'commande-incomplete') { await click(String(early.flowerOrder(round).expected)); await click('Vérifier la commande'); }
      else if (slug === 'suite-train') { const q = early.trainSequence(round); await click(String(q.values[q.gap])); }
      else if (slug === 'detective-phrase') {
        const q = french.detectives[round]; await click(q.sentences[q.evidence]); await click(q.truth ? 'prouve l’affirmation' : 'contredit l’affirmation');
      } else if (slug === 'reparer-message') {
        const words = french.messages[round].split(' ');
        await page.getByRole('button', { name: words[0], exact: true }).first().click(); await click('Outil point'); await page.getByRole('button', { name: words.at(-1), exact: true }).last().click(); await click('Vérifier la phrase'); await click('J’ai lu la phrase');
      } else if (slug === 'accord-reparer') {
        for (const word of french.agreements[round].words) if (word.initial !== word.correct) { await click(word.initial); await click(word.correct); }
        await click('Vérifier l’accord'); await click('J’ai compris l’accord');
      } else if (slug === 'referent-pronom') {
        const q = french.pronouns[round]; await page.getByRole('button', { name: q.answer, exact: true }).first().click(); await click('J’ai trouvé le référent');
      } else if (slug === 'preuves-texte') {
        const q = french.proofs[round]; await click(q.answer); for (const index of q.evidenceOptions[0]) await click(q.sentences[index]); await click('Vérifier mes preuves');
        await page.locator('textarea').fill('Je retrouve cet indice dans le texte.'); await click('Terminer ma réponse');
      } else if (slug === 'chronologie-coherente') {
        const q = french.chronologies[round];
        await click(`Monter : ${q.events[0]}`); await click(`Monter : ${q.events[1]}`); await click(`Monter : ${q.events[1]}`);
        await click('Vérifier l’ordre'); await click(q.events[q.cause]); await click(q.link);
        await page.locator('textarea').fill('Le premier événement déclenche le suivant.'); await click('Terminer ma réponse');
      } else if (slug === 'voisins-nombre') {
        const n = math.neighbors[round];
        if (round === 0) { await fill('Juste avant', n); await fill('Juste après', n + 1); await validate(); await page.locator('main').getByRole('alert').waitFor(); }
        await fill('Juste avant', n - 1); await fill('Juste après', n + 1); await validate();
      } else if (slug === 'choisir-operation') {
        const q = math.operations[round];
        assert.equal(await page.getByLabel('Nombre de fleurs maintenant', { exact: true }).count(), 0);
        await click(q.sign === '+' ? 'Addition' : 'Soustraction'); await fill('Nombre de fleurs maintenant', q.result); await validate();
      } else if (slug === 'calcul-raisonnable') {
        const q = math.estimates[round];
        assert.equal(await page.getByLabel('Résultat exact', { exact: true }).count(), 0);
        await click(`≈ ${q.estimate}`); await click(round % 2 === 0 ? 'Non, c’est trop éloigné' : 'Oui, c’est plausible'); await fill('Résultat exact', q.result); await validate();
        assert.equal(await page.getByLabel('Résultat exact', { exact: true }).isDisabled(), true, 'accepted calculation cannot be edited or submitted again');
        await click('J’ai vérifié mon résultat');
      } else if (slug === 'mesure-vrai-faux') {
        const q = math.measures[round]; const verdict = q.claim === q.end - q.start ? 'Vrai' : 'Faux'; await click(verdict);
        for (let i = 0; i < q.start; i++) await click('Déplacer la règle à droite');
        await click('Le zéro est au début'); await fill('Longueur en cm', q.end-q.start); await click('Vérifier la longueur'); await click(verdict);
      } else if (slug === 'erreur-soustraction') {
        const q = math.subtractions[round], cells = math.borrowingCells(q), errorCell = cells.find(c => c.shown !== c.correct);
        if (round === 0) { const goodCell = cells.find(c => c.shown === c.correct); await click(`${goodCell.label} : ${goodCell.shown}`); await page.locator('main').getByRole('alert').waitFor(); }
        await click(`${errorCell.label} : ${errorCell.shown}`);
        await fill(`Corriger : ${errorCell.label}`, errorCell.correct); await click('Vérifier la correction'); await click('J’ai corrigé l’emprunt');
      } else if (slug === 'point-milieu') {
        const q = math.midpoints[round], p = q.points.find(p => p.position === q.length / 2);
        await click(`Point ${p.name}, à ${p.position} ${q.unit} de A`); await fill(`A${p.name} en ${q.unit}`, q.length / 2); await fill(`${p.name}B en ${q.unit}`, q.length / 2); await validate(); await click('J’ai vérifié les deux parties');
      }
      await click(round === 3 ? 'Voir mon bilan' : 'Continuer');
      completed++;
    }
    await page.getByRole('heading', { name: 'Exercice terminé !' }).waitFor();
    const correct = ['deux-actions', 'voisins-nombre', 'erreur-soustraction'].includes(exercise.slug) ? 3 : 4;
    assert.match(await page.locator('body').innerText(), new RegExp(`${correct} du premier coup sur 4`));
    await click('Recommencer');
    await page.getByText('Question 1 sur 4', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Continuer', exact: true }).count(), 0, 'restart clears feedback');
    assert.equal(await page.locator('main').getByRole('alert').count(), 0, 'restart clears mistakes');
  }
  // Homework navigation works without sending any actual student data.
  await page.goto(`${base}/exercise/mot-correct?from=devoirs&date=2026-09-16`);
  for (let r = 0; r < 4; r++) { await click(early.wordChoice(r).expected); await click(r === 3 ? 'Voir mon bilan' : 'Continuer'); }
  assert.equal(await page.getByRole('button', { name: 'Recommencer', exact: true }).count(), 0);
  assert.equal(await page.getByRole('link', { name: 'Retour aux devoirs', exact: true }).getAttribute('href'), '/devoirs');
  assert.deepEqual(errors, [], 'no browser runtime exceptions');
  console.log(`PASS: ${completed} rounds, ${completed / 4} restarts, mobile layouts, retry scoring, homework navigation.`);
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png`, fullPage: true });
  console.error(`FAIL after ${completed} rounds at ${page.url()}`, error);
  throw error;
} finally { await browser.close(); }
