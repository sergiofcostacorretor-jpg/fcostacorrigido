const https = require("https");

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN ||
  "TEST-5530547465625102-051910-40631a770254c942845c217c7aec93a8-1472028198";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: "JSON inválido" }; }

  const { type, data } = body;

  // Apenas eventos de assinatura
  if (type !== "subscription_preapproval") {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ignored: true }) };
  }

  const id = data?.id;
  if (!id) return { statusCode: 400, headers, body: "ID ausente" };

  // Consultar assinatura no MP
  const mpData = await fetchMP("/preapproval/" + id);

  if (!mpData || mpData.status !== "authorized") {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, status: mpData?.status }) };
  }

  const email = mpData.payer_email;
  const plano = mpData.reason?.includes("Anual") ? "anual" : "mensal";
  const expiry = plano === "anual"
    ? new Date(Date.now() + 365 * 86400000).toISOString()
    : new Date(Date.now() + 30  * 86400000).toISOString();

  // Salvar no Firebase RTDB
  await saveFirebase(email, { plano, expiry, mp_id: id, ativo: true });

  console.log("Assinatura ativada:", email, plano, expiry);
  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, email, plano }) };
};

function fetchMP(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: "api.mercadopago.com",
      path, method: "GET",
      headers: { "Authorization": "Bearer " + ACCESS_TOKEN }
    };
    const req = https.request(options, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
    });
    req.on("error", () => resolve(null));
    req.end();
  });
}

function saveFirebase(email, data) {
  const DB_URL = process.env.FIREBASE_DB_URL ||
    "https://fcosta-31125-default-rtdb.firebaseio.com";
  const key = email.replace(/[.#$\[\]]/g, "_");
  const payload = JSON.stringify(data);

  return new Promise((resolve) => {
    const url = new URL(DB_URL + "/assinaturas/" + key + ".json");
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    };
    const req = https.request(options, (res) => {
      res.on("data", () => {});
      res.on("end", () => resolve(true));
    });
    req.on("error", () => resolve(false));
    req.write(payload);
    req.end();
  });
}
