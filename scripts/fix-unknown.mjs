import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
const root=path.join(process.cwd(),'src');
function walk(dir){ return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]); }
let count=0;
for(const file of walk(root).filter(p=>/\.tsx?$/.test(p))){
 let source=fs.readFileSync(file,'utf8');
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
 const edits=[];
 function visit(node){
  if(node.kind===ts.SyntaxKind.AnyKeyword){
   const parent=node.parent;
   const contextual=ts.isParameter(parent) && (ts.isArrowFunction(parent.parent)||ts.isFunctionExpression(parent.parent));
   if(contextual) {
    let start=node.getStart(ast); while(source[start-1]===' ') start--;
    if(source[start-1]===':') start--;
    edits.push({start,end:node.end,text:''});
   } else edits.push({start:node.getStart(ast),end:node.end,text:'unknown'});
  }
  ts.forEachChild(node,visit);
 }
 visit(ast);
 for(const edit of edits.sort((a,b)=>b.start-a.start)){source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);count++;}
 if(edits.length)fs.writeFileSync(file,source);
}
console.log('Replaced unsafe any / restored contextual inference:',count);
