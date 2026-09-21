export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  // 1. Prüfen, ob der Browser unser getarntes Bild anfordert
  if (url.pathname === '/assets/icon-system.gif') {
    
    const goatCounterCode = "ict"; 
    
    // Daten des Besuchers auslesen
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('cf-connecting-ip') || '';
    const referrer = request.headers.get('referer') || '';

    // Falls ein Referrer existiert (z.B. https://pages.dev), extrahieren wir den Pfad (/about)
    let pagePath = '/';
    if (referrer) {
      try {
        const refUrl = new URL(referrer);
        pagePath = refUrl.pathname + refUrl.search;
      } catch (e) {
        // Falls der Referrer keine gültige URL ist, bleibt es beim Root-Pfad
      }
    }

    // Die ECHTE GoatCounter-API-URL korrekt zusammenbauen
    // p = Die aufgerufene Seite, r = Woher der Nutzer kam (falls extern)
    const targetUrl = `https://${goatCounterCode}://{encodeURIComponent(pagePath)}&r=${encodeURIComponent(referrer)}`;

    // Die Anfrage unsichtbar im Hintergrund an GoatCounter senden
    context.waitUntil(
      fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          'X-Forwarded-For': ip
        }
      })
    );

    // Dem Browser das echte, winzige 1x1 transparente GIF zurückliefern
    const transparentGif = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
      0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x21, 0xf9, 0x04, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x00, 0x02, 0x02, 0x4c, 0x01, 0x00, 0x3b
    ]);

    return new Response(transparentGif, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  }

  // Für alle anderen Seitenaufrufe: Normal weiterleiten
  return context.next();
}
