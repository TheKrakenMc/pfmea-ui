import ts from 'typescript';import fs from 'node:fs';import path from 'node:path';
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
let count=0;
for(const file of files('src').filter(p=>p.endsWith('.tsx'))){
 const text=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const states=new Map(),effects=[];
 function visit(node){
  if(ts.isVariableDeclaration(node)&&ts.isArrayBindingPattern(node.name)&&node.initializer&&ts.isCallExpression(node.initializer)&&node.initializer.expression.getText(ast).endsWith('useState')){
   const [name,setter]=node.name.elements;if(name&&setter&&ts.isIdentifier(name.name)&&ts.isIdentifier(setter.name))states.set(name.name.text,{setter:setter.name,statement:node.parent.parent});
  }
  if(ts.isExpressionStatement(node)&&ts.isCallExpression(node.expression)&&node.expression.expression.getText(ast).endsWith('useEffect')){
   const [callback,deps]=node.expression.arguments;
   if(callback&&ts.isArrowFunction(callback)&&ts.isBlock(callback.body)&&deps&&ts.isArrayLiteralExpression(deps)){
    const body=callback.body.getText(ast).replace(/\/\/[^\n]*/g,'').replace(/\s/g,'');
    if(body==='{setCurrentPage(1);}')effects.push({statement:node,deps:deps.elements.filter(ts.isIdentifier).map(n=>n.text)});
   }
  }
  ts.forEachChild(node,visit);
 }
 visit(ast);
 const edits=[],converted=new Set();
 for(const effect of effects){
  edits.push({start:effect.statement.getStart(ast),end:effect.statement.end,text:''});
  for(const dependency of effect.deps){const state=states.get(dependency);if(!state||converted.has(dependency))continue;converted.add(dependency);
   const setter=state.setter.text,raw='raw'+setter[0].toUpperCase()+setter.slice(1);
   edits.push({start:state.setter.getStart(ast),end:state.setter.end,text:raw});
   edits.push({start:state.statement.end,end:state.statement.end,text:'\n  const '+setter+' = (value: Parameters<typeof '+raw+'>[0]) => { '+raw+'(value); setCurrentPage(1); };'});
  }
  count++;
 }
 let result=text;for(const edit of edits.sort((a,b)=>b.start-a.start))result=result.slice(0,edit.start)+edit.text+result.slice(edit.end);
 if(edits.length)fs.writeFileSync(file,result);
}
console.log('Moved pagination resets to filter events:',count);
