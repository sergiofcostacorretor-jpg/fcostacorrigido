/* FCImoveis — ponte única entre o Painel ADM e qualquer ferramenta.
   Uso:  <script src="fcosta-imoveis.js"></script>
         FCImoveis.escolher(function(im){ ... })      // abre o seletor de imóveis
         FCImoveis.listar().then(function(lista){})   // todos os imóveis ativos do painel
         FCImoveis.publicar(im,{canal:'Instagram',ferramenta:'tour'})  // grava no mural "Publicações" do site */
(function(w){'use strict';
var DB='https://fcosta2026-847c3-default-rtdb.firebaseio.com',SITE='https://fcostacorretor.com',WA='5511993509109',cache=null;
function j(p,q,o){return fetch(DB+'/'+p+'.json'+(q||''),o).then(function(r){if(!r.ok)throw new Error('Firebase '+r.status);return r.json()})}
function arr(v){return Array.isArray(v)?v.filter(Boolean):Object.keys(v||{}).map(function(k){return v[k]}).filter(Boolean)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function money(p){p=String(p||'').trim();return !p?'Consulte':/^R\$/.test(p)?p:'R$ '+p}
function morta(u){return /supabase\.co\//i.test(String(u||''))}
function norm(id,d){var f=arr(d.fotos).filter(function(u){return !morta(u)});if(morta(d.fotoDestaque))d=Object.assign({},d,{fotoDestaque:''});return{id:id,codigo:d.codigo||'',titulo:d.titulo||'Imóvel',status:d.status||'venda',tipo:d.tipo||'',preco:d.preco||'',area:d.area||'',
 quartos:+d.quartos||0,banheiros:+d.banheiros||0,vagas:+d.vagas||0,bairro:d.bairro||'',cidade:d.cidade||'',descricao:d.descricao||'',fotos:f,
 capa:d.fotoDestaque||f[0]||'',tourMp4:d.tourMp4||'',destaque:!!d.destaque,slug:d.slug||'',link:d.slug?SITE+'/'+d.slug+'/':SITE+'/imovel?id='+id,atualizado:d.atualizado||''}}
function listar(o){o=o||{};
 if(cache&&!o.forcar&&Date.now()-cache.t<60000)return Promise.resolve(filtra(cache.l,o));
 return j('fcosta_imoveis').then(function(d){var l=Object.keys(d||{}).map(function(k){return{raw:d[k],im:norm(k,d[k])}}).filter(function(x){return x.raw.publicado!==false&&x.raw.status!=='panfleto'}).map(function(x){return x.im});
  l.sort(function(a,b){return (b.destaque-a.destaque)||String(b.atualizado).localeCompare(a.atualizado)});cache={t:Date.now(),l:l};return filtra(l,o)})}
function filtra(l,o){return l.filter(function(i){return (o.vendidos||i.status!=='vendido')&&(!o.status||i.status===o.status)})}
function texto(im){var e=[im.quartos&&im.quartos+' quarto(s)',im.banheiros&&im.banheiros+' banheiro(s)',im.vagas&&im.vagas+' vaga(s)',im.area&&im.area+(/m/.test(im.area)?'':' m²')].filter(Boolean).join(' · ');
 return [(im.status==='aluguel'?'🔑 ':'🏠 ')+im.titulo,'📍 '+[im.bairro,im.cidade].filter(Boolean).join(' – '),'💰 '+money(im.preco)+(im.status==='aluguel'?'/mês':''),e&&'🛏️ '+e,'','Código '+im.codigo,'👉 '+im.link,'💬 Sérgio Costa · CRECI-SP 294791-F · wa.me/'+WA].filter(function(x){return x!==false&&x!==0&&x!==undefined}).join('\n')}
function publicar(im,o){o=o||{};var p={imovelId:im.id,codigo:im.codigo,titulo:im.titulo,capa:im.capa,link:im.link,canal:o.canal||'Geral',ferramenta:o.ferramenta||'',texto:o.texto||texto(im),criado:new Date().toISOString()};
 return j('fcosta_publicacoes','',{method:'POST',body:JSON.stringify(p)}).then(function(){return{ok:true}},function(e){
  try{var q=JSON.parse(localStorage.getItem('fc_pub_fila')||'[]');q.push(p);localStorage.setItem('fc_pub_fila',JSON.stringify(q))}catch(x){}return{ok:false,fila:true,erro:e.message}})}
function publicacoes(n){return j('fcosta_publicacoes','?orderBy=%22%24key%22&limitToLast='+(n||12)).then(function(d){return Object.keys(d||{}).map(function(k){var p=d[k];p.id=k;return p}).reverse()})}
function escolher(cb,o){var m=document.createElement('div');m.style.cssText='position:fixed;inset:0;z-index:99;background:rgba(7,13,24,.8);display:flex;align-items:center;justify-content:center;padding:12px';
 m.innerHTML='<div role="dialog" aria-label="Escolher imóvel" style="background:#fff;color:#0b1424;border-radius:14px;width:100%;max-width:520px;max-height:88vh;display:flex;flex-direction:column;font:15px DM Sans,system-ui,sans-serif"><div style="padding:12px;display:flex;gap:8px"><input id="fcq" placeholder="Buscar por código, bairro ou título" style="flex:1;min-height:44px;padding:0 12px;border:1px solid #ccd3e0;border-radius:10px;font:inherit"><button id="fcx" style="min-height:44px;padding:0 14px;border:0;border-radius:10px;background:#e8ecf4;font:inherit;cursor:pointer">Fechar</button></div><div id="fcl" style="overflow:auto;padding:0 12px 12px">Carregando imóveis…</div></div>';
 document.body.appendChild(m);var L=[];function fecha(){m.remove()}m.querySelector('#fcx').onclick=fecha;m.onclick=function(e){if(e.target===m)fecha()};
 function pinta(){var q=m.querySelector('#fcq').value.toLowerCase(),box=m.querySelector('#fcl'),r=L.filter(function(i){return (i.codigo+i.titulo+i.bairro+i.cidade).toLowerCase().indexOf(q)>-1});
  box.innerHTML=r.length?r.map(function(i,n){return '<button data-n="'+L.indexOf(i)+'" style="display:flex;gap:10px;align-items:center;width:100%;text-align:left;padding:8px;margin-bottom:6px;border:1px solid #e1e6ef;border-radius:10px;background:#fff;cursor:pointer;font:inherit;color:inherit">'+(i.capa?'<img src="'+esc(i.capa)+'" alt="" style="width:64px;height:48px;object-fit:cover;border-radius:6px">':'')+'<span><b>'+esc(i.codigo)+'</b> '+esc(i.titulo)+'<br><small style="color:#5b6784">'+esc(i.bairro)+' · '+esc(money(i.preco))+'</small></span></button>'}).join(''):'Nenhum imóvel encontrado.';
  [].forEach.call(box.querySelectorAll('button'),function(b){b.onclick=function(){var im=L[+b.dataset.n];fecha();cb(im)}})}
 listar(o).then(function(l){L=l;pinta();m.querySelector('#fcq').oninput=pinta;m.querySelector('#fcq').focus()},function(){m.querySelector('#fcl').textContent='Não foi possível carregar os imóveis do painel. Verifique a conexão e abra de novo.'})}
w.FCImoveis={listar:listar,obter:function(id){return listar({vendidos:true}).then(function(l){return l.filter(function(i){return i.id===id})[0]||null})},texto:texto,publicar:publicar,publicacoes:publicacoes,escolher:escolher,money:money,esc:esc,WA:WA,SITE:SITE};
})(window);
