import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

let executablePath = '';
if (fs.existsSync(CHROME_PATH)) {
    executablePath = CHROME_PATH;
} else if (fs.existsSync(EDGE_PATH)) {
    executablePath = EDGE_PATH;
} else {
    console.error("No Chrome or Edge browser executable found.");
    process.exit(1);
}

const args = process.argv.slice(2);
const isHeadless = args.includes('--headless');
const isKeepAlive = args.includes('--open');

// Filter out flag arguments to get positional arguments
const positionalArgs = args.filter(arg => !arg.startsWith('--'));

const url = positionalArgs[0] || 'http://localhost:5173/';
const screenshotPath = positionalArgs[1] || null;

console.log(`Executable: ${executablePath}`);
console.log(`Headless mode: ${isHeadless}`);
console.log(`Target URL: ${url}`);
if (screenshotPath) console.log(`Screenshot file: ${screenshotPath}`);

(async () => {
    try {
        const browser = await puppeteer.launch({
            executablePath,
            headless: isHeadless,
            defaultViewport: { width: 1440, height: 900 },
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        const title = await page.title();
        console.log(`\n[SUCCESS] Page loaded successfully!`);
        console.log(`Title: "${title}"`);
        console.log(`URL: ${page.url()}`);

        if (screenshotPath) {
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`[SCREENSHOT] Saved screenshot to: ${screenshotPath}`);
        }

        if (isHeadless && !isKeepAlive) {
            await browser.close();
        } else {
            console.log("[INFO] Browser window launched for desktop interaction.");
        }
    } catch (err) {
        console.error("[ERROR] Browser operation failed:", err.message);
        process.exit(1);
    }
})();
