/* Arranque.

   `App.ASSETS` é preenchido de duas maneiras: em desenvolvimento aponta para os
   ficheiros em src/assets, e no ficheiro único gerado por tools/build.py é
   substituído por data URLs, para a app funcionar offline e sem servidor. */
(function (App) {
  'use strict';

  App.ASSETS = App.ASSETS || {
    font: 'assets/fonts/BebasNeue-Regular.ttf',
    logoDir: 'assets/logos/',
  };

  function loadImage(src) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () { res(img); };
      img.onerror = function () { rej(new Error('Falhou a carregar ' + src)); };
      img.src = src;
    });
  }

  function logoSrc(key) {
    var meta = App.LOGOS[key];
    return meta.src || (App.ASSETS.logoDir + meta.file);
  }

  App.images = {};

  App.start = function () {
    App.cv = document.getElementById('cv');
    App.ctx = App.cv.getContext('2d');

    var face = new FontFace(App.G.FONT, 'url(' + App.ASSETS.font + ')');
    return face.load()
      .then(function (f) { document.fonts.add(f); })
      .then(function () {
        return Promise.all(Object.keys(App.LOGOS).map(function (k) {
          return loadImage(logoSrc(k)).then(function (img) { App.images[k] = img; });
        }));
      })
      .then(function () {
        var restored = App.load();
        App.bindUI();
        App.applyView();
        var el = document.getElementById('saveState');
        if (el && App.storeOk) {
          el.textContent = restored
            ? 'Dados recuperados da última sessão. Guarda automaticamente neste dispositivo.'
            : 'Guarda automaticamente neste dispositivo a cada alteração.';
        }
        App.refresh();
      })
      .catch(function (err) {
        var el = document.getElementById('saveState');
        if (el) el.textContent = 'Erro no arranque: ' + err.message;
        throw err;
      });
  };

  if (typeof document !== 'undefined' && !App.NO_AUTOSTART) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', App.start);
    } else {
      App.start();
    }
  }
}(window.App = window.App || {}));
