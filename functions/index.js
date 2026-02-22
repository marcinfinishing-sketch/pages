export async function onRequest(context) {
  const host = (context.request.headers.get("host") || "").toLowerCase();
  const assetPath = `/content/${host}.json`;

  async function getJson(path) {
    const r = await context.env.ASSETS.fetch(new Request(new URL(path, context.request.url)));
    if (!r.ok) return null;
    return await r.json();
  }

  const data =
    (await getJson(assetPath)) ||
    (await getJson("/content/_default.json")) || {
      title: host,
      seoTitle: host,
      bodyHtml: "<p>Coming soon.</p>",
      description: "Coming soon"
    };

  const title = data.seoTitle || data.title || host;
  const h1 = data.title || host;
  const desc = data.description || "";

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${desc}"/>
<style>
body{font-family:system-ui;margin:40px}
h1{font-size:40px}
article{font-size:18px;line-height:1.6}
</style>
</head>
<body>
<h1>${h1}</h1>
<article>${data.bodyHtml || ""}</article>
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
