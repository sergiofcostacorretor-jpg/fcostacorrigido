/* area-restrita.js — FCosta
   Esconde a página de quem não entrou no Painel ADM.
   Para abrir: entre primeiro no painel (fcostacorretor.com/painel_adm) neste mesmo aparelho e depois abra a página. */
(function () {
  var st = document.createElement('style');
  st.id = 'ar-esconde';
  st.textContent = 'html{visibility:hidden!important}';
  document.head.appendChild(st);
  function mostra() { var s = document.getElementById('ar-esconde'); if (s) s.remove(); }
  function bloqueia() {
    document.title = 'Área restrita | FCosta';
    var b = document.body || document.documentElement;
    b.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#0A0B0F;color:#F4F1EA;font-family:Inter,system-ui,sans-serif;text-align:center">' +
      '<div style="max-width:420px"><div style="font-size:40px">🔒</div>' +
      '<h1 style="font-family:Fraunces,Georgia,serif;font-weight:600;font-size:28px;margin:12px 0 8px">Área restrita</h1>' +
      '<p style="color:#8A877F;margin:0 0 22px">Esta página é só para a equipe FCosta. Entre no painel e depois abra esta página de novo.</p>' +
      '<a href="/painel_adm" style="display:inline-block;padding:14px 26px;border-radius:999px;background:linear-gradient(135deg,#F2DCA4 0%,#D6B266 45%,#A78340 100%);color:#0A0B0F;font-weight:700;text-decoration:none">Entrar no painel</a>' +
      '<p style="margin-top:18px"><a href="/" style="color:#D6B266">Voltar ao site</a></p></div></div>';
    mostra();
  }
  var s = document.createElement('script');
  s.type = 'module';
  s.textContent =
    "import{initializeApp}from'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';" +
    "import{getAuth,onAuthStateChanged}from'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';" +
    "const app=initializeApp({apiKey:'AIzaSyBo3zQ-yUNJ2Zk9d6jkEpslF-bsrFcRu8I',authDomain:'fcosta2026-847c3.firebaseapp.com',projectId:'fcosta2026-847c3',appId:'1:131225040087:web:d468aad3d80bd26aaa2c92'});" +
    "onAuthStateChanged(getAuth(app),u=>{window.__arDecidiu=1;u?window.__arMostra():window.__arBloqueia();});";
  window.__arMostra = mostra;
  window.__arBloqueia = function () { if (document.body) bloqueia(); else document.addEventListener('DOMContentLoaded', bloqueia); };
  s.onerror = window.__arBloqueia;
  document.head.appendChild(s);
  setTimeout(function () { if (!window.__arDecidiu) window.__arBloqueia(); }, 10000);
})();
