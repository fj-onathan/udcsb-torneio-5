/* Blocos, separadores e discos de emblema. */
(function (App) {
  'use strict';

  var G = App.G, C = App.C;
  function ctx() { return App.ctx; }

  App.roundRect = function (c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y); c.arcTo(x + w, y, x + w, y + r, r);
    c.lineTo(x + w, y + h - r); c.arcTo(x + w, y + h, x + w - r, y + h, r);
    c.lineTo(x + r, y + h); c.arcTo(x, y + h, x, y + h - r, r);
    c.lineTo(x, y + r); c.arcTo(x, y, x + r, y, r);
    c.closePath();
  };

  /* Bloco translúcido: deixa o padrão do fundo ler-se por baixo. */
  App.block = function (x, y, w, h, color, rad) {
    var c = ctx();
    c.save();
    c.globalAlpha = G.ALPHA;
    c.fillStyle = color;
    App.roundRect(c, x, y, w, h, rad === undefined ? G.RAD : rad);
    c.fill();
    c.restore();
  };

  /* Faixa navy no topo de um bloco, recortada pelos cantos arredondados. */
  App.blockHeader = function (x, y, w, h, stripH) {
    var c = ctx();
    c.save();
    c.globalAlpha = G.ALPHA;
    App.roundRect(c, x, y, w, h, G.RAD);
    c.clip();
    c.fillStyle = C.NAVY;
    c.fillRect(x, y, w, stripH);
    c.restore();
  };

  App.sepChecker = function (y, h, sq) {
    var c = ctx();
    c.save();
    c.globalAlpha = G.ALPHA;
    App.roundRect(c, G.MARGIN, y, G.BW, h, G.SEP_RAD);
    c.clip();
    c.fillStyle = C.WHITE;
    c.fillRect(G.MARGIN, y, G.BW, h);
    var i = 0;
    for (var x = 0; x < G.BW; x += sq) {
      for (var j = 0; j < 2; j++) {
        c.fillStyle = ((i + j) % 2 === 0) ? C.YELLOW : C.WHITE;
        c.fillRect(G.MARGIN + x, y + j * sq, Math.min(sq, G.BW - x), sq);
      }
      i++;
    }
    c.restore();
  };

  App.sepStripes = function (y, h) {
    var c = ctx();
    c.save();
    c.globalAlpha = G.ALPHA;
    App.roundRect(c, G.MARGIN, y, G.BW, h, G.SEP_RAD);
    c.clip();
    c.fillStyle = C.AZURE;
    c.fillRect(G.MARGIN, y, G.BW, h);
    var bars = [[C.YELLOW, 17], [C.WHITE, 11], [C.AZURE, 20], [C.WHITE, 11], [C.YELLOW, 17]];
    var cy = y;
    bars.forEach(function (b) { c.fillStyle = b[0]; c.fillRect(G.MARGIN, cy, G.BW, b[1]); cy += b[1]; });
    c.restore();
  };

  /* Emblema dentro de um disco branco.

     A posição usa o centro de massa da tinta, não a caixa delimitadora: escudos
     têm a mancha toda em cima e acabam em bico, e centrá-los geometricamente
     deixa-os a parecer descaídos. 60% é o compromisso que equilibra sem empurrar
     o bico contra a borda. */
  App.disc = function (key, cx, cy, dia) {
    var c = ctx(), meta = App.LOGOS[key], img = App.images[key];
    c.save();
    c.beginPath();
    c.arc(cx, cy, dia / 2, 0, Math.PI * 2);
    c.clip();
    c.fillStyle = C.WHITE;
    c.fillRect(cx - dia / 2, cy - dia / 2, dia, dia);
    var s = dia * 0.78, r = Math.min(s / meta.w, s / meta.h);
    var w = meta.w * r, h = meta.h * r;
    var px = w / 2 + 0.6 * (meta.inkx * w - w / 2);
    var py = h / 2 + 0.6 * (meta.inky * h - h / 2);
    c.drawImage(img, cx - px, cy - py, w, h);
    c.restore();
    c.lineWidth = 5;
    c.strokeStyle = C.NAVY;
    c.beginPath();
    c.arc(cx, cy, dia / 2 - 2.5, 0, Math.PI * 2);
    c.stroke();
  };

  /* Disco para equipa ainda não apurada. */
  App.blankDisc = function (cx, cy, dia) {
    var c = ctx();
    c.save();
    c.beginPath();
    c.arc(cx, cy, dia / 2, 0, Math.PI * 2);
    c.fillStyle = '#e7e2d4';
    c.fill();
    c.restore();
    App.text(cx, cy + 4, '?', dia * 0.38, '#b3ab97', 0);
    c.lineWidth = 5;
    c.strokeStyle = C.NAVY;
    c.beginPath();
    c.arc(cx, cy, dia / 2 - 2.5, 0, Math.PI * 2);
    c.stroke();
  };

  App.discOrBlank = function (key, cx, cy, dia) {
    if (key) App.disc(key, cx, cy, dia); else App.blankDisc(cx, cy, dia);
  };

  /* Cabeçalho das stories (1080x1920). */
  App.header = function (sub) {
    var meta = App.LOGOS.udcsb, ch = 140, cw = meta.w * ch / meta.h;
    App.ctx.drawImage(App.images.udcsb, App.G.W / 2 - cw / 2, 112, cw, ch);
    App.text(G.W / 2, 300, App.EVENT.title, 38, C.WHITE, 3);
    App.text(G.W / 2, 348, sub, 34, C.YELLOW, 6);
  };

  App.footer = function (ySep, yHandle) {
    App.sepStripes(ySep, 76);
    App.text(G.W / 2, yHandle, App.EVENT.handle, 36, C.HANDLE, 8);
  };

  /* Par de blocos lado a lado, duas linhas em cada. */
  App.infoRow = function (y, h, leftTop, leftBottom, rightTop, rightBottom) {
    var bw2 = (G.BW - G.GAP) / 2, x2 = G.MARGIN + bw2 + G.GAP, cy = y + h / 2;
    App.block(G.MARGIN, y, bw2, h, C.AZURE);
    App.block(x2, y, bw2, h, C.WHITE);
    App.text(G.MARGIN + bw2 / 2, cy - 31, leftTop, App.fit(leftTop, 34, bw2 - 48, 3), C.MUTED_LIGHT, 3);
    App.text(G.MARGIN + bw2 / 2, cy + 30, leftBottom, App.fit(leftBottom, 50, bw2 - 44, 2), C.WHITE, 2);
    App.text(x2 + bw2 / 2, cy - 31, rightTop, App.fit(rightTop, 34, bw2 - 48, 3), '#78849b', 3);
    App.text(x2 + bw2 / 2, cy + 30, rightBottom, App.fit(rightBottom, 50, bw2 - 44, 2), C.NAVY, 2);
  };
}(window.App = window.App || {}));
