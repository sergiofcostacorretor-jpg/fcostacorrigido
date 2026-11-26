/* Mostra o numero da versao do site, discreto, ao lado do logo */
(function(){
  function por(){
    var v=window.FC_VERSAO;if(!v||!v.n)return;
    var alvo=document.querySelectorAll('.hdr .logo small');
    for(var i=0;i<alvo.length;i++){
      if(alvo[i].querySelector('.fc-ver'))continue;
      var s=document.createElement('span');
      s.className='fc-ver';s.textContent=' · v'+v.n;
      if(v.d)s.title='Versão '+v.n+' publicada em '+v.d;
      alvo[i].appendChild(s);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',por);else por();
})();
