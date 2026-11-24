// Unwind nas lojas: os links oficiais e a deteccao do aparelho moram so aqui.
//
// Carregado no <head>, sem defer, de proposito: marca o <html> com
// data-aparelho antes da primeira pintura, e o CSS troca botao por selos sem
// piscar. E pequeno e local, entao o bloqueio e desprezivel.
//
// - iPhone/iPad: todo .js-baixar vira link direto pra App Store.
// - Android: todo .js-baixar vira link direto pro Google Play.
// - Desktop: o CSS mostra os selos (.selos-loja) no lugar do botao. Botao com
//   data-selos abre o popover que ele aponta em aria-controls; os outros
//   seguem pro href original (baixar.html, a pagina de download).
// - Sem JS: nada muda e todo botao leva pra baixar.html, que tem os dois selos.
//
// GA4: so clique que vai pra loja conta como clique_baixar_app (com
// data-loja=ios|android). Abrir o popover ou a pagina de download no desktop
// vira outro evento, pra nao inflar o numero de quem foi pra loja.
(function () {
  var LOJAS = {
    ios: 'https://apps.apple.com/br/app/id6789730748?pt=127820874&ct=site&mt=8',
    android: 'https://play.google.com/store/apps/details?id=com.dids1901.unwind&referrer=utm_source%3Dsite%26utm_medium%3Dweb'
  };

  var ua = navigator.userAgent;
  // iPad no iPadOS se apresenta como Mac: o toque e o que denuncia.
  var ios = /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var loja = ios ? 'ios' : /Android/i.test(ua) ? 'android' : null;

  document.documentElement.setAttribute('data-aparelho', loja || 'desktop');
  window.UNWIND_LOJAS = { links: LOJAS, loja: loja };

  function cada(lista, fn) {
    Array.prototype.forEach.call(lista, fn);
  }

  function prepara() {
    var botoes = document.querySelectorAll('.js-baixar');

    if (loja) {
      cada(botoes, function (b) {
        b.href = LOJAS[loja];
        b.dataset.loja = loja;
        // Na mesma aba: o sistema abre o app da loja direto.
        b.removeAttribute('target');
      });
      return;
    }

    cada(botoes, function (b) {
      var pop = b.hasAttribute('data-selos') &&
        document.getElementById(b.getAttribute('aria-controls'));

      if (!pop) {
        if (b.dataset.evento) b.dataset.evento = 'abrir_pagina_download';
        return;
      }

      if (b.dataset.evento) b.dataset.evento = 'abrir_selos_loja';
      b.setAttribute('aria-expanded', 'false');

      function fecha() {
        pop.hidden = true;
        b.setAttribute('aria-expanded', 'false');
      }

      b.addEventListener('click', function (e) {
        e.preventDefault();
        var abrir = pop.hidden;
        pop.hidden = !abrir;
        b.setAttribute('aria-expanded', String(abrir));
        if (abrir) {
          var primeiro = pop.querySelector('a');
          if (primeiro) primeiro.focus();
        }
      });

      document.addEventListener('click', function (e) {
        if (!pop.hidden && !pop.contains(e.target) && !b.contains(e.target)) fecha();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !pop.hidden) {
          fecha();
          b.focus();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prepara);
  } else {
    prepara();
  }
})();
