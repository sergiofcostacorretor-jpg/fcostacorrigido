/* ptam-pro-nucleo.js — Central do Avaliador FCosta
   Núcleo: utilidades, armazenamento, formulário, documento, PDF e navegação. */
(function () {
  'use strict';
  var PP = window.PP = { itens: {}, ordem: [], h: {}, calc: {} };

  PP.cats = [
    { id: 'ptam', ic: '📄', nome: 'Modelos de PTAM', sub: '20 modelos, cada um em versão completa e resumida para o cliente', selo: 'Os mais usados' },
    { id: 'calc', ic: '🧮', nome: 'Planilhas de cálculo', sub: '10 planilhas que calculam sozinhas + guia dos métodos', selo: 'Calculam sozinhas' },
    { id: 'laudo', ic: '🏛️', nome: 'Laudos judiciais e oficiais', sub: '12 modelos + checklist de documentos', selo: 'Justiça, banco, fisco' },
    { id: 'form', ic: '📋', nome: 'Formulários e termos', sub: '6 modelos para vistoria e análise', selo: 'Imprimir ou preencher' },
    { id: 'ferr', ic: '🧰', nome: 'Ferramentas do dia a dia', sub: '15 ferramentas: proposta, recibo, contrato, agenda…', selo: 'Atendimento' },
    { id: 'tab', ic: '📚', nome: 'Tabelas e casos especiais', sub: '3 tabelas + 2 guias de casos especiais', selo: 'Consulta rápida' }
  ];

  PP.add = function (it) { PP.itens[it.id] = it; PP.ordem.push(it.id); };

  /* ---------- utilidades ---------- */
  var esc = PP.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  PP.num = function (s) {
    if (typeof s === 'number') return isFinite(s) ? s : 0;
    if (s == null) return 0;
    s = String(s).replace(/R\$|\s|%/g, '');
    if (!s) return 0;
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    var v = parseFloat(s);
    return isFinite(v) ? v : 0;
  };
  PP.N = function (v, d) {
    d = d == null ? 2 : d;
    return (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  PP.R = function (v) { return 'R$ ' + PP.N(v, 2); };
  PP.dt = function (s) {
    if (!s) return '';
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    return m ? m[3] + '/' + m[2] + '/' + m[1] : s;
  };
  PP.hoje = function () {
    var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };
  PP.dataExtenso = function (s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || PP.hoje());
    if (!m) return s;
    var meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return parseInt(m[3], 10) + ' de ' + meses[parseInt(m[2], 10) - 1] + ' de ' + m[1];
  };
  PP.arred = function (v) {
    // arredonda de forma usual em avaliação (até 1% de variação)
    if (!v) return 0;
    var mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(Math.abs(v))) - 2));
    return Math.round(v / mag) * mag;
  };

  /* valor por extenso (reais) */
  PP.extenso = function (valor) {
    valor = Math.round((Number(valor) || 0) * 100) / 100;
    var u = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    var dz = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    var ct = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
    function ate999(n) {
      if (n === 0) return '';
      if (n === 100) return 'cem';
      var c = Math.floor(n / 100), r = n % 100, p = [];
      if (c) p.push(ct[c]);
      if (r) { if (r < 20) p.push(u[r]); else { var d = Math.floor(r / 10), x = r % 10; p.push(dz[d] + (x ? ' e ' + u[x] : '')); } }
      return p.join(' e ');
    }
    function inteiro(n) {
      if (n === 0) return 'zero';
      var grupos = [], esc2 = [['', ''], ['mil', 'mil'], ['milhão', 'milhões'], ['bilhão', 'bilhões']];
      var i = 0;
      while (n > 0) { grupos.push(n % 1000); n = Math.floor(n / 1000); i++; }
      var partes = [];
      for (var g = grupos.length - 1; g >= 0; g--) {
        var v = grupos[g]; if (!v) continue;
        var t = (g === 1 && v === 1) ? 'mil' : ate999(v) + (g ? ' ' + (v === 1 ? esc2[g][0] : esc2[g][1]) : '');
        partes.push({ t: t, v: v, g: g });
      }
      var out = '';
      partes.forEach(function (p, k) {
        if (k === 0) out = p.t;
        else {
          out += (p.v < 100 || p.v % 100 === 0) ? ' e ' + p.t : ', ' + p.t;
        }
      });
      return out.replace(/, (?=[^,]*$)/, function (m) { return m; });
    }
    var r = Math.floor(valor), c = Math.round((valor - r) * 100);
    var s = '';
    if (r) {
      s = inteiro(r);
      var redondo = r >= 1000000 && r % 1000000 === 0;
      s += redondo ? ' de reais' : (r === 1 ? ' real' : ' reais');
    }
    if (c) s += (r ? ' e ' : '') + inteiro(c) + (c === 1 ? ' centavo' : ' centavos');
    return s || 'zero real';
  };

  /* ---------- armazenamento local ---------- */
  var LS = PP.ls = {
    get: function (k, def) { try { var v = localStorage.getItem('pp:' + k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set: function (k, v) { try { localStorage.setItem('pp:' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem('pp:' + k); } catch (e) {} }
  };

  PP.perfilPadrao = {
    nome: 'Sergio Fernandes da Costa',
    titulo: 'Corretor de Imóveis e Avaliador',
    creci: 'CRECI-SP 294791-F',
    cnai: 'CNAI 52708',
    whats: '(11) 99350-9109',
    email: '',
    site: 'fcostacorretor.com',
    cidade: 'São Paulo – SP',
    endereco: '',
    pix: '',
    bio: 'Corretor de imóveis inscrito no CRECI-SP e avaliador imobiliário com registro no Cadastro Nacional de Avaliadores Imobiliários (CNAI/COFECI). Atua na Zona Leste de São Paulo e Grande São Paulo com avaliação de imóveis residenciais, comerciais, terrenos e imóveis rurais.',
    assinatura: ''
  };
  PP.perfil = function () {
    var p = LS.get('perfil', {}), o = {};
    for (var k in PP.perfilPadrao) o[k] = (p[k] != null && p[k] !== '') ? p[k] : PP.perfilPadrao[k];
    if (p.assinatura === '') o.assinatura = '';
    return o;
  };

  /* ---------- avisos e janelinhas ---------- */
  PP.aviso = function (t) {
    var a = document.createElement('div'); a.className = 'aviso'; a.textContent = t;
    document.body.appendChild(a); setTimeout(function () { a.remove(); }, 2600);
  };
  PP.janela = function (o) {
    var m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = '<div><h3>' + esc(o.titulo) + '</h3>' + (o.texto ? '<p>' + esc(o.texto) + '</p>' : '') +
      (o.campo != null ? '<input type="text" value="' + esc(o.campo) + '">' : '') +
      '<div class="bts"><button class="bt p" data-x="0">Cancelar</button><button class="bt p ouro" data-x="1">' + esc(o.ok || 'OK') + '</button></div></div>';
    document.body.appendChild(m);
    var inp = m.querySelector('input'); if (inp) { inp.focus(); inp.select(); }
    m.addEventListener('click', function (e) {
      var x = e.target.getAttribute('data-x');
      if (e.target === m) x = '0';
      if (x == null) return;
      m.remove();
      if (x === '1' && o.sim) o.sim(inp ? inp.value : true);
    });
  };
  PP.copiar = function (t) {
    function ok() { PP.aviso('Copiado ✔'); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(ok, velho); else velho();
    function velho() { var a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); ok(); } catch (e) {} a.remove(); }
  };
  PP.wa = function (texto, fone) {
    var f = String(fone || '').replace(/\D/g, '');
    if (f && f.length <= 11) f = '55' + f;
    window.open('https://wa.me/' + f + '?text=' + encodeURIComponent(texto), '_blank');
  };

  /* ---------- peças do documento ---------- */
  var h = PP.h;
  /* selo "FCosta Avaliador · CNAI": logo no centro, nome em volta */
  PP.selo = null;
  PP.fazSelo = function (cb) {
    var img = new Image();
    img.onload = function () {
      try {
        var P = PP.perfil(), S = 420, c = document.createElement('canvas'); c.width = c.height = S;
        var g = c.getContext('2d'), cx = S / 2, cy = S / 2;
        var grad = g.createLinearGradient(0, 0, S, S); grad.addColorStop(0, '#F2DCA4'); grad.addColorStop(0.45, '#D6B266'); grad.addColorStop(1, '#A78340');
        g.beginPath(); g.arc(cx, cy, 206, 0, 2 * Math.PI); g.fillStyle = '#0A0B0F'; g.fill();
        g.lineWidth = 9; g.strokeStyle = grad; g.stroke();
        g.beginPath(); g.arc(cx, cy, 146, 0, 2 * Math.PI); g.lineWidth = 3; g.stroke();
        g.save(); g.beginPath(); g.arc(cx, cy, 140, 0, 2 * Math.PI); g.clip(); g.drawImage(img, cx - 140, cy - 140, 280, 280); g.restore();
        function curvo(txt, raio, centro, baixo) {
          g.font = '700 34px Georgia, "Times New Roman", serif'; g.fillStyle = grad; g.textAlign = 'center'; g.textBaseline = 'middle';
          var esp = 3, larg = txt.split('').map(function (ch) { return g.measureText(ch).width + esp; });
          var total = larg.reduce(function (a, b) { return a + b; }, 0) / raio, ang = centro + (baixo ? total / 2 : -total / 2);
          txt.split('').forEach(function (ch, i) {
            var a = larg[i] / raio, meio = baixo ? ang - a / 2 : ang + a / 2;
            g.save(); g.translate(cx + raio * Math.cos(meio), cy + raio * Math.sin(meio));
            g.rotate(meio + (baixo ? -Math.PI / 2 : Math.PI / 2)); g.fillText(ch, 0, 0); g.restore();
            ang = baixo ? ang - a : ang + a;
          });
        }
        curvo('FCOSTA AVALIADOR', 176, -Math.PI / 2, false);
        curvo((P.cnai || 'CNAI 52708').toUpperCase(), 176, Math.PI / 2, true);
        g.fillStyle = grad; [Math.PI, 0].forEach(function (a) { g.beginPath(); g.arc(cx + 176 * Math.cos(a), cy + 176 * Math.sin(a), 6, 0, 2 * Math.PI); g.fill(); });
        PP.selo = c.toDataURL('image/png');
      } catch (e) { PP.selo = null; }
      if (cb) cb();
    };
    img.onerror = function () { if (cb) cb(); };
    img.src = '/logo-fcosta.png';
  };
  h.cab = function (P) {
    return '<div class="cab"><img src="' + (PP.selo || '/logo-fcosta.png') + '" alt="FCosta Avaliador ' + esc(P.cnai) + '"><div><b>' + esc(P.nome) + '</b><small>' + esc(P.titulo) + ' · ' + esc(P.creci) + ' · ' + esc(P.cnai) +
      '<br>WhatsApp ' + esc(P.whats) + (P.email ? ' · ' + esc(P.email) : '') + ' · ' + esc(P.site) + '</small></div></div>';
  };
  h.t = function (t, s) { return '<h1>' + esc(t) + '</h1>' + (s ? '<div class="sub">' + s + '</div>' : ''); };
  h.s = function (t) { return '<h3>' + t + '</h3>'; };
  h.p = function (t) { return t ? '<p>' + esc(t).replace(/\n/g, '<br>') + '</p>' : ''; };
  h.v = function (x) { return (x == null || x === '') ? '<span class="branco"></span>' : esc(x); };
  h.kv = function (rows, branco) {
    var r = rows.filter(function (x) { return x && (branco || (x[1] != null && x[1] !== '')); });
    if (!r.length) return '';
    return '<table class="kv">' + r.map(function (x) {
      return '<tr><td>' + esc(x[0]) + '</td><td>' + (x[2] ? x[1] : h.v(x[1])) + '</td></tr>';
    }).join('') + '</table>';
  };
  h.tab = function (cab, linhas, num) {
    num = num || [];
    return '<table><tr>' + cab.map(function (c, i) { return '<th' + (num.indexOf(i) >= 0 ? ' class="n"' : '') + '>' + c + '</th>'; }).join('') + '</tr>' +
      linhas.map(function (l) { return '<tr>' + l.map(function (c, i) { return '<td' + (num.indexOf(i) >= 0 ? ' class="n"' : '') + '>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
  };
  h.valor = function (v, legenda) { return '<div class="valor"><b>' + v + '</b><span>' + (legenda || '') + '</span></div>'; };
  h.ck = function (itens, marcados) {
    marcados = marcados || [];
    return '<ul class="ck">' + itens.map(function (t, i) { return '<li' + (marcados.indexOf(i) >= 0 ? ' class="x"' : '') + '>' + esc(t) + '</li>'; }).join('') + '</ul>';
  };
  h.nota = function (t) { return '<div class="nota">' + t + '</div>'; };
  h.ass = function (P, local, data, quem) {
    return '<div class="ass-bloco" style="break-inside:avoid;page-break-inside:avoid"><p style="text-align:right;margin-top:16px">' + esc(local || P.cidade) + ', ' + PP.dataExtenso(data) + '.</p>' +
      '<div class="ass">' + (P.assinatura && !quem ? '<img src="' + P.assinatura + '" alt="">' : '') + '<div class="l"><b>' + esc(quem || P.nome) + '</b>' +
      (quem ? '' : '<small>' + esc(P.titulo) + '</small><small>' + esc(P.creci) + ' · ' + esc(P.cnai) + '</small>') + '</div></div></div>';
  };
  h.ass2 = function (n1, s1, n2, s2) {
    return '<div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:34px">' + [[n1, s1], [n2, s2]].map(function (a) {
      return '<div class="ass" style="flex:1;min-width:200px;margin-top:0"><div class="l" style="width:90%"><b>' + h.v(a[0]) + '</b><small>' + esc(a[1]) + '</small></div></div>';
    }).join('') + '</div>';
  };
  h.rod = function (P) { return '<div class="rod">' + esc(P.nome) + ' · ' + esc(P.creci) + ' · ' + esc(P.cnai) + ' · ' + esc(P.site) + '</div>'; };
  h.fotos = function (lista) {
    if (!lista || !lista.length) return '';
    return '<div class="fotos-doc">' + lista.map(function (f, i) {
      return '<figure><img src="' + f.src + '" alt=""><figcaption>Foto ' + (i + 1) + (f.leg ? ' – ' + esc(f.leg) : '') + '</figcaption></figure>';
    }).join('') + '</div>';
  };

  /* ---------- formulário ---------- */
  function rotulo(c) { return '<label>' + esc(c.l) + '</label>'; }
  function campoHTML(c, val, path) {
    var at = ' data-p="' + esc(path) + '"', w = c.w === 'm' ? ' m' : '';
    var aj = c.aj ? '<div class="aj">' + c.aj + '</div>' : '';
    switch (c.t) {
      case 'sec': return '<div class="c f-sec">' + esc(c.l) + '</div>';
      case 'acao': return '<div class="c"><button class="bt p ouro" data-acao="' + esc(c.a) + '">' + esc(c.l) + '</button></div>';
      case 'info': return '<div class="c"><p class="dica">' + c.l + '</p></div>';
      case 'area': return '<div class="c">' + rotulo(c) + '<textarea' + at + ' placeholder="' + esc(c.ph || '') + '">' + esc(val) + '</textarea>' + aj + '</div>';
      case 'sel': return '<div class="c' + w + '">' + rotulo(c) + '<select' + at + '>' + c.o.map(function (o) {
        var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o;
        return '<option value="' + esc(v) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(t) + '</option>';
      }).join('') + '</select>' + aj + '</div>';
      case 'chk': return '<div class="c">' + (c.l ? rotulo(c) : '') + c.o.map(function (o, i) {
        var on = Array.isArray(val) && val.indexOf(i) >= 0;
        return '<label class="chk"><input type="checkbox" data-chk="' + i + '"' + at + (on ? ' checked' : '') + '><span>' + esc(o) + '</span></label>';
      }).join('') + aj + '</div>';
      case 'fotos': return '<div class="c">' + rotulo(c) + '<input type="file" accept="image/*" multiple data-fotos="1"' + at + '>' + aj +
        '<div class="fotos">' + (val || []).map(function (f, i) {
          return '<figure><img src="' + f.src + '" alt=""><input type="text" placeholder="Legenda" value="' + esc(f.leg || '') + '" data-p="' + esc(path) + '.' + i + '.leg">' +
            '<button class="bt peq perigo" data-delfoto="' + i + '" data-pf="' + esc(path) + '" style="margin-top:6px;width:100%">Tirar foto</button></figure>';
        }).join('') + '</div></div>';
      case 'tab': return '<div class="c">' + rotulo(c) + aj + (val || []).map(function (row, i) {
        return '<div class="linha"><div class="linha-t"><span>' + esc(c.item || 'Item') + ' ' + (i + 1) + '</span><button class="bt peq perigo" data-del="' + i + '" data-pt="' + esc(path) + '">Remover</button></div><div class="fl">' +
          c.cols.map(function (cc) { return campoHTML(cc, row[cc.k] == null ? '' : row[cc.k], path + '.' + i + '.' + cc.k); }).join('') + '</div></div>';
      }).join('') + '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="bt p" data-add="' + esc(path) + '">+ Adicionar ' + esc((c.item || 'item').toLowerCase()) + '</button>' +
        (c.acao ? '<button class="bt p" data-acao="' + esc(c.acao[0]) + '">' + esc(c.acao[1]) + '</button>' : '') + '</div></div>';
      default:
        var tipo = c.t === 'date' ? 'date' : c.t === 'time' ? 'time' : 'text';
        var mode = (c.t === 'num' || c.t === 'money') ? ' inputmode="decimal"' : (c.t === 'tel' ? ' inputmode="tel"' : '');
        return '<div class="c' + w + '">' + rotulo(c) + '<input type="' + tipo + '"' + mode + at + ' value="' + esc(val) + '" placeholder="' + esc(c.ph || (c.t === 'money' ? 'R$ 0,00' : '')) + '">' + aj + '</div>';
    }
  }
  PP.campos = function (it, d) { return typeof it.campos === 'function' ? it.campos(d) : (it.campos || []); };
  PP.formHTML = function (it, d) {
    return '<div class="fl">' + PP.campos(it, d).filter(function (c) { return !c.se || c.se(d); }).map(function (c) {
      var v = d[c.k]; if (v == null) v = c.t === 'tab' || c.t === 'fotos' || c.t === 'chk' ? [] : '';
      return campoHTML(c, v, c.k || '');
    }).join('') + '</div>';
  };
  PP.padroes = function (it) {
    var d = {};
    PP.campos(it, d).forEach(function (c) { if (c.v != null) d[c.k] = JSON.parse(JSON.stringify(c.v)); });
    if (it.inicio) it.inicio(d);
    return d;
  };
  function setPath(obj, path, val) {
    var p = path.split('.'), o = obj;
    for (var i = 0; i < p.length - 1; i++) { if (o[p[i]] == null) o[p[i]] = /^\d+$/.test(p[i + 1]) ? [] : {}; o = o[p[i]]; }
    o[p[p.length - 1]] = val;
  }
  function getPath(obj, path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }
  PP.novaLinha = function (it, path) {
    var p = path.split('.'), def = null, lista = PP.campos(it, {});
    // encontra a definição da tabela (só 1 nível)
    lista.forEach(function (c) { if (c.k === p[0]) def = c; });
    var o = {}; if (def && def.cols) def.cols.forEach(function (cc) { if (cc.v != null) o[cc.k] = cc.v; });
    return o;
  };

  /* compressão de fotos */
  PP.lerFoto = function (file, max, cb) {
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var s = Math.min(1, (max || 1100) / Math.max(img.width, img.height));
        var cv = document.createElement('canvas'); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        cb(cv.toDataURL('image/jpeg', 0.72));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  };

  /* ---------- PDF ---------- */
  var h2p = null;
  function carregaH2P(cb) {
    if (window.html2pdf) return cb();
    if (h2p) return h2p.push(cb);
    h2p = [cb];
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    s.onload = function () { h2p.forEach(function (f) { f(); }); };
    s.onerror = function () { PP.aviso('Sem internet para gerar o PDF. Use Imprimir.'); h2p = null; };
    document.head.appendChild(s);
  }
  PP.pdf = function (nome, compartilhar) {
    var el = document.querySelector('#vista .folha');
    if (!el) return;
    PP.aviso('Gerando PDF…');
    carregaH2P(function () {
      var clone = el.cloneNode(true);
      clone.querySelectorAll('.msg-bts').forEach(function (b) { b.remove(); });
      clone.style.maxWidth = '190mm'; clone.style.padding = '0'; clone.style.fontSize = '10.5pt';
      var box = document.createElement('div'); box.style.cssText = 'position:absolute;left:-10000px;top:0;width:190mm;background:#fff';
      var yAntes = window.scrollY; window.scrollTo(0, 0);
      box.appendChild(clone); document.body.appendChild(box);
      var opt = {
        margin: [12, 10, 12, 10], filename: (nome || 'documento') + '.pdf',
        image: { type: 'jpeg', quality: 0.92 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.valor', '.ass-bloco', '.ass', 'figure', 'h3', '.msg'] }
      };
      var w = html2pdf().set(opt).from(clone);
      if (compartilhar && navigator.canShare) {
        w.outputPdf('blob').then(function (blob) {
          box.remove(); window.scrollTo(0, yAntes);
          var f = new File([blob], opt.filename, { type: 'application/pdf' });
          if (navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: nome }).catch(function () {});
          else baixar(blob, opt.filename);
        });
      } else {
        w.save().then(function () { box.remove(); window.scrollTo(0, yAntes); });
      }
    });
  };
  function baixar(blob, nome) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  PP.baixarTexto = function (texto, nome, tipo) { baixar(new Blob([texto], { type: tipo || 'text/plain' }), nome); };

  /* ---------- telas ---------- */
  var app, estado = { it: null, d: null, modo: 'completa', aba: 'form' }, tPrev = null;

  function telaInicio() {
    var P = PP.perfil();
    var cont = {}; PP.ordem.forEach(function (id) { var c = PP.itens[id].cat; cont[c] = (cont[c] || 0) + 1; });
    app.innerHTML = '<section class="hero"><h1>Olá, ' + esc(P.nome.split(' ')[0]) + '. O que vamos <em>avaliar</em> hoje?</h1>' +
      '<p>Escolha um modelo, preencha no celular e gere o PDF pronto para enviar ao cliente. Seus dados já entram sozinhos.</p>' +
      '<input class="busca" id="busca" type="search" placeholder="Procurar: casa, terreno, recibo, penhora…"></section>' +
      '<div id="res"></div><div class="grade" id="cats">' + PP.cats.map(function (c) {
        return '<a class="cart" href="#/cat/' + c.id + '"><div class="ic">' + c.ic + '</div><h3>' + esc(c.nome) + '</h3><p>' + esc(c.sub) + '</p><span class="selo">' + esc(c.selo) + ' · ' + (cont[c.id] || 0) + '</span></a>';
      }).join('') + '</div>' +
      '<div class="grade" style="margin-top:12px"><a class="cart" href="#/item/ptam-casa?exemplo=1"><div class="ic">⭐</div><h3>PTAM de exemplo (casa)</h3><p>Um PTAM preenchido de A a Z para você ver como fica.</p></a>' +
      '<a class="cart" href="#/item/guia-modelo"><div class="ic">🧭</div><h3>Qual modelo usar?</h3><p>Guia curto para escolher e adaptar o modelo certo.</p></a></div>';
    var b = document.getElementById('busca');
    b.addEventListener('input', function () {
      var q = b.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      var res = document.getElementById('res');
      if (!q) { res.innerHTML = ''; document.getElementById('cats').style.display = ''; return; }
      document.getElementById('cats').style.display = 'none';
      var achou = PP.ordem.map(function (id) { return PP.itens[id]; }).filter(function (it) {
        return (it.titulo + ' ' + (it.desc || '')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').indexOf(q) >= 0;
      });
      res.innerHTML = '<div class="grade" style="margin-bottom:14px">' + (achou.length ? achou.map(cartItem).join('') : '<p class="dica">Nada encontrado.</p>') + '</div>';
    });
  }
  function cartItem(it) {
    return '<a class="cart" href="#/item/' + it.id + '"><div class="ic">' + (it.ic || '📄') + '</div><h3>' + esc(it.titulo) + '</h3>' + (it.desc ? '<p>' + esc(it.desc) + '</p>' : '') + '</a>';
  }
  function telaCat(id) {
    var c = PP.cats.filter(function (x) { return x.id === id; })[0];
    if (!c) return telaInicio();
    var itens = PP.ordem.map(function (k) { return PP.itens[k]; }).filter(function (it) { return it.cat === id; });
    app.innerHTML = '<div class="titsec"><a class="bt p" href="#/">← Início</a><h2>' + c.ic + ' ' + esc(c.nome) + '</h2><p>' + esc(c.sub) + '</p></div>' +
      '<div class="grade">' + itens.map(cartItem).join('') + '</div>';
  }
  function telaSalvos() {
    var arq = LS.get('arq', []);
    app.innerHTML = '<div class="titsec"><a class="bt p" href="#/">← Início</a><h2>📁 Documentos salvos</h2><p>Ficam guardados neste aparelho. Faça uma cópia de segurança de vez em quando.</p></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><button class="bt p" id="bk">⬇️ Cópia de segurança</button><label class="bt p">⬆️ Restaurar cópia<input type="file" id="rs" accept=".json,application/json" hidden></label></div>' +
      (arq.length ? '<div class="grade lista-salvos">' + arq.slice().reverse().map(function (a) {
        var it = PP.itens[a.item];
        return '<div class="cart"><div class="ic">' + (it ? it.ic : '📄') + '</div><h3>' + esc(a.nome) + '</h3><p>' + esc(it ? it.titulo : a.item) + ' · ' + esc(a.quando) + '</p>' +
          '<div class="bts"><button class="bt peq ouro" data-abre="' + a.id + '">Abrir</button><button class="bt peq perigo" data-apaga="' + a.id + '">Apagar</button></div></div>';
      }).join('') + '</div>' : '<p class="dica">Nenhum documento salvo ainda. Dentro de qualquer modelo, toque em <b>Salvar</b>.</p>');
    app.onclick = function (e) {
      var ab = e.target.getAttribute('data-abre'), ap = e.target.getAttribute('data-apaga');
      if (ab) {
        var a = LS.get('arq', []).filter(function (x) { return String(x.id) === ab; })[0];
        if (a) { LS.set('d:' + a.item, a.d); location.hash = '#/item/' + a.item; }
      }
      if (ap) PP.janela({ titulo: 'Apagar este documento?', texto: 'Não dá para desfazer.', ok: 'Apagar', sim: function () {
        LS.set('arq', LS.get('arq', []).filter(function (x) { return String(x.id) !== ap; })); telaSalvos();
      } });
      if (e.target.id === 'bk') {
        var tudo = {}; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf('pp:') === 0) tudo[k] = localStorage.getItem(k); } } catch (er) {}
        PP.baixarTexto(JSON.stringify(tudo), 'central-avaliador-copia-' + PP.hoje() + '.json', 'application/json');
      }
    };
    document.getElementById('rs').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      var r = new FileReader(); r.onload = function () {
        try { var o = JSON.parse(r.result); Object.keys(o).forEach(function (k) { if (k.indexOf('pp:') === 0) localStorage.setItem(k, o[k]); }); PP.aviso('Cópia restaurada ✔'); telaSalvos(); }
        catch (er) { PP.aviso('Arquivo inválido'); }
      }; r.readAsText(f);
    };
  }

  /* ---------- tela de um item (formulário + documento) ---------- */
  function telaItem(id, q) {
    var it = PP.itens[id];
    if (!it) return telaInicio();
    var d = LS.get('d:' + id, null);
    if (!d) d = PP.padroes(it);
    if (q.exemplo && it.exemplo) d = JSON.parse(JSON.stringify(typeof it.exemplo === 'function' ? it.exemplo() : it.exemplo));
    estado = { it: it, d: d, modo: LS.get('modo:' + id, 'completa'), aba: it.soLeitura ? 'doc' : 'form' };
    var cat = PP.cats.filter(function (c) { return c.id === it.cat; })[0] || {};
    var bts = [];
    bts.push('<a class="bt p" href="#/cat/' + it.cat + '">←</a>');
    if (it.versoes) bts.push('<button class="bt p' + (estado.modo === 'completa' ? ' ativo' : '') + '" data-modo="completa">Completa</button><button class="bt p' + (estado.modo === 'resumida' ? ' ativo' : '') + '" data-modo="resumida">Resumida</button>');
    bts.push('<button class="bt p ouro" data-a="pdf">⬇️ PDF</button>');
    if (navigator.share) bts.push('<button class="bt p" data-a="share">📤 Enviar</button>');
    bts.push('<button class="bt p" data-a="print">🖨️ Imprimir</button>');
    if (!it.soLeitura) {
      bts.push('<button class="bt p" data-a="salvar">💾 Salvar</button>');
      if (it.exemplo) bts.push('<button class="bt p" data-a="exemplo">⭐ Exemplo</button>');
      bts.push('<button class="bt p perigo" data-a="limpar">🧹 Limpar</button>');
    }
    app.innerHTML = '<div id="vista"><div class="barra"><h2>' + (it.ic || '') + ' ' + esc(it.titulo) + '</h2><div class="acoes">' + bts.join('') + '</div></div>' +
      (it.soLeitura ? '' : '<div class="abas"><button class="bt p ativo" data-aba="form">✏️ Preencher</button><button class="bt p" data-aba="doc">📄 Ver documento</button></div>') +
      '<div class="duas"><div class="pane form-pane"' + (it.soLeitura ? ' style="display:none!important"' : '') + '>' + (it.desc ? '<p class="dica">' + esc(it.desc) + '</p>' : '') + '<div id="resumo"></div><div id="form"></div></div>' +
      '<div class="pane doc-pane"' + (it.soLeitura ? '' : ' style="display:none"') + '><div class="folha-wrap"><div class="folha" id="folha"></div></div></div></div></div>';
    desenhaForm(); desenhaDoc();
    var v = document.getElementById('vista');
    v.addEventListener('click', clique);
    v.addEventListener('input', digita);
    v.addEventListener('change', muda);
    window.scrollTo(0, 0);
  }
  function salvaRasc() { if (!LS.set('d:' + estado.it.id, estado.d)) PP.aviso('Memória cheia: tire algumas fotos ou apague salvos.'); }
  function desenhaForm() {
    var f = document.getElementById('form'); if (!f) return;
    var y = window.scrollY, fp = document.querySelector('.form-pane'), y2 = fp ? fp.scrollTop : 0;
    f.innerHTML = PP.formHTML(estado.it, estado.d);
    window.scrollTo(0, y); if (fp) fp.scrollTop = y2;
    desenhaResumo();
  }
  function desenhaResumo() {
    var r = document.getElementById('resumo'); if (!r) return;
    var t = estado.it.resumo ? estado.it.resumo(estado.d) : '';
    r.innerHTML = t ? '<div class="resumo">' + t + '</div>' : '';
  }
  function desenhaDoc() {
    var el = document.getElementById('folha'); if (!el) return;
    var P = PP.perfil(), it = estado.it;
    var html;
    try { html = it.render(estado.d, { P: P, modo: estado.modo, h: h }); }
    catch (e) { html = '<p>Erro ao montar o documento: ' + esc(e.message) + '</p>'; console.error(e); }
    el.innerHTML = (it.semCab ? '' : h.cab(P)) + html + (it.semRod ? '' : h.rod(P));
  }
  function agenda() { clearTimeout(tPrev); tPrev = setTimeout(function () { desenhaDoc(); desenhaResumo(); }, 250); }
  function digita(e) {
    var p = e.target.getAttribute('data-p'); if (!p || e.target.type === 'checkbox' || e.target.type === 'file') return;
    setPath(estado.d, p, e.target.value); salvaRasc(); agenda();
  }
  function muda(e) {
    var t = e.target, p = t.getAttribute('data-p'); if (!p) return;
    if (t.getAttribute('data-fotos')) {
      var files = Array.prototype.slice.call(t.files || []); if (!files.length) return;
      var lista = getPath(estado.d, p) || []; setPath(estado.d, p, lista);
      PP.aviso('Preparando fotos…');
      var falta = files.length;
      var tam = p.indexOf('.') > 0 ? 800 : 1100;
      files.forEach(function (f) { PP.lerFoto(f, tam, function (src) { lista.push({ src: src, leg: '' }); if (--falta === 0) { salvaRasc(); desenhaForm(); desenhaDoc(); } }); });
      return;
    }
    if (t.type === 'checkbox') {
      var arr = getPath(estado.d, p) || [], i = parseInt(t.getAttribute('data-chk'), 10);
      arr = arr.filter(function (x) { return x !== i; }); if (t.checked) arr.push(i);
      setPath(estado.d, p, arr); salvaRasc(); agenda(); return;
    }
    if (t.tagName === 'SELECT') { setPath(estado.d, p, t.value); salvaRasc(); desenhaForm(); desenhaDoc(); }
  }
  function clique(e) {
    var t = e.target.closest('button,[data-aba]'); if (!t) return;
    var it = estado.it, d = estado.d;
    if (t.hasAttribute('data-aba')) {
      estado.aba = t.getAttribute('data-aba');
      document.querySelectorAll('.abas .bt').forEach(function (b) { b.classList.toggle('ativo', b === t); });
      document.querySelector('.form-pane').style.display = estado.aba === 'form' ? '' : 'none';
      document.querySelector('.doc-pane').style.display = estado.aba === 'doc' ? '' : 'none';
      if (estado.aba === 'doc') desenhaDoc();
      return;
    }
    if (t.hasAttribute('data-modo')) {
      estado.modo = t.getAttribute('data-modo'); LS.set('modo:' + it.id, estado.modo);
      document.querySelectorAll('[data-modo]').forEach(function (b) { b.classList.toggle('ativo', b === t); });
      desenhaDoc(); return;
    }
    if (t.hasAttribute('data-add')) {
      var p = t.getAttribute('data-add'), l = getPath(d, p) || [];
      l.push(PP.novaLinha(it, p)); setPath(d, p, l); salvaRasc(); desenhaForm(); desenhaDoc(); return;
    }
    if (t.hasAttribute('data-del')) {
      var pt = t.getAttribute('data-pt'), i = +t.getAttribute('data-del'), l2 = getPath(d, pt) || [];
      l2.splice(i, 1); salvaRasc(); desenhaForm(); desenhaDoc(); return;
    }
    if (t.hasAttribute('data-delfoto')) {
      var pf = t.getAttribute('data-pf'), j = +t.getAttribute('data-delfoto'), l3 = getPath(d, pf) || [];
      l3.splice(j, 1); salvaRasc(); desenhaForm(); desenhaDoc(); return;
    }
    if (t.hasAttribute('data-acao')) {
      var fn = it.acoes && it.acoes[t.getAttribute('data-acao')];
      if (fn) { fn(d); salvaRasc(); desenhaForm(); desenhaDoc(); }
      return;
    }
    if (t.hasAttribute('data-copia')) { PP.copiar(t.closest('.msg').querySelector('.msg-t').innerText); return; }
    if (t.hasAttribute('data-zap')) { PP.wa(t.closest('.msg').querySelector('.msg-t').innerText, d.fone || ''); return; }
    var a = t.getAttribute('data-a'); if (!a) return;
    var nome = (it.nomeArquivo ? it.nomeArquivo(d) : it.titulo).replace(/[\\/:*?"<>|]+/g, '-');
    if (a === 'pdf') PP.pdf(nome);
    if (a === 'share') PP.pdf(nome, true);
    if (a === 'print') { desenhaDoc(); var dp = document.querySelector('.doc-pane'); var antes = dp.style.display; dp.style.display = ''; window.print(); dp.style.display = antes; }
    if (a === 'limpar') PP.janela({ titulo: 'Começar em branco?', texto: 'Apaga o que está preenchido neste modelo (os salvos continuam guardados).', ok: 'Limpar', sim: function () {
      estado.d = PP.padroes(it); salvaRasc(); desenhaForm(); desenhaDoc();
    } });
    if (a === 'exemplo') PP.janela({ titulo: 'Carregar o exemplo?', texto: 'Troca o que está preenchido pelos dados de exemplo.', ok: 'Carregar', sim: function () {
      estado.d = JSON.parse(JSON.stringify(typeof it.exemplo === 'function' ? it.exemplo() : it.exemplo)); salvaRasc(); desenhaForm(); desenhaDoc();
    } });
    if (a === 'salvar') PP.janela({ titulo: 'Salvar documento', texto: 'Dê um nome para achar depois.', campo: nome + ' ' + PP.dt(PP.hoje()), ok: 'Salvar', sim: function (n) {
      var arq = LS.get('arq', []);
      arq.push({ id: Date.now(), item: it.id, nome: n || nome, quando: new Date().toLocaleString('pt-BR'), d: d });
      if (LS.set('arq', arq)) PP.aviso('Salvo ✔ (veja em Salvos)'); else PP.aviso('Memória cheia: apague salvos antigos.');
    } });
  }

  /* ---------- meus dados ---------- */
  var itPerfil = {
    id: '_perfil', cat: '', ic: '👤', titulo: 'Meus dados', semRod: true,
    desc: 'Estes dados entram sozinhos em todos os documentos. Ficam guardados neste aparelho.',
    campos: [
      { t: 'sec', l: 'Identificação' },
      { k: 'nome', l: 'Nome completo' }, { k: 'titulo', l: 'Como aparece abaixo do nome' },
      { k: 'creci', l: 'CRECI', w: 'm' }, { k: 'cnai', l: 'CNAI', w: 'm' },
      { k: 'whats', l: 'WhatsApp', t: 'tel', w: 'm' }, { k: 'email', l: 'E-mail', w: 'm' },
      { k: 'site', l: 'Site', w: 'm' }, { k: 'cidade', l: 'Cidade (para a data)', w: 'm' },
      { k: 'endereco', l: 'Endereço do escritório (opcional)' }, { k: 'pix', l: 'Chave PIX (para recibos e propostas)' },
      { k: 'bio', l: 'Apresentação curta (portfólio)', t: 'area' },
      { t: 'sec', l: 'Assinatura' },
      { k: 'assinatura', l: 'Foto da sua assinatura (papel branco, caneta azul ou preta)', t: 'fotos', aj: 'Use uma foto só. Ela aparece sobre a linha de assinatura.' }
    ],
    render: function (d, c) { return h.t('Prévia do cabeçalho') + h.p('É assim que seus dados aparecem nos documentos.') + h.ass(c.P, c.P.cidade, PP.hoje()); }
  };
  function telaPerfil() {
    var p = PP.perfil(); var d = JSON.parse(JSON.stringify(p));
    d.assinatura = p.assinatura ? [{ src: p.assinatura, leg: '' }] : [];
    estado = { it: itPerfil, d: d, modo: 'completa', aba: 'form' };
    app.innerHTML = '<div id="vista"><div class="titsec"><a class="bt p" href="#/">← Início</a><h2>👤 Meus dados</h2><p>' + esc(itPerfil.desc) + '</p></div>' +
      '<div class="duas"><div class="pane form-pane"><div id="form"></div><button class="bt ouro" id="grava" style="width:100%;margin-top:14px">Guardar meus dados</button></div><div class="pane doc-pane"><div class="folha-wrap"><div class="folha" id="folha"></div></div></div></div></div>';
    desenhaForm(); desenhaDoc();
    var v = document.getElementById('vista');
    v.addEventListener('input', function (e) { digita(e); });
    v.addEventListener('change', function (e) {
      var t = e.target;
      if (t.getAttribute('data-fotos')) {
        var f = t.files[0]; if (!f) return;
        PP.lerFoto(f, 600, function (src) { estado.d.assinatura = [{ src: src.replace('image/jpeg', 'image/jpeg'), leg: '' }]; desenhaForm(); });
      }
    });
    v.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-delfoto')) { estado.d.assinatura = []; desenhaForm(); }
      if (e.target.id === 'grava') {
        var o = {}; for (var k in PP.perfilPadrao) o[k] = estado.d[k];
        o.assinatura = (estado.d.assinatura && estado.d.assinatura[0]) ? estado.d.assinatura[0].src : '';
        LS.set('perfil', o); PP.aviso('Dados guardados ✔'); PP.fazSelo(desenhaDoc);
      }
    });
    // o rascunho do perfil não deve ser salvo como item
    salvaRasc = function () {};
  }
  var salvaRascOriginal = salvaRasc;

  function rota() {
    salvaRasc = salvaRascOriginal;
    app.onclick = null;
    var hsh = location.hash.replace(/^#\/?/, ''), q = {};
    var partes = hsh.split('?'); hsh = partes[0];
    (partes[1] || '').split('&').forEach(function (kv) { var x = kv.split('='); if (x[0]) q[x[0]] = decodeURIComponent(x[1] || ''); });
    var seg = hsh.split('/');
    // troca o nó para limpar ouvintes antigos
    var novo = app.cloneNode(false); app.parentNode.replaceChild(novo, app); app = novo;
    if (seg[0] === 'cat') telaCat(seg[1]);
    else if (seg[0] === 'item') telaItem(seg[1], q);
    else if (seg[0] === 'salvos') telaSalvos();
    else if (seg[0] === 'perfil') telaPerfil();
    else telaInicio();
  }

  PP.iniciar = function () {
    app = document.getElementById('app');
    window.addEventListener('hashchange', rota);
    rota();
    PP.fazSelo(function () { if (document.getElementById('folha')) desenhaDoc(); });
  };
})();
