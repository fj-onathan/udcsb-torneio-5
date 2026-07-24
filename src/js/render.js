/* Encaminhador de desenho.

   As stories são 1080x1920 e o carrossel 1080x1350, por isso a altura da tela
   muda consoante a vista. Mudar `height` limpa o canvas, o que não incomoda
   porque se redesenha tudo de seguida. */
(function (App) {
  'use strict';

  App.H = App.G.H_STORY;

  App.setH = function (h) {
    if (App.H !== h || App.cv.height !== h) {
      App.H = h;
      App.cv.height = h;
    }
  };

  App.render = function () {
    App.save();
    var v = App.state.view;

    if (v === 'carousel') {
      App.setH(App.G.H_POST);
      App.renderCarousel();
      return;
    }

    App.setH(App.G.H_STORY);
    if (v === 'result') App.renderResult();
    else if (v === 'table') App.renderStandings();
    else if (v === 'next') App.renderFixtures(App.state.fixDay);
    else if (v === 'champ') App.renderChampion();
    else App.renderAward();
  };

  /* Nome do ficheiro sugerido para a vista atual. */
  App.filename = function () {
    var s = App.state;
    if (s.view === 'table') return 'classificacao_grupos.png';
    if (s.view === 'next') return s.fixDay === 'sat' ? 'jogos_sabado.png' : 'jogos_domingo.png';
    if (s.view === 'champ') return 'campeao.png';
    if (s.view === 'award') return 'premio_' + s.awardView + '.png';
    if (s.view === 'carousel') return App.slideFilename(s.slide);
    if (s.day === 'sat') return 'resultado_sab_' + App.MATCHES[s.match][0].replace(':', 'h') + '.png';
    return 'resultado_dom_' + App.SUN[s.matchSun][0].replace(':', 'h') + '.png';
  };

  App.slideFilename = function (i) {
    return 'slide_' + (i + 1) + '_' +
           App.SLIDES[i].toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '') + '.png';
  };
}(window.App = window.App || {}));
