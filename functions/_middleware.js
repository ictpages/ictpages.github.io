export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  // 1. Prüfen, ob der Browser das getarnte Tracking-Bild anfordert
  if (url.pathname === '/assets/icon-system.gif') {
    
    // Fest für das Konto 'ict' hinterlegt
    const goatCounterCode = "ict"; 
    
    // Wichtige Header-Daten des Besuchers auslesen
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || '';
    const referrer = request.headers.get('referer') || '';

    // Den echten aufgerufenen Seitenpfad aus dem Referrer extrahieren
    let pagePath = '/';
    if (referrer) {
      try {
        const refUrl = new URL(referrer);
        pagePath = refUrl.pathname + refUrl.search;
      } catch (e) {
        // Fallback auf die Startseite, falls das Parsen fehlschlägt
      }
    }

    // API-URL mit Cache-Buster (Zufallsstring) zusammenbauen (KORRIGIERT: ://)
    const rnd = Math.random().toString(36).substring(2);
    const targetUrl = `https://${goatCounterCode}://${encodeURIComponent(pagePath)}&r=${encodeURIComponent(referrer)}&rnd=${rnd}`;

    // Die Anfrage asynchron im Hintergrund an GoatCounter senden
    context.waitUntil(
      fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          'X-Forwarded-For': ip,
          'Host': `${goatCounterCode}.goatcounter.com`
        }
      }).catch(err => {
        console.error(`GoatCounter Fehler: ${err.message}`);
      })
    );

    // Dem Browser des Besuchers ein echtes, transparentes 1x1 GIF zurückliefern
    const transparentGif = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
      0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x21, 0xf9, 0x04, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x00, 0x02, 0x02, 0x4c, 0x01, 0x00, 0x3b
    ]);

    return new Response(transparentGif, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }

  // Für alle anderen Seiten und Assets: Die Anfrage ganz normal verarbeiten
  return context.next();
}
