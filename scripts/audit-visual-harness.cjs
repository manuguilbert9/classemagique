/* Isolated visual audit: actual components and local generators; NO Firebase or AI.
 * Browser/context services are substituted only in this disposable bundle.
 * This is a rendering probe, not an end-to-end validation of the real backend.
 */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
const out = path.join(root, '.next/audit-integrity');
fs.mkdirSync(out, { recursive: true });
const navigation = `
export const useParams=()=>({skill:new URLSearchParams(location.search).get('slug')||'calendar'});
export const useSearchParams=()=>new URLSearchParams(location.search);
export const useRouter=()=>({push:()=>{},replace:()=>{},back:()=>{},refresh:()=>{}});
export const usePathname=()=>'/exercise/'+useParams().skill;
export const notFound=()=>{throw new Error('route absente du catalogue')};`;
const context = `import {createContext} from 'react';
const p=new URLSearchParams(location.search); const slug=p.get('slug');const level=p.get('level')||'B';
export const UserContext=createContext({student:{id:'audit-fixture',name:'Profil fictif',groupId:'audit',levels:{[slug]:level},nuggets:0,mentalMathPerformance:{}},isLoading:false,refreshStudent:()=>{}});`;
const serviceStub = file => {
  let source = fs.readFileSync(file, 'utf8');
  for (const match of [...source.matchAll(/export\s*\*\s*from\s*['"]([^'"]+)['"]/g)]) {
    source += '\n' + fs.readFileSync(path.resolve(path.dirname(file), match[1] + '.ts'), 'utf8');
  }
  const functions = [...source.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)].map(m => m[1]);
  const constants = [...source.matchAll(/export\s+const\s+(\w+)/g)].map(m => m[1]);
  const reexports = [...source.matchAll(/export\s*\{([^}]+)\}\s*from/g)].flatMap(m => m[1].split(',').map(s => s.trim()).filter(Boolean));
  return [...new Set([...functions, ...constants, ...reexports])].map(name => `export const ${name}=async(...args)=>{window.__auditCalls.push({service:${JSON.stringify(path.basename(file))},name:${JSON.stringify(name)},args});return ${name==='getCurrentSchoolYear' ? '"2026"' : /^(add|save|persist|update|delete|upload)/.test(name) ? '{success:true}' : /^(getEntry|getHomework|getStudentById)/.test(name) ? 'null' : '[]'};};`).join('\n');
};
const plugin = { name: 'audit-isolation', setup(build) {
  build.onLoad({ filter: /\.(png|jpe?g|webp)$/ }, args => ({ loader: 'js', contents: `export default {src:${JSON.stringify('/' + path.relative(path.join(root,'public'),args.path).replaceAll('\\','/'))}};` }));
  build.onResolve({ filter: /^next\/(navigation|link|image)$/ }, args => ({ path: args.path, namespace: 'audit' }));
  build.onResolve({ filter: /^genkit$/ }, args => ({ path: 'genkit', namespace: 'audit' }));
  build.onLoad({ filter: /.*/, namespace: 'audit' }, args => {
    const contents = args.path === 'next/navigation' ? navigation : args.path === 'genkit' ? `export {z} from 'zod';` : args.path === 'next/link'
      ? `import React from 'react';export default React.forwardRef(function Link({href,children,...props},ref){return <a href={href} ref={ref} {...props}>{children}</a>})`
      : `import React from 'react';export default function Image({src,alt,fill,priority,unoptimized,loader,quality,sizes,...props}){return <img src={typeof src==='string'?src:src.src} alt={alt} {...props} style={{...props.style,...(fill?{position:'absolute',width:'100%',height:'100%',inset:0}: {})}}/>}`;
    return { contents, loader: 'tsx', resolveDir: root };
  });
  build.onLoad({ filter: /[\\/]context[\\/]user-context\.tsx$/ }, () => ({ contents: context, loader: 'tsx', resolveDir: root }));
  build.onLoad({ filter: /[\\/]services[\\/].*\.ts$/ }, args => {
    if (args.path.endsWith('dictees.ts')) return;
    if (args.path.endsWith('exercise-pool.ts')) return { loader: 'ts', resolveDir: root, contents: `
      import {POOLED_GENERATORS} from '@/lib/exercise-content-registry';
      import {generateQuestions} from '@/lib/questions';
      export async function getPooledContent(slug,count,options={}) {
        window.__auditCalls.push({name:'getPooledContent',slug,count,options});
        return POOLED_GENERATORS[slug]?POOLED_GENERATORS[slug]({count,...options}):generateQuestions(slug,count,options.settings);
      }
      export const getExerciseQuestions=getPooledContent;
    ` };
    return { contents: serviceStub(args.path), loader: 'ts', resolveDir: root };
  });
  build.onLoad({ filter: /[\\/]ai[\\/]genkit\.ts$/ }, () => ({ loader: 'ts', contents: `export const ai={definePrompt:()=>async()=>{throw new Error('IA distante désactivée pour cet audit')},defineFlow:(_,fn)=>fn};` }));
} };
(async () => {
  await esbuild.build({ stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import ExercisePage from '@/app/exercise/[skill]/page';window.__auditCalls=[];class Boundary extends React.Component {state={error:null};static getDerivedStateFromError(error){return{error:String(error)}}render(){return this.state.error?<pre role="alert">{this.state.error}</pre>:this.props.children}}createRoot(document.getElementById('root')).render(<Boundary><ExercisePage/></Boundary>);`, resolveDir: root, loader: 'tsx' },
    outfile: path.join(out, 'app.js'), bundle: true, platform: 'browser', format: 'iife', jsx: 'automatic', plugins: [plugin],
    tsconfig: path.join(root, 'tsconfig.json'), define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'warning' });
  const cssFiles = [];
  function findCss(dir) { if(!fs.existsSync(dir))return; for(const e of fs.readdirSync(dir,{withFileTypes:true})) { const f=path.join(dir,e.name); if(e.isDirectory())findCss(f);else if(f.endsWith('.css'))cssFiles.push(f); } }
  findCss(path.join(root,'.next/static'));
  fs.writeFileSync(path.join(out,'styles.css'),cssFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n').replaceAll('../media/','/_next/static/media/'));
  fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><style>@font-face{font-family:AuditAndika;src:url('/fonts/andika.ttf')}@font-face{font-family:AuditMonof;src:url('/fonts/monof55.ttf')}body{--font-andika:AuditAndika;--font-pangolin:Pangolin;--font-monof:AuditMonof;font-family:AuditAndika,sans-serif}</style><body class="font-body"><div id="root"></div><script src="/app.js"></script></body></html>`);
  http.createServer((req,res)=>{
    if(req.method!=='GET'){res.writeHead(405);return res.end();}
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/api/fluence-texts') {
      const level=url.searchParams.get('level');if(!['B','C','D'].includes(level)){res.writeHead(400);return res.end('[]')}
      const rows=[];const baseDir=path.join(root,'public/fluence',level);
      const read=(dir,subCategory)=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){read(file,entry.name);continue;}if(!entry.name.endsWith('.txt'))continue;const raw=fs.readFileSync(file,'utf8');const title=raw.match(/<titre>(.*?)<\/titre>/)?.[1]?.trim()||'Texte sans titre';const content=raw.replace(/<titre>.*?<\/titre>\s*/,'').trim();rows.push({level:'Niveau '+level,subCategory,title,content,wordCount:content.split(/\s+/).filter(Boolean).length})}};
      if(fs.existsSync(baseDir))read(baseDir);res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify(rows));
    }
    if(url.pathname==='/api/expansion-texts') {
      const baseDir=path.join(root,'public/expansion');const names=fs.readdirSync(baseDir).filter(x=>x.endsWith('.txt'));const id=url.searchParams.get('id');
      const read=name=>{const lines=fs.readFileSync(path.join(baseDir,name),'utf8').split('\n').filter(x=>x.trim());return{id:name,title:lines.shift().replace(/<\/?titre>/g,'').trim(),sentences:lines}};
      const data=id?(names.includes(id)?read(id):null):names.map(name=>{const d=read(name);return{id:d.id,title:d.title,sentenceCount:d.sentences.length}});
      res.writeHead(data?200:404,{'content-type':'application/json'});return res.end(JSON.stringify(data));
    }
    const nextAsset=url.pathname.startsWith('/_next/');
    const base=nextAsset?path.join(root,'.next'):['/app.js','/styles.css'].includes(url.pathname)?out: url.pathname==='/'?out:path.join(root,'public');
    const relative=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname).replace(nextAsset?/^\/_next\//:/^\//,'');
    const file=path.resolve(base,relative);
    if(!file.startsWith(base+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('Unavailable in isolated audit');}
    const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.txt':'text/plain','.json':'application/json'}[path.extname(file)]||'application/octet-stream';
    res.writeHead(200,{'content-type':type+';charset=utf-8'});fs.createReadStream(file).pipe(res);
  }).listen(9004,'127.0.0.1',()=>console.log('Isolated audit ready at http://127.0.0.1:9004 (no Firebase, AI, or external requests).'));
})().catch(e=>{console.error(e.message);process.exitCode=1});
