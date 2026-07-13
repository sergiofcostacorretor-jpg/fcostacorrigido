// ===================== HELPERS DE CLÁUSULA (mesmo texto legal do contratos_principal.html) =====================
const CRECI_JS = "CRECI-SP 294791-F";
const CNAI_JS = "CNAI 52708";
const CORRETOR_JS = "Sergio Fernandes da Costa";

function campo(field, placeholder){
  return '<span class="campo-edit" contenteditable="true" data-field="'+field+'" data-placeholder="'+placeholder+'"></span>';
}
function textoLivre(field, placeholder){
  return '<span class="campo-edit" contenteditable="true" data-field="'+field+'" data-placeholder="'+placeholder+'"></span>';
}
function leiBloco(titulo, itens){
  return '<div class="lei-bloco"><div class="lei-header">'+titulo+'</div>'+itens.map(i=>'<div class="lei-item">'+i+'</div>').join('')+'</div>';
}
function clausula(titulo, corpo, leis){
  leis = leis || [];
  return '<h3 class="clausula-titulo">'+titulo+'</h3><p class="clausula-texto">'+corpo+'</p>'+(leis.length ? leiBloco('AMPARO LEGAL', leis) : '');
}

function cla_deverInfo(num){
  return clausula('CLÁUSULA '+num+' — DO DEVER DE INFORMAÇÃO E BOA-FÉ',
    'O(A) CORRETOR(A) F. COSTA compromete-se a:<br>'+
    '(a) Informar ao(à) OUTORGANTE/CONTRATANTE todas as circunstâncias relevantes ao negócio, incluindo pendências, ônus, restrições ou riscos de que tenha conhecimento;<br>'+
    '(b) Prestar contas de toda documentação, proposta e tratativa realizada;<br>'+
    '(c) Atuar com transparência, lealdade e imparcialidade na intermediação;<br>'+
    '(d) Comunicar imediatamente qualquer fato superveniente que possa influenciar a decisão das partes.<br><br>'+
    'As partes declaram-se mutuamente cientes de seus direitos e obrigações.',
    ['<strong>Art. 6º, III, CDC:</strong> É direito básico do consumidor a informação adequada e clara sobre os serviços.',
     '<strong>Art. 723 do CC/2002:</strong> O corretor é obrigado a executar a mediação com diligência e prudência, prestando ao cliente todas as informações sobre o andamento do negócio.',
     '<strong>Art. 422 do CC/2002:</strong> Os contratantes são obrigados a guardar os princípios de probidade e boa-fé.']);
}
function cla_lgpd(num){
  return clausula('CLÁUSULA '+num+' — DA AUTORIZAÇÃO DE DIVULGAÇÃO E PROTEÇÃO DE DADOS (LGPD)',
    'O(A) OUTORGANTE/PROPRIETÁRIO(A) autoriza expressamente o(a) CORRETOR(A) a:<br>'+
    '(a) Divulgar o imóvel em portais imobiliários, redes sociais, sites, aplicativos, grupos de WhatsApp e demais canais digitais ou impressos;<br>'+
    '(b) Produzir e utilizar fotografias, vídeos, plantas e descrições do imóvel para fins exclusivos de divulgação e comercialização;<br>'+
    '(c) Coletar, armazenar e processar dados pessoais dos interessados exclusivamente para fins de intermediação imobiliária.<br><br>'+
    'Os dados serão tratados em conformidade com a <strong>Lei Geral de Proteção de Dados — LGPD (Lei nº 13.709/2018)</strong>.',
    ['<strong>Art. 7º, V, LGPD:</strong> O tratamento de dados pessoais é permitido quando necessário para a execução de contrato.',
     '<strong>Art. 18 da LGPD:</strong> O titular dos dados tem direito de solicitar acesso, correção ou eliminação a qualquer momento.']);
}
function cla_documentacao(num){
  return clausula('CLÁUSULA '+num+' — DA DOCUMENTAÇÃO NECESSÁRIA',
    'Para a realização do negócio, o(a) OUTORGANTE/PROPRIETÁRIO(A) compromete-se a fornecer ao(à) CORRETOR(A), quando solicitado:<br>'+
    '(a) Matrícula atualizada do imóvel (máximo 30 dias);<br>'+
    '(b) Certidões negativas de ônus e ações reais;<br>'+
    '(c) Certidão negativa de IPTU e comprovante de pagamento em dia;<br>'+
    '(d) Comprovante de quitação do condomínio (se aplicável);<br>'+
    '(e) Documentos pessoais: RG, CPF, comprovante de residência, certidão de estado civil;<br>'+
    '(f) Certidões negativas de protestos e de ações cíveis e trabalhistas;<br>'+
    '(g) Demais documentos exigidos pelo banco financiador ou cartório.<br><br>'+
    'A omissão ou falsidade de documentos acarretará as sanções previstas neste contrato e na legislação vigente.',
    ['<strong>Art. 502 do CC/2002:</strong> O vendedor responde pelos débitos existentes sobre a coisa até o momento da tradição.',
     '<strong>Art. 422 do CC/2002:</strong> Boa-fé obrigatória na execução do contrato.']);
}
function cla_desistencia(num){
  return clausula('CLÁUSULA '+num+' — DA DESISTÊNCIA INJUSTIFICADA',
    'Caso o(a) OUTORGANTE/PROPRIETÁRIO(A) desista injustificadamente <strong>após o(a) CORRETOR(A) ter apresentado proposta ou interessado em condições compatíveis</strong> com as estabelecidas neste instrumento:<br><br>'+
    '(a) Ficará obrigado(a) ao pagamento da <strong>comissão integral</strong> ao(à) CORRETOR(A), conforme cláusula de honorários;<br>'+
    '(b) Em caso de desistência antes da apresentação de proposta, deverá comunicar por escrito com antecedência mínima de <strong>5 (cinco) dias</strong>;<br>'+
    '(c) A desistência motivada por caso fortuito ou força maior devidamente comprovada isenta o(a) OUTORGANTE das penalidades desta cláusula.',
    ['<strong>Art. 725 do CC/2002:</strong> A remuneração é devida ao corretor mesmo que não celebrado o negócio, desde que tenha conseguido o resultado previsto.',
     '<strong>Art. 726 do CC/2002:</strong> Ajustada a exclusividade, o corretor tem direito à remuneração integral mesmo que o negócio se realize sem sua mediação.']);
}
function cla_infoFalsas(num){
  return clausula('CLÁUSULA '+num+' — DA RESPONSABILIDADE POR INFORMAÇÕES FALSAS',
    'As partes declaram que todas as informações prestadas neste instrumento são verdadeiras e completas, respondendo civil e criminalmente por qualquer omissão ou falsidade.<br><br>'+
    '(a) O(A) OUTORGANTE/PROPRIETÁRIO(A)/LOCADOR(A) responde por vícios ocultos, dívidas, ônus ou pendências não informados;<br>'+
    '(b) Informação falsa ou omissão causadora de prejuízo: o responsável arcará com todos os danos, inclusive honorários advocatícios e custas processuais;<br>'+
    '(c) A parte prejudicada poderá rescindir o contrato imediatamente, com direito a perdas e danos;<br>'+
    '(d) O(A) CORRETOR(A) F. COSTA não se responsabiliza por informações prestadas diretamente pelo(a) PROPRIETÁRIO(A)/LOCADOR(A) sem o seu conhecimento prévio.',
    ['<strong>Art. 186 do CC/2002:</strong> Aquele que causar dano a outrem, por ação ou omissão voluntária, comete ato ilícito.',
     '<strong>Art. 927 do CC/2002:</strong> É obrigado a reparar o dano aquele que causar prejuízo a outrem.',
     '<strong>Art. 6º, VI, CDC:</strong> É direito básico do consumidor a efetiva prevenção e reparação de danos patrimoniais e morais.']);
}

