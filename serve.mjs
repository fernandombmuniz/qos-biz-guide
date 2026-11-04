import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 const bytes=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(bytes);
 }catch{res.writeHead(404);res.end('Arquivo nao encontrado. Execute npm run build se a pasta dist estiver ausente.');}});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'A porta 4173 ja esta em uso. Abra http://localhost:4173 ou encerre a outra instancia.':e);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Concierge V3 disponivel em http://localhost:${port}\nMantenha esta janela aberta. Ctrl+C para encerrar.`));
