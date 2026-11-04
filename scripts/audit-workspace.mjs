import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const base = process.env.WORKSPACE_AUDIT_URL || 'http://localhost:5181';
const out = '.impeccable/review/workspace';
await fs.mkdir(out, { recursive: true });
const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();
const errors = [], checks = [];
let role = 'Administrator', failProducts = false, productDelay = 0;
const products = Array.from({ length: 205 }, (_, i) => ({ id: i + 1, part_number: `APG-${String(i + 1).padStart(4, '0')}`, customer_part_number: `C-${10240 + i}`, description: ['Aislante acústico de tablero · Plataforma SUV', 'Conjunto de piso termoformado', 'Revestimiento de paso de rueda'][i % 3], customer: { id: i % 2 + 1, company_name: i % 2 ? 'Volkswagen' : 'Audi', customer_code: 'OEM' }, status: i % 3 ? 'Draft' : 'Released', version: 2, dimensions: '840 × 620 mm', weight: 1.4, cycle_time: 45, rate_per_hour: 80, technologies: [{ id: 1, name: 'Termoformado' }, { id: 2, name: 'Troquelado' }], parameters: [], created_at: '2026-10-20T12:00:00Z', updated_at: '2026-10-27T16:35:00Z' }));
const flowcharts = Array.from({ length: 15 }, (_, i) => ({ id: i + 1, title: ['Insonorizante de tablero · Ensamble', 'Aislante de piso · Termoformado', 'Paso de rueda · Troquelado'][i % 3], type: 'Process Flow Diagram', status: i === 14 ? 'Archived' : i % 3 ? 'Draft' : 'Approved', version: 3, product: { part_number: products[i].part_number, customer_name: products[i].customer.company_name }, created_at: products[i].created_at, updated_at: products[i].updated_at }));
const pfmeas = flowcharts.map((item, i) => ({ ...item, project_name: item.title, customer: products[i].customer.company_name, part_number: products[i].part_number, moc_status: item.status }));
page.on('pageerror', error => errors.push(error.message));
await page.setRequestInterception(true);
page.on('request', async request => {
  const url = new URL(request.url());
  const path = url.pathname;
  if (!['xhr', 'fetch'].includes(request.resourceType()) && request.method() !== 'OPTIONS') return request.continue();
  let body = [], status = 200;
  const headers = { 'access-control-allow-origin': base, 'access-control-allow-credentials': 'true', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type, accept-language, x-csrf-token, x-plant-id' };
  if (path.endsWith('/auth/me')) body = { id: '1', full_name: 'María Hernández', email: 'fixture@example.com', department: 'Ingeniería de procesos', role_name: role, plant_id: 1, plant_ids: [1, 2], csrf_token: 'fixture', is_active: true, is_verified: true, must_change_password: false };
  else if (path.endsWith('/plants')) body = [{ id: 1, name: 'Puebla', is_active: true }, { id: 2, name: 'Querétaro', is_active: true }];
  else if (/\/products\/?$/.test(path)) {
    if (productDelay) await new Promise(resolve => setTimeout(resolve, productDelay));
    if (failProducts) { status = 500; body = { detail: 'Fixture failure' }; }
    else body = products.filter(item => !url.searchParams.get('q') || `${item.part_number} ${item.description} ${item.customer.company_name}`.toLowerCase().includes(url.searchParams.get('q').toLowerCase()));
  } else if (/\/flowcharts\/?$/.test(path)) body = flowcharts;
  else if (/\/pfmea-project\/?$/.test(path)) body = pfmeas;
  if (Array.isArray(body) && url.searchParams.has('skip')) {
    const skip = Number(url.searchParams.get('skip')); body = body.slice(skip, skip + Number(url.searchParams.get('limit') || 50));
  }
  await request.respond({ status, contentType: 'application/json', headers, body: JSON.stringify(body) });
});
await page.evaluateOnNewDocument(() => { localStorage.setItem('theme', 'light'); localStorage.setItem('i18nextLng', 'es'); });
async function go(route) {
  await page.goto(base + route, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.workspace-page h1');
  await page.waitForFunction(() => !document.querySelector('[aria-busy=true]'));
}
async function screenshot(name) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))));
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}: page overflow`);
  const clipping = await page.evaluate(() => [...document.querySelectorAll('.workspace-page, .app-header-inner')].some(el => el.scrollWidth > el.clientWidth + 1));
  assert.equal(clipping, false, `${name}: container overflow`);
  checks.push(name);
}
try {
  for (const width of [1440, 768, 390]) {
    await page.setViewport({ width, height: width === 390 ? 844 : 1000 });
    for (const route of ['/products', '/flowcharts', '/pfmea']) {
      await go(route); await screenshot(`${route.slice(1)}-${width}`);
    }
  }
  await page.setViewport({ width: 768, height: 1000 });
  await go('/products');
  assert.match(await page.$eval('.workspace-results', el => el.textContent), /205/);
  await page.click('[aria-label="Página siguiente"]');
  assert.match(await page.$eval('.workspace-pages', el => el.textContent), /2 de/);
  await page.select('.workspace-page-size select', '24');
  assert.match(await page.$eval('.workspace-pages', el => el.textContent), /1 de/);
  await page.type('.workspace-search input', 'no-match-fixture');
  await page.waitForSelector('.workspace-empty');
  await screenshot('products-empty-768');
  await page.click('.workspace-empty button');
  await page.waitForSelector('.document-card');
  await page.click('.workspace-view button:last-child');
  await page.waitForSelector('.workspace-table');
  await screenshot('products-table-768');
  await go('/flowcharts');
  assert.ok(await page.$('.workspace-table'), 'view preference should carry between catalogs');
  assert.match(await page.$eval('.workspace-results', el => el.textContent), /14/);
  await page.click('.workspace-archive input');
  assert.match(await page.$eval('.workspace-results', el => el.textContent), /15/);
  await page.click('.workspace-filters .ui-disclosure:nth-child(2) button');
  await page.waitForSelector('.workspace-filter-options');
  await page.keyboard.press('Escape');
  assert.equal(await page.$('.workspace-filter-options'), null);
  await page.click('.app-menu-toggle');
  await page.waitForSelector('dialog[open]');
  await screenshot('drawer-768');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog[open]'));
  assert.equal(await page.$eval('.app-menu-toggle', el => el === document.activeElement), true, 'drawer restores focus');
  await page.click('.app-account > button');
  await page.click('.app-account .ui-popover button:first-of-type');
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), true);
  await page.keyboard.press('Escape');
  await screenshot('flowcharts-dark-768');
  await page.click('.app-account > button');
  await page.click('.app-account .ui-popover button:nth-of-type(2)');
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  await page.keyboard.press('Escape');
  assert.match(await page.$eval('.workspace-results', el => el.textContent), /results/);
  await screenshot('flowcharts-en-dark-768');
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  assert.equal(await page.$eval('.workspace-content', el => getComputedStyle(el).animationName), 'none');
  await page.emulateMediaFeatures([]);
  failProducts = true;
  await go('/products');
  assert.ok(await page.$('.workspace-empty[role=alert]'));
  await screenshot('products-error-768');
  failProducts = false;
  await page.click('.workspace-empty button');
  await page.waitForSelector('.workspace-table');
  role = 'Viewer';
  for (const route of ['/products', '/flowcharts', '/pfmea']) {
    await go(route);
    assert.equal(await page.$('.workspace-primary'), null, 'viewer cannot create');
    assert.equal(await page.$('button[aria-label^="Archivar:"]'), null, 'viewer cannot archive');
  }
  checks.push('205-record pagination, page size reset, empty/reset, persisted view, archived table, Escape/focus, theme/language, reduced motion, retry, viewer permissions');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: true, checks, errors }, null, 2));
  await fs.writeFile(`${out}/audit.json`, JSON.stringify({ passed: true, checks, errors }, null, 2));
} catch (error) {
  console.error(error); console.error(errors); process.exitCode = 1;
  await page.screenshot({ path: `${out}/failure.png`, fullPage: true }).catch(() => {});
} finally { await browser.close(); }
