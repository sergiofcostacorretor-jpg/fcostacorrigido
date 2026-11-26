/* Mostra o numero da versao do site em destaque, ao lado do nome FCosta.
   Numero = total de envios do site no GitHub (muda a cada publicacao). */
(function(){
  var API='https://api.github.com/repos/sergiofcostacorretor-jpg/fcostacorrigido/commits?sha=main&per_page=1';
  function mostra(n,d){
    if(!n)return;
    var alvo=document.querySelectorAll('.hdr .logo b');
    for(var i=0;i<alvo.length;i++){
      var s=alvo[i].querySelector('.fc-ver');
      if(!s){s=document.createElement('span');s.className='fc-ver';alvo[i].appendChild(s);}
      s.textContent='v'+n;
      s.title='Versão '+n+(d?' publicada em '+d:'');
    }
  }
  function busca(){
    var c=null;
    try{c=JSON.parse(localStorage.getItem('fcVersao')||'null');}catch(e){}
    if(c&&c.n){mostra(c.n,c.d);if(Date.now()-c.t<600000)return;}
    if(!window.fetch)return;
    fetch(API,{headers:{'Accept':'application/vnd.github+json'}}).then(function(r){
      if(!r.ok)return;
      var l=r.headers.get('Link')||'',m=l.match(/[?&]page=(\d+)>;\s*rel="last"/);
      return r.json().then(function(j){
        var n=m?m[1]:(j&&j.length?'1':'');
        var d='';try{d=new Date(j[0].commit.committer.date).toLocaleDateString('pt-BR');}catch(e){}
        if(!n)return;
        mostra(n,d);
        try{localStorage.setItem('fcVersao',JSON.stringify({n:n,d:d,t:Date.now()}));}catch(e){}
      });
    }).catch(function(){});
  }
  function por(){
    var v=window.FC_VERSAO;
    if(v&&v.n)mostra(v.n,v.d);else busca();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',por);else por();
})();