function assinaturas(rotuloOutorgante, comConjuge){
  let h = '<div class="bloco-assinaturas"><p>São Paulo, ____ de _______________ de ________.</p>';
  h += '<div class="assinaturas">';
  h += blocoAssinatura(rotuloOutorgante);
  if(comConjuge) h += blocoAssinatura('Cônjuge do(a) '+rotuloOutorgante);
  h += '</div>';
  h += '<div class="assinaturas">'+blocoAssinatura('F. COSTA — Corretor de Imóveis — '+CRECI_JS+' | '+CNAI_JS)+'</div>';
  h += '<p class="titulo-testemunhas">TESTEMUNHAS</p>';
  h += '<div class="assinaturas">'+blocoAssinatura('Testemunha 1')+blocoAssinatura('Testemunha 2')+'</div>';
  h += '</div>';
  return h;
}
function blocoAssinatura(qualif){
  return '<div class="assinatura-box"><div class="linha-ass"></div>'+
    '<div class="ass-nome campo-edit" contenteditable="true" data-placeholder="Nome completo"></div>'+
    '<div class="ass-qualif">'+qualif+' — CPF: <span class="campo-edit" contenteditable="true" data-placeholder="000.000.000-00"></span></div></div>';
}

function cabecalhoDoc(){
  return '<div class="doc-cabecalho">'+
    '<img src="'+LOGO_URL+'" onerror="this.style.display=\'none\'">'+
    '<div><div class="nome">SÉRGIO COSTA</div>'+
    '<div class="info">Corretor de Imóveis  •  '+CRECI_JS+'  •  '+CNAI_JS+'<br>WhatsApp: (11) 99350-9109</div></div>'+
    '</div>';
}
function rodapeDoc(){
  return '<div class="rodape-fcosta"><strong>FCOSTA CORRETOR E AVALIADOR DE IMÓVEIS</strong><br>'+
    CRECI_JS+' | '+CNAI_JS+' — Responsável: '+CORRETOR_JS+'</div>';
}

