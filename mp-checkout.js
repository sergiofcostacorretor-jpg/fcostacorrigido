const https = require("https");

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN ||
  "TEST-5530547465625102-051910-40631a770254c942845c217c7aec93a8-1472028198";

const PLANOS = {
  mensal: { title: "FCosta PTAM Pro — Mensal", price: 79.00, freq: "monthly", reps: 0 },
  anual:  { title: "FCosta PTAM Pro — Anual",  price: 690.00, freq: "yearly",  reps: 1 }
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "JSON inválido" }) }; }

  const plano = PLANOS[body.plano] || PLANOS.mensal;

  const payload = JSON.stringify({
    reason: plano.title,
    auto_recurring: {
      frequency: 1,
      frequency_type: plano.freq === "monthly" ? "months" : "years",
      transaction_amount: plano.price,
      currency_id: "BRL"
    },
    payer_email: body.email || "test@test.com",
    back_url: body.back_url || "https://fcostacorretor.com/ptam-fcosta.html",
    status: "pending"
  });

  const options = {
    hostname: "api.mercadopago.com",
    path: "/preapproval",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + ACCESS_TOKEN,
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
          if (json.init_point || json.sandbox_init_point) {
            resolve({
              statusCode: 200, headers,
              body: JSON.stringify({
                ok: true,
                url: json.sandbox_init_point || json.init_point,
                id: json.id
              })
            });
          } else {
            resolve({
              statusCode: 400, headers,
              body: JSON.stringify({ ok: false, error: json.message || "Erro MP", detail: json })
            });
          }
        } catch(e) {
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
