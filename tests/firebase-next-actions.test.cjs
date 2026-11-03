const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('Firebase routes Turbopack server-action workers through Next, preserving existing routes',()=>{
  const file='../scripts/firebase-next-actions.cjs';
  const resolve=fs.existsSync(require('node:path').resolve(__dirname,file))?require(file):null;
  assert.equal(typeof resolve,'function');
  const manifest={node:{action:{workers:{'app/devoirs/page':{},'app/teacher/dashboard/page':{},'app/page':{},'app/unknown/page':{}}}},edge:{}};
  const paths={'/devoirs/page':'/devoirs','/teacher/dashboard/page':'/teacher/dashboard','/page':'/'};
  assert.deepEqual(resolve(manifest,paths,['/existing','/devoirs']),['/existing','/devoirs','/teacher/dashboard','/']);
  assert.deepEqual(resolve({node:{action:{layer:{'app/page':'action-browser'}}}},paths,['/']),['/']);
});
