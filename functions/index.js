export async function onRequestGet(context) {
  const { request, env } = context;
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];

  // wybieramy JSON per domena, a jak nie ma - fallback
  const candidatePaths = [
    `/content/${host}.json`,
    `/content/_default.json`
  ];

  let data = null;

  for (const p of candidatePaths) {
    const assetRes = await env.ASSETS.fetch(new Request(new URL(p, request.url)));
    if (assetRes.ok) {
      try {
        data = await assetRes.json();
        break;
      } catch {}
    }
  }

  if (!data) {
    return new Response("No content found.", { status: 404 });
  }

  const seoTitle = escapeHtml(data.seoTitle || data.title || host);
  const title = escapeHtml(data.title || host);
  const desc = escapeHtml(data.description || "");
  const bodyHtml = data.bodyHtml || "";
  const footerHtml = data.footerHtml || "";

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${seoTitle}</title>
  <meta name="description" content="${desc}" />
</head>
<body>
  <main style="max-width:900px;margin:40px auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:0 16px;">
    <h1>${title}</h1>
    ${desc ? `<p>${desc}</p>` : ""}
    <hr />
    <section>${bodyHtml}</section>
    ${footerHtml ? `<hr /><footer>${footerHtml}</footer>` : ""}
  </main>
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
