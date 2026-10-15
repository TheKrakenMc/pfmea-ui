import {describe,it,expect} from 'vitest';
import reference from '../../tests/fixtures/python-action-priority.json';
import {calculateActionPriority} from '../utils/apCalculator';
import {draftKey,saveDraft,loadDraft,discardDraft} from './drafts';
import {CorporateApgLayoutStrategy} from './pdf/CorporateApgLayoutStrategy';
import {generatePfmeaPdf} from './pfmeaPdfGenerator';
import type {CorporateApgPdfData,PfmeaPdfData} from '../types/pfmeaExport.types';

describe('cross-layer regression contracts',()=>{
 it('matches Python reference for every S/O/D combination',()=>{
  const table:Record<string,string>=reference;
  for(let s=1;s<=10;s++)for(let o=1;o<=10;o++)for(let d=1;d<=10;d++)expect(calculateActionPriority(s,o,d)).toBe(table[[s,o,d].join(',')]);
  expect(calculateActionPriority(0,1,1)).toBeUndefined();expect(calculateActionPriority(1.5,2,3)).toBeUndefined();expect(calculateActionPriority(9,1,undefined)).toBeUndefined();
 });
 it('separates drafts by actor,plant,document and preserves expected revision',()=>{
  const key=draftKey('1',1,'pfmea',1);saveDraft(key,7,{rows:[{id:1}]});
  expect(loadDraft(key)?.expectedVersion).toBe(7);
  expect(loadDraft(draftKey('2',1,'pfmea',1))).toBeNull();
  expect(loadDraft(draftKey('1',2,'pfmea',1))).toBeNull();
  discardDraft(key);expect(loadDraft(key)).toBeNull();localStorage.setItem(key,'{invalid');expect(loadDraft(key)).toBeNull();
 });
 it('exports both PDF layouts with the upgraded exporter',async()=>{
  const corporate:CorporateApgPdfData={header:{item:'QA',processResponsibility:'Quality',pfmeaNumber:'QA-01',modelYear:'2026',keyDate:'2026-10-14',preparedBy:'Auditor',customerPartNumber:'QA',supplierPartNumber:'QA',coreTeam:'Quality',fmeaDateOrig:'2026-10-14',fmeaDateRev:'2026-10-14',specialDocumentControl:'0'},rows:[],formCode:'QA'};
  const standard:PfmeaPdfData={header:{pfmeaNumber:'QA-01',partNumber:'QA',description:'Synthetic QA',project:'QA',customer:'Synthetic customer',team:'Quality',responsible:'Auditor',stage:'production',manufacturing:'QA',preparedBy:'Auditor',originalDate:'2026-10-14',revisionDate:'2026-10-14',revision:'1'},rows:[],footerRevision:'1',printDate:'2026-10-14',revisionDate:'2026-10-14'};
  for(const pdf of [await new CorporateApgLayoutStrategy().generate(corporate),await generatePfmeaPdf(standard,key=>key)]){expect(pdf.type).toBe('application/pdf');expect(pdf.size).toBeGreaterThan(1000);}
 });
});