// ===================== 1. LAUDO GERAL =====================
function montarLaudo(){
  let h = cabecalhoDoc();
  h += '<div class="doc-titulo">LAUDO GERAL DE ANÁLISE DOCUMENTAL DE IMÓVEL</div>';
  h += '<div class="doc-subtitulo">Fins de comercialização (venda) — '+campo('endereco_completo','Endereço completo do imóvel')+'</div>';

  h += '<h2 class="titulo-secao">1. IDENTIFICAÇÃO DO IMÓVEL</h2>';
  h += '<table class="tbl-chave-valor">';
  h += linhaTabela('Tipo', campo('tipo_imovel','Casa / Apartamento / Terreno / etc.'));
  h += linhaTabela('Loteamento', campo('loteamento','Nome do loteamento, se houver'));
  h += linhaTabela('Lote/Quadra/Gleba', campo('lote_quadra_gleba','Lote, Quadra, Gleba'));
  h += linhaTabela('Endereço', campo('endereco_completo','Endereço completo, bairro, cidade - UF'));
  h += linhaTabela('CEP', campo('cep','00000-000'));
  h += linhaTabela('Matrícula', campo('matricula','nº da matrícula - Cartório de Registro de Imóveis'));
  h += linhaTabela('Registro anterior', campo('registro_anterior','nº do registro anterior, se houver'));
  h += linhaTabela('Inscrição cadastral', campo('inscricao_cadastral','nº de inscrição do IPTU'));
  h += '</table>';

  h += '<h2 class="titulo-secao">2. METRAGEM E ÁREA TOTAL</h2>';
  h += '<p><strong>Área total do terreno:</strong> '+campo('area_terreno','00,00 m²')+'</p>';
  h += '<p class="bullet">•  Frente: '+campo('medida_frente','00,00 m')+' — para a '+campo('rua_frente','nome da rua')+'</p>';
  h += '<p class="bullet">•  Fundos: '+campo('medida_fundos','00,00 m')+' — confrontando com '+campo('confrontacao_fundos','lote/imóvel vizinho')+'</p>';
  h += '<p class="bullet">•  Lado direito: '+campo('medida_lado_direito','00,00 m')+' — confrontando com '+campo('confrontacao_direito','lote/imóvel vizinho')+'</p>';
  h += '<p class="bullet">•  Lado esquerdo: '+campo('medida_lado_esquerdo','00,00 m')+' — confrontando com '+campo('confrontacao_esquerdo','lote/imóvel vizinho')+'</p>';

  h += '<h2 class="titulo-secao">3. ÁREA CONSTRUÍDA</h2>';
  h += '<p><strong>Área construída:</strong> '+campo('area_construida','00 m²')+' — ano: '+campo('ano_construcao','AAAA')+' — uso: '+campo('uso_imovel','residencial/comercial')+'</p>';
  h += '<p><strong>Composição das edificações:</strong> '+campo('composicao_edificacoes','descrição dos cômodos e ambientes')+'</p>';
  h += '<p class="nota-italica">Recomenda-se levantamento métrico atualizado (planta/croqui) e, se necessário, averbação da(s) construção(ões) na matrícula antes da venda.</p>';

  h += '<h2 class="titulo-secao">4. CADEIA DOMINIAL (HISTÓRICO DE PROPRIEDADE)</h2>';
  h += '<p>'+campo('cadeia_dominial_resumo','Resumo do histórico de propriedade: aquisições, transmissões e registros anteriores')+'</p>';

  h += '<h2 class="titulo-secao">5. PROPRIETÁRIOS ATUAIS</h2>';
  h += '<table class="tbl-chave-valor">';
  h += linhaTabela('Proprietário(a)', campo('proprietario_nome','Nome completo, CPF, RG, estado civil'));
  h += linhaTabela('Cônjuge (se aplicável)', campo('conjuge_nome','Nome completo, CPF, regime de bens'));
  h += linhaTabela('Situação da titularidade', campo('situacao_titularidade','Exclusiva / Copropriedade / Em inventário'));
  h += linhaTabela('Aquisição original', campo('aquisicao_original','Como e quando o imóvel foi adquirido'));
  h += '</table>';

  h += '<h2 class="titulo-secao">6. SITUAÇÃO FISCAL E CERTIDÕES</h2>';
  h += '<p class="bullet">•  ITBI: '+campo('itbi_situacao','situação do recolhimento')+'</p>';
  h += '<p class="bullet">•  IPTU: '+campo('iptu_situacao','situação — em dia / isento / pendências')+'</p>';
  h += '<p class="bullet">•  Referência de área para cálculo do IPTU: '+campo('area_iptu_referencia','valores')+'</p>';
  h += '<p class="nota-italica">Antes da venda, recomenda-se solicitar: (i) certidão de matrícula atualizada; (ii) certidão de ônus reais atualizada; (iii) IPTU/ITBI atualizados junto à Prefeitura.</p>';

  h += '<h2 class="titulo-secao">7. SITUAÇÃO SUCESSÓRIA / INVENTÁRIO (SE APLICÁVEL)</h2>';
  h += '<p class="nota-italica">Preencher apenas se houver falecimento de titular, inventário ou partilha em andamento. Caso não se aplique, escrever "Não se aplica".</p>';
  h += '<p>'+campo('situacao_sucessoria','Detalhar falecimento, inventário, partilha, herdeiros e percentuais, se houver — ou "Não se aplica"')+'</p>';

  h += '<h2 class="titulo-secao">8. PONTOS DE ATENÇÃO PARA A VENDA</h2>';
  h += '<p class="bullet">•  '+campo('pontos_atencao_1','Pendência ou risco identificado nº 1')+'</p>';
  h += '<p class="bullet">•  '+campo('pontos_atencao_2','Pendência ou risco identificado nº 2')+'</p>';
  h += '<p class="bullet">•  '+campo('pontos_atencao_3','Pendência ou risco identificado nº 3')+'</p>';

  h += '<h2 class="titulo-secao">9. RESUMO EXECUTIVO</h2>';
  h += '<p>'+campo('resumo_executivo','Resumo em 3 a 5 linhas: descrição do imóvel, situação documental e pontos essenciais antes da venda.')+'</p>';
  h += '<p class="nota-italica">Laudo elaborado com base exclusivamente na documentação fornecida. Não substitui análise jurídica formal nem due diligence completa junto aos órgãos competentes.</p>';

  h += '<h2 class="titulo-secao">10. VALORES DE REFERÊNCIA PARA A VENDA</h2>';
  h += '<p class="nota-italica">Campos totalmente editáveis — clique para ajustar.</p>';
  h += '<table class="valores-box">';
  h += '<tr><td class="chave">VALOR PEDIDO PELO PROPRIETÁRIO (VENDA)</td><td class="valor">R$ '+campo('valor_pedido','________________')+'</td></tr>';
  h += '<tr><td class="chave">VALOR DE MERCADO AVALIADO (FCOSTA)</td><td class="valor">R$ '+campo('valor_mercado','________________')+'</td></tr>';
  h += '</table>';

  h += rodapeDoc();
  return h;
}
function linhaTabela(label, valorHtml){
  return '<tr><td class="chave">'+label+'</td><td>'+valorHtml+'</td></tr>';
}

