/* Texto.

   O canvas só ganhou `letterSpacing` recentemente e não em todos os browsers
   móveis, por isso o espaçamento é feito à mão, carácter a carácter. */
(function (App) {
  'use strict';

  function ctx() { return App.ctx; }

  App.setFont = function (size) {
    ctx().font = size + 'px ' + App.G.FONT + ', sans-serif';
  };

  App.textW = function (str, size, tracking) {
    App.setFont(size);
    var w = 0, c = ctx();
    for (var i = 0; i < str.length; i++) w += c.measureText(str[i]).width;
    return w + (tracking || 0) * (str.length - 1);
  };

  /* Desenha a partir de x (alinhado à esquerda, centrado na vertical). */
  App.textAt = function (x, cy, str, size, color, tracking) {
    var c = ctx();
    tracking = tracking || 0;
    App.setFont(size);
    c.fillStyle = color;
    c.textBaseline = 'middle';
    for (var i = 0; i < str.length; i++) {
      c.fillText(str[i], x, cy);
      x += c.measureText(str[i]).width + tracking;
    }
  };

  /* Desenha centrado em cx. */
  App.text = function (cx, cy, str, size, color, tracking) {
    App.textAt(cx - App.textW(str, size, tracking) / 2, cy, str, size, color, tracking);
  };

  /* Reduz o corpo até o texto caber na largura pedida. */
  App.fit = function (str, size, maxw, tracking) {
    while (size > 16 && App.textW(str, size, tracking || 0) > maxw) size -= 2;
    return size;
  };

  /* Quebra por palavras, para blocos de texto corrido. */
  App.wrap = function (str, size, maxw, tracking) {
    var words = str.split(' '), lines = [], cur = '';
    words.forEach(function (w) {
      var test = cur ? cur + ' ' + w : w;
      if (App.textW(test, size, tracking || 0) > maxw && cur) { lines.push(cur); cur = w; }
      else cur = test;
    });
    if (cur) lines.push(cur);
    return lines;
  };
}(window.App = window.App || {}));
