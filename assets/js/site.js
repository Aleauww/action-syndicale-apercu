/* Action Syndicale — scripts du site (aucune dépendance, aucun service tiers) */
(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.remove('no-js');
  html.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {

    /* Menu mobile */
    var bouton = document.querySelector('.bouton-menu');
    var menu = document.getElementById('menu-principal');
    if (bouton && menu) {
      bouton.addEventListener('click', function () {
        var ouvert = bouton.getAttribute('aria-expanded') === 'true';
        bouton.setAttribute('aria-expanded', String(!ouvert));
        menu.classList.toggle('ouvert', !ouvert);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('ouvert')) { bouton.click(); bouton.focus(); }
      });
    }

    /* Vidéos : l'iframe YouTube (youtube-nocookie) n'est créée qu'au clic */
    document.querySelectorAll('[data-youtube]').forEach(function (cadre) {
      var facade = cadre.querySelector('.video-facade');
      if (!facade) return;
      facade.addEventListener('click', function (e) {
        e.preventDefault();
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(cadre.dataset.youtube) + '?autoplay=1&rel=0';
        f.title = cadre.dataset.titre || 'Vidéo';
        f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
        f.allowFullscreen = true;
        f.referrerPolicy = 'strict-origin-when-cross-origin';
        cadre.innerHTML = '';
        cadre.appendChild(f);
      });
    });

    /* Visionneuse photos */
    var photos = Array.prototype.slice.call(document.querySelectorAll('a.photo'));
    if (photos.length && typeof HTMLDialogElement === 'function') {
      var d = document.querySelector('.visionneuse');
      if (!d) {
        d = document.createElement('dialog');
        d.className = 'visionneuse';
        d.setAttribute('aria-label', 'Photo agrandie');
        d.innerHTML = '<form method="dialog"><button class="visionneuse-fermer" aria-label="Fermer">×</button></form>' +
          '<button class="visionneuse-nav visionneuse-prec" type="button" aria-label="Photo précédente">‹</button>' +
          '<figure><img src="" alt=""><figcaption></figcaption></figure>' +
          '<button class="visionneuse-nav visionneuse-suiv" type="button" aria-label="Photo suivante">›</button>';
        document.body.appendChild(d);
      }
      var img = d.querySelector('img'), leg = d.querySelector('figcaption'), i = 0;
      var montrer = function (n) {
        i = (n + photos.length) % photos.length;
        img.src = photos[i].getAttribute('href');
        img.alt = photos[i].querySelector('img') ? photos[i].querySelector('img').alt : '';
        leg.textContent = photos[i].dataset.legende || '';
      };
      photos.forEach(function (p, n) {
        p.addEventListener('click', function (e) { e.preventDefault(); montrer(n); d.showModal(); });
      });
      d.querySelector('.visionneuse-prec').addEventListener('click', function () { montrer(i - 1); });
      d.querySelector('.visionneuse-suiv').addEventListener('click', function () { montrer(i + 1); });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') montrer(i - 1);
        if (e.key === 'ArrowRight') montrer(i + 1);
      });
      d.addEventListener('click', function (e) { if (e.target === d || e.target.tagName === 'FIGURE') d.close(); });
    }

    /* Recherche dans la liste des signataires */
    document.querySelectorAll('[data-filtre]').forEach(function (champ) {
      var liste = document.querySelector(champ.dataset.filtre);
      if (!liste) return;
      var vide = liste.parentNode.querySelector('.aucun-resultat');
      var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
      var items = Array.prototype.slice.call(liste.children).map(function (li) { return [li, norm(li.textContent)]; });
      champ.addEventListener('input', function () {
        var q = norm(champ.value.trim()), n = 0;
        items.forEach(function (it) { var ok = !q || it[1].indexOf(q) !== -1; it[0].hidden = !ok; if (ok) n++; });
        if (vide) vide.hidden = n > 0;
      });
    });

    /* Compteur de caractères */
    document.querySelectorAll('textarea[data-compteur]').forEach(function (t) {
      var max = parseInt(t.getAttribute('maxlength'), 10), min = parseInt(t.getAttribute('minlength') || '0', 10);
      var c = document.createElement('span');
      c.className = 'compteur-caracteres';
      c.setAttribute('aria-live', 'polite');
      t.insertAdjacentElement('afterend', c);
      var maj = function () {
        var n = t.value.length;
        c.textContent = n.toLocaleString('fr-FR') + ' / ' + max.toLocaleString('fr-FR') + ' caractères' + (n < min ? ' (minimum ' + min + ')' : '');
        c.classList.toggle('trop', n > max || (n > 0 && n < min));
      };
      t.addEventListener('input', maj); maj();
    });

    /* Texte long de la motion : replié avec bouton « Lire toute la motion » */
    document.querySelectorAll('[data-replier]').forEach(function (bloc) {
      if (bloc.scrollHeight < 620) return;
      bloc.classList.add('replie');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'bouton bouton-noir bouton-deplier';
      b.textContent = 'Lire toute la motion';
      b.setAttribute('aria-expanded', 'false');
      b.addEventListener('click', function () {
        var r = bloc.classList.toggle('replie');
        b.textContent = r ? 'Lire toute la motion' : 'Replier le texte';
        b.setAttribute('aria-expanded', String(!r));
        if (r) bloc.scrollIntoView({ block: 'start' });
      });
      bloc.insertAdjacentElement('afterend', b);
    });

    /* Confirmation des actions sensibles (administration) */
    document.querySelectorAll('form[data-confirmer]').forEach(function (f) {
      f.addEventListener('submit', function (e) { if (!window.confirm(f.dataset.confirmer)) e.preventDefault(); });
    });

    /* Bouton « Copier » (administration) */
    document.querySelectorAll('[data-copier]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = document.querySelector(b.dataset.copier);
        if (!c) return;
        c.select();
        var ok = function () { b.textContent = 'Copié !'; setTimeout(function () { b.textContent = 'Copier la liste'; }, 2000); };
        if (navigator.clipboard) navigator.clipboard.writeText(c.value).then(ok, function () { document.execCommand('copy'); ok(); });
        else { document.execCommand('copy'); ok(); }
      });
    });

    /* Partage natif sur mobile */
    if (navigator.share) {
      document.querySelectorAll('.bouton-partage').forEach(function (b) {
        b.hidden = false;
        b.addEventListener('click', function () { navigator.share({ title: b.dataset.titre, url: b.dataset.url }).catch(function () {}); });
      });
    }

    /* Copier une valeur (ex. le lien de la motion) */
    document.querySelectorAll('[data-copier-valeur]').forEach(function (b) {
      var texte = b.textContent;
      b.addEventListener('click', function () {
        var ok = function () { b.textContent = 'Lien copié !'; setTimeout(function () { b.textContent = texte; }, 2000); };
        if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copierValeur).then(ok, function () {});
      });
    });

    /* ---------- Animations légères ---------- */
    var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Nombres qui défilent jusqu'à leur valeur (signataires, contributions, J-…)
    var animerNombre = function (el) {
      var cible = parseInt(el.dataset.compte, 10), prefixe = el.dataset.prefixe || '';
      if (!cible || calme) return;
      var t0 = null, duree = Math.min(1800, 600 + cible * 6);
      var pas = function (t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / duree), e = 1 - Math.pow(1 - p, 3);
        el.textContent = prefixe + Math.round(cible * e).toLocaleString('fr-FR');
        if (p < 1) requestAnimationFrame(pas);
      };
      el.textContent = prefixe + '0';
      requestAnimationFrame(pas);
    };
    // Barres <progress> qui se remplissent (jauge de signatures, frise du congrès)
    var animerJauge = function (el) {
      var cible = parseFloat(el.getAttribute('value')) || 0;
      if (!cible || calme) return;
      var t0 = null, duree = 1500;
      el.value = 0;
      var pas = function (t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / duree), e = 1 - Math.pow(1 - p, 3);
        el.value = cible * e;
        if (p < 1) requestAnimationFrame(pas);
      };
      requestAnimationFrame(pas);
    };

    // Apparition au défilement : cartes, rendez-vous, étapes, titres…
    var cibles = '.titre-section, .carte, .evenement, .carte-action, .carte-lien-externe, .liste-tribunes li, .photo, .video, .etapes-detaillees li, .voie, .encart-noir, .bloc-moderation, .liste-documents li, .faq details, .stat';
    var elements = Array.prototype.slice.call(document.querySelectorAll(cibles)).filter(function (el) { return !el.closest('.une-congres'); });
    // Décalage en cascade entre éléments voisins
    var parParent = new Map();
    elements.forEach(function (el) {
      var p = el.parentNode, i = parParent.get(p) || 0;
      parParent.set(p, i + 1);
      el.classList.add('reveal');
      el.style.setProperty('--delai', Math.min(i, 6) * 0.07 + 's');
    });
    var aAnimer = Array.prototype.slice.call(document.querySelectorAll('[data-compte], progress[data-anime]'));
    var declencher = function (el) {
      if (el.classList.contains('reveal')) el.classList.add('visible');
      if (el.hasAttribute('data-compte')) animerNombre(el);
      if (el.tagName === 'PROGRESS') animerJauge(el);
    };
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (en) { if (en.isIntersecting) { declencher(en.target); obs.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      elements.concat(aAnimer).forEach(function (el) { obs.observe(el); });
    } else {
      elements.concat(aAnimer).forEach(declencher);
    }

    /* Mettre le message de retour d'un formulaire au premier plan */
    var alerte = document.querySelector('.alerte[tabindex]');
    if (alerte) { alerte.focus({ preventScroll: true }); }
  });
})();

document.addEventListener('submit', function (e) { e.preventDefault(); }, true);