// ===================== 2. AUTORIZAÇÃO COM EXCLUSIVIDADE =====================
function montarAutorizacaoCom(){
  let h = cabecalhoDoc();
  h += '<div class="doc-titulo">AUTORIZAÇÃO DE VENDA COM EXCLUSIVIDADE</div>';
  h += '<div class="doc-subtitulo">Instrumento Particular de Intermediação Imobiliária Exclusiva — Art. 726 e 729 do CC/2002 | Lei nº 6.530/78</div>';

  h += leiBloco('FUNDAMENTO LEGAL', ['<strong>Art. 726 do CC:</strong> Ajustada a corretagem com exclusividade, o corretor tem direito à remuneração integral, ainda que o negócio se realize sem sua mediação.']);

  h += clausula('CLÁUSULA I — DO OUTORGANTE',
    '<strong>OUTORGANTE/PROPRIETÁRIO(A):</strong> '+campo('outorgante_nome','Nome completo')+', CPF nº '+campo('outorgante_cpf','000.000.000-00')+', RG nº '+campo('outorgante_rg','00.000.000-0')+', residente em '+campo('outorgante_endereco','Endereço completo')+'.<br><br>'+
    '<strong>CÔNJUGE:</strong> '+campo('conjuge_nome','Nome do cônjuge')+', CPF nº '+campo('conjuge_cpf','000.000.000-00')+', regime: '+campo('regime_bens','Comunhão Parcial')+'.');

  h += clausula('CLÁUSULA II — DO IMÓVEL E PREÇO',
    'Imóvel '+campo('imovel_tipo','Tipo')+', situado na '+campo('imovel_endereco','Endereço completo')+', área de '+campo('imovel_area','00,00')+' m², Matrícula nº '+campo('imovel_matricula','XXXXX')+'.<br>'+
    '<strong>Preço mínimo:</strong> R$ '+campo('preco_minimo','0.000.000,00')+' ('+campo('preco_extenso','valor por extenso')+').<br>'+
    '<strong>Condições:</strong> '+campo('condicoes_pagamento','À vista / Financiamento / FGTS / Permuta')+'.');

  h += clausula('CLÁUSULA III — DA EXCLUSIVIDADE',
    'Esta autorização é <strong>EXCLUSIVA</strong> ao Corretor <strong>F. COSTA — '+CRECI_JS+' | '+CNAI_JS+'</strong>, pelo prazo de <strong>'+campo('prazo_dias','90 (noventa)')+' dias</strong>, de '+campo('data_inicio','DD/MM/AAAA')+' a '+campo('data_fim','DD/MM/AAAA')+'.',
    ['<strong>Art. 726 do CC:</strong> Com exclusividade, comissão devida mesmo sem mediação do corretor.']);

  h += clausula('CLÁUSULA IV — DA COMISSÃO',
    '<strong>Comissão: '+campo('comissao_percentual','6')+'%</strong> sobre o valor efetivo da venda, responsabilidade do(a) OUTORGANTE, paga na assinatura.');

  h += cla_deverInfo('V');
  h += cla_lgpd('VI');
  h += cla_documentacao('VII');
  h += cla_desistencia('VIII');
  h += cla_infoFalsas('IX');
  h += clausula('CLÁUSULA X — DO FORO', 'Foro da Comarca de <strong>São Paulo/SP</strong>. Firmado em <strong>2 (duas) vias</strong>.');

  h += assinaturas('OUTORGANTE/PROPRIETÁRIO(A)', true);
  h += rodapeDoc();
  return h;
}

