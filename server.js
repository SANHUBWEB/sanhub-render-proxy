(function proxyMain(){
  const http=require('http');const ORIGIN=process.env.ALLOWED_ORIGIN||'*';
  http.createServer(async(req,res)=>{
    const cors={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'GET,POST,PUT,PATCH,DELETE,OPTIONS','Access-Control-Allow-Headers':'Authorization,Content-Type,Accept','Access-Control-Max-Age':'86400'};
    if(req.method==='OPTIONS'){res.writeHead(204,cors);return res.end()}
    if(req.url==='/'||req.url==='/health'){res.writeHead(200,Object.assign({'Content-Type':'text/plain'},cors));return res.end('SANHUB Render proxy OK')}
    if(!req.url.startsWith('/v1/')){res.writeHead(404,cors);return res.end('Not found')}
    const chunks=[];for await(const c of req)chunks.push(c);const body=Buffer.concat(chunks);
    try{
      const noBody=['GET','HEAD','DELETE'].includes(req.method)||!body.length;
      const h={Authorization:req.headers.authorization||'',Accept:'application/json'};if(!noBody)h['Content-Type']=req.headers['content-type']||'application/json';
      const r=await fetch('https://api.render.com'+req.url,{method:req.method,headers:h,body:noBody?undefined:body});
      const text=await r.text();
      res.writeHead(r.status,Object.assign({'Content-Type':r.headers.get('content-type')||'application/json'},cors));res.end(text);
    }catch(e){res.writeHead(502,Object.assign({'Content-Type':'application/json'},cors));res.end(JSON.stringify({message:'Proxy error: '+e.message}))}
  }).listen(process.env.PORT||3000);
})();
