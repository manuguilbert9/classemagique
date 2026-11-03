/* Firebase's framework packager copies Next's Windows junctions as symlinks,
 * requiring elevated privileges. Materialize them only inside generated staging,
 * excluding build caches and local test output. Reconcile the generated lock file
 * after Firebase adds its runtime dependencies, then verify npm ci before upload.
 * Also recognize Next 16 Turbopack server-action routes in the CLI adapter.
 * Usage: node --require ./scripts/firebase-windows-copy.cjs <firebase-cli> deploy ...
 * No installed package or Windows setting is changed. */
if(process.platform==='win32'){
  const path=require('node:path');
  const childProcess=require('node:child_process');
  const nextUtils=require(path.join(path.dirname(process.argv[1]),'..','frameworks','next','utils.js'));
  const oldRoutes=nextUtils.getRoutesWithServerAction;
  const routesWithActions=require('./firebase-next-actions.cjs');
  nextUtils.getRoutesWithServerAction=(manifest,paths)=>routesWithActions(manifest,paths,oldRoutes(manifest,paths));
  const fsExtra=require(require.resolve('fs-extra',{paths:[path.dirname(process.argv[1])]}));
  const original=fsExtra.copy;
  const root=process.cwd();
  const inside=(file,folder)=>{const relative=path.relative(folder,path.resolve(file));return relative!==''&&!relative.startsWith('..')&&!path.isAbsolute(relative);};
  fsExtra.copy=function(source,destination,options,callback){
    if(typeof options==='function'){callback=options;options={};}
    if(inside(source,path.join(root,'.next'))&&inside(destination,path.join(root,'.firebase'))){
      const previousFilter=options?.filter;
      options={...options,dereference:true,filter:(file,target)=>{
        const section=path.relative(path.join(root,'.next'),path.resolve(file)).split(path.sep)[0];
        return ['cache','dev','homework-ui'].includes(section)?false:previousFilter?previousFilter(file,target):true;
      }};
    }
    return callback?original(source,destination,options,callback):original(source,destination,options);
  };
  const execSync=childProcess.execSync;
  childProcess.execSync=function(command,options){
    const result=execSync(command,options);
    if(command==='npm i --omit dev --no-audit'&&options?.cwd&&inside(options.cwd,path.join(root,'.firebase'))){
      // Match the npm version used by the Node 24 Cloud Build image; npm 11.6
      // accepts peer entries that npm 11.19 correctly reports as incomplete.
      const npm='npm exec --yes --package=npm@11.19.1 -- npm';
      execSync(npm+' install --package-lock-only --ignore-scripts --omit=dev --no-audit --no-fund',options);
      execSync(npm+' ci --dry-run --ignore-scripts --omit=dev --no-audit --no-fund',{...options,stdio:'pipe'});
      process.stdout.write('Generated Firebase dependency lock verified.\n');
    }
    return result;
  };
}
