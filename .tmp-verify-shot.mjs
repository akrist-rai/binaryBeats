import { chromium } from 'playwright';

const OUT = '/tmp/claude-1000/-media-akrist-a977b748-a3f2-4a42-840d-af56f85287d9-binary-beats/a895c6a2-90d2-4908-935d-b596798ece63/scratchpad';

const browser = await chromium.launch({ channel: 'chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

const errors = [];
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));

await page.goto('http://localhost:5173/login.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/login.png`, fullPage: true });

await page.click('#tabSignUp');
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/login-signup.png`, fullPage: true });

console.log('LOGIN_ERRORS:', JSON.stringify(errors));

const page2 = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
const errors2 = [];
page2.on('console', (msg) => { if (msg.type() === 'error') errors2.push(msg.text()); });
page2.on('pageerror', (err) => errors2.push('pageerror: ' + err.message));
await page2.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page2.waitForTimeout(1000);
await page2.screenshot({ path: `${OUT}/app-shell.png`, fullPage: true });
console.log('APP_URL_AFTER:', page2.url());
console.log('APP_ERRORS:', JSON.stringify(errors2));

await browser.close();
