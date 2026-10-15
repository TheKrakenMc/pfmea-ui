import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import path from 'node:path';
import {existsSync} from 'node:fs';
const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const output=path.resolve('audit-artifacts/pdf');await fs.mkdir(output,{recursive:true});
const browser=await puppeteer.launch({executablePath,headless:true,defaultViewport:{width:1440,height:1000}});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('status of 401'))errors.push(m.text());});
const cdp=await page.createCDPSession();await cdp.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:output});
const report=[];
async function download(label,action){const before=new Set(await fs.readdir(output));await action();for(let attempt=0;attempt<100;attempt++){await new Promise(resolve=>setTimeout(resolve,200));const name=(await fs.readdir(output)).find(n=>n.endsWith('.pdf')&&!before.has(n));if(name){await fs.copyFile(path.join(output,name),path.join(output,label+'.pdf'));const bytes=await fs.readFile(path.join(output,label+'.pdf'));if(!bytes.subarray(0,5).equals(Buffer.from('%PDF-')))throw new Error('Invalid PDF header');report.push({file:label+'.pdf',bytes:bytes.length});return;}}throw new Error('PDF export timed out: '+label);}
try{
 await page.goto('http://localhost:5174/login',{waitUntil:'networkidle0'});await page.waitForSelector('input[type=email]');await page.type('input[type=email]','audit@example.com');await page.type('input[type=password]','AuditPassword123!');await Promise.all([page.waitForNavigation({waitUntil:'networkidle0'}),page.click('button[type=submit]')]);
 for(const [id,layout,label] of [[1,'AIAG','pfmea-apg-100'],[1,'AIAG & VDA','pfmea-vda-100'],[3,'AIAG','pfmea-apg-1000']]){
  await page.goto('http://localhost:5174/pfmea/'+id,{waitUntil:'networkidle0'});await page.evaluate(layout=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===layout);if(!button)throw new Error('Layout switch missing');button.click();},layout);
  await download(label,()=>page.evaluate(()=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Exportar PFMEA');if(!button)throw new Error('PFMEA export missing');button.click();}));
 }
 await page.goto('http://localhost:5174/control-plans',{waitUntil:'networkidle0'});await page.evaluate(()=>[...document.querySelectorAll('h3')].find(h=>h.textContent.includes('Synthetic end-to-end control plan')).click());await page.waitForSelector('form');
 await download('control-plan-approved',()=>page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Exportar plan guardado').click()));
 await fs.writeFile(path.join(output,'report.json'),JSON.stringify({exports:report,errors},null,2));console.log(JSON.stringify({exports:report,errors},null,2));if(errors.length)process.exitCode=1;
}catch(error){console.error(JSON.stringify({error:error.message,errors},null,2));process.exitCode=1;}finally{await browser.close();}
