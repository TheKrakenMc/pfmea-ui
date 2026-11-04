import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';

// Isolated browser fixtures: no credentials or mutations reach the backend.
const base = process.env.ENTRY_AUDIT_URL || 'http://localhost:5181';
const out = '.impeccable/review';
await fs.mkdir(out, { recursive: true });
const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();
const errors = [];
const checks = [];
const welcomeOnly = process.argv.includes('--welcome-only');
let authenticated = welcomeOnly;
let failNext = false;
const user = { id: 'entry-design-fixture', full_name: 'Design review', email: 'design@example.com', role_name: 'Engineer', plant_id: 1, plant_ids: [1], csrf_token: 'fixture', is_active: true, is_verified: true, must_change_password: false };
page.on('pageerror', error => errors.push(error.message));
await page.setRequestInterception(true);
page.on('request', request => {
  const path = new URL(request.url()).pathname;
  if (!path.startsWith('/api/') && !/^\/(auth|plants)(\/|$)/.test(path)) return request.continue();
  let status = 200;
  let body = {};
  if (path.endsWith('/auth/me')) { status = authenticated ? 200 : 401; body = authenticated ? user : { detail: 'Not authenticated' }; }
  else if (path.endsWith('/auth/login')) {
    if (failNext) { status = 400; body = { detail: 'Credenciales incorrectas. Intenta de nuevo.' }; failNext = false; }
    else { authenticated = true; body = { user }; }
  } else if (path.endsWith('/plants')) body = [{ id: 1, name: 'Review plant', code: 'REVIEW', is_active: true }];
  return request.respond({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': base, 'access-control-allow-credentials': 'true', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type, accept-language, x-csrf-token, x-plant-id' }, body: JSON.stringify(body) });
});
await page.evaluateOnNewDocument(() => { localStorage.setItem('theme', 'light'); localStorage.setItem('i18nextLng', 'es'); });

async function capture(name, width, route) {
  await page.setViewport({ width, height: width === 390 ? 844 : 900 });
  await page.goto(base + route, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.entry-page h1');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false, `${name}: horizontal overflow`);
  assert.ok(await page.$('h1'), `${name}: heading missing`);
  checks.push({ capture: name, width, horizontalOverflow: overflow });
}

try {
  if (!welcomeOnly) {
  for (const width of [1440, 768, 390]) await capture(`login-${width}`, width, '/login');
  await page.type('#login-email', 'design@example.com');
  await page.type('#login-password', 'ReviewPassword123');
  await page.click('.password-input button');
  assert.equal(await page.$eval('#login-password', el => el.type), 'text');
  await page.click('.password-input button');
  failNext = true;
  await page.click('.entry-submit');
  await page.waitForSelector('[role=alert]');
  checks.push({ flow: 'password visibility and login error', passed: true });
  await page.click('.forgot-password');
  assert.equal(await page.$eval('#login-email', el => el.value), 'design@example.com');
  await page.click('.entry-submit');
  await page.waitForSelector('#reset-otp');
  await page.type('#reset-otp', '123456');
  await page.type('#login-password', 'NewPassword123');
  await page.screenshot({ path: `${out}/recovery-390.png`, fullPage: true });
  await page.click('.entry-submit');
  await page.waitForSelector('[role=status]');
  assert.ok(await page.$('#login-email'));
  assert.equal(await page.$eval('#login-password', el => el.value), '');
  checks.push({ flow: 'email recovery, OTP, password reset and confirmation', passed: true });
  await page.waitForFunction(() => !document.querySelector('[data-sonner-toast]'));
  await page.click('[aria-label="Switch to English"]');
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  assert.equal(await page.$eval('h1', el => el.textContent), 'Sign in');
  await page.click('[aria-label="Change theme"]');
  await page.screenshot({ path: `${out}/login-dark-en-390.png`, fullPage: true });
  await page.click('[aria-label="Change theme"]');
  await page.click('[aria-label="Cambiar a español"]');
  await page.waitForFunction(() => document.documentElement.lang === 'es');
  assert.equal(await page.$eval('#login-email', el => el.value), 'design@example.com');
  await page.type('#login-password', 'ReviewPassword123');
  await page.click('.entry-submit');
  await page.waitForSelector('.welcome-page');
  checks.push({ flow: 'language, theme and successful login', passed: true });
  }
  for (const width of [1440, 768, 390]) await capture(`welcome-${width}`, width, '/');
  const destinations = await page.$$eval('.workspace-modules a', nodes => nodes.map(node => node.getAttribute('href')));
  assert.deepEqual(destinations, ['/pfmea', '/flowcharts', '/products', '/auxiliaries/customers']);
  await page.mouse.move(0, 0);
  await page.evaluate(() => { document.querySelector('main').scrollTop = document.querySelector('main').scrollHeight; });
  await page.screenshot({ path: `${out}/welcome-bottom-390.png`, fullPage: true });
  await page.evaluate(() => { document.querySelector('main').scrollTop = 0; });
  await page.evaluate(() => { document.documentElement.classList.add('dark'); });
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 350)));
  await page.screenshot({ path: `${out}/welcome-dark-390.png`, fullPage: true });
  await page.setViewport({ width: 320, height: 740 });
  assert.ok(await page.$$eval('nav:first-of-type button', buttons => buttons.every(button => { const box = button.getBoundingClientRect(); return box.width === 0 || (box.left >= 0 && box.right <= innerWidth); })), 'Mobile navigation clipped');
  checks.push({ flow: 'all four existing module destinations', passed: true });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ checks, errors, backend: 'isolated browser fixtures' }, null, 2));
  await fs.writeFile(`${out}/${welcomeOnly ? 'welcome-audit' : 'entry-audit'}.json`, JSON.stringify({ checks, errors, backend: 'isolated browser fixtures' }, null, 2));
} catch (error) {
  console.log(JSON.stringify({ checks, errors, url: page.url(), body: await page.evaluate(() => document.body.innerText), failure: error.message }, null, 2));
  await page.screenshot({ path: `${out}/failure.png`, fullPage: true });
  throw error;
} finally { await browser.close(); }
