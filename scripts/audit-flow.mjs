import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser=await puppeteer.launch({executablePath,headless:true,defaultViewport:{width:1440,height:1000}});
const page=await browser.newPage();const failures=[];const network=[];page.on('response',async response=>{if(response.url().includes('/api/v1/')&&response.status()>=400){network.push({url:response.url(),status:response.status(),body:await response.text()});}});page.on('pageerror',e=>failures.push(e.message));
await fs.mkdir('audit-artifacts/flow',{recursive:true});
try{
 await page.goto('http://localhost:5174/login',{waitUntil:'networkidle0'});
 await page.waitForSelector('input[type=email]');await page.type('input[type=email]','audit@example.com');await page.type('input[type=password]','AuditPassword123!');
 await Promise.all([page.waitForNavigation({waitUntil:'networkidle0'}),page.click('button[type=submit]')]);
 const result=await page.evaluate(async()=>{
  const {default:api}=await import('/src/api/axiosClient.ts');const suffix=Date.now();
  const product=(await api.post('/products/',{part_number:'E2E-'+suffix,description:'Synthetic end-to-end product',technology_ids:[1]})).data;
  const diagram=(await api.post('/flowcharts/',{product_id:product.id,title:'Synthetic end-to-end process',status:'Draft',steps:[{step_number:10,sub_step:0,technology_id:1,product_characteristics:'Dimension',process_characteristics:'Inspection',target:'10 ± 1 mm'}]})).data;
  await api.put('/flowcharts/'+diagram.id+'/save',{expected_version:1,header:{status:'In Review'},steps:diagram.steps});
  await api.put('/flowcharts/'+diagram.id+'/save',{expected_version:2,header:{status:'Approved'},steps:diagram.steps});
  const project=(await api.post('/pfmea-project/',{flowchart_id:diagram.id,project_name:'Synthetic end-to-end PFMEA',customer:'Synthetic customer'})).data;
  const saved=(await api.put('/pfmea-project/'+project.id+'/save',{expected_version:1,rows:[{flowchart_step_id:diagram.steps[0].id,station_operation:'10 Inspection',failure_mode:'Dimension outside range',severity:9,occurrence:1,detection:7,product_characteristic:'Dimension',actions_taken:'QA-001: sensor installed and validated',responsible_person_id:1,completion_date:new Date().toISOString().slice(0,10),new_severity:9,new_occurrence:1,new_detection:7}]})).data;
  const row=saved.worksheet_rows[0];await api.post('/pfmea-project/'+project.id+'/worksheet/'+row.id+'/confirm-action',{}, {headers:{'If-Match':'2'}});
  await api.patch('/pfmea-project/'+project.id+'/status',{new_status:'In Review'},{headers:{'If-Match':'3'}});
  const approved=(await api.patch('/pfmea-project/'+project.id+'/status',{new_status:'Approved'},{headers:{'If-Match':'4'}})).data;
  const plan=(await api.post('/control-plans/project/'+project.id,{title:'Synthetic end-to-end control plan'},{headers:{'If-Match':'5'}})).data;
  if(plan.items.length!==1 || plan.items[0].pfmea_worksheet_row_id!==row.id)throw new Error('Control-plan source identity mismatch');
  await api.put('/control-plans/items/'+plan.items[0].id,{characteristic:'Dimension',classification:'CC',specification:'10 ± 1 mm',measurement_method:'Caliper',sample_size:5,sample_frequency:'Hourly',responsible_person_id:1,reaction_plan:'Stop and segregate affected material'},{headers:{'If-Match':'1'}});
  await api.patch('/control-plans/'+plan.id+'/status',{new_status:'In Review'},{headers:{'If-Match':'2'}});
  const released=(await api.patch('/control-plans/'+plan.id+'/status',{new_status:'Approved'},{headers:{'If-Match':'3'}})).data;
  const versions=(await api.get('/document-versions/control_plan/'+plan.id)).data;
  if(!versions.some(v=>v.snapshot_data.status==='Approved'))throw new Error('Approved control-plan snapshot missing');
  return {product:product.id,diagram:diagram.id,pfmea:project.id,plan:plan.id,pfmeaStatus:approved.moc_status,planStatus:released.status,sourceRow:row.id,ownerValidated:true,residualSeverity:9};
 });
 await page.goto('http://localhost:5174/pfmea/'+result.pfmea,{waitUntil:'networkidle0'});await page.screenshot({path:'audit-artifacts/flow/approved-pfmea.png',fullPage:true});
 await page.goto('http://localhost:5174/control-plans',{waitUntil:'networkidle0'});
 await page.evaluate(()=>{const title=[...document.querySelectorAll('h3')].find(node=>node.textContent.includes('Synthetic end-to-end control plan'));if(!title)throw new Error('Plan card not rendered');title.click();});
 await page.waitForSelector('form');await page.screenshot({path:'audit-artifacts/flow/approved-control-plan.png',fullPage:true});
 await fs.writeFile('audit-artifacts/flow/report.json',JSON.stringify({result,failures},null,2));console.log(JSON.stringify({result,failures},null,2));if(failures.length)process.exitCode=1;
}catch(error){await page.screenshot({path:'audit-artifacts/flow/failure.png'});console.error(JSON.stringify({error:error.message,network},null,2));process.exitCode=1;}finally{await browser.close();}
