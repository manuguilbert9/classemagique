// Firebase CLI 15 expects Webpack's action.layer. Next 16 Turbopack instead
// records the consuming routes in action.workers; these also need the SSR backend.
module.exports=function routesWithActions(manifest,paths,existing=[]){
  const routes=new Set(existing.filter(Boolean));
  for(const runtime of ['node','edge'])for(const action of Object.values(manifest[runtime]||{})){
    for(const worker of Object.keys(action.workers||{})){
      const route=paths[worker.replace(/^app/,'')];
      if(typeof route==='string')routes.add(route);
    }
  }
  return [...routes];
};