// ===================== 3. AUTORIZAÇÃO SEM EXCLUSIVIDADE =====================
function montarAutorizacaoSem(){
  let h = cabecalhoDoc();
  h += '<div class="doc-titulo">AUTORIZAÇÃO DE VENDA SEM EXCLUSIVIDADE</div>';
  h += '<div class="doc-subtitulo">Instrumento Particular de Intermediação Imobiliária — Art. 722 e 725 do CC/2002 | Lei nº 6.530/78</div>';

  h += clausula('CLÁUSULA I — DO OUTORGANTE E DO IMÓVEL',
    '<strong>OUTORGANTE/PROPRIETÁRIO(A):</strong> '+campo('outorgante_nome','Nome completo')+', CPF nº '+campo('outorgante_cpf','000.000.000-00')+', residente em '+campo('outorgante_endereco','Endereço completo')+'.<br><br>'+
    '<strong>CÔNJUGE:</strong> '+campo('conjuge_nome','Nome do cônjuge')+', CPF nº '+campo('conjuge_cpf','000.000.000-00')+', regime: '+campo('regime_bens','Comunhão Parcial')+'.<br><br>'+
    '<strong>IMÓVEL:</strong> '+campo('imovel_tipo','Tipo')+', situado na '+campo('imovel_endereco','Endereço completo')+', área de '+campo('imovel_area','00,00')+' m², Matrícula nº '+campo('imovel_matricula','XXXXX')+'.<br>'+
    '<strong>PREÇO MÍNIMO:</strong> R$ '+campo('preco_minimo','0.000.000,00')+'.');

  h += clausula('CLÁUSULA II — SEM EXCLUSIVIDADE',
    'Autorização <strong>SEM EXCLUSIVIDADE</strong>, pelo prazo de <strong>'+campo('prazo_dias','60 (sessenta)')+' dias</strong>. Comissão devida ao Corretor FCOSTA <strong>somente se ele apresentar o comprador efetivo</strong>.',
    ['<strong>Art. 726 do CC:</strong> Sem exclusividade, sem comissão se negócio direto entre as partes.']);

  h += clausula('CLÁUSULA III — DA COMISSÃO',
    '<strong>Comissão: '+campo('comissao_percentual','6')+'%</strong> sobre o valor efetivo, devida pelo OUTORGANTE, somente se o comprador for apresentado pelo Corretor FCOSTA.');

  h += cla_deverInfo('IV');
  h += cla_lgpd('V');
  h += cla_documentacao('VI');
  h += cla_desistencia('VII');
  h += cla_infoFalsas('VIII');

  h += assinaturas('OUTORGANTE/PROPRIETÁRIO(A)', true);
  h += rodapeDoc();
  return h;
}
