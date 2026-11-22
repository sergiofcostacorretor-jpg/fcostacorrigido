/* Ajudantes comuns dos protótipos de identidade visual (só para a prévia). */
(function(){
 var L=window.IMOVEIS||[];
 function cap(s){return String(s||'').toLowerCase().replace(/(^|[\s\-\/])([a-zà-ú])/g,function(m,a,b){return a+b.toUpperCase();}).replace(/\bSao\b/g,'São').replace(/\b(De|Da|Do|Dos|Das|E)\b/g,function(m){return m.toLowerCase();});}
 window.P={
  lista:L,
  tipo:function(i){return cap((i.chips[0]||'Imóvel').replace('Chacara','Chácara'));},
  bairro:function(i){return cap(String(i.local).split(/\s[-–—]\s/)[0]);},
  cidade:function(i){var p=String(i.local).split(/\s[-–—]\s/);return cap((p[1]||'São Paulo').replace(/\/?\s*SP\.?$/i,'').replace(/[—–-]\s*$/,'').trim());},
  area:function(i){var a=i.chips.filter(function(c){return /m²/.test(c);})[0];return a||'';},
  quartos:function(i){var a=i.chips.filter(function(c){return /quarto/.test(c);})[0];return a||'';},
  preco:function(i){return i.preco;},
  foto:function(i,n){return i.fotos[n||0]||'';},
  wa:function(t){return 'https://wa.me/5511993509109?text='+encodeURIComponent(t||'Olá, Sergio! Vim pelo site.');},
  el:function(h){var d=document.createElement('div');d.innerHTML=h.trim();return d.firstChild;},
  esc:function(s){return String(s||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});},
  revelar:function(){
   var ns=document.querySelectorAll('[data-rv]');
   if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches){ns.forEach(function(n){n.classList.add('in');});return;}
   var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
   ns.forEach(function(n){io.observe(n);});
  },
  topo:function(el){function f(){el.classList.toggle('solid',scrollY>40);}addEventListener('scroll',f,{passive:true});f();},
  slides:function(box,urls,ms){
   var k=0,im=[];urls.forEach(function(u,j){var s=document.createElement('div');s.className='sl'+(j?'':' on');s.style.backgroundImage='url("'+u+'")';box.appendChild(s);im.push(s);});
   if(im.length<2)return;setInterval(function(){im[k].classList.remove('on');k=(k+1)%im.length;im[k].classList.add('on');},ms||6500);
  }
 };
})();
