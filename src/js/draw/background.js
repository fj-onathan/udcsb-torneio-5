/* Fundo: padrão abstrato de chevrons em dois azuis, inclinado, com grão.

   O grão existe porque blocos de cor chapada sobre azul liso ficam com ar de
   interface, não de cartaz. */
(function (App) {
  'use strict';

  var G = App.G, C = App.C;
  var grainTile = null;

  function makeGrain() {
    if (grainTile) return grainTile;
    var c = document.createElement('canvas');
    c.width = c.height = 160;
    var g = c.getContext('2d'), d = g.createImageData(160, 160);
    for (var i = 0; i < d.data.length; i += 4) {
      var v = 120 + Math.random() * 135;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    grainTile = c;
    return c;
  }

  App.drawBackground = function () {
    var c = App.ctx, W = G.W, H = App.H;

    c.fillStyle = C.BLUE;
    c.fillRect(0, 0, W, H);

    c.save();
    c.translate(W / 2, H / 2);
    c.rotate(-12 * Math.PI / 180);
    c.translate(-W / 2, -H / 2);
    c.lineWidth = 26;
    c.lineJoin = 'round';
    c.lineCap = 'round';
    var stepX = 210, stepY = 190, s = 130, row = 0;
    for (var y = -420; y < H + 420; y += stepY) {
      var col = 0;
      for (var x = -420 + (row % 2 ? 105 : 0); x < W + 420; x += stepX) {
        c.strokeStyle = ((row + col) % 2 === 0) ? C.BLUE_DARK : C.BLUE_LITE;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + s * 0.55, y + s * 0.5);
        c.lineTo(x, y + s);
        c.stroke();
        col++;
      }
      row++;
    }
    c.restore();

    c.save();
    c.globalAlpha = 0.05;
    c.drawImage(makeGrain(), 0, 0, W, H);
    c.restore();

    var g = c.createLinearGradient(0, 0, 0, 460);
    g.addColorStop(0, 'rgba(4,26,70,0.5)');
    g.addColorStop(1, 'rgba(4,26,70,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, 460);

    g = c.createLinearGradient(0, H, 0, H - 380);
    g.addColorStop(0, 'rgba(4,26,70,0.5)');
    g.addColorStop(1, 'rgba(4,26,70,0)');
    c.fillStyle = g;
    c.fillRect(0, H - 380, W, 380);
  };
}(window.App = window.App || {}));
