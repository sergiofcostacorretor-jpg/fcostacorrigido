/* fotos-reserva.js — FCosta
   Quando uma foto não carrega (ex.: serviço antigo de fotos fora do ar),
   troca por um quadro elegante "Fotos em atualização" em vez de mostrar um buraco.
   Miniaturas e fotos extras de galerias são apenas escondidas. */
(function () {
  'use strict';
  var SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">' +
    '<defs><radialGradient id="g" cx="50%" cy="38%" r="65%"><stop offset="0" stop-color="#2a2417"/><stop offset="1" stop-color="#0A0B0F"/></radialGradient>' +
    '<linearGradient id="o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2DCA4"/><stop offset=".45" stop-color="#D6B266"/><stop offset="1" stop-color="#A78340"/></linearGradient></defs>' +
    '<rect width="800" height="600" fill="url(#g)"/>' +
    '<path d="M330 300 L400 240 L470 300 M345 288 V360 H455 V288 M385 360 V318 H415 V360" fill="none" stroke="url(#o)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<text x="400" y="420" text-anchor="middle" font-family="Georgia,serif" font-size="34" fill="#F2DCA4">Fotos em atualização</text>' +
    '<text x="400" y="458" text-anchor="middle" font-family="Arial,sans-serif" font-size="19" fill="#8A877F">Peça as fotos pelo WhatsApp (11) 99350-9109</text></svg>';
  var RESERVA = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SVG);
  var MINI = '.modal-thumbs,.lb-thumbs,.thumbs,.mini,.miniaturas,[class*="thumb"]';
  window.FCostaFotoReserva = RESERVA;
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'IMG' || t.getAttribute('data-reserva')) return;
    if (!t.getAttribute('src') || t.getAttribute('src').indexOf('data:') === 0) return;
    t.setAttribute('data-reserva', '1');
    var cls = String(t.className || '');
    var miniatura = /(^|\s)(mth|lbth|th|thumb)/.test(cls) || (t.closest && t.closest(MINI));
    var extraGaleria = t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('gal') && t.previousElementSibling;
    if (miniatura || extraGaleria) { t.style.display = 'none'; return; }
    t.removeAttribute('srcset');
    t.src = RESERVA;
    t.style.objectFit = 'cover';
  }, true);
})();
