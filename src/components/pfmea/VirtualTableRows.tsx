import {useVirtualizer} from '@tanstack/react-virtual';
import {useCallback,useLayoutEffect,useRef,useState,type ReactNode} from 'react';

/** Keeps row identity and controlled edits while measuring wrapped row heights. */
export function VirtualTableRows<T extends {id:number|string}>({rows,columns,renderRow,mode='table'}:{rows:T[];columns:number;mode?:'table'|'div';renderRow:(row:T,index:number,measure:(node:HTMLElement|null)=>void)=>ReactNode}) {
 const anchor=useRef<HTMLElement|null>(null);
 const [margin,setMargin]=useState(0);
 const enabled=rows.length>100;
 const getScrollElement=useCallback(()=>anchor.current?.closest('[data-worksheet-scroll]') ?? null,[]);
 const getItemKey=useCallback((index:number)=>rows[index].id,[rows]);
 // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual uses imperative measurement; this app does not enable React Compiler.
 const virtualizer=useVirtualizer<HTMLDivElement,HTMLElement>({count:rows.length,getScrollElement:()=>getScrollElement() as HTMLDivElement|null,getItemKey,estimateSize:()=>160,overscan:4,enabled,scrollMargin:margin,initialRect:{width:1440,height:700}});
 useLayoutEffect(()=>{
  const parent=getScrollElement() as HTMLElement|null;if(!parent)return;
  const observer=new ResizeObserver(()=>{if(anchor.current)setMargin(anchor.current.getBoundingClientRect().top-parent.getBoundingClientRect().top+parent.scrollTop);});
  observer.observe(parent);const header=parent.querySelector('thead');if(header)observer.observe(header);
  return()=>observer.disconnect();
 },[getScrollElement]);
 const items=virtualizer.getVirtualItems();
 const top=items.length?Math.max(0,items[0].start-margin):0;
 const bottom=items.length?Math.max(0,virtualizer.getTotalSize()-(items[items.length-1].end-margin)):0;
 const rendered=enabled?items.map(item=>renderRow(rows[item.index],item.index,virtualizer.measureElement)):rows.map((row,index)=>renderRow(row,index,()=>{}));
 if(mode==='div')return <><div ref={node=>{anchor.current=node;}} aria-hidden="true"/><div aria-hidden="true" style={{height:top}}/>{rendered}<div aria-hidden="true" style={{height:bottom}}/></>;
 return <><tr ref={node=>{anchor.current=node;}} aria-hidden="true"><td colSpan={columns} style={{height:0,padding:0,border:0}}/></tr>
 {enabled?<><tr aria-hidden="true"><td colSpan={columns} style={{height:top,padding:0,border:0}}/></tr>{items.map(item=>renderRow(rows[item.index],item.index,virtualizer.measureElement))}<tr aria-hidden="true"><td colSpan={columns} style={{height:bottom,padding:0,border:0}}/></tr></>:rows.map((row,index)=>renderRow(row,index,()=>{}))}
 </>;
}
