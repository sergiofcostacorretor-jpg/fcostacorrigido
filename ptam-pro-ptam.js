/* ptam-pro-ptam.js — 20 modelos de PTAM + 12 laudos judiciais/oficiais (mesmo motor) */
(function () {
  'use strict';
  var PP = window.PP, h = PP.h, esc = PP.esc, num = PP.num, R = PP.R, N = PP.N;

  PP.HEID = [
    ['a', 'a – Novo', 0], ['b', 'b – Entre novo e regular', 0.32], ['c', 'c – Regular', 2.52],
    ['d', 'd – Entre regular e reparos simples', 8.09], ['e', 'e – Reparos simples', 18.10],
    ['f', 'f – Entre reparos simples e importantes', 33.20], ['g', 'g – Reparos importantes', 52.60],
    ['h', 'h – Entre reparos importantes e sem valor', 75.20], ['i', 'i – Sem valor (só demolição)', 100]
  ];
  PP.heidNome = function (k) { var x = PP.HEID.filter(function (e) { return e[0] === k; })[0]; return x ? x[1] : ''; };
  var OPT_HEID = PP.HEID.map(function (e) { return [e[0], e[1]]; });
  var PADRAO = ['', 'Baixo / popular', 'Normal / médio', 'Alto', 'Luxo'];
  var SIMNAO = ['', 'Sim', 'Não'];
  var TOPO = ['', 'Plano', 'Aclive leve', 'Aclive acentuado', 'Declive leve', 'Declive acentuado', 'Irregular'];

  function F(k, l, t, x) { var o = { k: k, l: l, t: t || 'text' }; if (x) for (var i in x) o[i] = x[i]; return o; }
  function m(k, l, t, x) { x = x || {}; x.w = 'm'; return F(k, l, t, x); }

  /* conjuntos de campos */
  var C_CASA = [
    m('area_terreno', 'Área do terreno (m²)', 'num'), m('area_construida', 'Área construída (m²)', 'num'),
    m('dormitorios', 'Dormitórios', 'num'), m('suites', 'Suítes', 'num'), m('banheiros', 'Banheiros', 'num'), m('vagas', 'Vagas de garagem', 'num'),
    m('pavimentos', 'Pavimentos', 'num'), m('idade', 'Idade aparente (anos)', 'num'), m('padrao', 'Padrão de acabamento', 'sel', { o: PADRAO })
  ];
  var C_APTO = [
    m('area_privativa', 'Área privativa (m²)', 'num'), m('area_total', 'Área total (m²)', 'num'),
    m('andar', 'Andar', 'num'), m('posicao', 'Posição', 'sel', { o: ['', 'Frente', 'Fundos', 'Lateral'] }),
    m('dormitorios', 'Dormitórios', 'num'), m('suites', 'Suítes', 'num'), m('banheiros', 'Banheiros', 'num'), m('vagas', 'Vagas', 'num'),
    m('condominio', 'Condomínio (R$/mês)', 'money'), m('elevador', 'Elevador', 'sel', { o: SIMNAO }),
    m('idade', 'Idade do prédio (anos)', 'num'), m('padrao', 'Padrão', 'sel', { o: PADRAO }),
    F('lazer', 'Lazer e áreas comuns', 'text', { ph: 'piscina, salão de festas, churrasqueira…' })
  ];
  var C_TERRENO = [
    m('area_terreno', 'Área (m²)', 'num'), m('testada', 'Frente / testada (m)', 'num'), m('profundidade', 'Profundidade (m)', 'num'),
    m('topografia', 'Topografia', 'sel', { o: TOPO }), m('formato', 'Formato', 'sel', { o: ['', 'Regular (retangular)', 'Irregular', 'Triangular', 'Em leque'] }),
    m('esquina', 'Esquina', 'sel', { o: SIMNAO }), m('solo', 'Solo', 'sel', { o: ['', 'Seco e firme', 'Úmido', 'Alagadiço', 'Aterro'] }),
    m('zoneamento', 'Zoneamento', 'text', { ph: 'ex.: ZM, ZC, ZER' })
  ];
  var C_COM = [
    m('area_terreno', 'Área do terreno (m²)', 'num'), m('area_construida', 'Área construída / útil (m²)', 'num'),
    m('testada', 'Frente (m)', 'num'), m('pe_direito', 'Pé-direito (m)', 'num'), m('banheiros', 'Banheiros', 'num'), m('vagas', 'Vagas', 'num'),
    m('fluxo', 'Movimento na rua', 'sel', { o: ['', 'Alto', 'Médio', 'Baixo'] }), m('idade', 'Idade aparente (anos)', 'num'),
    m('padrao', 'Padrão', 'sel', { o: PADRAO }), F('atividade', 'Atividades permitidas / uso atual')
  ];
  var C_GENERICO = [
    m('tipo_imovel', 'Tipo de imóvel', 'sel', { o: ['', 'Casa', 'Sobrado', 'Apartamento', 'Terreno', 'Sala comercial', 'Loja', 'Galpão', 'Chácara / sítio', 'Imóvel rural', 'Outro'] }),
    m('area_terreno', 'Área do terreno (m²)', 'num'), m('area_construida', 'Área construída / privativa (m²)', 'num'),
    m('dormitorios', 'Dormitórios', 'num'), m('banheiros', 'Banheiros', 'num'), m('vagas', 'Vagas', 'num'),
    m('idade', 'Idade aparente (anos)', 'num'), m('padrao', 'Padrão', 'sel', { o: PADRAO })
  ];

  var ROT = {
    area_terreno: 'Área do terreno', area_construida: 'Área construída', area_privativa: 'Área privativa', area_total: 'Área total', area_ha: 'Área total (hectares)',
    dormitorios: 'Dormitórios', suites: 'Suítes', banheiros: 'Banheiros', vagas: 'Vagas de garagem', pavimentos: 'Pavimentos', idade: 'Idade aparente',
    padrao: 'Padrão de acabamento', andar: 'Andar', posicao: 'Posição', condominio: 'Condomínio', elevador: 'Elevador', lazer: 'Lazer e áreas comuns',
    testada: 'Frente / testada', profundidade: 'Profundidade', topografia: 'Topografia', formato: 'Formato', esquina: 'Esquina', solo: 'Solo', zoneamento: 'Zoneamento',
    pe_direito: 'Pé-direito', fluxo: 'Movimento na rua', atividade: 'Atividade / uso'
  };
  var UNID = { area_terreno: ' m²', area_construida: ' m²', area_privativa: ' m²', area_total: ' m²', testada: ' m', profundidade: ' m', pe_direito: ' m', idade: ' anos', area_ha: ' ha' };

  /* ---------- os 20 modelos de PTAM ---------- */
  var TIPOS = [
    { id: 'casa', nome: 'Casa', ic: '🏠', campos: C_CASA.concat([F('quintal', 'Quintal / área externa', 'text')]), area: 'area_construida', obra: true },
    { id: 'apto', nome: 'Apartamento', ic: '🏢', campos: C_APTO, area: 'area_privativa', obra: true },
    { id: 'casa-cond', nome: 'Casa em condomínio / geminada', ic: '🏘️', campos: [m('modalidade', 'Modalidade', 'sel', { o: ['', 'Condomínio fechado', 'Geminada', 'Vila', 'Sobreposta'] }), m('condominio', 'Condomínio (R$/mês)', 'money')].concat(C_CASA, [F('lazer', 'Lazer e segurança do condomínio')]), area: 'area_construida', obra: true },
    { id: 'predio', nome: 'Prédio residencial', ic: '🏬', campos: [m('area_terreno', 'Área do terreno (m²)', 'num'), m('area_construida', 'Área construída (m²)', 'num'), m('unidades', 'Nº de unidades', 'num'), m('pavimentos', 'Pavimentos', 'num'), m('renda_atual', 'Renda atual (R$/mês)', 'money'), m('ocupacao', 'Unidades alugadas', 'num'), m('idade', 'Idade aparente (anos)', 'num'), m('padrao', 'Padrão', 'sel', { o: PADRAO })], area: 'area_construida', obra: true, metodo: 'evolutivo', rot: { unidades: 'Unidades', renda_atual: 'Renda atual', ocupacao: 'Unidades alugadas' } },
    { id: 'terreno', nome: 'Terreno urbano', ic: '🟫', campos: C_TERRENO.concat([F('infra', 'Melhoramentos na rua', 'text', { ph: 'asfalto, água, esgoto, luz…' })]), area: 'area_terreno', rot: { infra: 'Melhoramentos' } },
    { id: 'lote-cond', nome: 'Lote em condomínio fechado', ic: '🌳', campos: C_TERRENO.concat([m('condominio', 'Taxa de condomínio (R$/mês)', 'money'), F('regras', 'Regras de construção do loteamento', 'text'), F('lazer', 'Estrutura do condomínio', 'text')]), area: 'area_terreno', rot: { regras: 'Regras do loteamento', lazer: 'Estrutura do condomínio' } },
    { id: 'incorp', nome: 'Terreno para incorporação', ic: '🏗️', campos: C_TERRENO.concat([m('ca_basico', 'Coef. aproveitamento básico', 'num'), m('ca_max', 'Coef. aproveitamento máximo', 'num'), m('to', 'Taxa de ocupação (%)', 'num'), F('potencial', 'Potencial construtivo / observações', 'text')]), area: 'area_terreno', metodo: 'involutivo', rot: { ca_basico: 'C.A. básico', ca_max: 'C.A. máximo', to: 'Taxa de ocupação (%)', potencial: 'Potencial construtivo' } },
    { id: 'loja', nome: 'Loja / ponto comercial', ic: '🏪', campos: C_COM, area: 'area_construida', obra: true },
    { id: 'shopping', nome: 'Loja em shopping center', ic: '🛍️', campos: [m('area_construida', 'ABL – área bruta locável (m²)', 'num'), m('piso', 'Piso / corredor', 'text'), m('aluguel_min', 'Aluguel mínimo (R$/mês)', 'money'), m('perc_fat', 'Aluguel % do faturamento', 'num'), m('condominio', 'Condomínio + fundo de promoção (R$/mês)', 'money'), m('idade', 'Idade do shopping (anos)', 'num'), F('res_sperata', 'Res sperata / luvas / contrato atípico', 'text'), F('mix', 'Mix de lojas / âncoras próximas', 'text')], area: 'area_construida', rot: { piso: 'Piso', aluguel_min: 'Aluguel mínimo', perc_fat: '% do faturamento', res_sperata: 'Res sperata / luvas', mix: 'Âncoras próximas' }, obs: 'Em shopping center o valor do ponto depende do contrato com o empreendedor (res sperata, aluguel percentual e regras do condomínio). Os valores deste parecer referem-se ao imóvel/direitos descritos, nas condições contratuais informadas.' },
    { id: 'sala', nome: 'Sala comercial / escritório', ic: '💼', campos: [m('area_privativa', 'Área privativa (m²)', 'num'), m('area_total', 'Área total (m²)', 'num'), m('andar', 'Andar', 'num'), m('banheiros', 'Banheiros', 'num'), m('vagas', 'Vagas', 'num'), m('condominio', 'Condomínio (R$/mês)', 'money'), m('idade', 'Idade do prédio (anos)', 'num'), m('padrao', 'Padrão', 'sel', { o: PADRAO }), F('lazer', 'Recepção / segurança / áreas comuns')], area: 'area_privativa', obra: true },
    { id: 'clinica', nome: 'Consultório / clínica', ic: '🩺', campos: [m('area_construida', 'Área útil (m²)', 'num'), m('salas', 'Salas de atendimento', 'num'), m('banheiros', 'Banheiros', 'num'), m('vagas', 'Vagas', 'num'), m('acessivel', 'Acessível (rampa/elevador)', 'sel', { o: SIMNAO }), m('alvara', 'Licença sanitária', 'sel', { o: ['', 'Tem', 'Não tem', 'Em andamento'] }), m('idade', 'Idade aparente (anos)', 'num'), m('padrao', 'Padrão', 'sel', { o: PADRAO }), F('adaptacoes', 'Adaptações (pias, gases, divisórias…)', 'text')], area: 'area_construida', obra: true, rot: { salas: 'Salas de atendimento', acessivel: 'Acessibilidade', alvara: 'Licença sanitária', adaptacoes: 'Adaptações' }, obs: 'Benfeitorias e equipamentos específicos da atividade de saúde só foram considerados quando incorporados ao imóvel e úteis a outros usuários.' },
    { id: 'galpao', nome: 'Galpão industrial', ic: '🏭', campos: [m('area_terreno', 'Área do terreno (m²)', 'num'), m('area_construida', 'Área construída (m²)', 'num'), m('pe_direito', 'Pé-direito livre (m)', 'num'), m('docas', 'Docas', 'num'), m('piso_carga', 'Piso (t/m²)', 'num'), m('energia', 'Energia (kVA)', 'num'), m('carreta', 'Acesso de carretas', 'sel', { o: SIMNAO }), m('escritorio', 'Escritórios (m²)', 'num'), m('idade', 'Idade aparente (anos)', 'num'), m('padrao', 'Padrão', 'sel', { o: PADRAO }), F('zoneamento', 'Zoneamento / uso permitido')], area: 'area_construida', obra: true, metodo: 'evolutivo', rot: { docas: 'Docas', piso_carga: 'Resistência do piso (t/m²)', energia: 'Energia (kVA)', carreta: 'Acesso de carretas', escritorio: 'Escritórios (m²)' } },
    { id: 'deposito', nome: 'Depósito', ic: '📦', campos: [m('area_terreno', 'Área do terreno (m²)', 'num'), m('area_construida', 'Área construída (m²)', 'num'), m('pe_direito', 'Pé-direito (m)', 'num'), m('acesso', 'Acesso de caminhão', 'sel', { o: SIMNAO }), m('idade', 'Idade aparente (anos)', 'num'), m('padrao', 'Padrão', 'sel', { o: PADRAO })], area: 'area_construida', obra: true, rot: { acesso: 'Acesso de caminhão' } },
    { id: 'vaga', nome: 'Vaga de garagem', ic: '🚗', campos: [m('vtipo', 'Situação', 'sel', { o: ['', 'Com matrícula própria', 'Vinculada à unidade', 'Indeterminada (por ordem de chegada)'] }), m('coberta', 'Coberta', 'sel', { o: SIMNAO }), m('demarcada', 'Demarcada', 'sel', { o: SIMNAO }), m('area_privativa', 'Área (m²)', 'num'), m('manobrista', 'Precisa manobrista', 'sel', { o: SIMNAO }), F('lazer', 'Prédio / condomínio')], area: 'area_privativa', unidadeComp: 'vaga', rot: { vtipo: 'Situação', coberta: 'Coberta', demarcada: 'Demarcada', manobrista: 'Manobrista', lazer: 'Prédio' }, obs: 'Vaga sem matrícula própria normalmente só pode ser vendida a condôminos, conforme a convenção (Código Civil, art. 1.331, §1º).' },
    { id: 'rural', nome: 'Imóvel rural (sítio / fazenda)', ic: '🌾', campos: [m('area_ha', 'Área total (hectares)', 'num', { aj: '1 alqueire paulista = 2,42 ha' }), m('area_util', 'Área aproveitável (ha)', 'num'), m('app', 'APP / reserva legal (ha)', 'num'), m('topografia', 'Topografia', 'sel', { o: TOPO }), F('uso_solo', 'Uso atual (pasto, lavoura, mata…)'), F('agua', 'Água (rio, nascente, poço, represa)'), F('benfeitorias', 'Benfeitorias (casa, curral, galpão, cercas)', 'area'), m('dist_cidade', 'Distância da cidade (km)', 'num'), m('acesso', 'Acesso', 'sel', { o: ['', 'Asfalto', 'Terra boa', 'Terra ruim'] }), m('car', 'CAR', 'text'), m('ccir', 'CCIR', 'text'), m('nirf', 'NIRF / ITR', 'text')], area: 'area_ha', unidade: 'ha', obraOpc: true, rot: { area_util: 'Área aproveitável (ha)', app: 'APP / reserva legal (ha)', uso_solo: 'Uso do solo', agua: 'Água', benfeitorias: 'Benfeitorias', dist_cidade: 'Distância da cidade (km)', acesso: 'Acesso', car: 'CAR', ccir: 'CCIR', nirf: 'NIRF / ITR' }, obs: 'Valores de imóveis rurais variam muito com o solo, a água e a aptidão agrícola. Quando houver dúvida sobre a capacidade produtiva, recomenda-se laudo agronômico complementar.' },
    { id: 'chacara', nome: 'Chácara / casa de veraneio', ic: '🏡', campos: [m('area_terreno', 'Área do terreno (m²)', 'num'), m('area_construida', 'Área construída (m²)', 'num'), m('dormitorios', 'Dormitórios', 'num'), m('banheiros', 'Banheiros', 'num'), m('piscina', 'Piscina', 'sel', { o: SIMNAO }), m('poco', 'Poço / nascente', 'sel', { o: SIMNAO }), m('cond_chacaras', 'Em condomínio de chácaras', 'sel', { o: SIMNAO }), m('dist_cidade', 'Distância do centro (km)', 'num'), m('idade', 'Idade aparente (anos)', 'num'), m('padrao', 'Padrão', 'sel', { o: PADRAO }), F('extras', 'Pomar, churrasqueira, lago…', 'text')], area: 'area_terreno', obra: true, rot: { piscina: 'Piscina', poco: 'Poço / nascente', cond_chacaras: 'Condomínio de chácaras', dist_cidade: 'Distância do centro (km)', extras: 'Outros atrativos' } },
    { id: 'posto', nome: 'Posto de combustível', ic: '⛽', campos: [m('area_terreno', 'Área do terreno (m²)', 'num'), m('area_construida', 'Área construída (m²)', 'num'), m('bombas', 'Bombas / bicos', 'num'), m('tanques', 'Tanques (mil litros)', 'num'), m('bandeira', 'Bandeira', 'text'), m('licenca', 'Licença ambiental', 'sel', { o: ['', 'Em dia', 'Vencida', 'Não tem'] }), m('esquina', 'Esquina', 'sel', { o: SIMNAO }), m('idade', 'Idade aparente (anos)', 'num'), F('extras', 'Loja de conveniência, lava-rápido, troca de óleo…')], area: 'area_terreno', obra: true, metodo: 'evolutivo', rot: { bombas: 'Bombas / bicos', tanques: 'Tanques (mil litros)', bandeira: 'Bandeira', licenca: 'Licença ambiental', extras: 'Serviços' }, obs: 'Este parecer não avalia passivo ambiental (contaminação do solo). Antes de qualquer negócio recomenda-se investigação ambiental conforme a CETESB/órgão ambiental. O fundo de comércio (marca, clientela, contrato com distribuidora) não está incluído, salvo menção expressa.' },
    { id: 'hotel', nome: 'Hotel / pousada', ic: '🛎️', campos: [m('area_terreno', 'Área do terreno (m²)', 'num'), m('area_construida', 'Área construída (m²)', 'num'), m('uhs', 'Quartos (UHs)', 'num'), m('ocup', 'Ocupação média (%)', 'num'), m('diaria', 'Diária média (R$)', 'money'), m('idade', 'Idade aparente (anos)', 'num'), m('padrao', 'Padrão', 'sel', { o: PADRAO }), F('estrutura', 'Estrutura (café, piscina, eventos…)', 'text')], area: 'area_construida', obra: true, metodo: 'renda', rot: { uhs: 'Quartos (UHs)', ocup: 'Ocupação média (%)', diaria: 'Diária média', estrutura: 'Estrutura' }, obs: 'O valor refere-se ao imóvel. Móveis, equipamentos e o fundo de comércio (marca, reservas, contratos) só estão incluídos se citados expressamente.' },
    { id: 'locacao', nome: 'Valor de locação (aluguel)', ic: '🔑', campos: C_GENERICO.concat([m('condominio', 'Condomínio (R$/mês)', 'money'), m('iptu', 'IPTU (R$/mês)', 'money')]), area: 'area_construida', obra: true, locacao: true, rot: { tipo_imovel: 'Tipo', iptu: 'IPTU mensal' } },
    { id: 'inventario', nome: 'Inventário e partilha de bens', ic: '⚖️', campos: C_GENERICO.concat([F('descricao', 'Descrição do imóvel', 'area')]), area: 'area_construida', obra: true, cotas: true, rot: { tipo_imovel: 'Tipo', descricao: 'Descrição' } }
  ];

  /* ---------- 12 laudos judiciais e oficiais ---------- */
  var LAUDOS = [
    { id: 'penhora', nome: 'Avaliação para penhora e leilão judicial', ic: '🔨', judicial: true, liquidacao: true,
      fin: 'Determinar o valor de mercado do imóvel penhorado, para fins de praça/leilão judicial.',
      lei: 'Código de Processo Civil, arts. 870 a 875 (avaliação) e art. 891, parágrafo único (preço vil: lance inferior a 50% da avaliação, salvo outro mínimo fixado pelo juiz).',
      extra: function (d, r) { return h.kv([['Valor de mercado', R(r.valor)], ['Lance mínimo de referência (50% – CPC, art. 891)', R(r.valor * 0.5)]]); } },
    { id: 'leilao-ext', nome: 'Avaliação para leilão extrajudicial (Lei 9.514)', ic: '🏦', liquidacao: true,
      fin: 'Determinar o valor de mercado do imóvel objeto de alienação fiduciária, para subsidiar o leilão extrajudicial.',
      lei: 'Lei nº 9.514/1997, arts. 24, VI e parágrafo único, 26 e 27 (com redação das Leis 13.465/2017 e 14.711/2023): se o valor do contrato for menor que a base de cálculo do ITBI, esta é o mínimo do 1º leilão.',
      campos: [F('sec_x', 'Dados do contrato', 'sec'), m('valor_contrato', 'Valor do imóvel no contrato', 'money'), m('valor_itbi', 'Base de cálculo do ITBI (prefeitura)', 'money'), m('divida', 'Valor da dívida (aprox.)', 'money')],
      extra: function (d, r) {
        var vc = num(d.valor_contrato), vi = num(d.valor_itbi), min1 = Math.max(vc, vi);
        return h.kv([['Valor de mercado apurado', R(r.valor)], ['Valor do imóvel no contrato', vc ? R(vc) : ''], ['Base de cálculo do ITBI', vi ? R(vi) : ''],
          ['Mínimo de referência para o 1º leilão', min1 ? R(min1) : ''], ['Dívida informada (referência do 2º leilão)', num(d.divida) ? R(num(d.divida)) : '']]);
      } },
    { id: 'pericial', nome: 'Laudo pericial (perito do juiz)', ic: '👨‍⚖️', judicial: true,
      fin: 'Atender à determinação judicial de avaliação do imóvel, respondendo aos quesitos das partes e do juízo.',
      lei: 'Código de Processo Civil, arts. 156 a 158 (perito), 464 a 480 (prova pericial) e art. 473 (requisitos do laudo: objeto, análise técnica, método e respostas conclusivas aos quesitos).',
      nota: 'O juízo pode exigir profissional com formação específica (CREA/CAU) conforme a natureza da perícia. Confira a nomeação antes de aceitar.' },
    { id: 'banco', nome: 'Avaliação para banco (financiamento)', ic: '🏛️', liquidacao: true,
      fin: 'Indicar o valor de mercado e o valor de liquidação forçada do imóvel, para fins de garantia em operação de crédito imobiliário.',
      lei: 'Resolução CMN nº 4.676/2018 (crédito imobiliário) e normas internas da instituição financeira.',
      nota: 'Bancos costumam aceitar só laudos de avaliadores credenciados e no modelo próprio deles. Use este parecer como referência para o cliente ou quando a instituição aceitar.' },
    { id: 'fiscal', nome: 'Avaliação para fins fiscais (ITBI / IPTU)', ic: '🧾',
      fin: 'Demonstrar o valor de mercado do imóvel para conferência ou contestação da base de cálculo de ITBI/IPTU junto ao município.',
      lei: 'Código Tributário Nacional, arts. 33 e 38; STJ, Tema 1.113 (REsp 1.937.821/SP): a base do ITBI é o valor da transação declarado, presumido compatível com o mercado; o município não pode impor previamente valor de referência.',
      campos: [F('sec_x', 'Dados fiscais', 'sec'), m('venal_iptu', 'Valor venal (carnê IPTU)', 'money'), m('valor_ref', 'Valor de referência ITBI (prefeitura)', 'money'), m('valor_trans', 'Valor da transação (escritura)', 'money'), m('aliquota', 'Alíquota ITBI (%)', 'num', { v: '3' })],
      extra: function (d, r) {
        var al = num(d.aliquota) / 100, ref = num(d.valor_ref), tr = num(d.valor_trans);
        return h.tab(['Base', 'Valor', 'ITBI'], [
          ['Valor de mercado (este parecer)', R(r.valor), R(r.valor * al)],
          ['Valor de referência da prefeitura', ref ? R(ref) : '—', ref ? R(ref * al) : '—'],
          ['Valor da transação', tr ? R(tr) : '—', tr ? R(tr * al) : '—'],
          ['Valor venal do IPTU', num(d.venal_iptu) ? R(num(d.venal_iptu)) : '—', '—']], [1, 2]);
      } },
    { id: 'revisional', nome: 'Avaliação para ação revisional de aluguel', ic: '📈', judicial: true, locacao: true,
      fin: 'Apurar o valor locativo de mercado do imóvel para ação revisional de aluguel.',
      lei: 'Lei nº 8.245/1991 (Lei do Inquilinato), art. 19 (revisão após 3 anos de contrato ou do último acordo) e arts. 68 a 70 (ação revisional).',
      campos: [F('sec_x', 'Dados da locação', 'sec'), m('aluguel_atual', 'Aluguel atual (R$/mês)', 'money'), m('inicio', 'Início do contrato / último acordo', 'date')],
      extra: function (d, r) {
        var a = num(d.aluguel_atual), dif = a ? (r.valor / a - 1) * 100 : 0;
        return h.kv([['Aluguel atual', a ? R(a) : ''], ['Aluguel de mercado apurado', R(r.valor)], ['Diferença', a ? N(dif, 1) + '%' : ''], ['Início do contrato / último acordo', PP.dt(d.inicio)]]);
      } },
    { id: 'desapropriacao', nome: 'Indenização por desapropriação', ic: '🛣️', judicial: true,
      fin: 'Estimar a justa indenização pela desapropriação total ou parcial do imóvel.',
      lei: 'Constituição Federal, art. 5º, XXIV; Decreto-Lei nº 3.365/1941, arts. 26 e 27 (justa indenização na data da avaliação).',
      nota: 'Desapropriações costumam exigir perícia de engenharia. Use este parecer como estudo de valor de mercado para a parte.',
      campos: [F('sec_x', 'Indenização', 'sec'), m('area_atingida', 'Área atingida (m²)', 'num', { aj: 'Deixe vazio se for desapropriação total.' }), m('area_total_ind', 'Área total do imóvel (m²)', 'num'), m('benf_ind', 'Benfeitorias atingidas (R$)', 'money'), m('outros_ind', 'Outros prejuízos (R$)', 'money', { aj: 'lucros cessantes, fundo de comércio, desvalorização da sobra' })],
      extra: function (d, r) {
        var at = num(d.area_atingida), tt = num(d.area_total_ind), base = (at && tt) ? r.valor * at / tt : r.valor;
        var tot = base + num(d.benf_ind) + num(d.outros_ind);
        return h.tab(['Parcela', 'Valor'], [[(at && tt) ? 'Terra/imóvel atingido (' + N(at, 2) + ' de ' + N(tt, 2) + ' m²)' : 'Imóvel (total)', R(base)], ['Benfeitorias atingidas', R(num(d.benf_ind))], ['Outros prejuízos', R(num(d.outros_ind))], ['<b>Indenização estimada</b>', '<b>' + R(tot) + '</b>']], [1]);
      } },
    { id: 'servidao', nome: 'Servidão administrativa (linhas de transmissão)', ic: '⚡', judicial: true,
      fin: 'Estimar a indenização pela instituição de servidão administrativa (faixa de linha de transmissão, duto ou similar).',
      lei: 'Decreto-Lei nº 3.365/1941, art. 40; Constituição Federal, art. 5º, XXIV.',
      nota: 'O coeficiente de servidão mede a perda de uso da faixa (costuma ficar entre 20% e 40% do valor da terra; justifique o escolhido).',
      campos: [F('sec_x', 'Faixa de servidão', 'sec'), m('faixa_area', 'Área da faixa (m²)', 'num'), m('faixa_vm2', 'Valor da terra (R$/m²)', 'money', { aj: 'Se vazio, usa o valor por m² apurado no cálculo.' }), m('coef', 'Coeficiente de servidão (%)', 'num', { v: '33' }), m('benf_serv', 'Benfeitorias/culturas atingidas (R$)', 'money')],
      extra: function (d, r) {
        var vm = num(d.faixa_vm2) || r.vu || 0, fa = num(d.faixa_area), cf = num(d.coef) / 100, ind = fa * vm * cf + num(d.benf_serv);
        return h.tab(['Item', 'Valor'], [['Área da faixa', N(fa, 2) + ' m²'], ['Valor da terra', R(vm) + '/m²'], ['Coeficiente de servidão', N(cf * 100, 1) + '%'], ['Benfeitorias atingidas', R(num(d.benf_serv))], ['<b>Indenização estimada</b>', '<b>' + R(ind) + '</b>']], [1]);
      } },
    { id: 'extincao', nome: 'Partilha de bens e extinção de condomínio', ic: '🤝', judicial: true, cotas: true,
      fin: 'Apurar o valor de mercado do imóvel e a parte de cada coproprietário, para partilha (divórcio, dissolução de união) ou extinção de condomínio.',
      lei: 'Código Civil, arts. 1.320 e 1.322 (extinção de condomínio); CPC, art. 730 (alienação judicial) e arts. 731 a 734 (divórcio e partilha).' },
    { id: 'heranca', nome: 'Inventário e herança', ic: '📜', judicial: true, cotas: true,
      fin: 'Apurar o valor de mercado do imóvel do espólio, para inventário, partilha e recolhimento do ITCMD.',
      lei: 'CPC, arts. 610 a 673 (inventário e partilha), art. 630 (avaliação); legislação estadual do ITCMD.',
      campos: [F('sec_x', 'Espólio', 'sec'), m('falecido', 'Nome do falecido(a)', 'text'), m('obito', 'Data do óbito', 'date')] },
    { id: 'usucapiao', nome: 'Avaliação para usucapião', ic: '🗝️',
      fin: 'Estimar o valor de mercado do imóvel usucapiendo, para fins de valor da causa, custas e emolumentos (judicial ou extrajudicial).',
      lei: 'Código Civil, arts. 1.238 a 1.244; CPC, art. 292; Lei nº 6.015/1973, art. 216-A (usucapião extrajudicial).',
      campos: [F('sec_x', 'Posse', 'sec'), m('modalidade_u', 'Modalidade', 'sel', { o: ['', 'Extraordinária (15 ou 10 anos)', 'Ordinária (10 ou 5 anos)', 'Especial urbana (5 anos, até 250 m²)', 'Especial rural (5 anos, até 50 ha)', 'Familiar (2 anos)', 'Coletiva'] }), m('posse_anos', 'Tempo de posse (anos)', 'num'), F('posse_desc', 'Como a posse é exercida', 'area')] },
    { id: 'seguro', nome: 'Avaliação para seguro', ic: '🛡️',
      fin: 'Estimar o valor de reconstrução das edificações (valor em risco) e o valor de mercado do imóvel, para contratação ou revisão de seguro.',
      lei: 'Código Civil, arts. 778 e 781 (o seguro não pode superar o valor do interesse segurado).',
      campos: [F('sec_x', 'Reconstrução', 'sec'), m('seg_cub', 'Custo de reconstrução (R$/m²)', 'money', { aj: 'Use o CUB do Sinduscon do mês + extras.' }), m('seg_extra', 'Demolição, remoção e projetos (%)', 'num', { v: '10' })],
      extra: function (d, r) {
        var ac = num(d.area_construida), cub = num(d.seg_cub), ex = num(d.seg_extra) / 100, rec = ac * cub * (1 + ex);
        return h.tab(['Item', 'Valor'], [['Área construída', N(ac, 2) + ' m²'], ['Custo de reconstrução', R(cub) + '/m²'], ['Acréscimo (demolição, projetos)', N(ex * 100, 1) + '%'], ['<b>Valor de reconstrução (valor em risco)</b>', '<b>' + R(rec) + '</b>'], ['Valor de mercado (terreno + construção)', R(r.valor)]], [1]);
      } }
  ];

  /* ---------- métodos ---------- */
  var METODOS = {
    comparativo: 'Comparativo direto de dados de mercado',
    evolutivo: 'Evolutivo (terreno + custo de reedição)',
    renda: 'Capitalização da renda',
    involutivo: 'Involutivo',
    manual: 'Valor definido por mim (com justificativa)'
  };
  var TXT_METODO = {
    comparativo: 'Foi utilizado o Método Comparativo Direto de Dados de Mercado, que identifica o valor do imóvel por meio da comparação com imóveis semelhantes ofertados ou negociados na mesma região. Os elementos pesquisados foram homogeneizados por fatores (oferta, localização, padrão, conservação e área) e a amostra foi saneada, descartando valores fora do intervalo de 30% em torno da média.',
    evolutivo: 'Foi utilizado o Método Evolutivo, que compõe o valor do imóvel pela soma do valor do terreno (obtido por comparação) com o custo de reedição das benfeitorias, depreciado pela idade e pelo estado de conservação (critério de Ross-Heidecke), aplicando-se ao final o fator de comercialização.',
    renda: 'Foi utilizado o Método da Capitalização da Renda, que estima o valor do imóvel a partir da renda líquida que ele pode gerar, dividida por uma taxa de capitalização compatível com o mercado para esse tipo de imóvel.',
    involutivo: 'Foi utilizado o Método Involutivo, que estima o valor do terreno a partir do aproveitamento eficiente previsto (empreendimento hipotético), descontando do valor geral de vendas os custos de construção, despesas, impostos e o lucro do empreendedor.',
    manual: 'O valor foi definido pelo avaliador com base em sua experiência e no conhecimento do mercado local, conforme a justificativa apresentada abaixo, nos termos permitidos ao parecer técnico de avaliação mercadológica.'
  };

  function camposComuns(cfg) {
    var L = [];
    L.push(F('', 'Pedido', 'sec'));
    L.push(m('numero', 'Número do parecer', 'text', { ph: 'ex.: 012/2026' }));
    L.push(m('data_laudo', 'Data do parecer', 'date'));
    if (cfg.judicial) {
      L.push(F('', 'Processo', 'sec'));
      L.push(F('processo', 'Número do processo'));
      L.push(m('vara', 'Vara', 'text')); L.push(m('comarca', 'Comarca', 'text'));
      L.push(m('autor', 'Autor / requerente', 'text')); L.push(m('reu', 'Réu / requerido', 'text'));
    }
    L.push(F('solicitante', cfg.judicial ? 'Solicitante (juízo ou parte que contratou)' : 'Solicitante / cliente'));
    L.push(m('doc_sol', 'CPF / CNPJ do solicitante', 'text'));
    L.push(m('fone', 'Telefone do cliente', 'tel'));
    if (!cfg.fin) L.push(F('finalidade', 'Finalidade', 'sel', { o: cfg.locacao ? ['Definir o valor de aluguel', 'Renovação / reajuste de contrato', 'Orientar proprietário', 'Outra'] : ['Venda', 'Compra', 'Partilha / inventário', 'Divórcio', 'Garantia / empréstimo', 'Orientar proprietário', 'Processo judicial', 'Outra'] }));
    L.push(m('data_vistoria', 'Data da vistoria', 'date'));
    L.push(F('', 'Imóvel', 'sec'));
    L.push(F('endereco', 'Endereço completo'));
    L.push(m('bairro', 'Bairro', 'text')); L.push(m('cidade', 'Cidade / UF', 'text'));
    L.push(m('matricula', cfg.rural ? 'Matrícula' : 'Matrícula', 'text')); L.push(m('cartorio', 'Cartório de Registro', 'text'));
    L.push(m('inscricao', cfg.rural ? 'INCRA / CCIR' : 'Inscrição IPTU (SQL)', 'text')); L.push(m('proprietario', 'Proprietário(s)', 'text'));
    return L;
  }
  function camposFim(cfg, t) {
    var L = [];
    L.push(F('', 'Região', 'sec'));
    L.push(F('regiao', 'Como é a região', 'area', { ph: 'Bairro residencial consolidado, perto de comércio, escolas e transporte…' }));
    L.push(F('infra', 'Serviços na região', 'chk', { o: ['Água', 'Esgoto', 'Energia elétrica', 'Iluminação pública', 'Rua asfaltada', 'Coleta de lixo', 'Transporte público', 'Comércio', 'Escolas', 'Postos de saúde'] }));
    L.push(F('', 'Vistoria', 'sec'));
    L.push(F('descricao_imovel', 'Descrição do imóvel (cômodos, acabamentos)', 'area'));
    if (t.obra || t.obraOpc || cfg.obra) L.push(F('conservacao', 'Estado de conservação', 'sel', { o: [''].concat(OPT_HEID) }));
    L.push(F('fotos', 'Fotos do imóvel', 'fotos', { aj: 'Tire as fotos no celular. Elas entram no anexo do parecer.' }));
    L.push(F('', 'Documentação', 'sec'));
    L.push(F('situacao_doc', 'Situação documental', 'sel', { o: ['Regular (matrícula em nome do vendedor)', 'Regular com pendências simples', 'Irregular / só contrato de gaveta', 'Sem matrícula (posse)', 'Não verificada (documentos não apresentados)'] }));
    L.push(F('obs_doc', 'Observações (ônus, averbações, construção não averbada…)', 'area'));
    return L;
  }
  function camposCalc(cfg, t) {
    var loc = cfg.locacao || t.locacao, unid = t.unidade === 'ha' ? 'ha' : 'm²';
    var ops = loc ? ['comparativo', 'manual'] : ['comparativo', 'evolutivo', 'renda', 'involutivo', 'manual'];
    var L = [F('', 'Cálculo do valor', 'sec'),
      F('metodo', 'Método', 'sel', { o: ops.map(function (k) { return [k, METODOS[k]]; }), aj: 'Na dúvida, use o comparativo. Veja o guia dos 4 métodos.' })];
    L.push(F('area_calc', 'Área usada no cálculo (' + unid + ')', 'num', { se: function (d) { return d.metodo === 'comparativo'; }, aj: 'Se ficar vazio, uso a área principal do imóvel.' }));
    L.push(F('farea', 'Ajustar pela diferença de área', 'sel', { o: [['sim', 'Sim (recomendado)'], ['nao', 'Não']], se: function (d) { return d.metodo === 'comparativo'; } }));
    L.push(F('comps', 'Imóveis comparáveis (pesquisa de mercado)', 'tab', {
      se: function (d) { return d.metodo === 'comparativo'; }, item: 'Comparável', acao: ['banco', '📥 Trazer do banco de comparáveis'],
      aj: 'Use de 3 a 6 imóveis parecidos. Fatores: 1,00 = igual; acima de 1 = o comparável é pior; abaixo de 1 = é melhor.',
      cols: [F('end', 'Endereço / descrição'), m('fonte', 'Fonte (site, imobiliária, telefone)', 'text'), m('area', 'Área (' + unid + ')', 'num'), m('preco', loc ? 'Aluguel pedido (R$/mês)' : 'Preço pedido (R$)', 'money'),
        m('fo', 'Fator oferta', 'num', { v: loc ? '0,95' : '0,90' }), m('fl', 'Fator localização', 'num', { v: '1,00' }), m('fp', 'Fator padrão', 'num', { v: '1,00' }), m('fc', 'Fator conservação', 'num', { v: '1,00' }), m('fx', 'Outros fatores', 'num', { v: '1,00' }), F('foto', 'Foto do imóvel', 'fotos', { aj: 'Print do anúncio ou foto da fachada' })]
    }));
    var ev = function (d) { return d.metodo === 'evolutivo'; };
    L.push(m('ev_at', 'Área do terreno (m²)', 'num', { se: ev })); L.push(m('ev_vt', 'Valor do terreno (R$/m²)', 'money', { se: ev }));
    L.push(m('ev_ac', 'Área construída (m²)', 'num', { se: ev })); L.push(m('ev_cub', 'Custo de construção novo (R$/m²)', 'money', { se: ev, aj: 'CUB Sinduscon do padrão + 20 a 30% de extras' }));
    L.push(m('ev_idade', 'Idade aparente (anos)', 'num', { se: ev })); L.push(m('ev_vida', 'Vida útil (anos)', 'num', { se: ev, v: '70', aj: 'Veja a tabela de vida útil' }));
    L.push(m('ev_estado', 'Estado (Heidecke)', 'sel', { se: ev, o: OPT_HEID, v: 'c' })); L.push(m('ev_res', 'Valor residual (%)', 'num', { se: ev, v: '20' }));
    L.push(F('ev_fc', 'Fator de comercialização', 'num', { se: ev, v: '1,00', aj: 'Acima de 1 em mercado aquecido; abaixo de 1 em mercado fraco.' }));
    var re = function (d) { return d.metodo === 'renda'; };
    L.push(m('re_aluguel', 'Renda bruta (R$/mês)', 'money', { se: re })); L.push(m('re_vac', 'Vacância / inadimplência (%)', 'num', { se: re, v: '8' }));
    L.push(m('re_desp', 'Despesas do proprietário (R$/ano)', 'money', { se: re })); L.push(m('re_taxa', 'Taxa de capitalização (% ao ano)', 'num', { se: re, v: '6', aj: 'Residencial 4–6%, comercial 6–9%, hotel 9–12%' }));
    var iv = function (d) { return d.metodo === 'involutivo'; };
    L.push(m('in_area', 'Área vendável projetada (m²)', 'num', { se: iv })); L.push(m('in_preco', 'Preço de venda (R$/m²)', 'money', { se: iv }));
    L.push(m('in_custo', 'Custo total da obra (R$)', 'money', { se: iv })); L.push(m('in_desp', 'Despesas, impostos e corretagem (%)', 'num', { se: iv, v: '15' }));
    L.push(F('in_lucro', 'Lucro do incorporador (%)', 'num', { se: iv, v: '20' }));
    var ma = function (d) { return d.metodo === 'manual'; };
    L.push(F('man_valor', loc ? 'Aluguel definido (R$/mês)' : 'Valor definido (R$)', 'money', { se: ma }));
    L.push(F('man_just', 'Justificativa', 'area', { se: ma, ph: 'Explique em poucas linhas como chegou ao valor (vendas recentes, conhecimento da rua…)' }));
    L.push(F('', 'Resultado', 'sec'));
    L.push(m('margem', 'Faixa de negociação (± %)', 'num', { v: '10' }));
    L.push(m('arred', 'Arredondar o valor', 'sel', { o: [['sim', 'Sim'], ['nao', 'Não']] }));
    L.push(m('liquidez', 'Liquidez', 'sel', { o: ['Alta', 'Média', 'Baixa'], v: 'Média' }));
    L.push(m('prazo', 'Prazo estimado de ' + (loc ? 'locação' : 'venda'), 'text', { v: loc ? '30 a 60 dias' : '3 a 6 meses' }));
    if (cfg.liquidacao) L.push(m('desagio', 'Deságio para venda rápida (%)', 'num', { v: '30', aj: 'Valor de liquidação forçada = mercado – deságio' }));
    if (cfg.cotas || t.cotas) L.push(F('cotas', cfg.id === 'heranca' || t.id === 'inventario' ? 'Herdeiros e partes' : 'Coproprietários e partes', 'tab', { item: 'Pessoa', cols: [m('nome', 'Nome', 'text'), m('perc', 'Parte (%)', 'num')] }));
    if (cfg.judicial) L.push(F('quesitos', 'Quesitos e respostas', 'tab', { item: 'Quesito', cols: [F('q', 'Quesito', 'area'), F('r', 'Resposta', 'area')] }));
    L.push(F('ressalvas', 'Ressalvas extras (opcional)', 'area'));
    L.push(F('conclusao', 'Comentário final (opcional)', 'area'));
    return L;
  }

  /* ---------- cálculo do PTAM ---------- */
  function areaPrincipal(d, t) { return num(d[t.area]) || num(d.area_construida) || num(d.area_privativa) || num(d.area_terreno) || num(d.area_ha); }
  PP.calcPTAM = function (d, t, cfg) {
    var r = { valor: 0, vu: 0, memoria: '', metodo: d.metodo || 'comparativo' }, C = PP.calc, loc = cfg.locacao || t.locacao;
    var un = t.unidade === 'ha' ? 'ha' : 'm²';
    if (r.metodo === 'comparativo') {
      var area = num(d.area_calc) || areaPrincipal(d, t);
      var hm = C.homog(d.comps || [], area, d.farea !== 'nao');
      r.hm = hm; r.vu = hm.mediaSan; r.valor = hm.mediaSan * area; r.area = area;
      r.memoria = C.tabelaHomog(hm, un, loc) +
        h.kv([['Média dos valores homogeneizados', R(hm.media) + '/' + un], ['Amostra saneada (±30% da média)', hm.nSan + ' de ' + hm.n + ' elementos'],
          ['Média saneada', R(hm.mediaSan) + '/' + un], ['Área do imóvel avaliado', N(area, 2) + ' ' + un], ['Valor calculado', R(r.valor) + (loc ? '/mês' : '')]]);
    } else if (r.metodo === 'evolutivo') {
      var e = C.evolutivo({ at: num(d.ev_at), vt: num(d.ev_vt), ac: num(d.ev_ac), cub: num(d.ev_cub), idade: num(d.ev_idade), vida: num(d.ev_vida), estado: d.ev_estado, res: num(d.ev_res), fc: num(d.ev_fc) || 1 });
      r.valor = e.valor; r.vu = num(d.ev_vt); r.memoria = e.memoria;
    } else if (r.metodo === 'renda') {
      var rr = C.renda({ aluguel: num(d.re_aluguel), vac: num(d.re_vac), desp: num(d.re_desp), taxa: num(d.re_taxa) });
      r.valor = rr.valor; r.memoria = rr.memoria;
    } else if (r.metodo === 'involutivo') {
      var iv = C.involutivo({ area: num(d.in_area), preco: num(d.in_preco), custo: num(d.in_custo), desp: num(d.in_desp), lucro: num(d.in_lucro) });
      r.valor = iv.valor; r.memoria = iv.memoria; var at2 = num(d.area_terreno); if (at2) r.vu = iv.valor / at2;
    } else {
      r.valor = num(d.man_valor); r.memoria = h.p(d.man_just || '');
    }
    r.calculado = r.valor;
    if (d.arred !== 'nao') r.valor = PP.arred(r.valor);
    var mg = (d.margem === '' || d.margem == null) ? 0.10 : num(d.margem) / 100;
    r.min = r.valor * (1 - mg); r.max = r.valor * (1 + mg);
    if (cfg.liquidacao) r.liq = r.valor * (1 - num(d.desagio == null || d.desagio === '' ? 30 : d.desagio) / 100);
    return r;
  };

  /* ---------- montagem do documento ---------- */
  function linhasCaract(d, t) {
    var rot = {}; for (var k in ROT) rot[k] = ROT[k]; if (t.rot) for (var k2 in t.rot) rot[k2] = t.rot[k2];
    var out = [];
    (t.campos || []).forEach(function (c) {
      if (!c.k || c.t === 'sec') return;
      var v = d[c.k]; if (v == null || v === '') return;
      if (c.t === 'money') v = R(num(v)); else if (UNID[c.k]) v = v + UNID[c.k];
      out.push([rot[c.k] || c.l, v]);
    });
    if (d.conservacao) out.push(['Estado de conservação', PP.heidNome(d.conservacao)]);
    return out;
  }

  function renderPTAM(d, c, t, cfg) {
    var P = c.P, r = PP.calcPTAM(d, t, cfg), loc = cfg.locacao || t.locacao;
    var pm = loc ? '/mês' : '';
    var titulo = cfg.laudo ? 'LAUDO DE AVALIAÇÃO' : 'PARECER TÉCNICO DE AVALIAÇÃO MERCADOLÓGICA';
    var subt = (cfg.laudo ? esc(cfg.nome) : t.nome) + (d.numero ? ' · Nº ' + esc(d.numero) : '');
    var fin = cfg.fin || ((loc ? 'Determinar o valor de locação (aluguel mensal) de mercado do imóvel' : 'Determinar o valor de mercado para venda do imóvel') + (d.finalidade ? ', para fins de: ' + d.finalidade.toLowerCase() : '') + '.');
    var end = [d.endereco, d.bairro, d.cidade].filter(Boolean).join(' – ');
    var valTxt = R(r.valor) + pm;

    if (c.modo === 'resumida') {
      return h.t(loc ? 'Valor de Aluguel – Resumo' : 'Parecer de Valor – Resumo', subt) +
        h.kv([['Cliente', d.solicitante], ['Imóvel', end], ['Tipo', t.nome], ['Área', areaPrincipal(d, t) ? N(areaPrincipal(d, t), 2) + (t.unidade === 'ha' ? ' ha' : ' m²') : ''], ['Data da vistoria', PP.dt(d.data_vistoria)]]) +
        h.valor(valTxt, '(' + PP.extenso(r.valor) + (loc ? ' por mês' : '') + ')') +
        h.kv([['Faixa de negociação', R(r.min) + ' a ' + R(r.max) + pm], ['Liquidez', d.liquidez], ['Prazo estimado', d.prazo]]) +
        (r.liq ? h.kv([['Valor para venda rápida (liquidação forçada)', R(r.liq)]]) : '') +
        h.s('Por que este valor?') +
        '<ul><li>Método: ' + esc(METODOS[r.metodo]) + '.</li>' +
        (r.hm ? '<li>Comparado com ' + r.hm.nSan + ' imóveis parecidos na região, ajustados pelas diferenças.</li>' : '') +
        (d.conservacao ? '<li>Estado de conservação considerado: ' + esc(PP.heidNome(d.conservacao)) + '.</li>' : '') +
        '<li>Valor válido para as condições de mercado da data deste parecer.</li></ul>' +
        (d.conclusao ? h.p(d.conclusao) : '') +
        h.nota('Este é o resumo do parecer técnico. A versão completa, com a pesquisa de mercado e os cálculos, fica à disposição do cliente.') +
        h.ass(P, P.cidade, d.data_laudo);
    }

    var n = 0, S = function (t2) { n++; return h.s(n + '. ' + t2); };
    var o = h.t(titulo, subt);
    o += S('Avaliador') + h.kv([['Nome', P.nome], ['Registro', P.creci + ' · ' + P.cnai], ['Contato', 'WhatsApp ' + P.whats + (P.email ? ' · ' + P.email : '')]]);
    if (cfg.judicial && (d.processo || d.vara)) o += S('Processo') + h.kv([['Processo nº', d.processo], ['Vara', d.vara], ['Comarca', d.comarca], ['Autor / requerente', d.autor], ['Réu / requerido', d.reu]]);
    if (cfg.id === 'heranca' && (d.falecido || d.obito)) o += h.kv([['Espólio de', d.falecido], ['Data do óbito', PP.dt(d.obito)]]);
    o += S('Solicitante e finalidade') + h.kv([['Solicitante', d.solicitante], ['CPF / CNPJ', d.doc_sol], ['Finalidade', fin], ['Data da vistoria', PP.dt(d.data_vistoria)], ['Data do parecer', PP.dt(d.data_laudo)]]);
    o += S('Identificação do imóvel') + h.kv([['Tipo', cfg.laudo ? (d.tipo_imovel || '') : t.nome], ['Endereço', d.endereco], ['Bairro', d.bairro], ['Cidade / UF', d.cidade], ['Matrícula', d.matricula], ['Cartório', d.cartorio], [t.unidade === 'ha' ? 'INCRA / CCIR' : 'Inscrição IPTU', d.inscricao], ['Proprietário(s)', d.proprietario]]);
    var inf = ['Água', 'Esgoto', 'Energia elétrica', 'Iluminação pública', 'Rua asfaltada', 'Coleta de lixo', 'Transporte público', 'Comércio', 'Escolas', 'Postos de saúde'];
    var infTxt = (d.infra || []).slice().sort(function (a, b) { return a - b; }).map(function (i) { return inf[i]; }).join(', ');
    o += S('Caracterização da região') + h.p(d.regiao || 'Região não descrita.') + (infTxt ? h.p('Serviços e melhoramentos disponíveis: ' + infTxt + '.') : '');
    o += S('Caracterização do imóvel') + h.kv(linhasCaract(d, t)) + h.p(d.descricao_imovel);
    if (d.modalidade_u || d.posse_anos) o += h.kv([['Modalidade de usucapião', d.modalidade_u], ['Tempo de posse', d.posse_anos ? d.posse_anos + ' anos' : '']]) + h.p(d.posse_desc);
    o += S('Situação documental') + h.p((d.situacao_doc || 'Não informada') + '.') + h.p(d.obs_doc) +
      h.p('As informações sobre documentação foram fornecidas pelo solicitante ou obtidas nos documentos apresentados e não substituem a análise jurídica da matrícula atualizada.');
    o += S('Metodologia') + h.p(TXT_METODO[r.metodo]) + h.p('Este parecer segue a Lei nº 6.530/1978, o Decreto nº 81.871/1978 e a Resolução COFECI nº 1.066/2007, utilizando como referência técnica a ABNT NBR 14653-1 e 14653-2.');
    o += S(r.metodo === 'comparativo' ? 'Pesquisa de mercado e cálculo' : 'Cálculo do valor') + (r.memoria || h.p('Preencha os dados do cálculo.'));
    o += S('Resultado') + h.valor(valTxt, '(' + PP.extenso(r.valor) + (loc ? ' por mês' : '') + ')') +
      h.kv([['Faixa de valores (negociação)', R(r.min) + ' a ' + R(r.max) + pm], r.liq ? ['Valor de liquidação forçada (venda rápida, deságio de ' + N(num(d.desagio === '' || d.desagio == null ? 30 : d.desagio), 0) + '%)', R(r.liq)] : null, ['Liquidez', d.liquidez], ['Prazo estimado de ' + (loc ? 'locação' : 'venda'), d.prazo]]);
    if (cfg.extra) o += h.s('Valores para a finalidade') + cfg.extra(d, r);
    if ((cfg.cotas || t.cotas) && (d.cotas || []).length) {
      o += h.s('Parte de cada um') + h.tab(['Nome', 'Parte', 'Valor'], d.cotas.map(function (q) { var p = num(q.perc); return [esc(q.nome), N(p, 2) + '%', R(r.valor * p / 100)]; }), [1, 2]);
    }
    if (cfg.judicial && (d.quesitos || []).length) {
      o += S('Respostas aos quesitos') + d.quesitos.map(function (q, i) { return '<p><b>Quesito ' + (i + 1) + ':</b> ' + esc(q.q) + '</p><p><b>Resposta:</b> ' + esc(q.r).replace(/\n/g, '<br>') + '</p>'; }).join('');
    }
    var ress = ['O valor refere-se à data deste parecer e às condições de mercado vigentes; pode variar com o tempo.',
      'Não foram feitos exames de estrutura, solo, instalações ocultas ou medições topográficas; considerou-se o imóvel sem vícios ocultos.',
      'As áreas e dados documentais foram informados pelo solicitante ou extraídos dos documentos apresentados.',
      'Este parecer não é laudo de engenharia e não substitui perícia de profissional do CREA/CAU quando a lei ou o juízo a exigir.'];
    if (t.obs) ress.push(t.obs);
    if (cfg.nota) ress.push(cfg.nota);
    o += S('Pressupostos e ressalvas') + '<ul>' + ress.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' + h.p(d.ressalvas);
    o += S('Fundamentação legal') + '<ul><li>Lei nº 6.530/1978, art. 3º, e Decreto nº 81.871/1978 (competência do corretor para opinar sobre a comercialização imobiliária).</li><li>Resolução COFECI nº 1.066/2007 (Parecer Técnico de Avaliação Mercadológica e CNAI).</li><li>ABNT NBR 14653-1 e 14653-2 (referência técnica).</li>' + (cfg.lei ? '<li>' + esc(cfg.lei) + '</li>' : '') + '</ul>';
    o += S('Conclusão') + h.p('Com base na vistoria, na pesquisa de mercado e nos cálculos acima, conclui-se que o ' + (loc ? 'valor de locação mensal' : 'valor de mercado') + ' do imóvel é de ' + valTxt + ' (' + PP.extenso(r.valor) + (loc ? ' por mês' : '') + ').') + h.p(d.conclusao) +
      h.p('Nada mais havendo, encerra-se o presente parecer, assinado pelo avaliador.');
    o += h.ass(P, P.cidade, d.data_laudo);
    if ((d.fotos || []).length) o += '<div class="quebra"></div>' + h.s('Anexo – Registro fotográfico') + h.fotos(d.fotos);
    if (r.metodo === 'comparativo') { var fc = PP.calc.fotosComps(d.comps); if (fc) o += '<div class="quebra"></div>' + h.s('Anexo – Imóveis comparáveis') + fc; }
    return o;
  }

  function resumo(d, t, cfg) {
    var r = PP.calcPTAM(d, t, cfg), loc = cfg.locacao || t.locacao;
    if (!r.valor) return 'Preencha o cálculo para ver o valor aqui.';
    return (loc ? 'Aluguel: ' : 'Valor: ') + '<b class="v">' + R(r.valor) + (loc ? '/mês' : '') + '</b><br>Faixa: ' + R(r.min) + ' a ' + R(r.max) +
      (r.hm ? '<br>' + r.hm.nSan + ' de ' + r.hm.n + ' comparáveis usados · ' + R(r.vu) + '/' + (t.unidade === 'ha' ? 'ha' : 'm²') : '') +
      (r.liq ? '<br>Venda rápida: ' + R(r.liq) : '');
  }

  function inicio(d, t, cfg) {
    d.data_laudo = PP.hoje(); d.data_vistoria = PP.hoje();
    d.metodo = t.metodo || 'comparativo'; d.cidade = 'São Paulo – SP';
    d.comps = [{}, {}, {}].map(function () { return { fo: (cfg.locacao || t.locacao) ? '0,95' : '0,90', fl: '1,00', fp: '1,00', fc: '1,00', fx: '1,00' }; });
    if (cfg.judicial) d.quesitos = [];
  }

  function registra(t, cfg) {
    var it = {
      id: cfg.laudo ? 'laudo-' + cfg.id : 'ptam-' + t.id, cat: cfg.laudo ? 'laudo' : 'ptam', ic: cfg.ic || t.ic,
      titulo: cfg.laudo ? cfg.nome : 'PTAM – ' + t.nome,
      desc: cfg.laudo ? cfg.fin : 'Versão completa e resumida para o cliente. Cálculo automático.',
      versoes: true,
      campos: function () {
        var extra = cfg.laudo ? (cfg.campos || []) : [];
        return camposComuns(cfg).concat([F('', 'Características', 'sec')], t.campos, extra, camposFim(cfg, t), camposCalc(cfg, t));
      },
      inicio: function (d) { inicio(d, t, cfg); },
      render: function (d, c) { return renderPTAM(d, c, t, cfg); },
      resumo: function (d) { return resumo(d, t, cfg); },
      nomeArquivo: function (d) { return (cfg.laudo ? 'Laudo' : 'PTAM') + ' ' + (d.endereco || t.nome).slice(0, 40); },
      acoes: { banco: function (d) { PP.trazerBanco(d); } }
    };
    if (!cfg.laudo && t.id === 'casa') it.exemplo = function () { return EXEMPLO; };
    PP.add(it);
  }

  TIPOS.forEach(function (t) { registra(t, {}); });
  var TGEN = { id: 'gen', nome: 'Imóvel', campos: C_GENERICO.concat([F('descricao', 'Outras características', 'area')]), area: 'area_construida', obraOpc: true, rot: { tipo_imovel: 'Tipo', descricao: 'Outras características' } };
  LAUDOS.forEach(function (l) { l.laudo = true; l.obra = true; registra(l.locacao ? { id: 'gen-loc', nome: 'Imóvel', campos: TGEN.campos, area: 'area_construida', locacao: true, rot: TGEN.rot } : TGEN, l); });

  /* traz linhas do banco de comparáveis */
  PP.trazerBanco = function (d) {
    var banco = (PP.ls.get('d:calc-banco', {}) || {}).itens || [];
    if (!banco.length) { PP.aviso('O banco de comparáveis está vazio.'); return; }
    var bairro = (d.bairro || '').toLowerCase();
    var lista = banco.filter(function (b) { return !bairro || (b.bairro || '').toLowerCase() === bairro; });
    if (!lista.length) lista = banco;
    d.comps = (d.comps || []).filter(function (x) { return num(x.preco) && num(x.area); });
    lista.slice(0, 8).forEach(function (b) {
      d.comps.push({ end: [b.end, b.bairro].filter(Boolean).join(' – '), fonte: b.fonte || '', area: b.area, preco: b.preco, foto: b.foto || [], fo: b.tipo === 'Vendido' ? '1,00' : '0,90', fl: '1,00', fp: '1,00', fc: '1,00', fx: '1,00' });
    });
    PP.aviso(lista.slice(0, 8).length + ' comparáveis trazidos ✔');
  };

  /* ---------- exemplo preenchido (casa) ---------- */
  var EXEMPLO = {
    numero: '001/2026', data_laudo: '2026-11-20', data_vistoria: '2026-11-18',
    solicitante: 'Maria Aparecida dos Santos (exemplo)', doc_sol: '000.000.000-00', fone: '', finalidade: 'Venda',
    endereco: 'Rua das Palmeiras, 120 (endereço fictício)', bairro: 'Jardim Exemplo', cidade: 'São Paulo – SP',
    matricula: '123.456', cartorio: '12º Registro de Imóveis de São Paulo', inscricao: '000.000.0000-0', proprietario: 'Maria Aparecida dos Santos',
    area_terreno: '250', area_construida: '140', dormitorios: '3', suites: '1', banheiros: '2', vagas: '2', pavimentos: '2', idade: '15', padrao: 'Normal / médio',
    quintal: 'Quintal nos fundos com churrasqueira e área de serviço coberta',
    regiao: 'Bairro residencial consolidado da Zona Leste, com ruas asfaltadas, comércio de bairro, escolas, UBS e ônibus a 300 m. Procura constante por casas de 2 e 3 dormitórios.',
    infra: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    descricao_imovel: 'Sobrado com sala de estar e jantar, cozinha, lavabo, 3 dormitórios (1 suíte), banheiro social, garagem para 2 carros, quintal com churrasqueira. Piso cerâmico, laje, telhado em telha cerâmica, esquadrias de alumínio.',
    conservacao: 'c', fotos: [],
    situacao_doc: 'Regular (matrícula em nome do vendedor)', obs_doc: 'Construção averbada na matrícula. Sem ônus informados.',
    metodo: 'comparativo', area_calc: '', farea: 'sim',
    comps: [
      { end: 'Sobrado 3 dorm., rua paralela', fonte: 'Portal imobiliário', area: '130', preco: '520000', fo: '0,90', fl: '1,00', fp: '1,00', fc: '1,00', fx: '1,00' },
      { end: 'Sobrado 3 dorm. com edícula', fonte: 'Imobiliária local', area: '160', preco: '600000', fo: '0,90', fl: '1,00', fp: '0,95', fc: '1,00', fx: '1,00' },
      { end: 'Casa térrea 2 dorm., mesma rua', fonte: 'Placa no local', area: '110', preco: '430000', fo: '0,90', fl: '1,00', fp: '1,00', fc: '1,05', fx: '1,00' },
      { end: 'Sobrado 3 dorm., bairro vizinho', fonte: 'Portal imobiliário', area: '150', preco: '540000', fo: '0,90', fl: '1,05', fp: '1,00', fc: '1,00', fx: '1,00' },
      { end: 'Sobrado reformado, 3 dorm.', fonte: 'Corretor parceiro', area: '135', preco: '700000', fo: '0,90', fl: '1,00', fp: '1,00', fc: '0,90', fx: '1,00' }
    ],
    margem: '10', arred: 'sim', liquidez: 'Média', prazo: '3 a 6 meses',
    ressalvas: '', conclusao: 'Imóvel bem localizado e em estado regular. Recomenda-se anunciar próximo ao valor de mercado para venda em prazo normal.'
  };
})();
