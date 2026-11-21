/* ptam-pro-calc.js — contas e as 10 planilhas que calculam sozinhas */
(function () {
  'use strict';
  var PP = window.PP, h = PP.h, esc = PP.esc, num = PP.num, R = PP.R, N = PP.N, C = PP.calc;
  function F(k, l, t, x) { var o = { k: k, l: l, t: t || 'text' }; if (x) for (var i in x) o[i] = x[i]; return o; }
  function m(k, l, t, x) { x = x || {}; x.w = 'm'; return F(k, l, t, x); }
  function fat(v) { var x = num(v); return x > 0 ? x : 1; }
  var OPT_HEID = PP.HEID.map(function (e) { return [e[0], e[1]]; });

  /* ---------- contas ---------- */
  C.media = function (a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; };
  C.desvio = function (a) { if (a.length < 2) return 0; var md = C.media(a); return Math.sqrt(a.reduce(function (s, x) { return s + (x - md) * (x - md); }, 0) / (a.length - 1)); };
  C.mediana = function (a) { if (!a.length) return 0; var s = a.slice().sort(function (x, y) { return x - y; }), k = Math.floor(s.length / 2); return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2; };
  C.saneia = function (vals) {
    // mantém os valores entre 70% e 130% da média, repetindo até estabilizar
    var dentro = vals.map(function () { return true; }), md = C.media(vals);
    for (var it = 0; it < 6; it++) {
      var lim = vals.filter(function (v, i) { return dentro[i]; }); md = C.media(lim);
      var novo = vals.map(function (v) { return v >= md * 0.7 && v <= md * 1.3; });
      if (!novo.some(Boolean)) break;
      var igual = novo.every(function (x, i) { return x === dentro[i]; });
      dentro = novo; if (igual) break;
    }
    var k = vals.filter(function (v, i) { return dentro[i]; });
    return { dentro: dentro, media: C.media(vals), mediaSan: C.media(k), n: vals.length, nSan: k.length, min: k.length ? Math.min.apply(null, k) : 0, max: k.length ? Math.max.apply(null, k) : 0 };
  };
  C.homog = function (rows, areaAval, usarArea) {
    var linhas = [];
    (rows || []).forEach(function (r) {
      var a = num(r.area), p = num(r.preco);
      if (!a || !p) return;
      var vu = p / a, fa = 1;
      if (usarArea && areaAval) { var q = a / areaAval; fa = Math.pow(q, Math.abs(1 - q) <= 0.3 ? 0.25 : 0.125); }
      var f = fat(r.fo) * fat(r.fl) * fat(r.fp) * fat(r.fc) * fat(r.fx) * fat(r.ft) * fat(r.fe) * fat(r.fg);
      linhas.push({ r: r, vu: vu, fa: fa, vh: vu * f * fa });
    });
    var s = C.saneia(linhas.map(function (l) { return l.vh; }));
    linhas.forEach(function (l, i) { l.ok = s.dentro[i]; });
    s.linhas = linhas; s.cv = C.media(linhas.map(function (l) { return l.vh; })) ? C.desvio(linhas.filter(function (l) { return l.ok; }).map(function (l) { return l.vh; })) / s.mediaSan * 100 : 0;
    return s;
  };
  C.tabelaHomog = function (hm, un, loc, extras) {
    if (!hm.linhas.length) return h.p('Nenhum comparável com área e preço preenchidos.');
    extras = extras || [];
    var cab = ['#', 'Imóvel e fatores', 'Área', loc ? 'Aluguel' : 'Preço', 'R$/' + un, 'Homog.'];
    var lin = hm.linhas.map(function (l, i) {
      var r = l.r, fs = ['Of ' + N(fat(r.fo), 2), 'Loc ' + N(fat(r.fl), 2), 'Pad ' + N(fat(r.fp), 2), 'Cons ' + N(fat(r.fc), 2)];
      if (r.ft) fs.push('Test ' + N(fat(r.ft), 2)); if (r.fg) fs.push('Topo ' + N(fat(r.fg), 2)); if (r.fe) fs.push('Esq ' + N(fat(r.fe), 2));
      if (fat(r.fx) !== 1) fs.push('Out ' + N(fat(r.fx), 2)); if (l.fa !== 1) fs.push('Área ' + N(l.fa, 3));
      var cls = l.ok ? '' : ' class="risc"';
      return [String(i + 1), '<span' + cls + '>' + esc(r.end || '—') + '</span>' + (r.fonte ? '<br><small>' + esc(r.fonte) + '</small>' : '') + '<br><small style="color:#6b6457">' + fs.join(' · ') + '</small>', N(num(r.area), 0), N(num(r.preco), 0), N(l.vu, 0), '<span' + cls + '>' + N(l.vh, 0) + '</span>'];
    });
    return h.tab(cab, lin, [2, 3, 4, 5]) + '<p style="font-size:8.5pt;color:#6b6457">Valores em R$. Homog. = valor por ' + un + ' depois dos ajustes.</p>' + (hm.nSan < hm.n ? h.nota('Valores riscados ficaram fora do intervalo de 30% em torno da média e foram descartados (amostra saneada).') : '') +
      (hm.nSan < 3 ? h.nota('Atenção: menos de 3 comparáveis válidos. Procure mais imóveis para dar segurança ao valor.') : '');
  };
  C.fotosComps = function (rows, titulo) {
    var f = [];
    (rows || []).forEach(function (r, i) { (r.foto || []).forEach(function (x) { f.push({ src: x.src, leg: 'Comparável ' + (i + 1) + (r.end ? ' – ' + r.end : '') + (x.leg ? ' (' + x.leg + ')' : '') }); }); });
    if (!f.length) return '';
    return (titulo ? h.s(titulo) : '') + '<div class="fotos-doc">' + f.map(function (x) { return '<figure><img src="' + x.src + '" alt=""><figcaption>' + esc(x.leg) + '</figcaption></figure>'; }).join('') + '</div>';
  };
  C.ross = function (idade, vida, estado) {
    var x = vida ? Math.min(1, idade / vida) : 0, kr = 0.5 * (x + x * x);
    var e = PP.HEID.filter(function (z) { return z[0] === estado; })[0], c = e ? e[2] / 100 : 0;
    return { x: x, kr: kr, c: c, K: kr + (1 - kr) * c };
  };
  C.evolutivo = function (o) {
    var vt = o.at * o.vt, vn = o.ac * o.cub, rs = C.ross(o.idade, o.vida, o.estado), res = (o.res || 0) / 100;
    var dep = (1 - res) * rs.K, vc = vn * (1 - dep), valor = (vt + vc) * (o.fc || 1);
    return {
      valor: valor, vt: vt, vn: vn, vc: vc, K: rs.K,
      memoria: h.tab(['Parcela', 'Conta', 'Valor'], [
        ['Terreno', N(o.at, 2) + ' m² × ' + R(o.vt), R(vt)],
        ['Construção nova', N(o.ac, 2) + ' m² × ' + R(o.cub), R(vn)],
        ['Depreciação (Ross-Heidecke)', 'idade ' + N(o.idade, 0) + ' de ' + N(o.vida, 0) + ' anos (' + N(rs.x * 100, 1) + '%), estado ' + esc(o.estado || '') + ' → ' + N(rs.K * 100, 2) + '% sobre ' + N(100 - res * 100, 0) + '% depreciável', '– ' + R(vn * dep)],
        ['Construção depreciada', '', R(vc)],
        ['Fator de comercialização', '× ' + N(o.fc || 1, 2), ''],
        ['<b>Valor do imóvel</b>', '(terreno + construção) × fator', '<b>' + R(valor) + '</b>']], [2])
    };
  };
  C.renda = function (o) {
    var bruta = o.aluguel * 12, efet = bruta * (1 - o.vac / 100), liq = efet - o.desp, valor = o.taxa ? liq / (o.taxa / 100) : 0;
    return { valor: valor, liq: liq, memoria: h.tab(['Item', 'Valor'], [['Renda bruta anual (' + R(o.aluguel) + ' × 12)', R(bruta)], ['Menos vacância/inadimplência (' + N(o.vac, 1) + '%)', R(efet)], ['Menos despesas do proprietário', '– ' + R(o.desp)], ['Renda líquida anual', R(liq)], ['Taxa de capitalização', N(o.taxa, 2) + '% ao ano'], ['<b>Valor (renda líquida ÷ taxa)</b>', '<b>' + R(valor) + '</b>']], [1]) };
  };
  C.involutivo = function (o) {
    var vgv = o.area * o.preco, desp = vgv * o.desp / 100, luc = vgv * o.lucro / 100, valor = vgv - desp - luc - o.custo;
    return { valor: Math.max(0, valor), vgv: vgv, memoria: h.tab(['Item', 'Valor'], [['Valor geral de vendas (' + N(o.area, 2) + ' m² × ' + R(o.preco) + ')', R(vgv)], ['Despesas, impostos e corretagem (' + N(o.desp, 1) + '%)', '– ' + R(desp)], ['Lucro do incorporador (' + N(o.lucro, 1) + '%)', '– ' + R(luc)], ['Custo total da obra', '– ' + R(o.custo)], ['<b>Valor do terreno</b>', '<b>' + R(Math.max(0, valor)) + '</b>']], [1]) + (valor < 0 ? h.nota('O resultado deu negativo: o empreendimento não se paga com esses números.') : '') };
  };
  function resultado(d, valor, legenda) {
    var mg = d.margem === '' || d.margem == null ? 0 : num(d.margem) / 100, v = d.arred === 'nao' ? valor : PP.arred(valor);
    return h.valor(R(v), legenda || '(' + PP.extenso(v) + ')') + (mg ? h.kv([['Faixa (± ' + N(mg * 100, 0) + '%)', R(v * (1 - mg)) + ' a ' + R(v * (1 + mg))]]) : '');
  }
  var RES = [m('margem', 'Faixa (± %)', 'num', { v: '10' }), m('arred', 'Arredondar', 'sel', { o: [['sim', 'Sim'], ['nao', 'Não']] })];
  function ident() { return [F('titulo_c', 'Referência (imóvel / cliente)', 'text', { ph: 'ex.: Casa Rua X – Sr. João' })]; }
  function topo(d, t) { return h.t(t, d.titulo_c ? esc(d.titulo_c) : 'Memória de cálculo'); }

  /* 1. comparativo direto */
  PP.add({
    id: 'calc-comparativo', cat: 'calc', ic: '⚖️', titulo: 'Comparativo direto (homogeneização por fatores)',
    desc: 'Compare com imóveis parecidos. Ajusta pelos fatores, tira os fora da curva e dá o valor.',
    campos: ident().concat([m('area', 'Área do imóvel avaliado', 'num'), m('un', 'Unidade', 'sel', { o: ['m²', 'ha'] }), F('farea', 'Ajustar pela diferença de área', 'sel', { o: [['sim', 'Sim'], ['nao', 'Não']] }),
      F('comps', 'Comparáveis', 'tab', { item: 'Comparável', acao: ['banco', '📥 Trazer do banco de comparáveis'], aj: 'Fatores: 1,00 = igual ao avaliado; maior que 1 = comparável pior; menor que 1 = comparável melhor.',
        cols: [F('end', 'Endereço / descrição'), m('fonte', 'Fonte', 'text'), m('area', 'Área', 'num'), m('preco', 'Preço (R$)', 'money'), m('fo', 'Fator oferta', 'num', { v: '0,90' }), m('fl', 'Fator localização', 'num', { v: '1,00' }), m('fp', 'Fator padrão', 'num', { v: '1,00' }), m('fc', 'Fator conservação', 'num', { v: '1,00' }), F('fx', 'Outros fatores', 'num', { v: '1,00' }), F('foto', 'Foto do imóvel', 'fotos', { aj: 'Print do anúncio ou foto da fachada' })] })]).concat(RES),
    inicio: function (d) { d.comps = [{}, {}, {}, {}].map(function () { return { fo: '0,90', fl: '1,00', fp: '1,00', fc: '1,00', fx: '1,00' }; }); },
    acoes: { banco: function (d) { PP.trazerBanco(d); } },
    resumo: function (d) { var hm = C.homog(d.comps, num(d.area), d.farea !== 'nao'); return hm.mediaSan ? 'Valor: <b class="v">' + R(PP.arred(hm.mediaSan * num(d.area))) + '</b><br>' + R(hm.mediaSan) + '/' + (d.un || 'm²') + ' · ' + hm.nSan + ' de ' + hm.n + ' usados' : 'Preencha área e comparáveis.'; },
    render: function (d) {
      var un = d.un || 'm²', hm = C.homog(d.comps, num(d.area), d.farea !== 'nao');
      return topo(d, 'Método Comparativo Direto') + C.tabelaHomog(hm, un) +
        h.kv([['Elementos válidos', hm.nSan + ' de ' + hm.n], ['Média homogeneizada', R(hm.media) + '/' + un], ['Média saneada', R(hm.mediaSan) + '/' + un], ['Menor e maior (saneados)', R(hm.min) + ' a ' + R(hm.max) + '/' + un], ['Coeficiente de variação', N(hm.cv, 1) + '%'], ['Área avaliada', N(num(d.area), 2) + ' ' + un]]) +
        resultado(d, hm.mediaSan * num(d.area)) + C.fotosComps(d.comps, 'Fotos dos comparáveis') + h.nota('Fator de área: (área do comparável ÷ área avaliada) elevado a 0,25 quando a diferença é de até 30%, e a 0,125 quando maior.');
    }
  });

  /* 2. média saneada */
  var CHAUV = { 3: 1.38, 4: 1.54, 5: 1.65, 6: 1.73, 7: 1.80, 8: 1.86, 9: 1.91, 10: 1.96, 11: 2.00, 12: 2.03, 13: 2.07, 14: 2.10, 15: 2.13, 16: 2.15, 17: 2.17, 18: 2.20, 19: 2.22, 20: 2.24, 25: 2.33, 30: 2.39, 40: 2.50, 50: 2.58 };
  function chauv(n) { var k = Object.keys(CHAUV).map(Number).filter(function (x) { return x <= n; }); return k.length ? CHAUV[Math.max.apply(null, k)] : 1.38; }
  PP.add({
    id: 'calc-saneada', cat: 'calc', ic: '🧹', titulo: 'Tratamento da amostra (média saneada)',
    desc: 'Cole os valores por m² e veja quais ficam e quais saem da média.',
    campos: ident().concat([F('crit', 'Critério', 'sel', { o: [['30', 'Intervalo de ±30% da média (mais usado)'], ['chauv', 'Critério de Chauvenet (estatístico)']] }),
      F('vals', 'Valores (R$/m²)', 'tab', { item: 'Valor', cols: [m('desc', 'Descrição', 'text'), m('v', 'R$/m²', 'money')] })]),
    inicio: function (d) { d.vals = [{}, {}, {}, {}, {}]; },
    calc: function (d) {
      var L = (d.vals || []).map(function (x) { return { desc: x.desc, v: num(x.v) }; }).filter(function (x) { return x.v > 0; });
      var vs = L.map(function (x) { return x.v; }), dentro, md = C.media(vs), dp = C.desvio(vs);
      if (d.crit === 'chauv') { var cr = chauv(vs.length); dentro = vs.map(function (v) { return !dp || Math.abs(v - md) / dp <= cr; }); }
      else dentro = C.saneia(vs).dentro;
      var k = vs.filter(function (v, i) { return dentro[i]; });
      return { L: L, dentro: dentro, md: md, dp: dp, ms: C.media(k), k: k };
    },
    resumo: function (d) { var r = PP.itens['calc-saneada'].calc(d); return r.k.length ? 'Média saneada: <b class="v">' + R(r.ms) + '</b>/m²<br>' + r.k.length + ' de ' + r.L.length + ' valores ficaram' : 'Digite os valores.'; },
    render: function (d) {
      var r = PP.itens['calc-saneada'].calc(d);
      return topo(d, 'Tratamento da Amostra') + h.tab(['#', 'Descrição', 'R$/m²', 'Situação'], r.L.map(function (x, i) { return [String(i + 1), esc(x.desc || ''), N(x.v, 2), r.dentro[i] ? 'Fica' : '<b>Sai</b>']; }), [2]) +
        h.kv([['Quantidade', String(r.L.length)], ['Média simples', R(r.md)], ['Mediana', R(C.mediana(r.L.map(function (x) { return x.v; })))], ['Desvio padrão', R(r.dp)], ['Coeficiente de variação', r.md ? N(r.dp / r.md * 100, 1) + '%' : ''],
          ['Critério', d.crit === 'chauv' ? 'Chauvenet (limite ' + N(chauv(r.L.length), 2) + ' desvios)' : '±30% em torno da média (repetido até estabilizar)'], ['Valores que ficaram', String(r.k.length)]]) +
        h.valor(R(r.ms) + '/m²', 'Média saneada') + h.nota('Coeficiente de variação até 15% indica amostra boa; acima de 30% a amostra está muito espalhada.');
    }
  });

  /* 3. evolutivo */
  PP.add({
    id: 'calc-evolutivo', cat: 'calc', ic: '🧱', titulo: 'Método evolutivo (custo de reedição)',
    desc: 'Terreno + construção depreciada × fator de comercialização.',
    campos: ident().concat([F('', 'Terreno', 'sec'), m('at', 'Área do terreno (m²)', 'num'), m('vt', 'Valor do terreno (R$/m²)', 'money'),
      F('', 'Construção', 'sec'), m('ac', 'Área construída (m²)', 'num'), m('cub', 'Custo novo (R$/m²)', 'money', { aj: 'CUB do Sinduscon + extras' }),
      m('idade', 'Idade aparente (anos)', 'num'), m('vida', 'Vida útil (anos)', 'num', { v: '70' }), m('estado', 'Estado (Heidecke)', 'sel', { o: OPT_HEID, v: 'c' }), m('res', 'Valor residual (%)', 'num', { v: '20' }),
      F('fc', 'Fator de comercialização', 'num', { v: '1,00' })]).concat(RES),
    run: function (d) { return C.evolutivo({ at: num(d.at), vt: num(d.vt), ac: num(d.ac), cub: num(d.cub), idade: num(d.idade), vida: num(d.vida), estado: d.estado, res: num(d.res), fc: fat(d.fc) }); },
    resumo: function (d) { var e = PP.itens['calc-evolutivo'].run(d); return e.valor ? 'Valor: <b class="v">' + R(PP.arred(e.valor)) + '</b><br>Terreno ' + R(e.vt) + ' · Construção ' + R(e.vc) : 'Preencha terreno e construção.'; },
    render: function (d) { var e = PP.itens['calc-evolutivo'].run(d); return topo(d, 'Método Evolutivo') + e.memoria + resultado(d, e.valor); }
  });

  /* 4. depreciação */
  PP.add({
    id: 'calc-depreciacao', cat: 'calc', ic: '📉', titulo: 'Depreciação (idade e estado de conservação)',
    desc: 'Critério de Ross-Heidecke: quanto a construção perdeu de valor.',
    campos: ident().concat([m('ac', 'Área construída (m²)', 'num'), m('cub', 'Custo novo (R$/m²)', 'money'), m('vn', 'ou Valor novo total (R$)', 'money', { aj: 'Se preencher, ignora área × custo' }),
      m('idade', 'Idade aparente (anos)', 'num'), m('vida', 'Vida útil (anos)', 'num', { v: '70' }), m('estado', 'Estado (Heidecke)', 'sel', { o: OPT_HEID, v: 'c' }), m('res', 'Valor residual (%)', 'num', { v: '20' })]),
    run: function (d) {
      var vn = num(d.vn) || num(d.ac) * num(d.cub), rs = C.ross(num(d.idade), num(d.vida), d.estado), res = num(d.res) / 100, dep = (1 - res) * rs.K;
      return { vn: vn, rs: rs, dep: dep, vd: vn * (1 - dep) };
    },
    resumo: function (d) { var r = PP.itens['calc-depreciacao'].run(d); return r.vn ? 'Depreciação: <b class="v">' + N(r.dep * 100, 2) + '%</b><br>Valor depreciado: ' + R(r.vd) : 'Preencha o valor novo e a idade.'; },
    render: function (d) {
      var r = PP.itens['calc-depreciacao'].run(d);
      return topo(d, 'Depreciação – Ross-Heidecke') +
        h.kv([['Valor novo', R(r.vn)], ['Idade / vida útil', N(num(d.idade), 0) + ' / ' + N(num(d.vida), 0) + ' anos (' + N(r.rs.x * 100, 1) + '% da vida)'], ['Coeficiente de Ross  ½ (x + x²)', N(r.rs.kr * 100, 2) + '%'],
          ['Estado de conservação', PP.heidNome(d.estado) + ' (' + N(r.rs.c * 100, 2) + '%)'], ['Depreciação combinada K = Ross + (1 – Ross) × Heidecke', N(r.rs.K * 100, 2) + '%'], ['Valor residual (não deprecia)', N(num(d.res), 0) + '%'],
          ['Depreciação efetiva sobre o valor novo', N(r.dep * 100, 2) + '%']]) +
        h.valor(R(r.vd), 'Valor da construção depreciada') +
        h.s('Tabela de estados de conservação (Heidecke)') + h.tab(['Estado', 'Depreciação'], PP.HEID.map(function (e) { return [esc(e[1]), N(e[2], 2) + '%']; }), [1]);
    }
  });

  /* 5. renda */
  PP.add({
    id: 'calc-renda', cat: 'calc', ic: '💰', titulo: 'Método da renda (capitalização)',
    desc: 'Valor do imóvel a partir do aluguel que ele rende.',
    campos: ident().concat([m('aluguel', 'Aluguel / renda bruta (R$/mês)', 'money'), m('vac', 'Vacância e inadimplência (%)', 'num', { v: '8' }),
      m('desp', 'Despesas do proprietário (R$/ano)', 'money', { aj: 'IPTU, seguro, manutenção, administração' }), m('taxa', 'Taxa de capitalização (% ao ano)', 'num', { v: '6' })]).concat(RES),
    run: function (d) { return C.renda({ aluguel: num(d.aluguel), vac: num(d.vac), desp: num(d.desp), taxa: num(d.taxa) }); },
    resumo: function (d) { var r = PP.itens['calc-renda'].run(d); return r.valor ? 'Valor: <b class="v">' + R(PP.arred(r.valor)) + '</b>' : 'Preencha aluguel e taxa.'; },
    render: function (d) { var r = PP.itens['calc-renda'].run(d); return topo(d, 'Método da Capitalização da Renda') + r.memoria + resultado(d, r.valor) + h.nota('Taxas usuais de referência: residencial 4% a 6% ao ano; comercial 6% a 9%; galpões 7% a 10%; hotéis 9% a 12%. Justifique a taxa escolhida.'); }
  });

  /* 6. involutivo */
  PP.add({
    id: 'calc-involutivo', cat: 'calc', ic: '🏗️', titulo: 'Método involutivo (terreno para incorporação)',
    desc: 'Quanto vale o terreno pelo prédio que dá para construir nele.',
    campos: ident().concat([F('', 'Potencial do terreno', 'sec'), m('at', 'Área do terreno (m²)', 'num'), m('ca', 'Coeficiente de aproveitamento', 'num', { v: '2' }), m('ef', 'Área vendável ÷ construída (%)', 'num', { v: '70' }),
      F('', 'Vendas e custos', 'sec'), m('preco', 'Preço de venda (R$/m² vendável)', 'money'), m('custo', 'Custo de obra (R$/m² construído)', 'money'), m('desp', 'Despesas, impostos e corretagem (%)', 'num', { v: '15' }), m('lucro', 'Lucro do incorporador (%)', 'num', { v: '20' })]).concat(RES),
    run: function (d) {
      var ac = num(d.at) * num(d.ca), av = ac * num(d.ef) / 100;
      var r = C.involutivo({ area: av, preco: num(d.preco), custo: ac * num(d.custo), desp: num(d.desp), lucro: num(d.lucro) });
      r.ac = ac; r.av = av; return r;
    },
    resumo: function (d) { var r = PP.itens['calc-involutivo'].run(d); return r.vgv ? 'Terreno: <b class="v">' + R(PP.arred(r.valor)) + '</b>' + (num(d.at) ? '<br>' + R(r.valor / num(d.at)) + '/m²' : '') : 'Preencha os dados.'; },
    render: function (d) {
      var r = PP.itens['calc-involutivo'].run(d);
      return topo(d, 'Método Involutivo') + h.kv([['Área do terreno', N(num(d.at), 2) + ' m²'], ['Área construída possível (× ' + N(num(d.ca), 2) + ')', N(r.ac, 2) + ' m²'], ['Área vendável (' + N(num(d.ef), 0) + '%)', N(r.av, 2) + ' m²'], ['Custo da obra', N(r.ac, 2) + ' m² × ' + R(num(d.custo))]]) +
        r.memoria + resultado(d, r.valor) + (num(d.at) ? h.kv([['Valor por m² de terreno', R(r.valor / num(d.at))]]) : '') + h.nota('Estudo simplificado, sem fluxo de caixa no tempo. Para negócios grandes, faça também um fluxo de caixa descontado.');
    }
  });

  /* 7. terreno por m² */
  var TOPOF = { 'Plano': 1, 'Aclive leve': 0.95, 'Declive leve': 0.90, 'Aclive acentuado': 0.85, 'Declive acentuado': 0.80, 'Alagadiço': 0.70 };
  var TOPO_O = Object.keys(TOPOF);
  PP.add({
    id: 'calc-terreno', cat: 'calc', ic: '📐', titulo: 'Valor do terreno por m²',
    desc: 'Comparação de terrenos com fatores automáticos de frente, topografia e esquina.',
    campos: ident().concat([F('', 'Terreno avaliado', 'sec'), m('area', 'Área (m²)', 'num'), m('test', 'Frente (m)', 'num'), m('topo', 'Topografia', 'sel', { o: TOPO_O }), m('esq', 'Esquina', 'sel', { o: ['Não', 'Sim'] }),
      F('comps', 'Terrenos comparáveis', 'tab', { item: 'Terreno', acao: ['banco', '📥 Trazer do banco de comparáveis'],
        cols: [F('end', 'Endereço'), m('area', 'Área (m²)', 'num'), m('preco', 'Preço (R$)', 'money'), m('test', 'Frente (m)', 'num'), m('topo', 'Topografia', 'sel', { o: TOPO_O }), m('esq', 'Esquina', 'sel', { o: ['Não', 'Sim'] }), m('fo', 'Fator oferta', 'num', { v: '0,90' }), m('fl', 'Fator localização', 'num', { v: '1,00' }), F('foto', 'Foto do imóvel', 'fotos', { aj: 'Print do anúncio ou foto da fachada' })] })]).concat(RES),
    inicio: function (d) { d.topo = 'Plano'; d.esq = 'Não'; d.comps = [{}, {}, {}].map(function () { return { topo: 'Plano', esq: 'Não', fo: '0,90', fl: '1,00' }; }); },
    acoes: { banco: function (d) { PP.trazerBanco(d); } },
    run: function (d) {
      var rows = (d.comps || []).map(function (c) {
        var o = {}; for (var k in c) o[k] = c[k];
        var ta = num(d.test), tc = num(c.test);
        o.ft = (ta && tc) ? Math.min(1.25, Math.max(0.75, Math.pow(ta / tc, 0.25))) : 1;
        o.fg = (TOPOF[d.topo] || 1) / (TOPOF[c.topo] || 1);
        o.fe = (d.esq === 'Sim' ? 1.10 : 1) / (c.esq === 'Sim' ? 1.10 : 1);
        o.fp = 1; o.fc = 1; return o;
      });
      return C.homog(rows, num(d.area), true);
    },
    resumo: function (d) { var hm = PP.itens['calc-terreno'].run(d); return hm.mediaSan ? 'Terreno: <b class="v">' + R(PP.arred(hm.mediaSan * num(d.area))) + '</b><br>' + R(hm.mediaSan) + '/m²' : 'Preencha os terrenos.'; },
    render: function (d) {
      var hm = PP.itens['calc-terreno'].run(d);
      return topo(d, 'Valor do Terreno por m²') + h.kv([['Área avaliada', N(num(d.area), 2) + ' m²'], ['Frente', N(num(d.test), 2) + ' m'], ['Topografia', d.topo], ['Esquina', d.esq]]) + C.tabelaHomog(hm, 'm²') +
        h.kv([['Média saneada', R(hm.mediaSan) + '/m²'], ['Elementos válidos', hm.nSan + ' de ' + hm.n]]) + resultado(d, hm.mediaSan * num(d.area)) + C.fotosComps(d.comps, 'Fotos dos terrenos comparáveis') +
        h.nota('Frente: (frente avaliada ÷ frente comparável)^0,25, limitado entre 0,75 e 1,25. Topografia: plano 1,00; aclive leve 0,95; declive leve 0,90; aclive acentuado 0,85; declive acentuado 0,80; alagadiço 0,70. Esquina: 1,10.');
    }
  });

  /* 8. rentabilidade */
  PP.add({
    id: 'calc-rentab', cat: 'calc', ic: '📊', titulo: 'Rentabilidade para investidores',
    desc: 'Quanto o imóvel rende por mês e por ano, e em quantos anos se paga.',
    campos: ident().concat([m('preco', 'Preço de compra (R$)', 'money'), m('custos', 'Custos de compra (R$)', 'money', { aj: 'ITBI, escritura, registro, reforma' }), m('aluguel', 'Aluguel (R$/mês)', 'money'),
      m('vac', 'Meses vazio por ano', 'num', { v: '1' }), m('adm', 'Taxa de administração (%)', 'num', { v: '8' }), m('desp', 'Despesas do dono (R$/ano)', 'money', { aj: 'IPTU, condomínio vazio, manutenção' }),
      F('', 'Comparar com', 'sec'), m('poup', 'Poupança (% ao ano)', 'num', { v: '6,17' }), m('cdi', 'CDI / Tesouro (% ao ano)', 'num', { v: '14' })]),
    run: function (d) {
      var inv = num(d.preco) + num(d.custos), al = num(d.aluguel), meses = Math.max(0, 12 - num(d.vac)), bruta = al * 12, rec = al * meses, adm = rec * num(d.adm) / 100, liq = rec - adm - num(d.desp);
      return { inv: inv, bruta: bruta, liq: liq, rb: inv ? bruta / inv * 100 : 0, rl: inv ? liq / inv * 100 : 0, pay: liq > 0 ? inv / liq : 0 };
    },
    resumo: function (d) { var r = PP.itens['calc-rentab'].run(d); return r.inv ? 'Rende <b class="v">' + N(r.rl / 12, 2) + '%</b> ao mês líquido<br>' + N(r.rl, 2) + '% ao ano · se paga em ' + N(r.pay, 1) + ' anos' : 'Preencha preço e aluguel.'; },
    render: function (d) {
      var r = PP.itens['calc-rentab'].run(d);
      return topo(d, 'Análise de Rentabilidade') + h.tab(['Item', 'Valor'], [['Investimento total', R(r.inv)], ['Aluguel bruto anual', R(r.bruta)], ['Renda líquida anual', R(r.liq)], ['Rentabilidade bruta', N(r.rb / 12, 2) + '% ao mês · ' + N(r.rb, 2) + '% ao ano'], ['<b>Rentabilidade líquida</b>', '<b>' + N(r.rl / 12, 2) + '% ao mês · ' + N(r.rl, 2) + '% ao ano</b>'], ['Retorno do investimento (payback)', r.pay ? N(r.pay, 1) + ' anos' : '—']], [1]) +
        h.s('Comparação') + h.tab(['Aplicação', '% ao ano', 'Rende por ano'], [['Este imóvel (líquido)', N(r.rl, 2) + '%', R(r.liq)], ['Poupança', N(num(d.poup), 2) + '%', R(r.inv * num(d.poup) / 100)], ['CDI / Tesouro (bruto)', N(num(d.cdi), 2) + '%', R(r.inv * num(d.cdi) / 100)]], [1, 2]) +
        h.nota('O imóvel também pode valorizar com o tempo, o que não aparece nesta conta. Aplicações financeiras pagam imposto de renda; aluguel também (carnê-leão).');
    }
  });

  /* 9. valor venal IPTU / ITBI */
  PP.add({
    id: 'calc-venal', cat: 'calc', ic: '🏛️', titulo: 'Valor venal: IPTU e ITBI',
    desc: 'Estime o valor venal e confira quanto dá o ITBI em cada base.',
    campos: ident().concat([F('', 'Estimativa do valor venal (Planta Genérica)', 'sec'), m('at', 'Área do terreno (m²)', 'num'), m('vpgv', 'Valor do m² de terreno na PGV (R$)', 'money'), m('fat_t', 'Fatores do terreno', 'num', { v: '1,00' }),
      m('ac', 'Área construída (m²)', 'num'), m('vcon', 'Valor do m² de construção (tabela do tipo/padrão)', 'money'), m('fat_c', 'Fator de obsolescência (idade)', 'num', { v: '1,00' }),
      F('', 'ITBI', 'sec'), m('venal', 'Valor venal do carnê (se tiver)', 'money'), m('ref', 'Valor de referência da prefeitura', 'money'), m('trans', 'Valor da compra (escritura)', 'money'), m('aliq', 'Alíquota (%)', 'num', { v: '3' })]),
    run: function (d) {
      var vt = num(d.at) * num(d.vpgv) * fat(d.fat_t), vc = num(d.ac) * num(d.vcon) * fat(d.fat_c), est = vt + vc, al = num(d.aliq) / 100;
      return { vt: vt, vc: vc, est: est, al: al };
    },
    resumo: function (d) { var r = PP.itens['calc-venal'].run(d); var tr = num(d.trans); return (r.est ? 'Venal estimado: <b class="v">' + R(r.est) + '</b><br>' : '') + (tr ? 'ITBI sobre a compra: ' + R(tr * r.al) : ''); },
    render: function (d) {
      var r = PP.itens['calc-venal'].run(d), ref = num(d.ref), tr = num(d.trans), vn = num(d.venal);
      return topo(d, 'Valor Venal – IPTU e ITBI') + h.tab(['Parcela', 'Conta', 'Valor'], [['Terreno', N(num(d.at), 2) + ' m² × ' + R(num(d.vpgv)) + ' × ' + N(fat(d.fat_t), 2), R(r.vt)], ['Construção', N(num(d.ac), 2) + ' m² × ' + R(num(d.vcon)) + ' × ' + N(fat(d.fat_c), 2), R(r.vc)], ['<b>Valor venal estimado</b>', '', '<b>' + R(r.est) + '</b>']], [2]) +
        h.s('ITBI (' + N(r.al * 100, 2) + '%)') + h.tab(['Base', 'Valor', 'ITBI'], [['Valor da compra (escritura)', tr ? R(tr) : '—', tr ? R(tr * r.al) : '—'], ['Valor de referência da prefeitura', ref ? R(ref) : '—', ref ? R(ref * r.al) : '—'], ['Valor venal do IPTU', vn ? R(vn) : '—', vn ? R(vn * r.al) : '—']], [1, 2]) +
        (tr && ref && ref > tr ? h.nota('A prefeitura usa referência maior que o valor da compra. Pelo STJ (Tema 1.113), a base do ITBI é o valor da transação declarado, que só pode ser contestado pelo município em processo próprio. Diferença de imposto: ' + R((ref - tr) * r.al) + '.') : '') +
        h.nota('Valores da Planta Genérica e alíquotas mudam por cidade. Confira sempre no site da prefeitura.');
    }
  });

  /* 10. banco de comparáveis */
  PP.add({
    id: 'calc-banco', cat: 'calc', ic: '🗂️', titulo: 'Banco de dados de comparáveis',
    desc: 'Guarde aqui os imóveis que você pesquisa. Depois é só trazer para o PTAM com um toque.',
    campos: [F('itens', 'Imóveis pesquisados', 'tab', { item: 'Imóvel', acao: ['csv', '⬇️ Baixar planilha (Excel)'],
      cols: [m('data', 'Data', 'date'), m('tipo', 'Situação', 'sel', { o: ['Oferta', 'Vendido', 'Alugado'] }), m('cat', 'Tipo', 'sel', { o: ['Casa', 'Sobrado', 'Apartamento', 'Terreno', 'Sala', 'Loja', 'Galpão', 'Chácara', 'Rural', 'Outro'] }), m('dorm', 'Dormitórios', 'num'),
        F('end', 'Endereço'), m('bairro', 'Bairro', 'text'), m('cidade', 'Cidade', 'text'), m('area', 'Área (m²)', 'num'), m('preco', 'Preço / aluguel (R$)', 'money'), m('fonte', 'Fonte', 'text'), m('contato', 'Contato', 'text'), F('obs', 'Observação'), F('foto', 'Foto do imóvel', 'fotos', { aj: 'Print do anúncio ou foto da fachada' })] })],
    inicio: function (d) { d.itens = []; },
    acoes: {
      csv: function (d) {
        var cab = ['Data', 'Situação', 'Tipo', 'Dorm', 'Endereço', 'Bairro', 'Cidade', 'Área', 'Preço', 'R$/m²', 'Fonte', 'Contato', 'Obs'];
        var l = (d.itens || []).map(function (x) { var a = num(x.area), p = num(x.preco); return [PP.dt(x.data), x.tipo, x.cat, x.dorm, x.end, x.bairro, x.cidade, N(a, 2), N(p, 2), a ? N(p / a, 2) : '', x.fonte, x.contato, x.obs]; });
        var csv = '﻿' + [cab].concat(l).map(function (r) { return r.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(';'); }).join('\r\n');
        PP.baixarTexto(csv, 'banco-comparaveis.csv', 'text/csv;charset=utf-8');
      }
    },
    resumo: function (d) { return (d.itens || []).length + ' imóveis guardados.'; },
    render: function (d) {
      var it = (d.itens || []).slice().sort(function (a, b) { return (a.bairro || '').localeCompare(b.bairro || '') || (b.data || '').localeCompare(a.data || ''); });
      var grupos = {};
      it.forEach(function (x) { var a = num(x.area), p = num(x.preco); if (!a || !p) return; var g = (x.bairro || 'Sem bairro') + ' · ' + (x.cat || '') + ' · ' + (x.tipo || ''); (grupos[g] = grupos[g] || []).push(p / a); });
      return h.t('Banco de Comparáveis', it.length + ' imóveis') +
        h.tab(['Data', 'Tipo', 'Endereço', 'Área', 'Preço', 'R$/m²', 'Fonte'], it.map(function (x) { var a = num(x.area), p = num(x.preco); return [PP.dt(x.data), esc((x.tipo || '') + ' ' + (x.cat || '')), esc([x.end, x.bairro].filter(Boolean).join(' – ')), N(a, 0), R(p), a ? N(p / a, 0) : '', esc(x.fonte || '')]; }), [3, 4, 5]) +
        h.s('Média por bairro e tipo') + h.tab(['Grupo', 'Qtde', 'Média R$/m²'], Object.keys(grupos).map(function (g) { return [esc(g), String(grupos[g].length), R(C.media(grupos[g]))]; }), [1, 2]);
    }
  });

  /* guia dos 4 métodos */
  PP.add({
    id: 'calc-guia', cat: 'calc', ic: '🧭', titulo: 'Guia dos 4 métodos da NBR 14653: quando usar cada um', soLeitura: true,
    desc: 'Explicação simples de cada método.',
    render: function () {
      return h.t('Os 4 métodos de avaliação', 'Referência: ABNT NBR 14653-1 e 14653-2') +
        h.tab(['Método', 'Quando usar', 'O que precisa'], [
          ['<b>Comparativo direto</b>', 'Sempre que houver imóveis parecidos à venda ou vendidos na região. É o preferido: casas, apartamentos, salas, terrenos.', 'De 3 a 6 comparáveis (o ideal é 5 ou mais), com área e preço.'],
          ['<b>Evolutivo</b>', 'Quando há poucos comparáveis: galpões, prédios inteiros, postos, imóveis muito específicos ou casas muito diferentes do padrão do bairro.', 'Valor do terreno, área construída, custo de construção (CUB), idade e estado.'],
          ['<b>Renda</b>', 'Imóveis comprados para render: lojas alugadas, hotéis, prédios de renda, galpões logísticos.', 'Aluguel ou renda, despesas, vacância e uma taxa de capitalização.'],
          ['<b>Involutivo</b>', 'Terrenos grandes ou para prédio, quando não há terrenos parecidos à venda.', 'Lei de zoneamento (quanto pode construir), preço de venda dos apartamentos/salas e custo da obra.']]) +
        h.s('Dicas rápidas') + '<ul><li>Na dúvida, use o comparativo.</li><li>Use dois métodos quando puder (ex.: comparativo e evolutivo) e explique por que escolheu o valor final.</li><li>Sempre guarde os anúncios pesquisados (print ou link) no banco de comparáveis.</li><li>Fator oferta 0,90 significa supor 10% de desconto sobre o preço pedido.</li><li>Comparáveis com mais de 30% de diferença da média devem sair da conta.</li></ul>' +
        h.nota('O corretor elabora o PTAM com base na Resolução COFECI nº 1.066/2007; a NBR 14653 serve como referência técnica de boas práticas.');
    }
  });
})();
