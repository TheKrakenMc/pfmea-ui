import ts from 'typescript';
import fs from 'node:fs';
const file='src/i18n/i18n.ts';
const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
function key(p){return p.name && (ts.isIdentifier(p.name)||ts.isStringLiteral(p.name)) ? p.name.text : null;}
function merge(properties){
 const result=[], positions=new Map();
 for(const property of properties){
  const name=key(property);
  if(name!==null && positions.has(name)){
   const index=positions.get(name), old=result[index];
   if(ts.isPropertyAssignment(old)&&ts.isPropertyAssignment(property)&&ts.isObjectLiteralExpression(old.initializer)&&ts.isObjectLiteralExpression(property.initializer)){
    result[index]=ts.factory.updatePropertyAssignment(property,property.name,ts.factory.updateObjectLiteralExpression(property.initializer,merge([...old.initializer.properties,...property.initializer.properties])));
   } else result[index]=property;
  } else {if(name!==null)positions.set(name,result.length);result.push(property);}
 }
 return result;
}
const result=ts.transform(source,[context=>function visit(node){if(ts.isObjectLiteralExpression(node))return ts.factory.updateObjectLiteralExpression(node,merge(node.properties.map(p=>ts.visitEachChild(p,visit,context))));return ts.visitEachChild(node,visit,context);}]);
fs.writeFileSync(file,ts.createPrinter({newLine:ts.NewLineKind.LineFeed}).printFile(result.transformed[0]));
console.log('Merged duplicate translation keys, preserving final-value precedence');
