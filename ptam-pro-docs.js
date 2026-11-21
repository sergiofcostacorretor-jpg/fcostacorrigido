/* ptam-pro-docs.js — formulários, ferramentas do dia a dia, tabelas e guias */
(function () {
  'use strict';
  var PP = window.PP, h = PP.h, esc = PP.esc, num = PP.num, R = PP.R, N = PP.N;
  function F(k, l, t, x) { var o = { k: k, l: l, t: t || 'text' }; if (x) for (var i in x) o[i] = x[i]; return o; }
  function m(k, l, t, x) { x = x || {}; x.w = 'm'; return F(k, l, t, x); }
  var add = PP.add;
  h.msg = function (t) { return '<div class="msg"><div class="msg-t">' + esc(t) + '</div><div class="msg-bts"><button data-copia="1">📋 Copiar</button><button data-zap="1">💬 WhatsApp</button></div></div>'; };
  function nomeCurto(P) { var p = P.nome.split(' '); return p[0] + ' ' + p[p.length - 1]; }
  function marcados(lista, sel) { return (sel || []).slice().sort(function (a, b) { return a - b; }).map(function (i) { return lista[i]; }).filter(Boolean); }
  var SERVICOS = ['PTAM – Parecer Técnico de Avaliação Mercadológica', 'PTAM resumido (opinião de valor)', 'Laudo para fins judiciais', 'Avaliação de aluguel', 'Avaliação para inventário / partilha', 'Avaliação de imóvel rural', 'Consultoria de compra / venda'];

  /* =============== LAUDOS: checklist =============== */
  var DOC_JUD = ['Cópia da decisão que nomeou o perito / determinou a avaliação', 'Número do processo, vara e comarca', 'Quesitos das partes e do juízo', 'Matrícula atualizada (até 30 dias)', 'Carnê do IPTU ou certidão de valor venal', 'Planta / croqui do imóvel (se houver)', 'Habite-se ou certidão de construção averbada', 'Documentos pessoais das partes (para identificação)', 'Contato das partes e assistentes técnicos para a vistoria', 'Comprovante de intimação das partes sobre data da vistoria', 'Fotos atuais do imóvel', 'Pesquisa de mercado com fontes (prints ou links)', 'Proposta de honorários aprovada / depósito judicial', 'Prazo de entrega do laudo anotado na agenda', 'Para rural: CCIR, ITR, CAR e georreferenciamento'];
  add({
    id: 'laudo-checklist', cat: 'laudo', ic: '✅', titulo: 'Checklist de documentos para laudo judicial',
    desc: 'Marque o que já tem. Imprima e deixe na pasta do processo.',
    campos: [F('processo', 'Processo nº'), m('vara', 'Vara', 'text'), m('prazo', 'Prazo de entrega', 'date'), F('ok', 'Documentos', 'chk', { o: DOC_JUD }), F('obs', 'Observações', 'area')],
    render: function (d) {
      var falta = DOC_JUD.length - (d.ok || []).length;
      return h.t('Checklist – Laudo Judicial', d.processo ? 'Processo ' + esc(d.processo) : '') + h.kv([['Vara', d.vara], ['Prazo de entrega', PP.dt(d.prazo)], ['Itens pendentes', String(falta)]]) + h.ck(DOC_JUD, d.ok) + h.p(d.obs);
    }
  });

  /* =============== FORMULÁRIOS =============== */
  var ESTADOS = ['', 'Ótimo', 'Bom', 'Regular', 'Ruim', 'Péssimo'];
  add({
    id: 'form-vistoria', cat: 'form', ic: '📝', titulo: 'Termo de vistoria',
    desc: 'Registra que a vistoria aconteceu, quem acompanhou e como estava cada cômodo.',
    campos: [F('cliente', 'Solicitante'), F('endereco', 'Endereço do imóvel'), m('data', 'Data', 'date'), m('hora', 'Hora', 'time'), m('acomp', 'Quem acompanhou', 'text'), m('acomp_doc', 'Documento de quem acompanhou', 'text'),
      F('finalidade', 'Finalidade da vistoria', 'text', { v: 'Avaliação mercadológica do imóvel' }),
      F('comodos', 'Cômodos vistoriados', 'tab', { item: 'Cômodo', cols: [m('nome', 'Cômodo', 'text'), m('estado', 'Estado', 'sel', { o: ESTADOS }), F('obs', 'Observações (piso, paredes, teto)')] }),
      F('obs', 'Observações gerais', 'area')],
    inicio: function (d) { d.data = PP.hoje(); d.comodos = ['Sala', 'Cozinha', 'Dormitório 1', 'Dormitório 2', 'Banheiro', 'Área de serviço'].map(function (n) { return { nome: n }; }); },
    render: function (d, c) {
      return h.t('Termo de Vistoria') + h.kv([['Solicitante', d.cliente], ['Imóvel', d.endereco], ['Data e hora', (PP.dt(d.data) || '') + (d.hora ? ' às ' + d.hora : '')], ['Acompanhado por', d.acomp], ['Documento', d.acomp_doc], ['Finalidade', d.finalidade]], true) +
        h.s('Cômodos') + h.tab(['Cômodo', 'Estado', 'Observações'], (d.comodos || []).map(function (x) { return [esc(x.nome || ''), esc(x.estado || ''), esc(x.obs || '')]; })) +
        h.s('Observações') + (d.obs ? h.p(d.obs) : '<p><span class="branco" style="width:100%"></span></p><p><span class="branco" style="width:100%"></span></p>') +
        h.p('Declaramos que a vistoria foi realizada na data acima, com livre acesso às dependências descritas, sem medições técnicas de engenharia.') +
        h.ass2(c.P.nome, 'Avaliador · ' + c.P.creci, d.acomp, 'Acompanhante');
    }
  });
  add({
    id: 'form-fotos', cat: 'form', ic: '📸', titulo: 'Relatório fotográfico da vistoria',
    desc: 'Tire as fotos pelo celular, coloque legenda e gere o relatório.',
    campos: [F('endereco', 'Imóvel'), m('data', 'Data da vistoria', 'date'), m('cliente', 'Solicitante', 'text'), F('fotos', 'Fotos', 'fotos'), F('obs', 'Observações', 'area')],
    inicio: function (d) { d.data = PP.hoje(); },
    render: function (d) { return h.t('Relatório Fotográfico') + h.kv([['Imóvel', d.endereco], ['Solicitante', d.cliente], ['Data da vistoria', PP.dt(d.data)], ['Total de fotos', String((d.fotos || []).length)]]) + (h.fotos(d.fotos) || h.p('Nenhuma foto adicionada.')) + h.p(d.obs); }
  });
  var ONUS = ['Hipoteca', 'Alienação fiduciária', 'Penhora', 'Arresto / sequestro', 'Usufruto', 'Indisponibilidade de bens', 'Servidão', 'Cláusula de inalienabilidade / impenhorabilidade', 'Ação judicial averbada', 'Promessa de compra e venda registrada'];
  add({
    id: 'form-juridica', cat: 'form', ic: '⚖️', titulo: 'Análise da situação jurídica (matrícula e zoneamento)',
    desc: 'Resumo do que a matrícula e a prefeitura dizem sobre o imóvel.',
    campos: [F('endereco', 'Imóvel'), m('matricula', 'Matrícula', 'text'), m('cartorio', 'Cartório', 'text'), m('data_cert', 'Data da certidão', 'date'), m('prop', 'Proprietário(s) na matrícula', 'text'),
      m('area_reg', 'Área na matrícula (m²)', 'num'), m('area_real', 'Área real / medida (m²)', 'num'), m('averb', 'Construção averbada', 'sel', { o: ['', 'Sim, conforme', 'Sim, mas diferente do real', 'Não averbada'] }),
      F('onus', 'Ônus e restrições encontrados', 'chk', { o: ONUS }), F('', 'Prefeitura', 'sec'), m('zona', 'Zoneamento', 'text'), m('uso', 'Uso permitido', 'text'), m('iptu_deb', 'Débitos de IPTU', 'sel', { o: ['', 'Não há', 'Há débitos', 'Não verificado'] }),
      F('restr', 'Outras restrições (APP, tombamento, recuo, faixa non aedificandi)', 'area'), F('conc', 'Conclusão', 'sel', { o: ['Sem impedimentos para venda', 'Com pendências que precisam ser resolvidas', 'Impedimento para venda no momento'] }), F('obs', 'Comentários', 'area')],
    render: function (d) {
      var dif = num(d.area_reg) && num(d.area_real) ? (num(d.area_real) / num(d.area_reg) - 1) * 100 : null;
      var on = marcados(ONUS, d.onus);
      return h.t('Análise da Situação Jurídica') + h.s('Matrícula') + h.kv([['Imóvel', d.endereco], ['Matrícula / cartório', [d.matricula, d.cartorio].filter(Boolean).join(' – ')], ['Certidão emitida em', PP.dt(d.data_cert)], ['Proprietário(s)', d.prop], ['Área na matrícula', d.area_reg ? d.area_reg + ' m²' : ''], ['Área real', d.area_real ? d.area_real + ' m²' : ''], ['Diferença de área', dif == null ? '' : N(dif, 1) + '%'], ['Construção averbada', d.averb]], true) +
        h.s('Ônus e restrições') + (on.length ? '<ul>' + on.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : h.p('Nenhum ônus marcado.')) +
        h.s('Prefeitura') + h.kv([['Zoneamento', d.zona], ['Uso permitido', d.uso], ['Débitos de IPTU', d.iptu_deb]], true) + h.p(d.restr) +
        h.s('Conclusão') + h.valor(esc(d.conc || 'Sem impedimentos para venda'), '') + h.p(d.obs) + (dif != null && Math.abs(dif) > 5 ? h.nota('Diferença de área acima de 5%: pode precisar de retificação de área no cartório.') : '') +
        h.nota('Análise de corretor para orientação comercial. Não substitui parecer de advogado.');
    }
  });
  add({
    id: 'form-comparavel', cat: 'form', ic: '🗃️', titulo: 'Ficha de imóvel comparável',
    desc: 'Anote um imóvel pesquisado. Toque em "Guardar no banco" para usar depois nos PTAMs.',
    campos: [m('data', 'Data', 'date'), m('tipo', 'Situação', 'sel', { o: ['Oferta', 'Vendido', 'Alugado'] }), m('cat', 'Tipo', 'sel', { o: ['Casa', 'Sobrado', 'Apartamento', 'Terreno', 'Sala', 'Loja', 'Galpão', 'Chácara', 'Rural', 'Outro'] }), m('dorm', 'Dormitórios', 'num'),
      F('end', 'Endereço'), m('bairro', 'Bairro', 'text'), m('cidade', 'Cidade', 'text'), m('area', 'Área (m²)', 'num'), m('preco', 'Preço (R$)', 'money'), m('vagas', 'Vagas', 'num'), m('idade', 'Idade (anos)', 'num'),
      m('fonte', 'Fonte (site, imobiliária)', 'text'), m('contato', 'Contato / link', 'text'), F('obs', 'Observações (estado, diferenciais)', 'area'),
      { t: 'acao', a: 'banco', l: '🗂️ Guardar no banco de comparáveis' }],
    inicio: function (d) { d.data = PP.hoje(); d.tipo = 'Oferta'; d.cat = 'Casa'; },
    acoes: { banco: function (d) {
      var b = PP.ls.get('d:calc-banco', null) || { itens: [] }; b.itens = b.itens || [];
      b.itens.push({ data: d.data, tipo: d.tipo, cat: d.cat, dorm: d.dorm, end: d.end, bairro: d.bairro, cidade: d.cidade, area: d.area, preco: d.preco, fonte: d.fonte, contato: d.contato, obs: d.obs });
      PP.ls.set('d:calc-banco', b); PP.aviso('Guardado no banco ✔ (' + b.itens.length + ' imóveis)');
    } },
    render: function (d) {
      var a = num(d.area), p = num(d.preco);
      return h.t('Ficha de Imóvel Comparável') + h.kv([['Data', PP.dt(d.data)], ['Situação', d.tipo], ['Tipo', d.cat], ['Endereço', d.end], ['Bairro / cidade', [d.bairro, d.cidade].filter(Boolean).join(' – ')], ['Área', a ? N(a, 2) + ' m²' : ''], ['Preço', p ? R(p) : ''], ['Valor por m²', a && p ? R(p / a) : ''], ['Dormitórios / vagas', [d.dorm, d.vagas].filter(Boolean).join(' / ')], ['Idade', d.idade ? d.idade + ' anos' : ''], ['Fonte', d.fonte], ['Contato / link', d.contato]], true) + h.p(d.obs);
    }
  });
  var PARTES = ['Estrutura (rachaduras, trincas)', 'Telhado / cobertura', 'Pisos', 'Paredes e revestimentos', 'Forro / teto', 'Portas e janelas', 'Instalação elétrica', 'Instalação hidráulica', 'Pintura', 'Umidade / infiltração', 'Banheiros', 'Cozinha'];
  var NOTA = { 'Ótimo': 5, 'Bom': 4, 'Regular': 3, 'Ruim': 2, 'Péssimo': 1 };
  function heidSug(med) { var t = [[4.75, 'a'], [4.25, 'b'], [3.75, 'c'], [3.25, 'd'], [2.75, 'e'], [2.25, 'f'], [1.75, 'g'], [1.25, 'h']]; for (var i = 0; i < t.length; i++) if (med >= t[i][0]) return t[i][1]; return 'i'; }
  add({
    id: 'form-conservacao', cat: 'form', ic: '🔍', titulo: 'Avaliação do estado de conservação',
    desc: 'Dê uma nota para cada parte. A ficha sugere a letra de Heidecke para usar no cálculo.',
    campos: [F('endereco', 'Imóvel'), m('data', 'Data', 'date'), m('idade', 'Idade aparente (anos)', 'num')].concat(PARTES.map(function (p, i) { return m('p' + i, p, 'sel', { o: ESTADOS }); }), [F('obs', 'Observações', 'area')]),
    inicio: function (d) { d.data = PP.hoje(); },
    calc: function (d) { var ns = PARTES.map(function (p, i) { return NOTA[d['p' + i]]; }).filter(Boolean); var md = ns.length ? ns.reduce(function (s, x) { return s + x; }, 0) / ns.length : 0; return { md: md, n: ns.length, l: md ? heidSug(md) : '' }; },
    resumo: function (d) { var r = PP.itens['form-conservacao'].calc(d); return r.n ? 'Nota média ' + N(r.md, 1) + ' → <b class="v">' + esc(PP.heidNome(r.l)) + '</b>' : 'Dê as notas abaixo.'; },
    render: function (d) {
      var r = PP.itens['form-conservacao'].calc(d);
      return h.t('Avaliação do Estado de Conservação') + h.kv([['Imóvel', d.endereco], ['Data', PP.dt(d.data)], ['Idade aparente', d.idade ? d.idade + ' anos' : '']], true) +
        h.tab(['Item', 'Ótimo', 'Bom', 'Regular', 'Ruim', 'Péssimo'], PARTES.map(function (p, i) { return [esc(p)].concat(['Ótimo', 'Bom', 'Regular', 'Ruim', 'Péssimo'].map(function (e) { return d['p' + i] === e ? '<b>X</b>' : ''; })); })) +
        (r.n ? h.valor(esc(PP.heidNome(r.l)), 'Estado sugerido (Heidecke) · nota média ' + N(r.md, 1) + ' de 5') : '') + h.p(d.obs) +
        h.nota('Notas: Ótimo 5 · Bom 4 · Regular 3 · Ruim 2 · Péssimo 1. A letra é sugestão: confirme com o que viu na vistoria.');
    }
  });
  var MAT = [['Número da matrícula e cartório', 'Confere com o que o cliente informou e com o carnê do IPTU.'], ['Data da certidão', 'Deve ter no máximo 30 dias para negócios e processos.'], ['Descrição do imóvel', 'Endereço, área, medidas e confrontações batem com o imóvel real?'], ['Proprietário atual', 'Último registro de compra (R.) mostra quem é o dono hoje.'], ['Estado civil do dono', 'Casado precisa da assinatura do cônjuge (salvo separação total de bens).'], ['Construção averbada (Av.)', 'A casa/prédio está averbada? Se não, a área construída não existe para o cartório.'], ['Ônus', 'Hipoteca, alienação fiduciária, penhora, usufruto, indisponibilidade.'], ['Cancelamentos', 'Ônus antigos foram cancelados por averbação?'], ['Ações judiciais', 'Averbação de ação, arrolamento ou citação.'], ['Cláusulas', 'Inalienabilidade, impenhorabilidade, incomunicabilidade.'], ['Desmembramento / unificação', 'A matrícula foi aberta de outra? A área ainda é a mesma?'], ['Imóvel rural', 'CCIR, georreferenciamento (INCRA) e reserva legal averbada ou no CAR.']];
  add({
    id: 'form-matricula', cat: 'form', ic: '📑', titulo: 'Certidão de matrícula: o que conferir',
    desc: 'Roteiro para ler a matrícula sem esquecer nada. Marque o que já conferiu.',
    campos: [m('matricula', 'Matrícula', 'text'), m('cartorio', 'Cartório', 'text'), F('ok', 'Conferido', 'chk', { o: MAT.map(function (x) { return x[0]; }) }), F('obs', 'Anotações', 'area')],
    render: function (d) {
      var ok = d.ok || [];
      return h.t('Matrícula: o que conferir', [d.matricula, d.cartorio].filter(Boolean).map(esc).join(' – ')) +
        h.tab(['', 'Item', 'O que olhar'], MAT.map(function (x, i) { return [ok.indexOf(i) >= 0 ? '☑' : '☐', '<b>' + esc(x[0]) + '</b>', esc(x[1])]; })) + h.p(d.obs) +
        h.nota('R. = registro (compra, venda, hipoteca). Av. = averbação (construção, casamento, cancelamentos). Leia sempre de cima para baixo até o último ato.');
    }
  });

  /* =============== FERRAMENTAS =============== */
  add({
    id: 'f-proposta', cat: 'ferr', ic: '💼', titulo: 'Proposta de honorários',
    campos: [F('cliente', 'Cliente'), m('fone', 'Telefone', 'tel'), m('data', 'Data', 'date'), F('imovel', 'Imóvel a avaliar'), F('servico', 'Serviço', 'sel', { o: SERVICOS }), F('finalidade', 'Finalidade', 'text'),
      m('valor', 'Honorários (R$)', 'money'), m('prazo', 'Prazo de entrega (dias úteis)', 'num', { v: '5' }), F('pagto', 'Forma de pagamento', 'text', { v: '50% na aprovação e 50% na entrega, por PIX' }), m('validade', 'Validade da proposta (dias)', 'num', { v: '15' }),
      F('inclui', 'Está incluído', 'chk', { o: ['Vistoria no imóvel', 'Pesquisa de mercado', 'PTAM completo em PDF', 'Resumo para o cliente', 'Uma revisão sem custo', 'Deslocamento na cidade'], v: [0, 1, 2, 3, 4, 5] }), F('obs', 'Observações', 'area')],
    inicio: function (d) { d.data = PP.hoje(); },
    render: function (d, c) {
      var v = num(d.valor);
      return h.t('Proposta de Honorários') + h.p('Prezado(a) ' + (d.cliente || '________') + ',') + h.p('Agradeço o contato. Apresento abaixo a proposta para o serviço de avaliação solicitado.') +
        h.kv([['Serviço', d.servico], ['Imóvel', d.imovel], ['Finalidade', d.finalidade], ['Prazo de entrega', d.prazo ? d.prazo + ' dias úteis após a vistoria e o recebimento dos documentos' : ''], ['Honorários', v ? R(v) + ' (' + PP.extenso(v) + ')' : ''], ['Pagamento', d.pagto], ['PIX', c.P.pix], ['Validade', d.validade ? d.validade + ' dias' : '']]) +
        h.s('Está incluído') + '<ul>' + marcados(['Vistoria no imóvel', 'Pesquisa de mercado', 'PTAM completo em PDF', 'Resumo para o cliente', 'Uma revisão sem custo', 'Deslocamento na cidade'], d.inclui).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' + h.p(d.obs) +
        h.p('O trabalho segue a Resolução COFECI nº 1.066/2007. Fico à disposição para qualquer dúvida.') + h.ass(c.P, c.P.cidade, d.data) +
        '<p style="margin-top:20px">De acordo: <span class="branco" style="width:60%"></span><br><small>' + esc(d.cliente || 'Cliente') + '</small></p>';
    }
  });
  add({
    id: 'f-recibo', cat: 'ferr', ic: '🧾', titulo: 'Recibo de honorários',
    campos: [F('pagador', 'Recebi de'), m('doc', 'CPF / CNPJ', 'text'), m('valor', 'Valor (R$)', 'money'), m('data', 'Data', 'date'), F('ref', 'Referente a', 'text', { v: 'honorários de avaliação mercadológica (PTAM) do imóvel situado em ' }), m('forma', 'Forma de pagamento', 'sel', { o: ['PIX', 'Dinheiro', 'Transferência', 'Cartão', 'Boleto'] }), m('parcela', 'Parcela', 'text', { ph: 'ex.: 1ª de 2' })],
    inicio: function (d) { d.data = PP.hoje(); },
    render: function (d, c) {
      var v = num(d.valor);
      return h.t('Recibo') + h.valor(R(v), '(' + PP.extenso(v) + ')') +
        h.p('Recebi de ' + (d.pagador || '________________') + (d.doc ? ', CPF/CNPJ ' + d.doc : '') + ', a quantia de ' + R(v) + ' (' + PP.extenso(v) + '), referente a ' + (d.ref || '________') + (d.parcela ? ' – parcela ' + d.parcela : '') + ', paga por ' + (d.forma || 'PIX') + '.') +
        h.p('Para clareza, firmo o presente recibo, dando plena quitação do valor acima.') + h.ass(c.P, c.P.cidade, d.data);
    }
  });
  add({
    id: 'f-contrato', cat: 'ferr', ic: '✍️', titulo: 'Contrato de prestação de serviços de avaliação',
    campos: [F('', 'Contratante', 'sec'), F('cli', 'Nome / razão social'), m('cli_doc', 'CPF / CNPJ', 'text'), m('cli_rg', 'RG', 'text'), F('cli_end', 'Endereço'), F('', 'Serviço', 'sec'), F('servico', 'Serviço', 'sel', { o: SERVICOS }), F('imovel', 'Imóvel'), F('finalidade', 'Finalidade'),
      m('valor', 'Honorários (R$)', 'money'), F('pagto', 'Pagamento', 'text', { v: '50% na assinatura e 50% na entrega do parecer' }), m('prazo', 'Prazo (dias úteis)', 'num', { v: '5' }), m('foro', 'Foro', 'text', { v: 'São Paulo – SP' }), m('data', 'Data', 'date')],
    inicio: function (d) { d.data = PP.hoje(); },
    render: function (d, c) {
      var P = c.P, v = num(d.valor), n = 0, cl = function (t) { n++; return '<p><b>Cláusula ' + n + 'ª.</b> ' + t + '</p>'; };
      return h.t('Contrato de Prestação de Serviços de Avaliação Imobiliária') +
        h.p('CONTRATANTE: ' + (d.cli || '________') + ', CPF/CNPJ ' + (d.cli_doc || '________') + (d.cli_rg ? ', RG ' + d.cli_rg : '') + ', residente em ' + (d.cli_end || '________') + '.') +
        h.p('CONTRATADO: ' + P.nome + ', corretor de imóveis, ' + P.creci + ', ' + P.cnai + (P.endereco ? ', com escritório em ' + P.endereco : '') + '.') +
        cl('O CONTRATADO prestará o serviço de ' + esc(d.servico || '') + ' do imóvel ' + esc(d.imovel || '________') + ', com a finalidade de ' + esc(d.finalidade || '________') + '.') +
        cl('O CONTRATANTE fornecerá os documentos pedidos (matrícula, IPTU, plantas) e dará acesso ao imóvel para vistoria.') +
        cl('O parecer será entregue em até ' + (d.prazo || '__') + ' dias úteis após a vistoria e a entrega dos documentos.') +
        cl('Pelos serviços o CONTRATANTE pagará ' + (v ? R(v) + ' (' + esc(PP.extenso(v)) + ')' : '________') + ', da seguinte forma: ' + esc(d.pagto || '') + '.' + (P.pix ? ' Chave PIX: ' + esc(P.pix) + '.' : '')) +
        cl('O parecer expressa a opinião técnica do CONTRATADO sobre o valor de mercado na data da avaliação, conforme a Lei nº 6.530/1978 e a Resolução COFECI nº 1.066/2007, sem garantia de venda pelo valor indicado.') +
        cl('O CONTRATADO manterá sigilo sobre as informações recebidas, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).') +
        cl('Desistência após a vistoria não dá direito à devolução do sinal, que remunera o trabalho já feito.') +
        cl('Fica eleito o foro de ' + esc(d.foro || '') + ' para resolver dúvidas deste contrato.') +
        h.p('E por estarem de acordo, assinam em duas vias.') + '<p style="text-align:right">' + esc(P.cidade) + ', ' + PP.dataExtenso(d.data) + '.</p>' +
        h.ass2(d.cli, 'Contratante', P.nome, 'Contratado · ' + P.creci) + h.ass2('', 'Testemunha 1', '', 'Testemunha 2');
    }
  });
  add({
    id: 'f-confirmacao', cat: 'ferr', ic: '📩', titulo: 'Confirmação do pedido',
    campos: [F('cliente', 'Cliente'), m('fone', 'WhatsApp do cliente', 'tel'), F('servico', 'Serviço', 'sel', { o: SERVICOS }), F('imovel', 'Imóvel'), m('data', 'Data da vistoria', 'date'), m('hora', 'Hora', 'time'), m('valor', 'Valor (R$)', 'money'), m('prazo', 'Entrega em (dias úteis)', 'num', { v: '5' })],
    render: function (d, c) {
      var t = 'Olá, ' + (d.cliente || '') + '! Aqui é ' + nomeCurto(c.P) + ', ' + c.P.creci + '.\n\nConfirmo seu pedido:\n• Serviço: ' + (d.servico || '') + '\n• Imóvel: ' + (d.imovel || '') + '\n• Vistoria: ' + (PP.dt(d.data) || 'a combinar') + (d.hora ? ' às ' + d.hora : '') + '\n• Valor: ' + (num(d.valor) ? R(num(d.valor)) : 'a combinar') + '\n• Entrega: até ' + (d.prazo || '5') + ' dias úteis após a vistoria\n\nPor favor, separe a matrícula atualizada e o carnê do IPTU. Qualquer dúvida estou à disposição. Obrigado pela confiança!';
      return h.t('Confirmação do Pedido') + h.msg(t) + h.kv([['Cliente', d.cliente], ['Serviço', d.servico], ['Imóvel', d.imovel], ['Vistoria', (PP.dt(d.data) || '') + (d.hora ? ' às ' + d.hora : '')], ['Valor', num(d.valor) ? R(num(d.valor)) : '']]);
    }
  });
  var STATUS = ['Novo', 'Aguardando documentos', 'Vistoria marcada', 'Em elaboração', 'Entregue', 'Cancelado'];
  add({
    id: 'f-pedidos', cat: 'ferr', ic: '📒', titulo: 'Controle de pedidos',
    desc: 'Todos os seus trabalhos num lugar: prazo, situação e pagamento.',
    campos: [F('itens', 'Pedidos', 'tab', { item: 'Pedido', cols: [m('cliente', 'Cliente', 'text'), m('fone', 'Telefone', 'tel'), F('imovel', 'Imóvel'), m('servico', 'Serviço', 'sel', { o: SERVICOS }), m('valor', 'Valor (R$)', 'money'), m('pedido', 'Data do pedido', 'date'), m('prazo', 'Prazo de entrega', 'date'), m('status', 'Situação', 'sel', { o: STATUS }), m('pago', 'Pagamento', 'sel', { o: ['Não pago', 'Sinal pago', 'Pago'] })] })],
    inicio: function (d) { d.itens = []; },
    calc: function (d) {
      var hj = PP.hoje(), it = d.itens || [], rec = 0, aRec = 0, atr = 0, ab = 0;
      it.forEach(function (x) { var v = num(x.valor); if (x.status === 'Cancelado') return; if (x.pago === 'Pago') rec += v; else if (x.pago === 'Sinal pago') { rec += v / 2; aRec += v / 2; } else aRec += v; if (x.status !== 'Entregue') { ab++; if (x.prazo && x.prazo < hj) atr++; } });
      return { rec: rec, aRec: aRec, atr: atr, ab: ab };
    },
    resumo: function (d) { var r = PP.itens['f-pedidos'].calc(d); return r.ab + ' em aberto' + (r.atr ? ' · <b style="color:#eb7b6f">' + r.atr + ' atrasado(s)</b>' : '') + '<br>A receber: ' + R(r.aRec); },
    render: function (d) {
      var r = PP.itens['f-pedidos'].calc(d), hj = PP.hoje();
      var it = (d.itens || []).slice().sort(function (a, b) { return (a.prazo || '9').localeCompare(b.prazo || '9'); });
      return h.t('Controle de Pedidos', 'Atualizado em ' + PP.dt(hj)) + h.kv([['Pedidos em aberto', String(r.ab)], ['Atrasados', String(r.atr)], ['Recebido (estimado)', R(r.rec)], ['A receber', R(r.aRec)]]) +
        h.tab(['Prazo', 'Cliente', 'Imóvel / serviço', 'Valor', 'Situação', 'Pago'], it.map(function (x) { var at = x.prazo && x.prazo < hj && x.status !== 'Entregue' && x.status !== 'Cancelado'; return [(at ? '⚠️ ' : '') + PP.dt(x.prazo), esc(x.cliente || '') + (x.fone ? '<br><small>' + esc(x.fone) + '</small>' : ''), esc(x.imovel || '') + '<br><small>' + esc(x.servico || '') + '</small>', R(num(x.valor)), esc(x.status || ''), esc(x.pago || '')]; }), [3]);
    }
  });
  add({
    id: 'f-timbrado', cat: 'ferr', ic: '🖋️', titulo: 'Papel timbrado e assinatura de e-mail',
    desc: 'Escreva uma carta no seu papel timbrado. Embaixo está sua assinatura de e-mail para copiar.',
    campos: [F('para', 'Para'), F('assunto', 'Assunto'), m('data', 'Data', 'date'), F('texto', 'Texto', 'area', { ph: 'Escreva aqui a carta…' })],
    inicio: function (d) { d.data = PP.hoje(); },
    render: function (d, c) {
      var P = c.P, sig = P.nome + '\n' + P.titulo + '\n' + P.creci + ' | ' + P.cnai + '\nWhatsApp ' + P.whats + (P.email ? '\n' + P.email : '') + '\n' + P.site;
      return '<p style="text-align:right">' + esc(P.cidade) + ', ' + PP.dataExtenso(d.data) + '.</p>' + (d.para ? h.p('A/C: ' + d.para) : '') + (d.assunto ? '<p><b>Assunto: ' + esc(d.assunto) + '</b></p>' : '') + (h.p(d.texto) || '<p style="min-height:120px"></p>') + h.ass(P, P.cidade, d.data).replace(/<p style="text-align:right[^<]*<\/p>/, '') +
        '<div class="msg-bts" style="margin-top:24px;display:block"><h4>Assinatura de e-mail (copie e cole no Gmail → Configurações → Assinatura)</h4>' + h.msg(sig).replace('<button data-zap="1">💬 WhatsApp</button>', '') + '</div>';
    }
  });
  add({
    id: 'f-portfolio', cat: 'ferr', ic: '🏅', titulo: 'Portfólio do avaliador',
    campos: [F('anos', 'Anos de experiência', 'num', { w: 'm' }), m('qtd', 'Avaliações feitas', 'num'), F('servs', 'Serviços', 'chk', { o: SERVICOS, v: [0, 1, 2, 3, 4, 5, 6] }), F('areas', 'Regiões atendidas', 'text', { v: 'Zona Leste de São Paulo, Itaim Paulista, São Miguel, Guaianases, Itaquera, Suzano, Ferraz de Vasconcelos, Poá e Grande São Paulo' }),
      F('difs', 'Diferenciais', 'area', { v: 'Atendimento pessoal e rápido\nParecer em PDF com fotos e pesquisa de mercado\nEntrega em até 5 dias úteis\nRegistro no CNAI/COFECI' }),
      F('deps', 'Depoimentos de clientes', 'tab', { item: 'Depoimento', cols: [m('nome', 'Nome', 'text'), F('txt', 'Depoimento', 'area')] })],
    render: function (d, c) {
      var P = c.P;
      return h.t(P.nome, esc(P.titulo) + ' · ' + esc(P.creci) + ' · ' + esc(P.cnai)) + h.p(P.bio) +
        h.kv([['Experiência', d.anos ? d.anos + ' anos' : ''], ['Avaliações realizadas', d.qtd ? 'Mais de ' + d.qtd : ''], ['Regiões atendidas', d.areas]]) +
        h.s('Serviços') + '<ul>' + marcados(SERVICOS, d.servs).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        h.s('Diferenciais') + '<ul>' + String(d.difs || '').split('\n').filter(Boolean).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        ((d.deps || []).length ? h.s('O que dizem os clientes') + d.deps.map(function (x) { return '<p><i>“' + esc(x.txt || '') + '”</i><br><b>' + esc(x.nome || '') + '</b></p>'; }).join('') : '') +
        h.s('Contato') + h.p('WhatsApp ' + P.whats + (P.email ? ' · ' + P.email : '') + ' · ' + P.site);
    }
  });
  add({
    id: 'f-como-ler', cat: 'ferr', ic: '📖', titulo: 'Como ler o PTAM: explicação para o cliente',
    campos: [F('cliente', 'Nome do cliente'), m('valor', 'Valor encontrado (R$)', 'money'), m('margem', 'Faixa (± %)', 'num', { v: '10' })],
    render: function (d, c) {
      var v = num(d.valor), mg = num(d.margem) / 100;
      return h.t('Entenda o seu Parecer de Avaliação') + h.p('Olá' + (d.cliente ? ', ' + d.cliente : '') + '! Preparei este guia rápido para você entender cada parte do parecer.') +
        (v ? h.valor(R(v), 'Valor de mercado encontrado' + (mg ? ' · faixa de ' + R(v * (1 - mg)) + ' a ' + R(v * (1 + mg)) : '')) : '') +
        h.tab(['Parte do parecer', 'O que significa'], [
          ['Identificação', 'Quem fez a avaliação, para quem e com qual objetivo.'], ['Região', 'Como é o bairro: comércio, transporte, escolas. Isso influencia o preço.'],
          ['Caracterização', 'Os dados do seu imóvel: área, cômodos, idade e estado.'], ['Pesquisa de mercado', 'Imóveis parecidos que estão à venda ou foram vendidos perto do seu.'],
          ['Homogeneização', 'Ajustes feitos para comparar “igual com igual” (ex.: um vizinho maior ou mais novo).'], ['Amostra saneada', 'Retiramos os preços fora da realidade para não distorcer a média.'],
          ['Valor de mercado', 'O preço mais provável para vender em prazo normal, sem pressa.'], ['Faixa de valores', 'Espaço para negociação: abaixo do mínimo você perde dinheiro; acima do máximo demora a vender.'],
          ['Liquidez', 'Se é fácil ou difícil vender esse tipo de imóvel hoje.'], ['Ressalvas', 'Limites do trabalho (ex.: não foi feita análise de estrutura).']]) +
        h.s('Dicas') + '<ul><li>O valor vale para hoje; o mercado muda com o tempo.</li><li>Anunciar muito acima da faixa costuma travar a venda.</li><li>Guarde o parecer: ele ajuda em negociações, partilhas e no banco.</li></ul>' +
        h.p('Qualquer dúvida, é só me chamar no WhatsApp ' + c.P.whats + '.');
    }
  });
  add({
    id: 'f-mensagens', cat: 'ferr', ic: '💬', titulo: 'Mensagens prontas para clientes (WhatsApp e e-mail)',
    desc: 'Preencha o nome e os dados. Toque em Copiar ou WhatsApp em cada mensagem.',
    campos: [F('nome', 'Nome do cliente'), m('fone', 'WhatsApp do cliente', 'tel'), m('valor', 'Valor (honorários ou avaliação)', 'money'), m('data', 'Data', 'date'), m('hora', 'Hora', 'time'), F('imovel', 'Imóvel')],
    semRod: true,
    render: function (d, c) {
      var n = d.nome || '', oi = 'Olá' + (n ? ', ' + n : '') + '!', eu = nomeCurto(c.P), deIm = d.imovel ? 'de ' + d.imovel : 'do imóvel', im = d.imovel || 'o imóvel', dt = PP.dt(d.data) || '___', hr = d.hora || '___', v = num(d.valor) ? R(num(d.valor)) : 'R$ ___';
      var L = [
        ['Primeiro contato', oi + ' Aqui é ' + eu + ', corretor e avaliador de imóveis (' + c.P.creci + ', ' + c.P.cnai + '). Recebi seu contato sobre a avaliação ' + deIm + '. Posso te fazer algumas perguntas rápidas para preparar a proposta?'],
        ['Envio de proposta', oi + ' Segue a proposta para a avaliação ' + deIm + ': honorários de ' + v + ', com vistoria, pesquisa de mercado e parecer em PDF. Entrega em até 5 dias úteis após a vistoria. Posso agendar?'],
        ['Agendar vistoria', oi + ' Podemos fazer a vistoria em ' + dt + ' às ' + hr + '? Leva cerca de 40 minutos. Peço que alguém maior de idade me acompanhe.'],
        ['Lembrete da vistoria (véspera)', oi + ' Passando para lembrar da vistoria amanhã, ' + dt + ', às ' + hr + (d.imovel ? ', em ' + d.imovel : '') + '. Até lá!'],
        ['Pedido de documentos', oi + ' Para fazer o parecer preciso de: matrícula atualizada, carnê do IPTU e, se tiver, planta ou habite-se. Pode mandar foto por aqui mesmo. Obrigado!'],
        ['Entrega do parecer', oi + ' Seu parecer de avaliação está pronto. Estou enviando o PDF completo e um resumo de uma página. Se quiser, explico cada parte por telefone.'],
        ['Cobrança gentil', oi + ' Tudo bem? Passando para lembrar do saldo de ' + v + ' referente à avaliação ' + deIm + '. Segue a chave PIX: ' + (c.P.pix || '___') + '. Obrigado!'],
        ['Agradecimento e indicação', oi + ' Obrigado pela confiança no meu trabalho. Se conhecer alguém que precise avaliar, vender ou alugar imóvel, ficarei feliz com a indicação. Deus abençoe!'],
        ['Pedido de avaliação no Google', oi + ' Se puder, deixe uma avaliação sobre o meu atendimento. Isso me ajuda muito. Obrigado!'],
        ['E-mail de entrega (formal)', 'Prezado(a)' + (n ? ' ' + n : '') + ',\n\nEncaminho em anexo o Parecer Técnico de Avaliação Mercadológica referente ' + (d.imovel ? 'ao imóvel ' + d.imovel : 'ao imóvel') + ', acompanhado do resumo para consulta rápida.\n\nPermaneço à disposição para esclarecimentos.\n\nAtenciosamente,\n' + c.P.nome + '\n' + c.P.creci + ' | ' + c.P.cnai + '\nWhatsApp ' + c.P.whats]
      ];
      return h.t('Mensagens Prontas') + L.map(function (x) { return '<h4>' + esc(x[0]) + '</h4>' + h.msg(x[1]); }).join('');
    }
  });
  add({
    id: 'f-parceria', cat: 'ferr', ic: '🤝', titulo: 'Proposta de parceria para imobiliárias e bancos',
    campos: [F('empresa', 'Empresa'), m('contato', 'Aos cuidados de', 'text'), m('tipo', 'Tipo de parceiro', 'sel', { o: ['Imobiliária', 'Banco / correspondente bancário', 'Escritório de advocacia', 'Construtora', 'Administradora de condomínios'] }), m('data', 'Data', 'date'),
      m('desc', 'Desconto para parceiros (%)', 'num', { v: '15' }), m('prazo', 'Prazo de entrega (dias úteis)', 'num', { v: '3' }), m('preco', 'Preço base do PTAM (R$)', 'money'), F('obs', 'Condições extras', 'area')],
    inicio: function (d) { d.data = PP.hoje(); },
    render: function (d, c) {
      var p = num(d.preco), ds = num(d.desc) / 100, P = c.P;
      return h.t('Proposta de Parceria', esc(d.tipo || '')) + h.p('À ' + (d.empresa || '________') + (d.contato ? ', aos cuidados de ' + d.contato : '') + ',') +
        h.p('Ofereço serviços de avaliação imobiliária para os clientes da sua empresa, com atendimento prioritário e condições especiais.') +
        h.s('O que ofereço') + '<ul><li>PTAM completo com vistoria, fotos e pesquisa de mercado.</li><li>Resumo de uma página para o cliente final.</li><li>Laudos para inventário, partilha, divórcio e processos judiciais.</li><li>Opinião rápida de valor para captação.</li></ul>' +
        h.s('Condições') + h.kv([['Desconto para parceiros', d.desc ? d.desc + '%' : ''], ['Preço base', p ? R(p) : ''], ['Preço para parceiros', p ? R(p * (1 - ds)) : ''], ['Prazo de entrega', d.prazo ? d.prazo + ' dias úteis' : ''], ['Registro', P.creci + ' · ' + P.cnai]]) + h.p(d.obs) +
        h.p('Fico à disposição para uma conversa.') + h.ass(P, P.cidade, d.data);
    }
  });
  var CK_VIST = ['Confirmar horário com o cliente na véspera', 'Levar trena / medidor a laser', 'Celular carregado (fotos) e carregador', 'Prancheta com termo de vistoria impresso', 'Cópia da matrícula e IPTU', 'Fotografar fachada, rua e vizinhança', 'Fotografar todos os cômodos', 'Conferir área construída e medidas principais', 'Verificar rachaduras, umidade e infiltração', 'Testar torneiras, descargas e tomadas (visual)', 'Ver telhado / laje e caixa d\'água', 'Anotar acabamentos (piso, forro, esquadrias)', 'Anotar idade aparente e reformas', 'Conversar com vizinhos / porteiro sobre o mercado', 'Anotar placas de venda na rua (comparáveis)', 'Colher assinatura do termo de vistoria'];
  add({
    id: 'f-ck-vistoria', cat: 'ferr', ic: '☑️', titulo: 'Checklist da vistoria',
    campos: [F('endereco', 'Imóvel'), m('data', 'Data', 'date'), F('ok', 'Itens', 'chk', { o: CK_VIST })],
    render: function (d) { return h.t('Checklist da Vistoria') + h.kv([['Imóvel', d.endereco], ['Data', PP.dt(d.data)]], true) + h.ck(CK_VIST, d.ok); }
  });
  var ACAB = ['Piso', 'Paredes', 'Forro / teto', 'Portas e janelas', 'Cobertura'];
  add({
    id: 'f-ficha-vistoria', cat: 'ferr', ic: '🏠', titulo: 'Ficha de vistoria do imóvel',
    desc: 'Ficha técnica rápida para preencher no local (ou imprimir em branco).',
    campos: [F('endereco', 'Endereço'), m('data', 'Data', 'date'), m('tipo', 'Tipo', 'text'), m('area_t', 'Área terreno (m²)', 'num'), m('area_c', 'Área construída (m²)', 'num'), m('idade', 'Idade aparente', 'num'),
      m('dorm', 'Dormitórios', 'num'), m('suite', 'Suítes', 'num'), m('ban', 'Banheiros', 'num'), m('vagas', 'Vagas', 'num'), m('pav', 'Pavimentos', 'num'), m('pos', 'Posição (frente/fundos)', 'text')].concat(ACAB.map(function (a, i) { return m('ac' + i, a, 'text'); }),
      [m('estado', 'Estado geral', 'sel', { o: ESTADOS }), m('ocup', 'Ocupação', 'sel', { o: ['', 'Desocupado', 'Proprietário', 'Inquilino', 'Terceiros'] }), F('lazer', 'Lazer / extras'), F('vizinhanca', 'Vizinhança e entorno', 'area'), F('obs', 'Observações', 'area')]),
    inicio: function (d) { d.data = PP.hoje(); },
    render: function (d) {
      return h.t('Ficha de Vistoria do Imóvel') + h.kv([['Endereço', d.endereco], ['Data', PP.dt(d.data)], ['Tipo', d.tipo], ['Área do terreno', d.area_t], ['Área construída', d.area_c], ['Idade aparente', d.idade], ['Dormitórios / suítes', [d.dorm, d.suite].filter(Boolean).join(' / ')], ['Banheiros', d.ban], ['Vagas', d.vagas], ['Pavimentos', d.pav], ['Posição', d.pos]], true) +
        h.s('Acabamentos') + h.kv(ACAB.map(function (a, i) { return [a, d['ac' + i]]; }), true) + h.kv([['Estado geral', d.estado], ['Ocupação', d.ocup], ['Lazer / extras', d.lazer]], true) +
        h.s('Vizinhança') + (d.vizinhanca ? h.p(d.vizinhanca) : '<p><span class="branco" style="width:100%"></span></p>') + h.s('Observações') + (d.obs ? h.p(d.obs) : '<p><span class="branco" style="width:100%"></span></p><p><span class="branco" style="width:100%"></span></p>');
    }
  });
  var DOCS = {
    'Venda / compra': ['Matrícula atualizada (até 30 dias)', 'Carnê do IPTU do ano', 'RG e CPF do proprietário', 'Certidão de casamento (se casado)', 'Planta ou habite-se (se tiver)', 'Última conta de condomínio (apartamento)'],
    'Inventário / herança': ['Certidão de óbito', 'Matrícula atualizada', 'Carnê do IPTU do ano do óbito e do ano atual', 'Documentos dos herdeiros', 'Número do processo ou escritura de inventário'],
    'Divórcio / partilha': ['Matrícula atualizada', 'Carnê do IPTU', 'Certidão de casamento', 'Número do processo (se houver)'],
    'Judicial': ['Cópia da decisão / nomeação', 'Quesitos das partes', 'Matrícula atualizada', 'Carnê do IPTU', 'Contato das partes para a vistoria'],
    'Rural': ['Matrícula atualizada', 'CCIR', 'ITR (últimos 5 anos) e NIRF', 'CAR', 'Georreferenciamento / mapa', 'Licenças ambientais (se houver)'],
    'Comercial / galpão': ['Matrícula atualizada', 'Carnê do IPTU', 'Habite-se / AVCB', 'Planta aprovada', 'Contrato de locação (se alugado)']
  };
  add({
    id: 'f-docs-cliente', cat: 'ferr', ic: '📂', titulo: 'Lista de documentos para pedir ao cliente',
    campos: [F('nome', 'Nome do cliente'), m('fone', 'WhatsApp', 'tel'), F('tipo', 'Tipo de avaliação', 'sel', { o: Object.keys(DOCS) })],
    inicio: function (d) { d.tipo = 'Venda / compra'; },
    render: function (d, c) {
      var l = DOCS[d.tipo] || DOCS['Venda / compra'];
      var t = 'Olá' + (d.nome ? ', ' + d.nome : '') + '! Para a avaliação (' + d.tipo.toLowerCase() + '), preciso destes documentos:\n' + l.map(function (x) { return '• ' + x; }).join('\n') + '\n\nPode mandar foto ou PDF por aqui mesmo. Obrigado! – ' + nomeCurto(c.P);
      return h.t('Documentos Necessários', esc(d.tipo)) + h.ck(l) + h.s('Mensagem pronta') + h.msg(t);
    }
  });
  var TODOS_DOCS = ['Matrícula atualizada', 'Carnê do IPTU', 'RG e CPF', 'Certidão de casamento', 'Planta / habite-se', 'Certidão de óbito', 'CCIR / ITR / CAR', 'Contrato de locação', 'Decisão judicial / quesitos'];
  add({
    id: 'f-pendentes', cat: 'ferr', ic: '⏳', titulo: 'Aviso de documentos pendentes',
    campos: [F('nome', 'Nome do cliente'), m('fone', 'WhatsApp', 'tel'), F('pend', 'O que falta', 'chk', { o: TODOS_DOCS }), F('outros', 'Outros documentos'), m('prazo', 'Prazo para enviar', 'date'), F('imovel', 'Imóvel')],
    render: function (d, c) {
      var l = marcados(TODOS_DOCS, d.pend).concat(d.outros ? [d.outros] : []);
      var t = 'Olá' + (d.nome ? ', ' + d.nome : '') + '! Para terminar a avaliação' + (d.imovel ? ' de ' + d.imovel : '') + ' ainda faltam:\n' + l.map(function (x) { return '• ' + x; }).join('\n') + (d.prazo ? '\n\nSe puder enviar até ' + PP.dt(d.prazo) + ', consigo manter o prazo de entrega.' : '') + '\n\nObrigado! – ' + nomeCurto(c.P);
      return h.t('Documentos Pendentes') + h.msg(t) + h.ck(l);
    }
  });
  add({
    id: 'f-agenda', cat: 'ferr', ic: '📅', titulo: 'Agenda de vistorias e prazos',
    desc: 'Vistorias, entregas, audiências e prazos. Os atrasados aparecem em destaque.',
    campos: [F('itens', 'Compromissos', 'tab', { item: 'Compromisso', cols: [m('data', 'Data', 'date'), m('hora', 'Hora', 'time'), m('tipo', 'Tipo', 'sel', { o: ['Vistoria', 'Entrega de laudo', 'Prazo judicial', 'Audiência', 'Reunião', 'Cobrança'] }), m('cliente', 'Cliente', 'text'), F('local', 'Endereço / processo'), m('fone', 'Telefone', 'tel'), m('feito', 'Feito', 'sel', { o: ['Não', 'Sim'] })] })],
    inicio: function (d) { d.itens = []; },
    resumo: function (d) { var hj = PP.hoje(), p = (d.itens || []).filter(function (x) { return x.feito !== 'Sim' && x.data; }).sort(function (a, b) { return (a.data + (a.hora || '')).localeCompare(b.data + (b.hora || '')); })[0]; return p ? 'Próximo: <b>' + esc(p.tipo || '') + '</b> ' + PP.dt(p.data) + (p.hora ? ' às ' + p.hora : '') + ' – ' + esc(p.cliente || '') + (p.data < hj ? ' ⚠️ atrasado' : '') : 'Nada pendente.'; },
    render: function (d) {
      var hj = PP.hoje(), it = (d.itens || []).slice().sort(function (a, b) { return ((a.data || '9') + (a.hora || '')).localeCompare((b.data || '9') + (b.hora || '')); });
      function gcal(x) { if (!x.data) return ''; var dd = x.data.replace(/-/g, ''); var hh = (x.hora || '09:00').replace(':', '') + '00'; return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent((x.tipo || '') + ' – ' + (x.cliente || '')) + '&dates=' + dd + 'T' + hh + '/' + dd + 'T' + hh + '&details=' + encodeURIComponent(x.local || '') + '&ctz=America/Sao_Paulo'; }
      return h.t('Agenda de Vistorias e Prazos', 'Hoje: ' + PP.dt(hj)) +
        h.tab(['Data', 'Tipo', 'Cliente', 'Local', 'Situação'], it.map(function (x) {
          var st = x.feito === 'Sim' ? '✔ Feito' : (x.data && x.data < hj ? '⚠️ Atrasado' : (x.data === hj ? '🔔 Hoje' : 'Pendente'));
          return [PP.dt(x.data) + (x.hora ? '<br>' + esc(x.hora) : ''), esc(x.tipo || ''), esc(x.cliente || '') + (x.fone ? '<br><small>' + esc(x.fone) + '</small>' : ''), esc(x.local || '') + (x.data ? '<br><small><a href="' + gcal(x) + '" target="_blank">+ Google Agenda</a></small>' : ''), st];
        }));
    }
  });

  /* =============== TABELAS E GUIAS =============== */
  add({
    id: 't-vida-util', cat: 'tab', ic: '⏱️', titulo: 'Vida útil das construções por tipo', soLeitura: true,
    render: function () {
      return h.t('Vida Útil das Construções', 'Referência usual (estudos IBAPE/SP) para o cálculo de depreciação') +
        h.tab(['Tipo de construção', 'Padrão', 'Vida útil (anos)', 'Valor residual'], [
          ['Barraco', 'Rústico / simples', '5 a 10', '0%'], ['Casa', 'Rústico / proletário', '60', '20%'], ['Casa', 'Econômico / simples', '70', '20%'], ['Casa', 'Médio / superior', '70', '20%'], ['Casa', 'Fino / luxo', '60', '20%'],
          ['Apartamento', 'Econômico a superior', '60', '20%'], ['Apartamento', 'Fino / luxo', '50', '20%'], ['Escritório / sala', 'Econômico a médio', '70', '20%'], ['Escritório / sala', 'Superior a luxo', '50 a 60', '20%'],
          ['Galpão', 'Rústico / simples', '60', '10% a 20%'], ['Galpão', 'Médio / superior', '80', '10% a 20%'], ['Coberturas / telheiros', 'Simples a superior', '20 a 30', '10%']], [2, 3]) +
        h.nota('Vida útil é o tempo de uso econômico da construção, não o tempo até cair. Use a idade aparente (considerando reformas). Confira a edição mais recente do estudo do IBAPE/SP.');
    }
  });
  add({
    id: 't-fatores', cat: 'tab', ic: '🎚️', titulo: 'Fatores de ajuste: localização e estado de conservação', soLeitura: true,
    render: function () {
      return h.t('Fatores de Ajuste (Homogeneização)', 'Valores de referência; justifique no parecer') +
        h.s('Como usar') + h.p('Fator = situação do imóvel avaliado ÷ situação do comparável. Se o comparável é pior que o avaliado, o fator fica acima de 1,00; se é melhor, abaixo de 1,00.') +
        h.s('Oferta') + h.tab(['Situação', 'Fator'], [['Preço pedido (anúncio)', '0,90'], ['Mercado muito disputado', '0,95'], ['Mercado parado / muita oferta', '0,85'], ['Venda já realizada', '1,00']], [1]) +
        h.s('Localização (comparável em relação ao avaliado)') + h.tab(['Comparável está…', 'Fator'], [['Em rua bem melhor (comercial, valorizada)', '0,85 a 0,90'], ['Em rua um pouco melhor', '0,95'], ['Em rua equivalente', '1,00'], ['Em rua um pouco pior', '1,05'], ['Em rua bem pior', '1,10 a 1,15']], [1]) +
        h.p('Dica: quando houver, use a razão entre os valores de m² de terreno da Planta Genérica (IPTU) das duas ruas.') +
        h.s('Estado de conservação') + h.p('Fator = (1 – depreciação do avaliado) ÷ (1 – depreciação do comparável), usando a tabela de Heidecke abaixo.') +
        h.tab(['Estado (Heidecke)', 'Depreciação'], PP.HEID.map(function (e) { return [esc(e[1]), N(e[2], 2) + '%']; }), [1]) +
        h.s('Padrão de acabamento') + h.tab(['Comparável é…', 'Fator'], [['Um padrão acima', '0,85 a 0,90'], ['Mesmo padrão', '1,00'], ['Um padrão abaixo', '1,10 a 1,15']], [1]) +
        h.s('Terrenos') + h.tab(['Característica', 'Fator'], [['Topografia: plano', '1,00'], ['Aclive leve', '0,95'], ['Declive leve', '0,90'], ['Aclive acentuado', '0,85'], ['Declive acentuado', '0,80'], ['Alagadiço', '0,70'], ['Esquina (comercial)', '1,05 a 1,15'], ['Frente: (frente avaliada ÷ frente comparável)^0,25', 'automático'], ['Área: (área comparável ÷ área avaliada)^0,25', 'automático']], [1]);
    }
  });
  var UN = [['m²', 1], ['hectare (ha)', 10000], ['alqueire paulista', 24200], ['alqueire mineiro / goiano', 48400], ['alqueire do norte', 27225], ['alqueire baiano', 96800], ['acre', 4046.86], ['tarefa (baiana)', 4356], ['braça quadrada', 4.84], ['km²', 1000000]];
  add({
    id: 't-conversor', cat: 'tab', ic: '🔄', titulo: 'Conversor de unidades de área (m², hectare, alqueire)',
    campos: [m('v', 'Quantidade', 'num', { v: '1' }), m('u', 'Unidade', 'sel', { o: UN.map(function (u) { return u[0]; }), v: 'alqueire paulista' }), m('preco', 'Preço total (opcional)', 'money')],
    resumo: function (d) { var u = UN.filter(function (x) { return x[0] === d.u; })[0] || UN[0], m2 = num(d.v) * u[1]; return '<b class="v">' + N(m2, 2) + ' m²</b> = ' + N(m2 / 10000, 4) + ' ha'; },
    render: function (d) {
      var u = UN.filter(function (x) { return x[0] === d.u; })[0] || UN[0], m2 = num(d.v) * u[1], p = num(d.preco);
      return h.t('Conversor de Área', N(num(d.v), 4) + ' ' + esc(u[0])) + h.tab(['Unidade', 'Equivale a', 'm² por unidade'].concat(p ? ['Preço por unidade'] : []), UN.map(function (x) { return [esc(x[0]), N(m2 / x[1], 4), N(x[1], 2)].concat(p ? [R(p / (m2 / x[1]))] : []); }), [1, 2, 3]) +
        h.nota('Alqueire varia por região: confira o costume local e a matrícula.');
    }
  });
  add({
    id: 't-casos1', cat: 'tab', ic: '🧩', titulo: 'Casos especiais I', soLeitura: true, desc: 'Imóvel sem escritura, área diferente, ocupado, usufruto, nua-propriedade.',
    render: function () {
      return h.t('Casos Especiais I') +
        h.s('Imóvel só com contrato de gaveta / sem escritura') + h.p('Avalie o valor de mercado como se estivesse regular e informe à parte o desconto de mercado pela irregularidade (normalmente 10% a 30%, conforme o custo e o tempo para regularizar). Deixe claro na ressalva que o valor considera a situação documental.') +
        h.s('Construção não averbada') + h.p('Avalie a construção existente, mas avise que para financiamento o banco só considera o que está averbado. Estime o custo de regularização (projeto, taxas, INSS da obra) e cite no parecer.') +
        h.s('Área real diferente da matrícula') + h.p('Use a área real medida no cálculo e informe a área registrada. Diferença acima de 5% pode exigir retificação de área.') +
        h.s('Imóvel ocupado (inquilino ou invasão)') + h.p('Para inquilino com contrato: o comprador herda a locação, o que pode reduzir o valor para quem quer morar. Para invasão/ocupação irregular: aplique deságio pelo custo e tempo da desocupação e deixe claro na ressalva.') +
        h.s('Usufruto e nua-propriedade') + h.p('Valor da nua-propriedade = valor do imóvel – valor do usufruto. Uma referência prática (usada por vários estados para o ITCMD) é considerar o usufruto como 1/3 do valor do imóvel e a nua-propriedade como 2/3. Confira a regra do seu estado.') +
        h.s('Fração ideal / parte de imóvel') + h.p('A venda de apenas uma parte (ex.: 50% de um imóvel) costuma valer menos que a proporção exata, porque o comprador fica em condomínio com outros donos. Indique o valor proporcional e, se for o caso, um deságio de mercado.');
    }
  });
  add({
    id: 't-casos2', cat: 'tab', ic: '🧩', titulo: 'Casos especiais II', soLeitura: true, desc: 'Penhora, APP e tombamento, ruína, imóvel em obra, poucos comparáveis.',
    render: function () {
      return h.t('Casos Especiais II') +
        h.s('Imóvel com penhora ou dívida') + h.p('O valor de mercado do imóvel não muda pela dívida, mas a venda depende de quitar ou levantar a penhora. Avalie o imóvel e informe os ônus separadamente.') +
        h.s('Área de preservação (APP) ou tombamento') + h.p('Partes em APP não podem ser construídas; aplique valor menor a essas áreas (ou avalie só a área aproveitável). Imóvel tombado tem limites para reforma: pesquise vendas de imóveis tombados ou aplique deságio justificado.') +
        h.s('Imóvel em ruína ou para demolir') + h.p('Use o valor do terreno menos o custo de demolição e remoção de entulho. A construção entra como estado "i – sem valor".') +
        h.s('Imóvel em construção') + h.p('Some o valor do terreno ao custo já executado da obra (percentual concluído × custo total), com cuidado: obra parada há muito tempo perde valor. Na planta, informe o valor estimado quando pronto e o atual separadamente.') +
        h.s('Poucos comparáveis na região') + h.p('Amplie a pesquisa para bairros parecidos (com fator de localização), use vendas antigas atualizadas pelo índice FipeZap e confirme pelo método evolutivo.') +
        h.s('Imóvel com uso misto (casa + comércio)') + h.p('Avalie as partes separadamente (residencial e comercial) e some, ou use comparáveis também mistos. Explique no parecer.');
    }
  });

  /* guia: escolher o modelo (fica com os modelos de PTAM) */
  add({
    id: 'guia-modelo', cat: 'ptam', ic: '🧭', titulo: 'Guia: como escolher e adaptar o modelo', soLeitura: true,
    render: function () {
      return h.t('Como Escolher e Adaptar o Modelo') +
        h.tab(['Se o pedido é…', 'Use o modelo'], [['Saber por quanto vender ou comprar', 'PTAM do tipo do imóvel (casa, apto, terreno…)'], ['Saber quanto cobrar de aluguel', 'PTAM – Valor de locação'], ['Inventário ou herança', 'PTAM – Inventário e partilha, ou Laudo – Inventário e herança se houver processo'],
          ['Processo na Justiça', 'Laudos judiciais (penhora, perícia, revisional, partilha…)'], ['Banco ou financiamento', 'Laudo – Avaliação para banco'], ['Achar que o ITBI/IPTU está alto', 'Laudo – Fins fiscais (ITBI/IPTU)'], ['Investidor querendo saber se compensa', 'PTAM + planilha de rentabilidade']]) +
        h.s('Passo a passo') + '<ol><li>Escolha o modelo pelo tipo do imóvel.</li><li>Preencha o pedido e o endereço.</li><li>Faça a vistoria e tire as fotos pelo próprio celular.</li><li>Coloque de 3 a 6 comparáveis (ou traga do banco).</li><li>Confira o valor no quadro dourado.</li><li>Toque em <b>Resumida</b> para a versão de 1 página do cliente.</li><li>Toque em <b>PDF</b> ou <b>Enviar</b>.</li></ol>' +
        h.s('Para adaptar') + '<ul><li>Campos vazios não aparecem no documento: preencha só o que tiver.</li><li>Use "Ressalvas extras" e "Comentário final" para qualquer situação diferente.</li><li>Imóvel que não está na lista: use o modelo mais parecido e descreva no campo de descrição.</li><li>Salve cada parecer com o nome do cliente para achar depois.</li></ul>';
    }
  });
})();
