import type {ControlPlan} from '../api/controlPlanService';

export interface ControlPlanPdfLabels {plant:string;customer:string;part:string;responsible:Record<number,string>;units:Record<number,string>}
export async function generateControlPlanPdf(plan:ControlPlan,labels:ControlPlanPdfLabels):Promise<Blob>{
 const [{jsPDF},{autoTable}]=await Promise.all([import('jspdf'),import('jspdf-autotable')]);
 const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a3'});
 const width=doc.internal.pageSize.getWidth();const height=doc.internal.pageSize.getHeight();
 const text=(value:unknown)=>String(value??'').replace(/[‐-―]/g,'-');
 const header=()=>{doc.setTextColor(20,35,60);doc.setFont('helvetica','bold');doc.setFontSize(14);doc.text('PLAN DE CONTROL',10,12);doc.setFontSize(8);doc.setFont('helvetica','normal');doc.text(text(plan.title),10,19);doc.text(text(plan.control_plan_code)+' - Rev. '+plan.version+' - '+plan.status,10,25);doc.text(text(labels.plant)+' | '+text(labels.customer)+' | '+text(labels.part),10,31);if(plan.needs_review)doc.text('Fuente modificada: revision pendiente',width-10,31,{align:'right'});};
 header();
 autoTable(doc,{startY:37,margin:{top:37,right:10,bottom:14,left:10},styles:{font:'helvetica',fontSize:7,cellPadding:2,overflow:'linebreak',valign:'middle'},headStyles:{fillColor:[25,45,75],textColor:255},alternateRowStyles:{fillColor:[242,246,250]},head:[['Sec.','Fila PFMEA','Caracteristica','CC/SC','Especificacion','Unidad','Metodo de medicion','Muestra','Frecuencia','Responsable','Plan de reaccion','Procedencia']],body:plan.items.map(item=>[text(item.item_sequence),text(item.pfmea_worksheet_row_id||item.source_row_id||'Sin resolver'),text(item.characteristic),text(item.classification),text(item.specification),item.unit_id?text(labels.units[item.unit_id]||'#'+item.unit_id):'',text(item.measurement_method),text(item.sample_size),text(item.sample_frequency),item.responsible_person_id?text(labels.responsible[item.responsible_person_id]||'#'+item.responsible_person_id):'',text(item.reaction_plan),item.is_active===false?'Retirado':item.needs_review?'Revisar':item.source_reviewed?'Revisado':'Vinculo por ID']),didDrawPage:()=>header()});
 for(let page=1;page<=doc.getNumberOfPages();page++){doc.setPage(page);doc.setFontSize(7);doc.setTextColor(70,70,70);doc.text('Version guardada en servidor. La aprobacion documental no implica certificacion normativa.',10,height-6);doc.text('Pagina '+page+' de '+doc.getNumberOfPages(),width-10,height-6,{align:'right'});}
 return doc.output('blob');
}
