import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
if(!executablePath)throw new Error('Chrome/Edge unavailable');
const directory='audit-artifacts/ui';await fs.mkdir(directory,{recursive:true});
const browser=await puppeteer.launch({executablePath,headless:true,defaultViewport:{width:1440,height:1000}});
const page=await browser.newPage();const errors=[];const requests=[];const results=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('status of 401'))errors.push(message.text());});
page.on('response',response=>{if(response.url().includes('/api/v1/')&&response.status()>=400)requests.push({url:response.url(),status:response.status()});});
try{
 await page.goto('http://localhost:5174/login',{waitUntil:'networkidle0'});
 await page.screenshot({path:directory+'/login.png'});
 await page.waitForSelector('input[type=email]',{timeout:10000});
 await page.type('input[type=email]','audit@example.com');await page.type('input[type=password]','AuditPassword123!');
 await Promise.all([page.waitForNavigation({waitUntil:'networkidle0'}),page.click('button[type=submit]')]);
 if(page.url().includes('/login'))throw new Error('Password login did not navigate');
 results.push({flow:'password login',passed:true,url:page.url()});
 for(const route of ['/products/1','/flowcharts/1','/pfmea','/control-plans','/admin/users']){
  const begin=Date.now();await page.goto('http://localhost:5174'+route,{waitUntil:'networkidle0'});
  await page.screenshot({path:directory+'/'+route.replaceAll('/','_')+'.png',fullPage:true});
  results.push({route,ms:Date.now()-begin,title:await page.title(),text:(await page.evaluate(()=>document.body.innerText)).slice(-200)});
 }
 for(const [id,rows] of [[1,100],[2,500],[3,1000]]){
  const begin=Date.now();await page.goto('http://localhost:5174/pfmea/'+id,{waitUntil:'networkidle0'});
  results.push({route:'/pfmea/'+id,rows,collapsedMs:Date.now()-begin,domNodes:await page.evaluate(()=>document.querySelectorAll('*').length)});
  const expandBegin=Date.now();await page.click('[data-testid=operation-toggle]');await page.waitForFunction(()=>document.querySelectorAll('textarea').length>10);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));results.push({rows,expandedMs:Date.now()-expandBegin,expandedDomNodes:await page.evaluate(()=>document.querySelectorAll('*').length)});
  if(rows>100){await page.evaluate(()=>{const scroller=document.querySelector('[data-worksheet-scroll]');scroller.scrollTop=scroller.scrollHeight;});await page.waitForFunction(expected=>[...document.querySelectorAll('textarea')].some(t=>t.value.includes('rango '+expected)),{},rows);results.push({rows,lastRowReachable:true});await page.evaluate(()=>{document.querySelector('[data-worksheet-scroll]').scrollTop=0;});}
  await page.screenshot({path:directory+'/pfmea-'+rows+'.png'});
  if(rows===1000){await page.evaluate(()=>[...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='AIAG & VDA').click());await page.waitForFunction(()=>[...document.querySelectorAll('button[aria-pressed=true]')].some(button=>button.textContent.includes('AIAG & VDA')));await page.click('[data-testid=operation-toggle]');await page.waitForSelector('[data-worksheet-scroll].pr-8');const vdaStart=Date.now();await page.waitForFunction(()=>document.querySelectorAll('textarea').length>10);results.push({layout:'AIAG_VDA',rows,domNodes:await page.evaluate(()=>document.querySelectorAll('*').length),renderWaitMs:Date.now()-vdaStart});await page.evaluate(()=>{const scroller=document.querySelector('[data-worksheet-scroll]');scroller.scrollTop=scroller.scrollHeight;});await page.waitForFunction(()=>[...document.querySelectorAll('textarea')].some(t=>t.value.includes('rango 1000')));results.push({layout:'AIAG_VDA',lastRowReachable:true});await page.screenshot({path:directory+'/pfmea-vda-1000.png'});}
 }
 await fs.writeFile(directory+'/report.json',JSON.stringify({results,errors,requests},null,2));
 console.log(JSON.stringify({results,errors,requests},null,2));
 if(errors.length||requests.some(r=>![401,404].includes(r.status)))process.exitCode=1;
}catch(error){console.log(JSON.stringify({errors,requests,body:await page.evaluate(()=>document.body.innerText),error:error.message},null,2));await fs.writeFile(directory+'/failure.json',JSON.stringify({errors,requests,error:error.message},null,2));process.exitCode=1;}finally{await browser.close();}
