export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  // 1. Prüfen, ob der Browser unser getarntes Bild anfordert
  if (url.pathname === '/assets/icon-system.gif') {
    
    // DEIN KONTO-NAME (Fest für 'ict' hinterlegt)
    const goatCounterCode = "ict"; 
    
    // Daten des Besuchers für GoatCounter auslesen
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('cf-connecting-ip') || '';
    const referrer = request.headers.get('referer') || '';

    // Die echte GoatCounter-URL im Hintergrund zusammenbauen
    const targetUrl = `https://${goatCounterCode}://{encodeURIComponent(referrer)}`;

    // Die Anfrage unsichtbar im Hintergrund an die GoatCounter Cloud senden
    context.waitUntil(
      fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          'X-Forwarded-For': ip
        }
      })
    );

    // Dem Browser des Besuchers ein echtes, winziges 1x1 transparentes GIF zurückliefern
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

  // Für alle anderen normalen Seitenaufrufe: Einfach die normale Webseite ausliefern
  return context.next();
}
