// Servicio de transcripción para "Mi ayuda memoria".
// Se pega tal cual en un Worker de Cloudflare que tenga una conexión de Workers AI llamada "AI".
// Recibe el audio (WAV en base64) desde la app y devuelve el texto.

const ORIGENES_PERMITIDOS = [
  "https://jpmusri15.github.io",
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const permitido = ORIGENES_PERMITIDOS.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": permitido ? origin : ORIGENES_PERMITIDOS[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };
    const responder = (datos, status = 200) =>
      new Response(JSON.stringify(datos), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method === "GET") return responder({ ok: true, servicio: "transcripción de Mi ayuda memoria" });
    if (request.method !== "POST") return responder({ error: "método no permitido" }, 405);
    if (!permitido) return responder({ error: "origen no permitido" }, 403);
    if (!env.AI) return responder({ error: "falta la conexión de Workers AI llamada AI" }, 500);

    let audio;
    try { ({ audio } = await request.json()); } catch { return responder({ error: "pedido inválido" }, 400); }
    if (typeof audio !== "string" || audio.length < 100) return responder({ error: "falta el audio" }, 400);
    if (audio.length > 12_000_000) return responder({ error: "audio demasiado largo" }, 413);

    try {
      const r = await env.AI.run("@cf/openai/whisper-large-v3-turbo", {
        audio,
        language: "es",
        initial_prompt: "Notas de trabajo dictadas en español de Argentina.",
      });
      return responder({ text: (r && r.text ? String(r.text) : "").trim() });
    } catch (e) {
      return responder({ error: "no se pudo transcribir: " + (e && e.message ? e.message : e) }, 502);
    }
  },
};
