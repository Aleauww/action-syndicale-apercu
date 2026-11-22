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

    /* ---------- Visuel à partager (dessiné dans le navigateur) ---------- */
    document.querySelectorAll('[data-visuel]').forEach(function (bloc) {
      var canvas = bloc.querySelector('canvas'), ctx = canvas.getContext('2d');
      var charger = function (src) { return new Promise(function (ok) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = src; }); };
      var polices = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load('400 100px Anton'), document.fonts.load('700 40px "Source Sans 3"')]) : Promise.resolve();
      Promise.all([charger(bloc.dataset.logo), charger(bloc.dataset.logoSnesup), polices]).then(function (r) {
        var logo = r[0], logoS = r[1], W = 1080;
        ctx.fillStyle = '#191917'; ctx.fillRect(0, 0, W, W);
        // bande diagonale bleue, comme sur le site
        ctx.save(); ctx.globalAlpha = .25; ctx.fillStyle = '#0e62a7';
        ctx.beginPath(); ctx.moveTo(760, 0); ctx.lineTo(W, 0); ctx.lineTo(W, W); ctx.lineTo(520, W); ctx.closePath(); ctx.fill(); ctx.restore();
        // bandes de couleur en haut
        ['#e2c634', '#d72a36', '#139d54', '#0e62a7'].forEach(function (c, i) { ctx.fillStyle = c; ctx.fillRect(i * 270, 0, 270, 16); });
        if (logo) { var lw = 420, lh = lw * logo.height / logo.width; ctx.drawImage(logo, 80, 90, lw, lh); }
        ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'alphabetic';
        var titre = (bloc.dataset.titre || '').toUpperCase();
        var taille = 210; ctx.font = '400 ' + taille + 'px Anton, Impact, sans-serif';
        while (ctx.measureText(titre).width > 920 && taille > 80) { taille -= 6; ctx.font = '400 ' + taille + 'px Anton, Impact, sans-serif'; }
        // surlignage jaune derrière le titre
        var tw = ctx.measureText(titre).width;
        ctx.save(); ctx.translate(80, 0); ctx.transform(1, 0, -0.14, 1, 0, 0);
        ctx.fillStyle = '#e2c634'; ctx.fillRect(-6, 560 - taille * .82, tw + 40, taille * .98); ctx.restore();
        ctx.fillStyle = '#191917'; ctx.fillText(titre, 96, 560);
        // sous-titre
        ctx.fillStyle = '#ffffff'; ctx.font = '400 82px Anton, Impact, sans-serif';
        var mots = (bloc.dataset.soustitre || '').toUpperCase().split(' '), ligne = '', y = 680, lignes = [];
        mots.forEach(function (m) { var t = ligne ? ligne + ' ' + m : m; if (ctx.measureText(t).width > 900) { lignes.push(ligne); ligne = m; } else ligne = t; });
        if (ligne) lignes.push(ligne);
        lignes.forEach(function (l) { ctx.fillText(l, 80, y); y += 92; });
        // motif des quatre bandes
        var by = y - 20;
        ctx.fillStyle = '#139d54'; ctx.fillRect(80 + 130, by, 200, 34);
        ctx.fillStyle = '#e2c634'; ctx.fillRect(80, by + 8, 140, 26);
        ctx.fillStyle = '#0e62a7'; ctx.fillRect(80 + 230, by + 36, 110, 20);
        ctx.fillStyle = '#d72a36'; ctx.fillRect(80 + 24, by + 30, 196, 28);
        // mention et adresse
        ctx.fillStyle = '#e3ddd5'; ctx.font = '600 36px "Source Sans 3", sans-serif';
        ctx.fillText(bloc.dataset.mention || '', 80, 990);
        if (bloc.dataset.site) { ctx.fillStyle = '#e2c634'; ctx.font = '800 34px "Source Sans 3", sans-serif'; ctx.fillText(bloc.dataset.site, 80, 1036); }
        if (logoS) { var sw = 200, sh = sw * logoS.height / logoS.width; ctx.fillStyle = '#ffffff'; ctx.fillRect(W - sw - 100, 90, sw + 40, sh + 30); ctx.drawImage(logoS, W - sw - 80, 105, sw, sh); }
      });
      var nom = 'visuel-' + (bloc.dataset.titre || 'action-syndicale').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-') + '-action-syndicale.png';
      var avecImage = function (f) { canvas.toBlob(function (b) { if (b) f(b); }, 'image/png'); };
      bloc.querySelector('[data-visuel-telecharger]').addEventListener('click', function () {
        avecImage(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nom; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); });
      });
      var bp = bloc.querySelector('[data-visuel-partager]');
      if (bp && navigator.canShare && window.File) {
        try { if (navigator.canShare({ files: [new File([''], 'test.png', { type: 'image/png' })] })) bp.hidden = false; } catch (e) {}
        bp.addEventListener('click', function () {
          avecImage(function (b) { navigator.share({ files: [new File([b], nom, { type: 'image/png' })], text: (bloc.dataset.titre || '') + ' ' + (bloc.dataset.soustitre || '') }).catch(function () {}); });
        });
      }
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
    var cibles = '.titre-section, .proposition, .profil-carte, .carte-signataires, .carte, .evenement, .carte-action, .carte-lien-externe, .liste-tribunes li, .photo, .video, .etapes-detaillees li, .voie, .encart-noir, .bloc-moderation, .liste-documents li, .faq details, .stat';
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
