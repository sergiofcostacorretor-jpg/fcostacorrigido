/* Central do Correspondente Bancário — FCosta
   Página interna (protegida por area-restrita.js). Dados ficam só neste aparelho (localStorage "cb:*"). */
(function () {
  'use strict';

  /* ---------- utilidades ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var app = document.getElementById('app');
  function ler(k, d) { try { var v = localStorage.getItem('cb:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function grava(k, v) { try { localStorage.setItem('cb:' + k, JSON.stringify(v)); } catch (e) {} }
  var fmtR = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  function R(v) { return isFinite(v) ? fmtR.format(v) : '—'; }
  function P(v, c) { return isFinite(v) ? v.toLocaleString('pt-BR', { minimumFractionDigits: c == null ? 2 : c, maximumFractionDigits: c == null ? 2 : c }) + '%' : '—'; }
  function num(v) { if (typeof v === 'number') return v; v = String(v || '').trim(); if (!v) return 0; if (v.indexOf(',') >= 0) v = v.replace(/\./g, '').replace(',', '.'); return parseFloat(v) || 0; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function aviso(t) { var a = document.createElement('div'); a.className = 'aviso'; a.textContent = t; document.body.appendChild(a); setTimeout(function () { a.remove(); }, 2200); }
  function hoje() { return new Date().toLocaleDateString('pt-BR'); }
  function copiar(t) { if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { aviso('Copiado ✓'); }, function () { aviso('Não deu para copiar'); }); else aviso('Copie manualmente'); }
  function zap(t, fone) { var f = String(fone || '').replace(/\D/g, ''); if (f && f.length <= 11) f = '55' + f; window.open('https://wa.me/' + f + '?text=' + encodeURIComponent(t), '_blank'); }
  function imprimir() { document.body.classList.add('imprime-folha'); setTimeout(function () { window.print(); setTimeout(function () { document.body.classList.remove('imprime-folha'); }, 400); }, 50); }
  function volta() { return '<a class="volta naoimp" href="#/">← Voltar ao início</a>'; }

  /* ---------- dados de referência (editáveis) ---------- */
  var PERFIL = { nome: 'Sérgio Fernandes da Costa', creci: 'CRECI-SP 294791-F', cnai: 'CNAI 52708', zap: '(11) 99350-9109', site: 'fcostacorretor.com' };

  var BANCOS_PADRAO = {
    data: '30/10/2026',
    fonte: 'MySide (radar de taxas, atualizado em 30/10/2026). Prazo, cota e renda mínima: CasaClara (dados do Banco Central, out/2026).',
    lista: [
      { n: 'Caixa', t: 10.26, pc: 9.01, prazo: 35, cota: 80, rmin: 2500 },
      { n: 'Banco do Brasil', t: 11.60, pc: 9.00, prazo: 30, cota: 80, rmin: 3000 },
      { n: 'Santander', t: 12.49, pc: 0, prazo: 35, cota: 80, rmin: 3500 },
      { n: 'Itaú', t: 12.89, pc: 0, prazo: 30, cota: 80, rmin: 4000 },
      { n: 'Bradesco', t: 15.00, pc: 0, prazo: 30, cota: 80, rmin: 4000 }
    ]
  };
  var MCMV_PADRAO = {
    data: '01/04/2026',
    fonte: 'Portaria MCID nº 333/2026, conforme resumos publicados (Portal Benefício Brasil, jun/2026; MySide, out/2026). As fontes divergem em tetos e juros da Faixa 2. Confirme sempre no simulador da Caixa.',
    lista: [
      { f: 'Faixa 1', renda: 3200, teto: 270000, jmin: 4.00, jmax: 4.25, sub: 55000, obs: 'Subsídio de até 95% em casos de programa público. Até R$ 65 mil no Norte. Inscrição pela prefeitura/CRAS ou via construtora.' },
      { f: 'Faixa 2', renda: 5000, teto: 350000, jmin: 4.75, jmax: 7.00, sub: 55000, obs: 'Subsídio parcial, diminui conforme a renda sobe. Juros sobem com a renda.' },
      { f: 'Faixa 3', renda: 9600, teto: 400000, jmin: 7.66, jmax: 8.16, sub: 0, obs: 'Sem subsídio. 7,66% para quem tem 3 anos de FGTS (cotista).' },
      { f: 'Faixa 4', renda: 13000, teto: 600000, jmin: 10.00, jmax: 10.00, sub: 0, obs: 'Classe média. Sem subsídio. Recursos do Fundo Social / SBPE.' }
    ]
  };
  function bancos() { return ler('bancos', BANCOS_PADRAO); }
  function mcmv() { return ler('mcmv', MCMV_PADRAO); }

  /* ---------- motor de cálculo ---------- */
  function taxaMes(aa) { return Math.pow(1 + aa / 100, 1 / 12) - 1; }
  function seguroMes(saldo, valorImovel, idade) {
    var mip = idade < 35 ? 0.00012 : idade < 45 ? 0.0002 : idade < 55 ? 0.00035 : idade < 65 ? 0.0006 : 0.001;
    return saldo * mip + valorImovel * 0.00007 + 25; // MIP + DFI + tarifa (estimativa)
  }
  function simular(o) {
    var pv = Math.max(0, o.valor - o.entrada - o.fgts - o.sub);
    var i = taxaMes(o.taxa), n = Math.max(1, Math.round(o.meses));
    var lin = [], saldo = pv, tj = 0, ts = 0, pmt = i > 0 ? pv * i / (1 - Math.pow(1 + i, -n)) : pv / n;
    for (var k = 1; k <= n; k++) {
      var j = saldo * i, am = o.sistema === 'price' ? pmt - j : pv / n;
      var sg = o.seguros ? seguroMes(saldo, o.valor, o.idade + k / 12) : 0;
      lin.push({ k: k, j: j, am: am, sg: sg, p: j + am + sg, saldo: Math.max(0, saldo - am) });
      tj += j; ts += sg; saldo -= am;
    }
    return { pv: pv, i: i, n: n, lin: lin, p1: lin[0] ? lin[0].p : 0, pn: lin.length ? lin[lin.length - 1].p : 0, juros: tj, seg: ts, total: pv + tj + ts };
  }
  function maxPorRenda(parcela, aa, n, sistema) {
    var i = taxaMes(aa); if (parcela <= 0) return 0;
    if (sistema === 'price') return i > 0 ? parcela * (1 - Math.pow(1 + i, -n)) / i : parcela * n;
    return parcela / (1 / n + i);
  }
  function faixaMCMV(renda) { var L = mcmv().lista; for (var x = 0; x < L.length; x++) if (renda <= L[x].renda) return L[x]; return null; }

  /* ---------- telas ---------- */
  var CARDS = [
    ['simulador', '🧮', 'Simulador completo', 'SAC e Price, FGTS, subsídio, entrada, renda mínima, idade e seguros. Gera PDF e manda no WhatsApp.'],
    ['bancos', '🏦', 'Comparar bancos', 'Mesmo financiamento em todos os bancos, lado a lado. Taxas com data e editáveis.'],
    ['mcmv', '🏠', 'Minha Casa Minha Vida', 'Descubra a faixa pela renda, teto do imóvel, juros e subsídio possível.'],
    ['capacidade', '💪', 'Quanto o cliente pode comprar', 'Pela renda, mostra o valor máximo de financiamento e de imóvel.'],
    ['fgts', '💼', 'Uso do FGTS', 'Regras para usar o FGTS na entrada, nas parcelas ou para quitar.'],
    ['comecar', '🚀', 'Como virar correspondente', 'Do zero: regras do Banco Central, certificação, credenciamento e comissões.'],
    ['etapas', '🧭', 'Passo a passo do processo', 'Do primeiro contato até o dinheiro na conta do vendedor.'],
    ['documentos', '📂', 'Checklists de documentos', 'Comprador, vendedor e imóvel. Marque o que já chegou.'],
    ['modelos', '📝', 'Modelos e mensagens', 'Ficha do cliente, autorização LGPD, protocolo e mensagens prontas.'],
    ['clientes', '👥', 'Meus clientes', 'Acompanhe cada processo por etapa. Fica salvo no aparelho.'],
    ['glossario', '📖', 'Glossário', 'SFH, SFI, SBPE, TR, CET, MIP, DFI, alienação fiduciária e mais.'],
    ['treino', '🎓', 'Treino para a prova', 'Perguntas de estudo para certificação de correspondente.']
  ];
  function telaInicio() {
    app.innerHTML = '<section class="hero"><h1>Central do <em>Correspondente</em></h1><p>Tudo sobre crédito imobiliário num lugar só: simulador, bancos, MCMV, FGTS, documentos e o guia para trabalhar como correspondente bancário.</p></section>' +
      '<div class="grade">' + CARDS.map(function (c) { return '<a class="cart" href="#/' + c[0] + '"><div class="ic">' + c[1] + '</div><h3>' + c[2] + '</h3><p>' + c[3] + '</p></a>'; }).join('') + '</div>' +
      '<p class="fonte">Taxas de referência de ' + esc(bancos().data) + '. Simulações não são proposta do banco: a aprovação depende da análise de crédito e da avaliação do imóvel.</p>';
  }

  /* --- Simulador --- */
  function campo(id, rot, val, aj, meia, tipo) {
    return '<div class="c' + (meia ? ' m' : '') + '"><label for="' + id + '">' + rot + '</label><input id="' + id + '" ' + (tipo === 'txt' ? 'type="text"' : 'type="text" inputmode="decimal"') + ' value="' + esc(val) + '">' + (aj ? '<div class="aj">' + aj + '</div>' : '') + '</div>';
  }
  function telaSimulador() {
    var s = ler('sim', { cliente: '', valor: 300000, entrada: 60000, fgts: 0, sub: 0, renda: 8000, idade: 35, taxa: bancos().lista[0].t, anos: 30, sistema: 'sac', banco: 'Caixa', comp: 30, seguros: 1 });
    var opB = bancos().lista.map(function (b) { return '<option value="' + esc(b.n) + '"' + (b.n === s.banco ? ' selected' : '') + '>' + esc(b.n) + ' · ' + P(b.t) + '</option>'; }).join('') + '<option value="MCMV"' + (s.banco === 'MCMV' ? ' selected' : '') + '>Minha Casa Minha Vida (taxa da faixa)</option><option value="Outro"' + (s.banco === 'Outro' ? ' selected' : '') + '>Outra taxa</option>';
    app.innerHTML = volta() + '<div class="titsec naoimp"><h2>🧮 Simulador completo</h2><p>Preencha e o resultado aparece na hora. Valores em reais.</p></div>' +
      '<div class="duas"><div class="caixa naoimp"><div class="fl">' +
      '<div class="sec c">Cliente</div>' + campo('cliente', 'Nome do cliente', s.cliente, '', false, 'txt') +
      campo('renda', 'Renda bruta da família', s.renda, 'Soma de quem vai compor renda', true) + campo('idade', 'Idade do mais velho', s.idade, 'Idade + prazo ≤ 80 anos e 6 meses', true) +
      '<div class="sec c">Imóvel e recursos</div>' + campo('valor', 'Valor do imóvel', s.valor, 'Valor de compra ou de avaliação, o menor', false) +
      campo('entrada', 'Entrada em dinheiro', s.entrada, '', true) + campo('fgts', 'FGTS usado', s.fgts, '', true) +
      campo('sub', 'Subsídio MCMV', s.sub, 'Só Faixas 1 e 2', true) + campo('comp', 'Comprometimento máx. (%)', s.comp, 'Padrão 30% da renda', true) +
      '<div class="sec c">Financiamento</div>' +
      '<div class="c"><label for="banco">Banco / linha</label><select id="banco">' + opB + '</select></div>' +
      campo('taxa', 'Juros ao ano (%)', s.taxa, '+ TR', true) + campo('anos', 'Prazo (anos)', s.anos, '', true) +
      '<div class="c m"><label for="sistema">Sistema</label><select id="sistema"><option value="sac"' + (s.sistema === 'sac' ? ' selected' : '') + '>SAC (cai com o tempo)</option><option value="price"' + (s.sistema === 'price' ? ' selected' : '') + '>Price (parcela fixa)</option></select></div>' +
      '<div class="c m"><label for="seguros">Seguros e tarifa</label><select id="seguros"><option value="1"' + (s.seguros ? ' selected' : '') + '>Incluir estimativa</option><option value="0"' + (!s.seguros ? ' selected' : '') + '>Não incluir</option></select></div>' +
      '</div></div><div id="res" style="min-width:0"></div></div>';
    $('#banco').addEventListener('change', function () {
      var v = this.value, b = bancos().lista.filter(function (x) { return x.n === v; })[0];
      if (b) { $('#taxa').value = String(b.t).replace('.', ','); $('#anos').value = Math.min(num($('#anos').value) || b.prazo, b.prazo); }
      if (v === 'MCMV') { var f = faixaMCMV(num($('#renda').value)); if (f) $('#taxa').value = String(f.jmax).replace('.', ','); $('#anos').value = 35; }
      calcSim();
    });
    $$('.caixa input, .caixa select').forEach(function (el) { el.addEventListener('input', calcSim); });
    calcSim();
  }
  function lerSim() {
    var s = { cliente: $('#cliente').value, valor: num($('#valor').value), entrada: num($('#entrada').value), fgts: num($('#fgts').value), sub: num($('#sub').value), renda: num($('#renda').value), idade: num($('#idade').value), taxa: num($('#taxa').value), anos: num($('#anos').value), sistema: $('#sistema').value, banco: $('#banco').value, comp: num($('#comp').value) || 30, seguros: $('#seguros').value === '1' ? 1 : 0 };
    grava('sim', s); return s;
  }
  function calcSim() {
    var s = lerSim();
    var b = bancos().lista.filter(function (x) { return x.n === s.banco; })[0];
    var cota = b ? b.cota : 80, prazoBanco = b ? b.prazo : 35;
    var mesesIdade = Math.floor((80.5 - s.idade) * 12);
    var meses = Math.min(s.anos * 12, mesesIdade, 420);
    var r = simular({ valor: s.valor, entrada: s.entrada, fgts: s.fgts, sub: s.sub, taxa: s.taxa, meses: meses, sistema: s.sistema, idade: s.idade, seguros: s.seguros });
    var limite = s.renda * s.comp / 100, rendaMin = r.p1 / (s.comp / 100);
    var pctFin = s.valor ? r.pv / s.valor * 100 : 0;
    var alertas = [];
    if (meses < s.anos * 12) alertas.push(['info', 'Prazo ajustado para ' + Math.floor(meses / 12) + ' anos e ' + (meses % 12) + ' meses por causa da idade (limite de 80 anos e 6 meses no fim do contrato).']);
    if (s.anos > prazoBanco) alertas.push(['info', 'Este banco costuma ir até ' + prazoBanco + ' anos.']);
    if (pctFin > cota + 0.01) alertas.push(['ruim', 'Financiamento de ' + P(pctFin, 1) + ' do imóvel. O banco financia até ' + cota + '%. Falta de entrada: ' + R(r.pv - s.valor * cota / 100) + '.']);
    if (r.p1 > limite) alertas.push(['ruim', 'A 1ª parcela passa de ' + s.comp + '% da renda. Renda mínima para esta simulação: ' + R(rendaMin) + '.']);
    else alertas.push(['ok', 'Cabe na renda: a 1ª parcela usa ' + P(r.p1 / s.renda * 100, 1) + ' da renda.']);
    if (b && s.renda < b.rmin) alertas.push(['ruim', 'Renda abaixo da mínima de referência do banco (' + R(b.rmin) + ').']);
    if (s.banco === 'MCMV') { var f = faixaMCMV(s.renda); alertas.push(f ? (s.valor > f.teto ? ['ruim', 'Imóvel acima do teto da ' + f.f + ' (' + R(f.teto) + ').'] : ['ok', 'Enquadra na ' + f.f + ' (renda até ' + R(f.renda) + ', imóvel até ' + R(f.teto) + ').']) : ['ruim', 'Renda acima do limite do MCMV. Use SBPE.']); }
    if (s.valor > 2250000) alertas.push(['info', 'Acima do teto do SFH (R$ 2,25 milhões): vira SFI e não pode usar FGTS.']);
    // tabela anual
    var linhas = r.lin.filter(function (l) { return l.k === 1 || l.k % 12 === 0 || l.k === r.n; });
    var tab = linhas.map(function (l) { return '<tr><td>' + l.k + '</td><td class="n">' + R(l.am) + '</td><td class="n">' + R(l.j) + '</td><td class="n">' + R(l.sg) + '</td><td class="n"><b>' + R(l.p) + '</b></td><td class="n">' + R(l.saldo) + '</td></tr>'; }).join('');
    var bancoTxt = s.banco === 'Outro' ? 'Taxa informada' : s.banco;
    var folha = '<div class="folha"><div class="cab"><img src="/logo-fcosta.png" alt=""><div><b>' + esc(PERFIL.nome) + '</b><small>Corretor de Imóveis · ' + PERFIL.creci + ' · ' + PERFIL.cnai + '</small><small>WhatsApp ' + PERFIL.zap + ' · ' + PERFIL.site + '</small></div></div>' +
      '<h1>Simulação de Financiamento</h1><p style="text-align:center;margin:0 0 10px;color:#6b5a33">' + (s.cliente ? 'Cliente: <b>' + esc(s.cliente) + '</b> · ' : '') + 'Data: ' + hoje() + '</p>' +
      '<table><tr><th>Valor do imóvel</th><td class="n">' + R(s.valor) + '</td><th>Banco / linha</th><td>' + esc(bancoTxt) + '</td></tr>' +
      '<tr><th>Entrada</th><td class="n">' + R(s.entrada) + '</td><th>Juros</th><td>' + P(s.taxa) + ' ao ano + TR</td></tr>' +
      '<tr><th>FGTS</th><td class="n">' + R(s.fgts) + '</td><th>Sistema</th><td>' + (s.sistema === 'sac' ? 'SAC' : 'Price') + '</td></tr>' +
      '<tr><th>Subsídio</th><td class="n">' + R(s.sub) + '</td><th>Prazo</th><td>' + r.n + ' meses</td></tr>' +
      '<tr><th>Valor financiado</th><td class="n"><b>' + R(r.pv) + '</b></td><th>% financiado</th><td>' + P(pctFin, 1) + '</td></tr></table>' +
      '<h3>Resultado</h3><table><tr><th>1ª parcela</th><td class="n"><b>' + R(r.p1) + '</b></td><th>Última parcela</th><td class="n">' + R(r.pn) + '</td></tr>' +
      '<tr><th>Renda mínima (' + s.comp + '%)</th><td class="n">' + R(rendaMin) + '</td><th>Total de juros</th><td class="n">' + R(r.juros) + '</td></tr>' +
      '<tr><th>Seguros e tarifa</th><td class="n">' + R(r.seg) + '</td><th>Total pago ao banco</th><td class="n">' + R(r.total) + '</td></tr></table>' +
      '<h3>Evolução das parcelas</h3><table><tr><th>Mês</th><th>Amortização</th><th>Juros</th><th>Seguros</th><th>Parcela</th><th>Saldo</th></tr>' + tab + '</table>' +
      '<div class="nota">Simulação feita pelo corretor, sem valor de proposta. A TR (correção do saldo) não está incluída. Seguros (MIP e DFI) e tarifa são estimativas. Taxas de referência de ' + esc(bancos().data) + '. O valor final depende da análise de crédito, da avaliação do imóvel e das regras do banco no dia da contratação.</div></div>';
    $('#res').innerHTML = '<div class="naoimp"><div class="kpis"><div class="kpi ouro"><span>1ª parcela</span><b>' + R(r.p1) + '</b></div><div class="kpi"><span>Última parcela</span><b>' + R(r.pn) + '</b></div><div class="kpi"><span>Valor financiado</span><b>' + R(r.pv) + '</b></div><div class="kpi"><span>Renda mínima</span><b>' + R(rendaMin) + '</b></div><div class="kpi"><span>Total de juros</span><b>' + R(r.juros) + '</b></div><div class="kpi"><span>Prazo</span><b>' + r.n + ' meses</b></div></div>' +
      alertas.map(function (a) { return '<div class="alerta ' + a[0] + '">' + a[1] + '</div>'; }).join('') +
      '<div class="bts" style="margin-bottom:12px"><button class="bt ouro" id="b-pdf">🖨️ Imprimir / PDF</button><button class="bt" id="b-zap">💬 Enviar no WhatsApp</button><button class="bt" id="b-cli">👥 Salvar em clientes</button></div></div>' +
      '<div class="folha-wrap so-folha">' + folha + '</div>';
    $('#b-pdf').onclick = imprimir;
    $('#b-zap').onclick = function () {
      zap('*Simulação de financiamento*' + (s.cliente ? '\nCliente: ' + s.cliente : '') + '\n\nImóvel: ' + R(s.valor) + '\nEntrada: ' + R(s.entrada) + (s.fgts ? '\nFGTS: ' + R(s.fgts) : '') + (s.sub ? '\nSubsídio: ' + R(s.sub) : '') + '\nFinanciado: ' + R(r.pv) + '\nBanco: ' + bancoTxt + ' · ' + P(s.taxa) + ' a.a. + TR\nSistema: ' + (s.sistema === 'sac' ? 'SAC' : 'Price') + ' em ' + r.n + ' meses\n\n*1ª parcela: ' + R(r.p1) + '*\nÚltima: ' + R(r.pn) + '\nRenda mínima: ' + R(rendaMin) + '\n\n_Simulação sem valor de proposta. Sujeita à análise de crédito._\n' + PERFIL.nome + ' · ' + PERFIL.creci);
    };
    $('#b-cli').onclick = function () {
      var L = ler('clientes', []);
      L.unshift({ id: Date.now(), nome: s.cliente || 'Cliente sem nome', fone: '', renda: s.renda, valor: s.valor, banco: bancoTxt, etapa: 1, obs: '1ª parcela ' + R(r.p1) + ' (' + (s.sistema === 'sac' ? 'SAC' : 'Price') + ', ' + r.n + 'x)', data: hoje() });
      grava('clientes', L); aviso('Salvo em Meus clientes ✓');
    };
  }

  /* --- Comparar bancos --- */
  function telaBancos() {
    var c = ler('cmp', { valor: 300000, entrada: 60000, anos: 30, idade: 35, sistema: 'sac', cotista: 0 });
    var B = bancos();
    app.innerHTML = volta() + '<div class="titsec"><h2>🏦 Comparar bancos</h2><p>O mesmo financiamento em cada banco. As taxas são de referência (' + esc(B.data) + ') e você pode corrigir na tabela de baixo.</p></div>' +
      '<div class="caixa" style="margin-bottom:14px"><div class="fl">' + campo('cv', 'Valor do imóvel', c.valor, '', true) + campo('ce', 'Entrada + FGTS', c.entrada, '', true) + campo('ca', 'Prazo (anos)', c.anos, '', true) + campo('ci', 'Idade do mais velho', c.idade, '', true) +
      '<div class="c m"><label for="cs">Sistema</label><select id="cs"><option value="sac">SAC</option><option value="price"' + (c.sistema === 'price' ? ' selected' : '') + '>Price</option></select></div>' +
      '<div class="c m"><label for="cc">Cliente tem 3 anos de FGTS?</label><select id="cc"><option value="0">Não</option><option value="1"' + (c.cotista ? ' selected' : '') + '>Sim (taxa pró-cotista)</option></select></div></div></div>' +
      '<div id="cmp-res"></div>' +
      '<h3 style="font-family:var(--serif);margin:22px 0 8px">Tabela de taxas (editável)</h3><div class="tab-wrap"><table class="t" id="tx"><tr><th>Banco</th><th>Juros a.a. %</th><th>Pró-cotista %</th><th>Prazo máx. (anos)</th><th>Cota máx. %</th><th>Renda mín. R$</th></tr>' +
      B.lista.map(function (b, k) { return '<tr data-k="' + k + '"><td><input data-f="n" value="' + esc(b.n) + '" style="width:130px"></td><td><input data-f="t" value="' + b.t + '"></td><td><input data-f="pc" value="' + (b.pc || '') + '"></td><td><input data-f="prazo" value="' + b.prazo + '"></td><td><input data-f="cota" value="' + b.cota + '"></td><td><input data-f="rmin" value="' + b.rmin + '"></td></tr>'; }).join('') +
      '</table></div><div class="bts"><button class="bt" id="tx-add">➕ Adicionar banco</button><button class="bt" id="tx-data">📅 Mudar data das taxas</button><button class="bt" id="tx-pad">↺ Voltar ao padrão</button></div>' +
      '<p class="fonte">Fonte: ' + esc(B.fonte) + ' Taxas "a partir de", para clientes com bom cadastro e relacionamento. Pode mudar a qualquer momento: confira no site de cada banco antes de passar ao cliente.</p>';
    function calc() {
      var v = num($('#cv').value), e = num($('#ce').value), an = num($('#ca').value), id = num($('#ci').value), si = $('#cs').value, co = $('#cc').value === '1';
      grava('cmp', { valor: v, entrada: e, anos: an, idade: id, sistema: si, cotista: co ? 1 : 0 });
      var rs = bancos().lista.map(function (b) {
        var tx = co && b.pc ? b.pc : b.t, m = Math.min(an, b.prazo) * 12; m = Math.min(m, Math.floor((80.5 - id) * 12));
        var r = simular({ valor: v, entrada: e, fgts: 0, sub: 0, taxa: tx, meses: m, sistema: si, idade: id, seguros: 1 });
        return { b: b, tx: tx, m: m, r: r, cabe: (v - e) <= v * b.cota / 100 };
      }).sort(function (a, b) { return a.r.total - b.r.total; });
      $('#cmp-res').innerHTML = '<div class="tab-wrap"><table class="t"><tr><th>#</th><th>Banco</th><th class="n">Juros</th><th class="n">Prazo</th><th class="n">1ª parcela</th><th class="n">Renda mínima</th><th class="n">Total pago</th></tr>' +
        rs.map(function (x, k) { return '<tr' + (k === 0 ? ' class="top"' : '') + '><td>' + (k === 0 ? '🏆' : k + 1) + '</td><td>' + esc(x.b.n) + (x.cabe ? '' : ' ⚠️') + '</td><td class="n">' + P(x.tx) + '</td><td class="n">' + x.m + 'x</td><td class="n"><b>' + R(x.r.p1) + '</b></td><td class="n">' + R(Math.max(x.r.p1 / 0.3, x.b.rmin)) + '</td><td class="n">' + R(x.r.total) + '</td></tr>'; }).join('') +
        '</table></div><p class="fonte">⚠️ = a entrada é menor que a exigida pela cota do banco. Parcela com estimativa de seguros e tarifa, sem TR.</p>';
    }
    $$('.caixa input, .caixa select').forEach(function (el) { el.addEventListener('input', calc); });
    $$('#tx input').forEach(function (el) {
      el.addEventListener('change', function () {
        var B2 = bancos(), k = +el.closest('tr').dataset.k, f = el.dataset.f;
        B2.lista[k][f] = f === 'n' ? el.value : num(el.value); grava('bancos', B2); calc(); aviso('Taxa salva ✓');
      });
    });
    $('#tx-add').onclick = function () { var B2 = bancos(); B2.lista.push({ n: 'Novo banco', t: 12, pc: 0, prazo: 30, cota: 80, rmin: 3000 }); grava('bancos', B2); telaBancos(); };
    $('#tx-data').onclick = function () { var d = prompt('Data em que você conferiu as taxas (ex.: 15/12/2026):', hoje()); if (d) { var B2 = bancos(); B2.data = d; B2.fonte = 'Conferido por ' + PERFIL.nome + ' nos sites dos bancos.'; grava('bancos', B2); telaBancos(); } };
    $('#tx-pad').onclick = function () { grava('bancos', BANCOS_PADRAO); telaBancos(); aviso('Taxas padrão de volta'); };
    calc();
  }

  /* --- MCMV --- */
  function telaMCMV() {
    var M = mcmv(), rd = ler('mcmv-renda', 4000);
    app.innerHTML = volta() + '<div class="titsec"><h2>🏠 Minha Casa Minha Vida</h2><p>Digite a renda bruta da família e veja a faixa. Regras de ' + esc(M.data) + '.</p></div>' +
      '<div class="duas"><div class="caixa"><div class="fl">' + campo('mr', 'Renda bruta familiar (R$)', rd, 'Soma de todos que compõem renda', false) + '</div><div id="mres" style="margin-top:12px"></div></div>' +
      '<div class="caixa texto"><h3>Regras básicas</h3><ul><li>Imóvel <b>residencial urbano</b>, novo ou usado, dentro do teto da faixa.</li><li>A família <b>não pode ter imóvel</b> nem financiamento habitacional ativo, e não pode ter recebido benefício habitacional do governo antes.</li><li>Parcela de até <b>30% da renda</b> bruta.</li><li>Prazo de até <b>35 anos</b> (420 meses), respeitando idade + prazo ≤ 80 anos e 6 meses.</li><li>Subsídio só nas <b>Faixas 1 e 2</b>. O valor exato sai na análise da Caixa: depende da renda, do tamanho e da região da cidade.</li><li>Quem tem <b>3 anos de FGTS</b> paga juros menores e pode usar o saldo na entrada.</li><li>Faixa 1 de programas públicos: inscrição na <b>prefeitura/CRAS</b>. Demais faixas: direto com a Caixa (correspondente) ou com a construtora.</li></ul></div></div>' +
      '<h3 style="font-family:var(--serif);margin:22px 0 8px">Tabela das faixas</h3><div class="tab-wrap"><table class="t"><tr><th>Faixa</th><th class="n">Renda até</th><th class="n">Imóvel até</th><th class="n">Juros a.a.</th><th class="n">Subsídio até</th></tr>' +
      M.lista.map(function (f) { return '<tr><td><b>' + f.f + '</b></td><td class="n">' + R(f.renda) + '</td><td class="n">' + R(f.teto) + '</td><td class="n">' + (f.jmin === f.jmax ? P(f.jmin) : P(f.jmin) + ' a ' + P(f.jmax)) + '</td><td class="n">' + (f.sub ? R(f.sub) : '—') + '</td></tr>'; }).join('') +
      '</table></div><p class="fonte">Fonte: ' + esc(M.fonte) + ' Tetos de imóvel variam por cidade; em São Paulo e região metropolitana valem os tetos maiores.</p>';
    function calc() {
      var r = num($('#mr').value); grava('mcmv-renda', r);
      var f = faixaMCMV(r);
      if (!f) { $('#mres').innerHTML = '<div class="alerta ruim">Renda acima de ' + R(M.lista[M.lista.length - 1].renda) + ': não entra no MCMV. Use o financiamento SBPE comum. <a href="#/bancos">Comparar bancos</a></div>'; return; }
      var parc = r * 0.3, maxFin = maxPorRenda(parc - 60, f.jmax, 420, 'sac');
      $('#mres').innerHTML = '<div class="kpis"><div class="kpi ouro"><span>Faixa</span><b>' + f.f + '</b></div><div class="kpi"><span>Imóvel até</span><b>' + R(f.teto) + '</b></div><div class="kpi"><span>Juros</span><b>' + (f.jmin === f.jmax ? P(f.jmin) : 'até ' + P(f.jmax)) + '</b></div><div class="kpi"><span>Subsídio</span><b>' + (f.sub ? 'até ' + R(f.sub) : 'não tem') + '</b></div><div class="kpi"><span>Parcela máx. (30%)</span><b>' + R(parc) + '</b></div><div class="kpi"><span>Financia até ~</span><b>' + R(Math.min(maxFin, f.teto * 0.8)) + '</b></div></div><div class="alerta info">' + esc(f.obs) + '</div><a class="bt ouro" href="#/simulador" id="m-sim">🧮 Levar para o simulador</a>';
      $('#m-sim').onclick = function () { var s = ler('sim', {}); s.renda = r; s.banco = 'MCMV'; s.taxa = f.jmax; s.anos = 35; grava('sim', s); };
    }
    $('#mr').addEventListener('input', calc); calc();
  }

  /* --- Capacidade --- */
  function telaCapacidade() {
    var c = ler('cap', { renda: 8000, dividas: 0, taxa: bancos().lista[0].t, anos: 30, idade: 35, entrada: 60000, cota: 80 });
    app.innerHTML = volta() + '<div class="titsec"><h2>💪 Quanto o cliente pode comprar</h2><p>Começa pela renda. Bom para o primeiro atendimento, antes de escolher o imóvel.</p></div><div class="duas"><div class="caixa"><div class="fl">' +
      campo('kr', 'Renda bruta familiar', c.renda, '', true) + campo('kd', 'Outras parcelas (carro, consignado…)', c.dividas, 'O banco desconta da margem', true) +
      campo('ke', 'Entrada + FGTS disponível', c.entrada, '', true) + campo('ki', 'Idade do mais velho', c.idade, '', true) +
      campo('kt', 'Juros ao ano (%)', c.taxa, '', true) + campo('ka', 'Prazo (anos)', c.anos, '', true) + campo('kc', 'Cota máx. do banco (%)', c.cota, '', true) +
      '</div></div><div id="kres"></div></div>';
    function calc() {
      var o = { renda: num($('#kr').value), dividas: num($('#kd').value), entrada: num($('#ke').value), idade: num($('#ki').value), taxa: num($('#kt').value), anos: num($('#ka').value), cota: num($('#kc').value) || 80 };
      grava('cap', o);
      var m = Math.min(o.anos * 12, Math.floor((80.5 - o.idade) * 12), 420);
      var marg = Math.max(0, o.renda * 0.3 - o.dividas), seg = 80;
      var sac = maxPorRenda(marg - seg, o.taxa, m, 'sac'), pr = maxPorRenda(marg - seg, o.taxa, m, 'price');
      function imv(fin) { return Math.min(fin + o.entrada, (o.entrada) / (1 - o.cota / 100)); }
      $('#kres').innerHTML = '<div class="kpis"><div class="kpi ouro"><span>Parcela máxima</span><b>' + R(marg) + '</b></div><div class="kpi"><span>Prazo possível</span><b>' + m + ' meses</b></div></div>' +
        '<div class="tab-wrap"><table class="t"><tr><th></th><th class="n">SAC</th><th class="n">Price</th></tr><tr><td>Financiamento máximo</td><td class="n">' + R(sac) + '</td><td class="n">' + R(pr) + '</td></tr><tr class="top"><td><b>Imóvel de até</b></td><td class="n"><b>' + R(imv(sac)) + '</b></td><td class="n"><b>' + R(imv(pr)) + '</b></td></tr></table></div>' +
        '<p class="fonte">"Imóvel de até" considera o limite da renda e o limite da entrada (o banco financia até ' + o.cota + '%). Se o valor do imóvel ficar travado pela entrada, o cliente precisa juntar mais entrada ou usar FGTS. Estimativa de R$ 80 de seguros e tarifa.</p>';
    }
    $$('.caixa input').forEach(function (el) { el.addEventListener('input', calc); }); calc();
  }

  /* --- Textos de guia --- */
  function pagTexto(tit, sub, html) { app.innerHTML = volta() + '<div class="titsec"><h2>' + tit + '</h2><p>' + sub + '</p></div><div class="caixa texto">' + html + '</div>'; }

  function telaFGTS() {
    pagTexto('💼 Uso do FGTS', 'Regras do Conselho Curador do FGTS e do Manual da Caixa. Confirme o caso do cliente com o extrato.',
      '<h3>Quem pode usar</h3><ul><li>Ter <b>3 anos ou mais</b> de trabalho com carteira assinada (FGTS), somando todos os empregos, mesmo que não seguidos.</li><li><b>Não ter imóvel</b> residencial (nem parte) na cidade onde mora, onde trabalha, nem nas cidades vizinhas ou da mesma região metropolitana.</li><li><b>Não ter financiamento ativo do SFH</b> em nenhum lugar do país.</li></ul>' +
      '<h3>Qual imóvel</h3><ul><li><b>Residencial urbano</b>, para o próprio cliente morar.</li><li>Na cidade onde ele mora ou trabalha (ou região metropolitana).</li><li>Valor dentro do <b>teto do SFH: R$ 2,25 milhões</b>. Acima disso é SFI e não usa FGTS.</li><li>Intervalo de <b>3 anos</b> entre um uso e outro do FGTS para compra.</li></ul>' +
      '<h3>Para que serve</h3><ul><li><b>Entrada</b> (parte do pagamento à vista ao vendedor).</li><li><b>Amortizar</b> o saldo devedor (diminuir prazo ou parcela), a cada 2 anos.</li><li><b>Pagar parte das parcelas</b> (até 80% de 12 parcelas seguidas).</li><li><b>Quitar</b> o financiamento.</li><li>Construção ou reforma em alguns programas (não para reforma comum).</li></ul>' +
      '<h3>Juros menores</h3><p>Quem tem 3 anos de FGTS tem taxa de <b>cotista</b>: menor no MCMV e na linha Pró-Cotista (Caixa e BB). Vale perguntar sempre: <i>"Você já trabalhou 3 anos de carteira assinada, somando tudo?"</i></p>' +
      '<h3>Documentos para usar</h3><ul><li>Carteira de trabalho (digital) e extrato do FGTS de todas as contas.</li><li>Declaração de IR (ou declaração de isento) para provar que não tem imóvel.</li><li>Formulários da Caixa de uso do FGTS (o correspondente gera no sistema).</li></ul>' +
      '<p class="fonte">Base: Lei 8.036/1990 e Manual do FGTS – Moradia Própria (Caixa). O teto de R$ 2,25 milhões do SFH vale desde a Resolução CMN de outubro de 2025.</p>');
  }

  function telaComecar() {
    pagTexto('🚀 Como virar correspondente bancário', 'O caminho do zero, explicado de forma simples. Conteúdo próprio, com base nas regras oficiais.',
      '<h3>1. O que é</h3><p>O <b>correspondente no País</b> é uma empresa contratada por um banco para atender clientes em nome dele: receber propostas, juntar documentos, fazer simulações e encaminhar o financiamento. Quem decide e empresta é sempre o banco. A regra é a <b>Resolução CMN nº 4.935/2021</b> do Banco Central (substituiu a 3.954/2011).</p>' +
      '<h3>2. O que a lei exige</h3><ul><li>Ser <b>empresa (CNPJ)</b>. Corretor pessoa física não é contratado direto: abra uma empresa ou trabalhe ligado a um correspondente já credenciado (sub-correspondente).</li><li>Ter <b>contrato</b> com o banco, que é o responsável pelo seu trabalho.</li><li>Quem atende operações de <b>crédito</b> precisa de <b>certificação técnica</b> reconhecida.</li><li>Mostrar ao cliente, de forma clara, que é <b>correspondente do banco X</b> (placa, site, cartão).</li><li><b>Não cobrar</b> nenhuma tarifa do cliente pelo serviço de correspondente. Quem paga você é o banco.</li><li>Não dar <b>adiantamento</b> ao cliente, não prometer aprovação e não emitir nada em nome próprio que pareça do banco.</li><li>Seguir a <b>LGPD</b>: guardar documentos com cuidado e pedir autorização para consultas.</li></ul>' +
      '<h3>3. Certificações conhecidas</h3><ul><li><b>FEBRABAN – FBB 100</b>: certificação de correspondente, muito pedida pelos bancos.</li><li><b>ANEPS</b>: exame de certificação para correspondentes (forte em consignado e crédito pessoal).</li><li><b>ABECIP – CA-300</b>: voltada a <b>crédito imobiliário</b>. A mais ligada ao seu trabalho.</li></ul><p>Cada banco escolhe quais aceita. Pergunte antes de pagar a prova. O treino desta central ajuda a estudar.</p>' +
      '<h3>4. Caixa: Correspondente CAIXA Aqui (CCA)</h3><ul><li>A Caixa contrata empresas por <b>credenciamento</b> (procure "Correspondente CAIXA Aqui" no site da Caixa).</li><li>Formatos: <b>CCA ligado a um Master</b> (uma empresa grande que organiza vários correspondentes, o caminho mais comum para corretor) ou <b>CCA Digital</b>.</li><li>Para habitação, os atendentes precisam da certificação aceita pela Caixa e do treinamento da Caixa.</li><li>Depois de credenciado, você usa o sistema da Caixa para simular, cadastrar o cliente e acompanhar o processo.</li></ul>' +
      '<h3>5. Outros bancos</h3><p>Itaú, Bradesco, Santander, BB e Inter trabalham com <b>parceiros</b> e <b>plataformas de crédito</b> (empresas que reúnem vários bancos num só sistema). É o jeito mais rápido de começar: você se cadastra na plataforma, ela é o correspondente, e você recebe parte da comissão.</p>' +
      '<h3>6. Quanto se ganha</h3><ul><li>No crédito imobiliário, o banco paga uma <b>comissão sobre o valor financiado</b>, conforme o contrato.</li><li>Ligado a um Master ou a uma plataforma, você recebe a <b>sua parte</b> (o restante fica com eles).</li><li>A comissão sai depois que o contrato é <b>assinado e registrado</b>.</li><li>Ganho extra para o corretor: o cliente aprovado compra mais rápido, e a <b>corretagem</b> do imóvel continua sendo sua (é outro serviço, separado).</li></ul>' +
      '<h3>7. Primeiros passos sugeridos</h3><ol><li>Escolher o caminho: Master da Caixa ou plataforma de vários bancos.</li><li>Abrir ou ajustar o CNPJ (CNAE de correspondente: 6619-3/02).</li><li>Estudar e fazer a certificação aceita pelo parceiro.</li><li>Assinar o contrato e fazer o treinamento.</li><li>Começar pelos seus próprios clientes compradores.</li></ol>' +
      '<p class="fonte">Base: Resolução CMN 4.935/2021 (Banco Central), páginas do Correspondente CAIXA Aqui (caixa.gov.br), ABECIP, FEBRABAN e ANEPS. Comissões variam por banco e contrato: confirme com o parceiro antes de assinar.</p>');
  }

  var ETAPAS = [
    ['Atendimento e entrevista', 'Renda, idade, FGTS, dívidas, estado civil e o imóvel desejado.', '1 dia'],
    ['Simulação', 'Simular nos bancos, escolher linha (MCMV, SBPE, Pró-Cotista) e sistema.', '1 dia'],
    ['Documentos do comprador', 'Juntar e conferir: pessoais, renda, estado civil, FGTS.', '2 a 7 dias'],
    ['Análise de crédito', 'Banco consulta SCR, Serasa e confirma renda. Sai o limite aprovado.', '2 a 10 dias'],
    ['Escolha do imóvel e documentos do vendedor', 'Matrícula atualizada, certidões do vendedor e do imóvel.', '3 a 10 dias'],
    ['Avaliação de engenharia', 'O banco manda um avaliador ao imóvel. Valor de avaliação define o máximo financiado.', '5 a 10 dias'],
    ['Análise jurídica (conformidade)', 'O banco confere documentos do vendedor e do imóvel e aprova o dossiê.', '5 a 15 dias'],
    ['Emissão e assinatura do contrato', 'Contrato com força de escritura. Pagamento de ITBI antes ou junto.', '3 a 10 dias'],
    ['Registro no cartório', 'Registro do contrato na matrícula (alienação fiduciária).', '15 a 30 dias'],
    ['Liberação do dinheiro', 'Banco paga o vendedor após o registro. Comissão é liberada.', '3 a 10 dias']
  ];
  function telaEtapas() {
    app.innerHTML = volta() + '<div class="titsec"><h2>🧭 Passo a passo do processo</h2><p>Do primeiro contato ao dinheiro na conta do vendedor. Total comum: 30 a 90 dias.</p></div><ol class="passos">' +
      ETAPAS.map(function (e) { return '<li><b>' + e[0] + '</b>' + e[1] + '<br><small>⏱️ ' + e[2] + '</small></li>'; }).join('') + '</ol>' +
      '<div class="caixa texto" style="margin-top:12px"><h3>Dicas para não travar</h3><ul><li>Peça a <b>matrícula atualizada</b> logo no começo: problemas na matrícula são a maior causa de atraso.</li><li>Aprovação de crédito tem <b>validade</b> (normalmente 60 a 90 dias). Não deixe vencer.</li><li>Se a avaliação vier abaixo do preço, o cliente completa a diferença na entrada.</li><li>Estado civil errado ou certidão desatualizada faz o cartório devolver o contrato.</li><li>Combine com o vendedor por escrito que o pagamento vem <b>após o registro</b>.</li></ul></div>';
  }

  /* --- Checklists --- */
  var LISTAS = {
    'Comprador – todos': ['RG e CPF (ou CNH) de todos que compõem renda', 'Certidão de nascimento ou casamento (com averbação, se divorciado/viúvo)', 'Pacto antenupcial ou escritura de união estável, se houver', 'Comprovante de residência atualizado (até 60 dias)', 'Declaração de IR completa com recibo (ou declaração de isento)', 'Extrato do FGTS e carteira de trabalho digital (se usar FGTS)', 'Autorização de consulta de dados assinada (LGPD)'],
    'Comprador – assalariado': ['3 últimos holerites', 'Carteira de trabalho (contrato atual)', 'Extrato bancário com o crédito do salário, se pedido'],
    'Comprador – autônomo / empresário': ['Extratos bancários dos últimos 6 meses', 'Declaração de IR com recibo', 'Contrato social e últimas alterações (empresário)', 'Pró-labore ou DECORE assinada por contador', 'Declaração de faturamento dos últimos 12 meses'],
    'Comprador – aposentado / pensionista': ['Extrato de pagamento do benefício (INSS / órgão)', 'Carta de concessão do benefício'],
    'Vendedor pessoa física': ['RG e CPF (e do cônjuge)', 'Certidão de estado civil atualizada (até 90 dias)', 'Comprovante de residência', 'Certidões de distribuidores cíveis, fiscais e trabalhistas (quando o banco pedir)', 'Dados bancários para receber o pagamento'],
    'Imóvel': ['Matrícula atualizada com ônus e ações (até 30 dias)', 'Certidão negativa de débitos de IPTU', 'Capa do carnê do IPTU (valor venal)', 'Declaração de quitação de condomínio (apartamento)', 'Habite-se / averbação da construção na matrícula', 'Planta ou memorial (imóvel na planta / construção)']
  };
  function telaDocs() {
    var marc = ler('docs', {});
    app.innerHTML = volta() + '<div class="titsec naoimp"><h2>📂 Checklists de documentos</h2><p>Toque para marcar o que já chegou. Fica salvo neste aparelho. Use "Limpar" ao começar um cliente novo.</p></div>' +
      '<div class="bts naoimp" style="margin-bottom:12px"><button class="bt ouro" id="d-pdf">🖨️ Imprimir lista em branco</button><button class="bt" id="d-zap">💬 Mandar lista no WhatsApp</button><button class="bt" id="d-lim">🧹 Limpar marcações</button></div>' +
      '<div class="naoimp">' + Object.keys(LISTAS).map(function (g) {
        var L = LISTAS[g], f = L.filter(function (_, k) { return marc[g + k]; }).length;
        return '<div class="caixa" style="margin-bottom:12px"><div class="sec" style="margin-top:0;border:0;padding:0">' + g + ' <small style="color:var(--mu);font-family:var(--sans);font-size:.8rem">' + f + '/' + L.length + '</small></div><div class="barra-prog"><i style="width:' + (f / L.length * 100) + '%"></i></div>' +
          L.map(function (d, k) { var on = marc[g + k]; return '<label class="chk' + (on ? ' feito' : '') + '"><input type="checkbox" data-id="' + esc(g + k) + '"' + (on ? ' checked' : '') + '><span>' + d + '</span></label>'; }).join('') + '</div>';
      }).join('') + '</div>' +
      '<div class="folha-wrap so-folha" style="display:none" id="d-folha"><div class="folha"><div class="cab"><img src="/logo-fcosta.png" alt=""><div><b>' + PERFIL.nome + '</b><small>' + PERFIL.creci + ' · WhatsApp ' + PERFIL.zap + '</small></div></div><h1>Documentos para financiamento</h1><p>Cliente: <span class="linha"></span></p>' +
      Object.keys(LISTAS).map(function (g) { return '<h3>' + g + '</h3><ul class="ck">' + LISTAS[g].map(function (d) { return '<li>' + d + '</li>'; }).join('') + '</ul>'; }).join('') + '<div class="nota">O banco pode pedir outros documentos conforme o caso.</div></div></div>';
    $$('input[data-id]').forEach(function (el) { el.onchange = function () { var m = ler('docs', {}); m[el.dataset.id] = el.checked; grava('docs', m); telaDocs(); }; });
    $('#d-lim').onclick = function () { grava('docs', {}); telaDocs(); };
    $('#d-pdf').onclick = function () { $('#d-folha').style.display = 'block'; imprimir(); setTimeout(function () { $('#d-folha').style.display = 'none'; }, 800); };
    $('#d-zap').onclick = function () {
      var t = '*Documentos para o financiamento*\n';
      ['Comprador – todos', 'Comprador – assalariado'].forEach(function (g) { t += '\n*' + g.replace('Comprador – ', '') + '*\n' + LISTAS[g].map(function (d) { return '• ' + d; }).join('\n') + '\n'; });
      t += '\nSe for autônomo ou aposentado, me avise que mando a lista certa. 🙏\n' + PERFIL.nome; zap(t);
    };
  }

  /* --- Modelos --- */
  function telaModelos() {
    var d = ler('mod', { nome: '', cpf: '', fone: '', email: '', banco: 'Caixa Econômica Federal' });
    var MSG = [
      ['Primeiro contato', 'Olá, {nome}! Aqui é o ' + PERFIL.nome + ', corretor e correspondente. Posso fazer uma simulação de financiamento para você sem compromisso. Me diga: renda bruta da família, idade e se tem 3 anos de FGTS. 😊'],
      ['Pedir documentos', '{nome}, para dar entrada na análise de crédito preciso destes documentos (pode ser foto bem nítida):\n• RG e CPF\n• Certidão de nascimento ou casamento\n• Comprovante de residência\n• 3 últimos holerites\n• Declaração de IR\nSeus dados ficam guardados com segurança. 🔒'],
      ['Crédito aprovado', 'Boa notícia, {nome}! 🎉 Seu crédito foi aprovado. Agora vamos escolher o imóvel e seguir para a avaliação. A aprovação vale por tempo limitado, então vamos agilizar. Qualquer dúvida, me chame.'],
      ['Pendência', '{nome}, o banco pediu mais um documento para seguir: ______. Assim que você me enviar, eu encaminho no mesmo dia. 👍'],
      ['Assinatura do contrato', '{nome}, o contrato está pronto! 📄 A assinatura será em __/__ às __h. Leve RG e CPF originais. Antes disso precisamos pagar o ITBI. Te passo a guia.'],
      ['Pós-venda', 'Parabéns pela casa nova, {nome}! 🏡 Foi uma alegria ajudar. Se algum amigo ou parente quiser comprar ou financiar, pode indicar. Deus abençoe o novo lar!']
    ];
    app.innerHTML = volta() + '<div class="titsec naoimp"><h2>📝 Modelos e mensagens</h2><p>Preencha os dados do cliente uma vez. Os documentos e mensagens se ajustam sozinhos.</p></div>' +
      '<div class="caixa naoimp" style="margin-bottom:14px"><div class="fl">' + campo('mn', 'Nome do cliente', d.nome, '', false, 'txt') + campo('mc', 'CPF', d.cpf, '', true, 'txt') + campo('mf', 'WhatsApp', d.fone, '', true, 'txt') + campo('mb', 'Banco', d.banco, '', false, 'txt') + '</div></div>' +
      '<div class="pilulas naoimp"><button class="bt ativo" data-m="msg">💬 Mensagens</button><button class="bt" data-m="ficha">📋 Ficha do cliente</button><button class="bt" data-m="lgpd">🔒 Autorização LGPD</button><button class="bt" data-m="prot">📥 Protocolo de documentos</button></div><div id="mod"></div>';
    var aba = 'msg';
    function cab() { return '<div class="cab"><img src="/logo-fcosta.png" alt=""><div><b>' + PERFIL.nome + '</b><small>Corretor de Imóveis · ' + PERFIL.creci + ' · ' + PERFIL.cnai + '</small><small>WhatsApp ' + PERFIL.zap + ' · ' + PERFIL.site + '</small></div></div>'; }
    function L(v) { return v ? '<b>' + esc(v) + '</b>' : '<span class="linha"></span>'; }
    function render() {
      var o = { nome: $('#mn').value, cpf: $('#mc').value, fone: $('#mf').value, banco: $('#mb').value }; grava('mod', o);
      var nm = o.nome.split(' ')[0] || 'tudo bem';
      var h = '';
      if (aba === 'msg') {
        h = MSG.map(function (m, k) { var t = m[1].replace(/\{nome\}/g, o.nome ? nm : '').replace(/^Olá, !/, 'Olá!').replace(/^, /, ''); return '<div class="msg"><div class="msg-t">' + m[0] + '</div>' + esc(t) + '<div class="bts"><button class="bt p" data-c="' + k + '">📋 Copiar</button><button class="bt p ouro" data-z="' + k + '">💬 WhatsApp</button></div></div>'; }).join('');
        $('#mod').innerHTML = h;
        $$('[data-c]').forEach(function (b) { b.onclick = function () { copiar(b.closest('.msg').childNodes[1].textContent); }; });
        $$('[data-z]').forEach(function (b) { b.onclick = function () { zap(b.closest('.msg').childNodes[1].textContent, o.fone); }; });
        return;
      }
      if (aba === 'ficha') {
        var it = ['Nome completo', 'CPF', 'RG / órgão', 'Data de nascimento', 'Estado civil / regime', 'Profissão', 'Empresa / tempo de serviço', 'Renda bruta mensal', 'Telefone / WhatsApp', 'E-mail', 'Endereço atual', 'Tem 3 anos de FGTS?', 'Saldo FGTS aproximado', 'Possui imóvel?', 'Tem financiamento ativo?', 'Outras dívidas mensais', 'Entrada disponível', 'Imóvel pretendido / valor'];
        h = cab() + '<h1>Ficha de Atendimento – Financiamento</h1><p style="text-align:center">Data: ' + hoje() + '</p><h3>Comprador</h3><table>' + it.map(function (x) { var v = x === 'Nome completo' ? o.nome : x === 'CPF' ? o.cpf : x === 'Telefone / WhatsApp' ? o.fone : ''; return '<tr><th style="width:38%">' + x + '</th><td>' + esc(v) + '&nbsp;</td></tr>'; }).join('') + '</table><h3>Segundo proponente (cônjuge / composição de renda)</h3><table>' + it.slice(0, 9).map(function (x) { return '<tr><th style="width:38%">' + x + '</th><td>&nbsp;</td></tr>'; }).join('') + '</table><h3>Observações</h3><p><span class="linha" style="width:100%"></span></p><p><span class="linha" style="width:100%"></span></p>';
      }
      if (aba === 'lgpd') {
        h = cab() + '<h1>Autorização para Consulta de Dados</h1><p style="text-align:justify">Eu, ' + L(o.nome) + ', CPF ' + L(o.cpf) + ', autorizo ' + PERFIL.nome + ' (' + PERFIL.creci + '), na função de intermediário e correspondente, a receber meus documentos pessoais e de renda e a encaminhá-los ao banco ' + L(o.banco) + ' com a finalidade exclusiva de análise de crédito para financiamento imobiliário.</p><p style="text-align:justify">Autorizo também o banco a consultar minhas informações no Sistema de Informações de Crédito do Banco Central (SCR) e em órgãos de proteção ao crédito, conforme a Lei 13.709/2018 (LGPD).</p><p style="text-align:justify">Fui informado(a) de que: (1) meus dados serão usados só para esta finalidade; (2) não pago nenhuma tarifa ao correspondente; (3) a aprovação depende exclusivamente do banco; (4) posso pedir a exclusão dos meus documentos quando o processo terminar.</p><p>São Paulo, ' + hoje() + '.</p><div class="ass"><div class="l">' + (o.nome ? esc(o.nome) : 'Assinatura do cliente') + '</div></div>';
      }
      if (aba === 'prot') {
        var docs = LISTAS['Comprador – todos'].concat(LISTAS['Comprador – assalariado']);
        h = cab() + '<h1>Protocolo de Recebimento de Documentos</h1><p>Recebi de ' + L(o.nome) + ', CPF ' + L(o.cpf) + ', os documentos marcados abaixo, para análise de crédito no banco ' + L(o.banco) + '.</p><ul class="ck">' + docs.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '<li>Outros: <span class="linha"></span></li></ul><p>Data: ' + hoje() + '</p><div class="ass" style="display:flex;gap:20px"><div class="l" style="flex:1">' + PERFIL.nome + '</div><div class="l" style="flex:1">' + (o.nome ? esc(o.nome) : 'Cliente') + '</div></div>';
      }
      $('#mod').innerHTML = '<div class="bts naoimp" style="margin:0 0 10px"><button class="bt ouro" id="m-pdf">🖨️ Imprimir / PDF</button></div><div class="folha-wrap so-folha"><div class="folha">' + h + '</div></div>';
      $('#m-pdf').onclick = imprimir;
    }
    $$('[data-m]').forEach(function (b) { b.onclick = function () { aba = b.dataset.m; $$('[data-m]').forEach(function (x) { x.classList.toggle('ativo', x === b); }); render(); }; });
    $$('.caixa input').forEach(function (el) { el.addEventListener('input', render); });
    render();
  }

  /* --- Clientes --- */
  function telaClientes() {
    var L = ler('clientes', []), filtro = ler('cli-f', 'todos');
    var lista = L.filter(function (c) { return filtro === 'todos' || (filtro === 'and' ? c.etapa < ETAPAS.length : c.etapa >= ETAPAS.length); });
    app.innerHTML = volta() + '<div class="titsec"><h2>👥 Meus clientes</h2><p>' + L.length + ' cliente(s). Toque em "Avançar" quando o processo passar de etapa.</p></div>' +
      '<div class="bts" style="margin-bottom:12px"><button class="bt ouro" id="c-novo">➕ Novo cliente</button><button class="bt' + (filtro === 'todos' ? ' ativo' : '') + '" data-f="todos">Todos</button><button class="bt' + (filtro === 'and' ? ' ativo' : '') + '" data-f="and">Em andamento</button><button class="bt' + (filtro === 'fim' ? ' ativo' : '') + '" data-f="fim">Concluídos</button></div><div id="c-form"></div>' +
      (lista.length ? lista.map(function (c) {
        var e = Math.min(c.etapa, ETAPAS.length);
        return '<div class="cli"><b>' + esc(c.nome) + '</b><small>' + (c.fone ? esc(c.fone) + ' · ' : '') + 'Renda ' + R(c.renda) + ' · Imóvel ' + R(c.valor) + ' · ' + esc(c.banco || '') + ' · desde ' + esc(c.data) + '</small>' +
          '<div style="font-size:.9rem">Etapa ' + e + '/' + ETAPAS.length + ': <b style="color:var(--goldl);font-family:var(--sans)">' + ETAPAS[e - 1][0] + '</b></div><div class="barra-prog"><i style="width:' + (e / ETAPAS.length * 100) + '%"></i></div>' + (c.obs ? '<small>' + esc(c.obs) + '</small>' : '') +
          '<div class="bts"><button class="bt p ouro" data-av="' + c.id + '">✓ Avançar</button><button class="bt p" data-vt="' + c.id + '">↩</button><button class="bt p" data-ed="' + c.id + '">✏️ Editar</button>' + (c.fone ? '<button class="bt p" data-zp="' + c.id + '">💬</button>' : '') + '<button class="bt p" data-ap="' + c.id + '">🗑️</button></div></div>';
      }).join('') : '<div class="alerta info">Nenhum cliente aqui ainda. Toque em "Novo cliente" ou salve uma simulação.</div>') +
      '<div class="bts" style="margin-top:16px"><button class="bt p" id="c-exp">💾 Cópia de segurança</button><label class="bt p" style="cursor:pointer">📂 Restaurar cópia<input type="file" id="c-imp" accept=".json" hidden></label></div>';
    function acha(id) { return L.filter(function (c) { return String(c.id) === String(id); })[0]; }
    function salva() { grava('clientes', L); telaClientes(); }
    function form(c) {
      c = c || { id: Date.now(), nome: '', fone: '', renda: '', valor: '', banco: 'Caixa', etapa: 1, obs: '', data: hoje(), novo: 1 };
      $('#c-form').innerHTML = '<div class="caixa" style="margin-bottom:12px"><div class="fl">' + campo('fn', 'Nome', c.nome, '', false, 'txt') + campo('ff', 'WhatsApp', c.fone, '', true, 'txt') + campo('fb', 'Banco', c.banco, '', true, 'txt') + campo('fr', 'Renda', c.renda, '', true) + campo('fv', 'Valor do imóvel', c.valor, '', true) +
        '<div class="c"><label for="fe">Etapa</label><select id="fe">' + ETAPAS.map(function (e, k) { return '<option value="' + (k + 1) + '"' + (c.etapa === k + 1 ? ' selected' : '') + '>' + (k + 1) + '. ' + e[0] + '</option>'; }).join('') + '</select></div>' +
        '<div class="c"><label for="fo">Anotações</label><textarea id="fo">' + esc(c.obs) + '</textarea></div></div><div class="bts"><button class="bt ouro" id="fs">Salvar</button><button class="bt" id="fc">Cancelar</button></div></div>';
      $('#fc').onclick = function () { $('#c-form').innerHTML = ''; };
      $('#fs').onclick = function () {
        var o = { id: c.id, nome: $('#fn').value || 'Sem nome', fone: $('#ff').value, banco: $('#fb').value, renda: num($('#fr').value), valor: num($('#fv').value), etapa: +$('#fe').value, obs: $('#fo').value, data: c.data };
        if (c.novo) L.unshift(o); else L[L.indexOf(acha(c.id))] = o; salva();
      };
      window.scrollTo(0, 0);
    }
    $('#c-novo').onclick = function () { form(); };
    $$('[data-f]').forEach(function (b) { b.onclick = function () { grava('cli-f', b.dataset.f); telaClientes(); }; });
    $$('[data-av]').forEach(function (b) { b.onclick = function () { var c = acha(b.dataset.av); c.etapa = Math.min(ETAPAS.length, c.etapa + 1); salva(); }; });
    $$('[data-vt]').forEach(function (b) { b.onclick = function () { var c = acha(b.dataset.vt); c.etapa = Math.max(1, c.etapa - 1); salva(); }; });
    $$('[data-ed]').forEach(function (b) { b.onclick = function () { form(acha(b.dataset.ed)); }; });
    $$('[data-zp]').forEach(function (b) { b.onclick = function () { var c = acha(b.dataset.zp); zap('Olá, ' + c.nome.split(' ')[0] + '! Passando para dar notícia do seu financiamento: estamos na etapa "' + ETAPAS[Math.min(c.etapa, ETAPAS.length) - 1][0] + '". ', c.fone); }; });
    $$('[data-ap]').forEach(function (b) { b.onclick = function () { if (confirm('Apagar este cliente?')) { L.splice(L.indexOf(acha(b.dataset.ap)), 1); salva(); } }; });
    $('#c-exp').onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(L)], { type: 'application/json' })); a.download = 'clientes-correspondente-' + hoje().replace(/\//g, '-') + '.json'; a.click(); };
    $('#c-imp').onchange = function () { var f = this.files[0]; if (!f) return; f.text().then(function (t) { try { var x = JSON.parse(t); if (Array.isArray(x)) { grava('clientes', x); telaClientes(); aviso('Cópia restaurada ✓'); } } catch (e) { aviso('Arquivo inválido'); } }); };
  }

  /* --- Glossário --- */
  var GLOS = [
    ['Alienação fiduciária', 'O imóvel fica em nome do banco como garantia até a quitação. O comprador mora e usa normalmente. Se não pagar, o banco pode retomar (Lei 9.514/1997).'],
    ['Amortização', 'Parte da parcela que diminui a dívida de verdade. O resto é juros e seguros.'],
    ['CCA', 'Correspondente CAIXA Aqui: empresa credenciada pela Caixa para atender clientes.'],
    ['CET', 'Custo Efetivo Total: juros + seguros + tarifas, em % ao ano. É o número certo para comparar bancos.'],
    ['Composição de renda', 'Somar a renda de duas ou mais pessoas (cônjuge, parentes) para aumentar o valor aprovado.'],
    ['Cota de financiamento', 'Percentual máximo do imóvel que o banco financia. No SBPE costuma ser até 80%.'],
    ['DFI', 'Seguro de Danos Físicos ao Imóvel (incêndio, desabamento). Obrigatório.'],
    ['FGTS', 'Fundo de Garantia. Pode pagar entrada, amortizar ou quitar, com regras próprias.'],
    ['ITBI', 'Imposto municipal pago na compra (em São Paulo, 3%; parte financiada tem alíquota menor no SFH). Pago antes do registro.'],
    ['MIP', 'Seguro de Morte e Invalidez Permanente. Quita a dívida (na proporção da renda) se o comprador falecer ou ficar inválido. Fica mais caro com a idade.'],
    ['MCMV', 'Minha Casa Minha Vida: programa do governo com juros menores e subsídio para rendas menores.'],
    ['Portabilidade', 'Levar o financiamento para outro banco com juros menores, sem custo de nova compra.'],
    ['Price', 'Sistema com parcela fixa (sem contar a TR). Começa menor que o SAC, mas paga mais juros no total.'],
    ['Pró-Cotista', 'Linha com recursos do FGTS e juros menores, para quem tem 3 anos de FGTS e não está no MCMV.'],
    ['SAC', 'Sistema de Amortização Constante. A parcela começa maior e diminui todo mês. Paga menos juros no total.'],
    ['SBPE', 'Sistema Brasileiro de Poupança e Empréstimo: dinheiro da poupança que os bancos usam para financiar imóveis (taxa de mercado).'],
    ['SCR', 'Sistema de Informações de Crédito do Banco Central. Mostra todas as dívidas do cliente nos bancos.'],
    ['SFH', 'Sistema Financeiro da Habitação: imóveis até R$ 2,25 milhões, juros limitados e uso do FGTS.'],
    ['SFI', 'Sistema de Financiamento Imobiliário: imóveis acima do teto do SFH ou comerciais. Regras livres, sem FGTS.'],
    ['Subsídio', 'Desconto dado pelo governo no MCMV (Faixas 1 e 2). Não precisa devolver.'],
    ['TR', 'Taxa Referencial. Corrige o saldo devedor. Por isso a taxa é escrita "X% + TR".'],
    ['Valor de avaliação', 'Valor que o engenheiro do banco dá ao imóvel. O banco financia sobre o menor valor entre compra e avaliação.']
  ];
  function telaGlossario() {
    app.innerHTML = volta() + '<div class="titsec"><h2>📖 Glossário</h2><p>As palavras do crédito imobiliário em linguagem simples.</p></div><div class="caixa"><div class="c"><input id="gb" placeholder="Procurar palavra…" style="width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--s2);color:var(--tx);font-size:16px"></div><dl class="glos" id="gl"></dl></div>';
    function r() { var q = $('#gb').value.toLowerCase(); $('#gl').innerHTML = GLOS.filter(function (g) { return !q || (g[0] + g[1]).toLowerCase().indexOf(q) >= 0; }).map(function (g) { return '<dt>' + g[0] + '</dt><dd>' + g[1] + '</dd>'; }).join(''); }
    $('#gb').addEventListener('input', r); r();
  }

  /* --- Treino --- */
  var QUIZ = [
    ['Qual norma do Banco Central regula hoje os correspondentes no País?', ['Resolução CMN 3.954/2011', 'Resolução CMN 4.935/2021', 'Lei 9.514/1997', 'Lei 8.036/1990'], 1, 'A Resolução CMN 4.935/2021 substituiu a 3.954/2011.'],
    ['O correspondente pode cobrar tarifa do cliente pelo atendimento?', ['Sim, até 1% do valor', 'Sim, se o cliente concordar', 'Não, quem remunera é o banco', 'Só no MCMV'], 2, 'É proibido cobrar do cliente pelo serviço de correspondente.'],
    ['Quem é responsável perante o cliente pelos serviços do correspondente?', ['Só o correspondente', 'O banco contratante', 'O Banco Central', 'O cartório'], 1, 'O banco responde pelos atos do correspondente que contratou.'],
    ['No sistema SAC, a parcela:', ['É fixa do começo ao fim', 'Começa maior e diminui', 'Começa menor e aumenta', 'Só tem juros'], 1, 'A amortização é constante e os juros caem com o saldo.'],
    ['Qual o comprometimento de renda mais usado pelos bancos?', ['10%', '30%', '50%', '70%'], 1, 'Em geral a parcela pode usar até 30% da renda bruta.'],
    ['Para usar o FGTS na compra, o cliente precisa de:', ['1 ano de FGTS', '3 anos de FGTS, somando empregos', '5 anos no mesmo emprego', 'Ser servidor público'], 1, 'São 3 anos de trabalho sob regime do FGTS, contínuos ou não.'],
    ['O seguro MIP cobre:', ['Danos ao imóvel', 'Morte e invalidez permanente', 'Desemprego', 'Atraso de obra'], 1, 'MIP = Morte e Invalidez Permanente. DFI cobre danos físicos ao imóvel.'],
    ['Qual número usar para comparar o custo real entre bancos?', ['Taxa nominal', 'CET', 'TR', 'Valor da 1ª parcela'], 1, 'O CET soma juros, seguros e tarifas.'],
    ['A garantia mais comum no financiamento imobiliário é:', ['Hipoteca', 'Fiança', 'Alienação fiduciária', 'Penhor'], 2, 'Pela Lei 9.514/1997, o imóvel fica alienado ao banco até a quitação.'],
    ['Imóvel acima do teto do SFH é financiado pelo:', ['MCMV', 'SFI', 'FGTS', 'Pró-Cotista'], 1, 'Acima do teto entra no SFI, sem uso de FGTS.'],
    ['Para consultar o SCR do cliente, é preciso:', ['Nada, é público', 'Autorização do cliente', 'Ordem judicial', 'Ser gerente do banco'], 1, 'A consulta ao SCR exige autorização do cliente (e respeito à LGPD).'],
    ['O banco financia com base em qual valor do imóvel?', ['O maior entre compra e avaliação', 'O menor entre compra e avaliação', 'O valor venal do IPTU', 'O valor que o cliente informar'], 1, 'Vale sempre o menor entre o preço de compra e a avaliação do banco.']
  ];
  function telaTreino() {
    var resp = {};
    app.innerHTML = volta() + '<div class="titsec"><h2>🎓 Treino para a prova</h2><p>Perguntas próprias, no estilo das provas de certificação. Toque na resposta: a explicação aparece na hora.</p></div><div id="pl" class="alerta info">Acertos: 0 de ' + QUIZ.length + '</div>' +
      QUIZ.map(function (q, k) { return '<div class="q" id="q' + k + '"><p>' + (k + 1) + '. ' + q[0] + '</p>' + q[1].map(function (o, j) { return '<label><input type="radio" name="r' + k + '" value="' + j + '"> ' + o + '</label>'; }).join('') + '<div class="exp">💡 ' + q[3] + '</div></div>'; }).join('') +
      '<button class="bt" id="qz">↺ Recomeçar</button>';
    $$('.q input').forEach(function (el) {
      el.onchange = function () {
        var k = +el.name.slice(1), q = QUIZ[k], box = $('#q' + k); if (resp[k] != null) return;
        resp[k] = +el.value === q[2]; box.classList.add('resp');
        $$('label', box).forEach(function (l, j) { if (j === q[2]) l.classList.add('certo'); else if (j === +el.value) l.classList.add('errado'); $('input', l).disabled = true; });
        var ac = Object.keys(resp).filter(function (x) { return resp[x]; }).length;
        $('#pl').textContent = 'Acertos: ' + ac + ' de ' + QUIZ.length + (Object.keys(resp).length === QUIZ.length ? (ac >= 9 ? ' · Muito bem! 🎉' : ' · Revise o glossário e tente de novo.') : '');
      };
    });
    $('#qz').onclick = telaTreino;
  }

  /* ---------- rotas ---------- */
  var ROTAS = { '': telaInicio, simulador: telaSimulador, bancos: telaBancos, mcmv: telaMCMV, capacidade: telaCapacidade, fgts: telaFGTS, comecar: telaComecar, etapas: telaEtapas, documentos: telaDocs, modelos: telaModelos, clientes: telaClientes, glossario: telaGlossario, treino: telaTreino };
  function rota() { var r = (location.hash || '').replace(/^#\/?/, ''); (ROTAS[r] || telaInicio)(); window.scrollTo(0, 0); }
  window.addEventListener('hashchange', rota);
  rota();
})();
