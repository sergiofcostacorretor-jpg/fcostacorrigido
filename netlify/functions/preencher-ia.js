const https = require("https");

const API_KEY = process.env.ANTHROPIC_API_KEY;

const ESQUEMAS = {
  laudo: {
    campos: [
      "endereco_completo", "tipo_imovel", "loteamento", "lote_quadra_gleba", "cep",
      "matricula", "registro_anterior", "inscricao_cadastral",
      "area_terreno", "medida_frente", "medida_fundos", "medida_lado_direito", "medida_lado_esquerdo",
      "rua_frente", "confrontacao_fundos", "confrontacao_direito", "confrontacao_esquerdo",
      "area_construida", "ano_construcao", "uso_imovel", "composicao_edificacoes",
      "cadeia_dominial_resumo",
      "proprietario_nome", "conjuge_nome", "situacao_titularidade", "aquisicao_original",
      "itbi_situacao", "iptu_situacao", "area_iptu_referencia",
      "situacao_sucessoria",
      "pontos_atencao_1", "pontos_atencao_2", "pontos_atencao_3",
      "resumo_executivo",
      "valor_pedido", "valor_mercado"
    ],
    instrucao: "Você está organizando dados de um LAUDO GERAL DE ANÁLISE DOCUMENTAL DE IMÓVEL para um corretor de imóveis brasileiro. Extraia do texto livre abaixo os dados correspondentes a cada campo. Se o texto mencionar pontos de atenção, riscos ou pendências, distribua entre pontos_atencao_1, pontos_atencao_2 e pontos_atencao_3 (deixe em branco os que não houver). Em resumo_executivo, escreva de 3 a 5 linhas resumindo o imóvel e a situação documental, com base SOMENTE no que foi informado."
  },
  com: {
    campos: [
      "outorgante_nome", "outorgante_cpf", "outorgante_rg", "outorgante_endereco",
      "conjuge_nome", "conjuge_cpf", "regime_bens",
      "imovel_tipo", "imovel_endereco", "imovel_area", "imovel_matricula",
      "preco_minimo", "preco_extenso", "condicoes_pagamento",
      "prazo_dias", "data_inicio", "data_fim", "comissao_percentual"
    ],
    instrucao: "Você está organizando dados de uma AUTORIZAÇÃO DE VENDA COM EXCLUSIVIDADE para um corretor de imóveis brasileiro (instrumento particular de intermediação imobiliária exclusiva). Extraia do texto livre abaixo os dados correspondentes a cada campo. Se prazo_dias, comissao_percentual, data_inicio ou data_fim não forem mencionados, deixe em branco (não invente um valor)."
  },
  sem: {
    campos: [
      "outorgante_nome", "outorgante_cpf", "outorgante_rg", "outorgante_endereco",
      "conjuge_nome", "conjuge_cpf", "regime_bens",
      "imovel_tipo", "imovel_endereco", "imovel_area", "imovel_matricula",
      "preco_minimo", "condicoes_pagamento",
      "prazo_dias", "comissao_percentual"
    ],
    instrucao: "Você está organizando dados de uma AUTORIZAÇÃO DE VENDA SEM EXCLUSIVIDADE para um corretor de imóveis brasileiro (instrumento particular de intermediação imobiliária). Extraia do texto livre abaixo os dados correspondentes a cada campo. Se prazo_dias ou comissao_percentual não forem mencionados, deixe em branco (não invente um valor)."
  }
};

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: "Method Not Allowed" }) };
  }
  if (!API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "ANTHROPIC_API_KEY não configurada no Netlify (Site settings > Environment variables)." }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "JSON inválido" }) }; }

  const tipo = body.tipo;
  const texto = (body.texto || "").trim();

  if (!ESQUEMAS[tipo]) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Tipo de documento inválido." }) };
  }
  if (!texto) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Texto vazio." }) };
  }

  const esquema = ESQUEMAS[tipo];
  const listaCampos = esquema.campos.map(c => `"${c}"`).join(", ");

  const systemPrompt =
    esquema.instrucao +
    `\n\nResponda APENAS com um objeto JSON válido, sem markdown, sem crases, sem texto antes ou depois. ` +
    `O JSON deve ter exatamente estas chaves (todas como string, use "" para o que não for informado): ${listaCampos}.`;

  const payload = JSON.stringify({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: texto }]
  });

  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Length": Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            resolve({ statusCode: 400, headers, body: JSON.stringify({ ok: false, error: json.error.message || "Erro da API Anthropic" }) });
            return;
          }
          const textoResposta = (json.content || []).map(b => b.text || "").join("").trim();
          const limpo = textoResposta.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
          let campos;
          try {
            campos = JSON.parse(limpo);
          } catch (e) {
            resolve({ statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "A IA não retornou um JSON válido.", bruto: textoResposta }) });
            return;
          }
          resolve({ statusCode: 200, headers, body: JSON.stringify({ ok: true, campos }) });
        } catch (e) {
          resolve({ statusCode: 500, headers, body: JSON.stringify({ ok: false, error: e.message }) });
        }
      });
    });
    req.on("error", (e) => {
      resolve({ statusCode: 500, headers, body: JSON.stringify({ ok: false, error: e.message }) });
    });
    req.write(payload);
    req.end();
  });
};
