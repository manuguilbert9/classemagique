/* Produces reviewable JSON only; never writes to Firebase. Roster input stays outside git. */
const fs=require('node:fs');const path=require('node:path');const esbuild=require('esbuild');
const [rosterFile,outputDirectory]=process.argv.slice(2);
if(!rosterFile||!outputDirectory)throw Error('Usage: node scripts/prepare-homework-p2.cjs roster.json output-directory');
fs.mkdirSync(outputDirectory,{recursive:true});
const moduleFile=path.join(outputDirectory,'homework-period.cjs');
esbuild.buildSync({entryPoints:['src/lib/homework-period.ts'],outfile:moduleFile,bundle:true,platform:'node',format:'cjs',logLevel:'warning'});
const {createPeriodPlan,periodDates,profileForStudent,validHomeworkPlan}=require(moduleFile);
const pupils=JSON.parse(fs.readFileSync(rosterFile,'utf8')).filter(student=>profileForStudent(student));
if(pupils.length!==16)throw Error(`Expected the 16 pupils in the approved brief; found ${pupils.length}`);
const field=value=>value===null?{nullValue:'NULL_VALUE'}:typeof value==='string'?{stringValue:value}:typeof value==='boolean'?{booleanValue:value}:typeof value==='number'?{integerValue:String(value)}:Array.isArray(value)?{arrayValue:{values:value.map(field)}}:{mapValue:{fields:Object.fromEntries(Object.entries(value).map(([k,v])=>[k,field(v)]))}};
const manifest=[];
for(const slot of periodDates('2026-11-03')){
 const assignments=Object.fromEntries(pupils.map(student=>{
  const plan=createPeriodPlan(slot.week,slot.day,profileForStudent(student));
  if(!validHomeworkPlan(plan))throw Error('Invalid plan for '+student.name+' '+slot.date);
  return [student.id,{francais:null,maths:null,orthographe:null,notes:null,plan}];
 }));
 const document={name:`projects/classemagique2/databases/(default)/documents/homework/${slot.date}`,fields:{assignmentsByStudent:field(assignments)}};
 fs.writeFileSync(path.join(outputDirectory,slot.date+'.json'),JSON.stringify(document));
 manifest.push({date:slot.date,week:slot.week,availableOn:slot.availableOn,pupils:Object.keys(assignments).length});
}
fs.writeFileSync(path.join(outputDirectory,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({dates:manifest.length,pupils:pupils.length,assignments:manifest.reduce((n,d)=>n+d.pupils,0),first:manifest[0],last:manifest.at(-1),outputDirectory}));
