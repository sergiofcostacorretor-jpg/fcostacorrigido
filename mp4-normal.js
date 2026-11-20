/* mp4-normal.js — FCosta
   Converte o MP4 "fragmentado" (gravado pelo navegador, sem duração) em um MP4
   normal, que toca em qualquer celular (principalmente iPhone).
   Não recodifica: só reorganiza os dados (mesma imagem e mesmo som).
   Uso: var novo = FCostaMp4.normalizar(arrayBuffer);  // devolve Uint8Array ou null
   Devolve null quando o arquivo já é normal ou quando não sabe converter. */
(function (g) {
  'use strict';
  function u32(d, o) { return d.getUint32(o); }
  function u64(d, o) { return d.getUint32(o) * 4294967296 + d.getUint32(o + 4); }
  function typ(b, o) { return String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]); }

  function boxes(b, d, ini, fim) {
    var out = [], o = ini;
    while (o + 8 <= fim) {
      var s = u32(d, o), t = typ(b, o + 4), h = 8;
      if (s === 1) { s = u64(d, o + 8); h = 16; }
      else if (s === 0) s = fim - o;
      if (s < h || o + s > fim) break;
      out.push({ t: t, o: o, s: s, h: h, c: o + h, e: o + s });
      o += s;
    }
    return out;
  }
  function filho(b, d, box, t) { var l = boxes(b, d, box.c, box.e); for (var i = 0; i < l.length; i++) if (l[i].t === t) return l[i]; return null; }
  function filhos(b, d, box, t) { return boxes(b, d, box.c, box.e).filter(function (x) { return x.t === t; }); }

  function cat(partes) {
    var n = 0, i; for (i = 0; i < partes.length; i++) n += partes[i].length;
    var r = new Uint8Array(n), o = 0;
    for (i = 0; i < partes.length; i++) { r.set(partes[i], o); o += partes[i].length; }
    return r;
  }
  function caixa(t, corpo) {
    var r = new Uint8Array(8 + corpo.length), d = new DataView(r.buffer);
    d.setUint32(0, r.length);
    for (var i = 0; i < 4; i++) r[4 + i] = t.charCodeAt(i);
    r.set(corpo, 8); return r;
  }
  function caixaF(t, ver, flags, ints) { /* full box com lista de uint32 */
    var r = new Uint8Array(4 + ints.length * 4), d = new DataView(r.buffer);
    d.setUint32(0, (ver << 24) | flags);
    for (var i = 0; i < ints.length; i++) d.setUint32(4 + i * 4, ints[i] >>> 0);
    return caixa(t, r);
  }
  function rle(v) { var r = []; for (var i = 0; i < v.length; i++) { if (r.length && r[r.length - 1][1] === v[i]) r[r.length - 1][0]++; else r.push([1, v[i]]); } return r; }

  function normalizar(buf) {
    var b = new Uint8Array(buf), d = new DataView(b.buffer, b.byteOffset, b.byteLength);
    var top = boxes(b, d, 0, b.length);
    var ftyp = null, moov = null, moofs = [];
    top.forEach(function (x) { if (x.t === 'ftyp') ftyp = x; else if (x.t === 'moov') moov = x; else if (x.t === 'moof') moofs.push(x); });
    if (!ftyp || !moov || !moofs.length || !filho(b, d, moov, 'mvex')) return null; /* já é normal */

    var mvex = filho(b, d, moov, 'mvex'), trex = {};
    filhos(b, d, mvex, 'trex').forEach(function (x) {
      trex[u32(d, x.c + 4)] = { sdi: u32(d, x.c + 8), dur: u32(d, x.c + 12), size: u32(d, x.c + 16), flags: u32(d, x.c + 20) };
    });

    var faixas = {}, ordem = [];
    filhos(b, d, moov, 'trak').forEach(function (tk) {
      var tkhd = filho(b, d, tk, 'tkhd'), v = b[tkhd.c];
      var id = u32(d, tkhd.c + (v === 1 ? 20 : 12));
      faixas[id] = { trak: tk, id: id, dur: [], size: [], sync: [], cto: [], chunks: [] };
      ordem.push(id);
    });

    /* lê todos os fragmentos */
    moofs.forEach(function (mf) {
      filhos(b, d, mf, 'traf').forEach(function (tf) {
        var tfhd = filho(b, d, tf, 'tfhd'); if (!tfhd) return;
        var fl = u32(d, tfhd.c) & 0xffffff, p = tfhd.c + 4, id = u32(d, p); p += 4;
        var F = faixas[id], T = trex[id] || { dur: 0, size: 0, flags: 0 };
        if (!F) return;
        var base = mf.o;
        if (fl & 1) { base = u64(d, p); p += 8; }
        if (fl & 2) p += 4;
        var dDur = T.dur, dSize = T.size, dFlags = T.flags;
        if (fl & 8) { dDur = u32(d, p); p += 4; }
        if (fl & 0x10) { dSize = u32(d, p); p += 4; }
        if (fl & 0x20) { dFlags = u32(d, p); p += 4; }
        var pos = base, tfdt = filho(b, d, tf, 'tfdt');
        if (tfdt) { /* respeita o tempo de início do fragmento (mantém som e imagem sincronizados) */
          var t0 = b[tfdt.c] === 1 ? u64(d, tfdt.c + 4) : u32(d, tfdt.c + 4);
          if (F.t === undefined) F.t = t0;
          else if (t0 > F.t && F.dur.length) { F.dur[F.dur.length - 1] += t0 - F.t; F.t = t0; }
        }
        filhos(b, d, tf, 'trun').forEach(function (tr) {
          var vv = b[tr.c], tfl = u32(d, tr.c) & 0xffffff, q = tr.c + 4, n = u32(d, q); q += 4;
          if (tfl & 1) { pos = base + d.getInt32(q); q += 4; }
          var first = null; if (tfl & 4) { first = u32(d, q); q += 4; }
          var ini = pos, tot = 0;
          for (var i = 0; i < n; i++) {
            var du = dDur, sz = dSize, f = dFlags, c = 0;
            if (tfl & 0x100) { du = u32(d, q); q += 4; }
            if (tfl & 0x200) { sz = u32(d, q); q += 4; }
            if (tfl & 0x400) { f = u32(d, q); q += 4; } else if (i === 0 && first !== null) f = first;
            if (tfl & 0x800) { c = vv ? d.getInt32(q) : u32(d, q); q += 4; }
            F.dur.push(du); F.t = (F.t || 0) + du; F.size.push(sz); F.sync.push(!(f & 0x10000)); F.cto.push(c);
            tot += sz;
          }
          if (n) {
            if (ini + tot > b.length) throw new Error('fragmento fora do arquivo');
            F.chunks.push({ ini: ini, len: tot, n: n });
          }
          pos = ini + tot;
        });
      });
    });

    var mvhd = filho(b, d, moov, 'mvhd'), movTs = u32(d, mvhd.c + (b[mvhd.c] === 1 ? 20 : 12));
    var movDur = 0;

    /* monta cada trak com tabelas novas; pos = onde começam os dados no arquivo novo */
    function montar(pos) {
    var novos = [];
    movDur = 0;
    ordem.forEach(function (id) {
      var F = faixas[id], tk = F.trak;
      if (!F.size.length) return;
      var mdia = filho(b, d, tk, 'mdia'), mdhd = filho(b, d, mdia, 'mdhd'), minf = filho(b, d, mdia, 'minf'), stbl = filho(b, d, minf, 'stbl');
      var tsc = u32(d, mdhd.c + (b[mdhd.c] === 1 ? 20 : 12));
      var durT = 0; F.dur.forEach(function (x) { durT += x; });
      var durM = Math.round(durT * movTs / tsc); if (durM > movDur) movDur = durM;

      var stsd = b.slice(filho(b, d, stbl, 'stsd').o, filho(b, d, stbl, 'stsd').e);
      var r = rle(F.dur), a = [r.length]; r.forEach(function (x) { a.push(x[0], x[1]); });
      var partes = [stsd, caixaF('stts', 0, 0, a)];
      if (F.cto.some(function (x) { return x !== 0; })) {
        var neg = F.cto.some(function (x) { return x < 0; });
        r = rle(F.cto); a = [r.length]; r.forEach(function (x) { a.push(x[0], x[1]); });
        partes.push(caixaF('ctts', neg ? 1 : 0, 0, a));
      }
      if (F.sync.some(function (x) { return !x; })) {
        a = []; F.sync.forEach(function (s, i) { if (s) a.push(i + 1); });
        partes.push(caixaF('stss', 0, 0, [a.length].concat(a)));
      }
      a = []; var ult = -1;
      F.chunks.forEach(function (c, i) { if (c.n !== ult) { a.push(i + 1, c.n, 1); ult = c.n; } });
      partes.push(caixaF('stsc', 0, 0, [a.length / 3].concat(a)));
      partes.push(caixaF('stsz', 0, 0, [0, F.size.length].concat(F.size)));
      partes.push(caixaF('stco', 0, 0, [F.chunks.length].concat(F.chunks.map(function (c) { var x = pos; pos += c.len; return x; }))));
      var nStbl = caixa('stbl', cat(partes));

      /* cópias dos cabeçalhos com a duração certa */
      function comDur(box, idxV0, idxV1, val) {
        var c = b.slice(box.o, box.e), dv = new DataView(c.buffer), v = c[box.h];
        if (v === 1) { dv.setUint32(box.h + idxV1, Math.floor(val / 4294967296)); dv.setUint32(box.h + idxV1 + 4, val >>> 0); }
        else dv.setUint32(box.h + idxV0, Math.min(val, 0xffffffff) >>> 0);
        return c;
      }
      function recompor(box, troca) {
        return caixa(box.t, cat(boxes(b, d, box.c, box.e).map(function (x) { return troca(x) || b.slice(x.o, x.e); })));
      }
      var nMinf = recompor(minf, function (x) { return x.t === 'stbl' ? nStbl : null; });
      var nMdia = recompor(mdia, function (x) {
        if (x.t === 'mdhd') return comDur(x, 16, 24, durT);
        if (x.t === 'minf') return nMinf; return null;
      });
      var nTrak = recompor(tk, function (x) {
        if (x.t === 'tkhd') return comDur(x, 20, 28, durM);
        if (x.t === 'mdia') return nMdia;
        if (x.t === 'edts') { /* lista de edição com duração 0: preenche com a duração da faixa */
          var el = filho(b, d, x, 'elst'); if (!el) return null;
          var c = b.slice(x.o, x.e), dv = new DataView(c.buffer), o = el.o - x.o + el.h, v = c[o], n = dv.getUint32(o + 4), p = o + 8;
          for (var i = 0; i < n; i++) {
            if (v === 1) { if (!dv.getUint32(p) && !dv.getUint32(p + 4)) { dv.setUint32(p, Math.floor(durM / 4294967296)); dv.setUint32(p + 4, durM >>> 0); } p += 20; }
            else { if (!dv.getUint32(p)) dv.setUint32(p, durM >>> 0); p += 12; }
          }
          return c;
        }
        return null;
      });
      novos.push(nTrak);
    });
    return novos;
    }
    var novos = montar(0);
    if (!novos.length) return null;

    var partesMoov = [];
    boxes(b, d, moov.c, moov.e).forEach(function (x) {
      if (x.t === 'mvhd') {
        var c = b.slice(x.o, x.e), dv = new DataView(c.buffer);
        if (c[x.h] === 1) { dv.setUint32(x.h + 24, Math.floor(movDur / 4294967296)); dv.setUint32(x.h + 28, movDur >>> 0); }
        else dv.setUint32(x.h + 16, movDur >>> 0);
        partesMoov.push(c);
      } else if (x.t === 'trak') { /* entra abaixo, na mesma ordem */ }
      else if (x.t !== 'mvex') partesMoov.push(b.slice(x.o, x.e));
    });
    function fazMoov(nv) { return caixa('moov', cat(partesMoov.slice(0, 1).concat(nv, partesMoov.slice(1)))); }
    var cab = b.slice(ftyp.o, ftyp.e);
    var total = 0; ordem.forEach(function (id) { faixas[id].chunks.forEach(function (c) { total += c.len; }); });
    if (total + 8 > 0xffffffff) return null;
    var nMoov = fazMoov(novos);
    var tam = nMoov.length;
    nMoov = fazMoov(montar(cab.length + tam + 8));
    if (nMoov.length !== tam) return null;
    var mdatCab = new Uint8Array(8); new DataView(mdatCab.buffer).setUint32(0, total + 8); mdatCab.set([109, 100, 97, 116], 4);
    var out = new Uint8Array(cab.length + nMoov.length + 8 + total), o = 0;
    out.set(cab, o); o += cab.length; out.set(nMoov, o); o += nMoov.length; out.set(mdatCab, o); o += 8;
    ordem.forEach(function (id) { if (!faixas[id].size.length) return; faixas[id].chunks.forEach(function (c) { out.set(b.subarray(c.ini, c.ini + c.len), o); o += c.len; }); });
    return out;
  }
  g.FCostaMp4 = { normalizar: normalizar };
  if (typeof module !== 'undefined') module.exports = g.FCostaMp4;
})(typeof window !== 'undefined' ? window : globalThis);
